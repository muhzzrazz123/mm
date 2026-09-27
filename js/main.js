/**
 * SARTORIAL HERITAGE & SON - UI CONTROLLER & PRODUCT GRID
 */

function initApp() {
  renderProductGrid("all");
  bindCategoryFilters();
  bindProductModalEvents();
  bindHeaderNavigation();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

let currentFilter = "all";

/**
 * Render Product Grid based on active category
 */
function renderProductGrid(filter = "all") {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  currentFilter = filter;
  let products = ProductStore.getAll();

  if (filter === "gents") {
    products = ProductStore.getByCategory("gents");
  } else if (filter === "boys") {
    products = ProductStore.getByCategory("boys");
  } else if (filter === "shirts") {
    products = ProductStore.getBySubCategory("shirts");
  } else if (filter === "ethnic") {
    products = ProductStore.getBySubCategory("ethnic");
  } else if (filter === "trousers") {
    products = ProductStore.getBySubCategory("trousers");
  } else if (filter === "new") {
    products = ProductStore.getNewArrivals();
  }

  grid.innerHTML = products.map((item) => `
    <article class="product-card" data-id="${item.id}" data-category="${item.category}">
      <div class="product-media">
        <img src="${item.images[0]}" alt="${item.name}" loading="lazy">
        ${item.isNewArrival ? '<span class="product-badge new">New Arrival</span>' : ''}
        ${item.featured3D ? '<button class="inspect-3d-badge" onclick="openProductModal(\'' + item.id + '\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg> 360° View</button>' : ''}
      </div>
      <div class="product-content">
        <div class="product-meta">
          <span class="product-tag ${item.category}">${item.category === 'boys' ? "Junior Suite" : "Gents Atelier"}</span>
          <span class="product-weave">${item.weave || "Bespoke Cloth"}</span>
        </div>
        <h3 class="product-title" onclick="openProductModal('${item.id}')">${item.name}</h3>
        <p class="product-material">${item.material}</p>
        
        <div class="product-size-selector" id="size-selector-${item.id}">
          <span class="size-label">Size:</span>
          ${item.sizes.map((s, idx) => `
            <button class="size-chip ${idx === 0 ? 'selected' : ''}" onclick="selectProductSize('${item.id}', '${s}', this)">${s}</button>
          `).join('')}
        </div>

        <div class="product-action-bar">
          <div class="product-price">${cartManager ? cartManager.formatPrice(item.price) : '₹' + item.price}</div>
          <button class="btn-add-cart" onclick="handleAddProductToCart('${item.id}', this)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </article>
  `).join("");

  // Smooth entrance with GSAP
  if (window.gsap) {
    gsap.fromTo(".product-card", 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power2.out" }
    );
  }
}

/**
 * Handle Size Selection inside card
 */
const selectedSizes = {};
function selectProductSize(productId, size, elem) {
  selectedSizes[productId] = size;
  const parent = elem.parentElement;
  if (parent) {
    parent.querySelectorAll('.size-chip').forEach(c => c.classList.remove('selected'));
    elem.classList.add('selected');
  }
}

/**
 * Add Product to Cart with Selected Size & Fly Animation
 */
function handleAddProductToCart(productId, btnElem) {
  const product = ProductStore.getById(productId);
  if (!product) return;

  const chosenSize = selectedSizes[productId] || (product.sizes && product.sizes[0]);
  if (cartManager) {
    cartManager.addItem(productId, chosenSize, 1, btnElem);
  }
}

/**
 * Filter Buttons binding
 */
function bindCategoryFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");
      renderProductGrid(filter);
    });
  });
}

/**
 * 360 Product Detail Modal
 */
function openProductModal(productId) {
  const product = ProductStore.getById(productId);
  if (!product) return;

  const modal = document.getElementById("product-modal");
  const modalContent = document.getElementById("modal-dynamic-content");
  if (!modal || !modalContent) return;

  modalContent.innerHTML = `
    <div class="modal-product-layout">
      <div class="modal-viewer-col">
        <div class="modal-360-stage" id="modal-360-canvas-box">
          <img src="${product.images[0]}" alt="${product.name}" class="modal-preview-img">
          <div class="turntable-hint">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>Drag horizontally to rotate 360°</span>
          </div>
        </div>
      </div>
      <div class="modal-details-col">
        <span class="modal-cat-tag ${product.category}">${product.category === 'boys' ? "Junior Collection" : "Gents Atelier"}</span>
        <h2 class="modal-product-title">${product.name}</h2>
        <div class="modal-product-price">${cartManager ? cartManager.formatPrice(product.price) : '₹' + product.price}</div>
        
        <div class="modal-fabric-card">
          <div class="fabric-badge-icon">🧵</div>
          <div>
            <div class="fabric-name">${product.weave || 'Artisanal Textile'}</div>
            <div class="fabric-desc">${product.material}</div>
          </div>
        </div>

        <p class="modal-product-desc">${product.description}</p>

        <div class="modal-sizes-group">
          <label>Available Tailor Sizes:</label>
          <div class="size-chips-wrap">
            ${product.sizes.map((s, i) => `
              <button class="size-chip ${i === 0 ? 'selected' : ''}" onclick="selectProductSize('${product.id}', '${s}', this)">${s}</button>
            `).join('')}
          </div>
        </div>

        <div class="modal-actions-row">
          <button class="btn-primary-atelier" onclick="handleAddProductToCart('${product.id}', this); closeProductModal();">
            Add to Bag & Cart
          </button>
          <button class="btn-whatsapp-direct" onclick="orderSingleItemWhatsApp('${product.id}')">
            <span>Enquire on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("open");
  document.body.style.overflow = "hidden";

  // If featured 3D, spin viewer is active
  if (product.featured3D && !ThreeShowroom.isMobile()) {
    setTimeout(() => {
      ThreeShowroom.init360Viewer("modal-360-canvas-box");
    }, 100);
  }
}

function closeProductModal() {
  const modal = document.getElementById("product-modal");
  if (modal) {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
}

function orderSingleItemWhatsApp(productId) {
  const product = ProductStore.getById(productId);
  if (!product) return;

  const size = selectedSizes[productId] || product.sizes[0];
  const msg = `🏛️ *ENQUIRY: ${product.name}*\n` +
              `• Price: ₹${product.price.toLocaleString('en-IN')}\n` +
              `• Size: ${size}\n` +
              `• Material: ${product.material}\n` +
              `• Showroom: Sartorial Heritage & Son\n` +
              `Kindly assist me with sizing consultation and order placement.`;

  window.open(`https://wa.me/[INSERT_WHATSAPP_NUMBER]?text=${encodeURIComponent(msg)}`, "_blank");
}

function bindProductModalEvents() {
  const modal = document.getElementById("product-modal");
  const closeBtn = document.getElementById("close-product-modal");
  if (closeBtn) closeBtn.addEventListener("click", closeProductModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeProductModal();
    });
  }
}

function bindHeaderNavigation() {
  const navLinks = document.querySelectorAll("header nav a, .clip-nav-pill");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId && targetId.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
          if (window.ScrollVideoExperience && ScrollVideoExperience.lenis && ScrollVideoExperience.lenis()) {
            ScrollVideoExperience.lenis().scrollTo(target, { offset: -60, duration: 1.2 });
          } else {
            target.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    });
  });
}
