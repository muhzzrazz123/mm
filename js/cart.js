/**
 * SARTORIAL HERITAGE & SON - CLIENT CART & WHATSAPP CHECKOUT
 */

const WHATSAPP_NUMBER = "[INSERT_WHATSAPP_NUMBER]"; // Customer contact destination

class CartManager {
  constructor() {
    this.storageKey = "sartorial_cart_items";
    this.items = this.loadCart();
    this.isOpen = false;
    this.init();
  }

  init() {
    this.updateBadge();
    this.renderCartDrawer();
    this.bindEvents();
  }

  loadCart() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Could not load cart from localStorage", e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.warn("Could not save cart to localStorage", e);
    }
    this.updateBadge();
    this.renderCartDrawer();
  }

  addItem(productId, size, quantity = 1, triggerElement = null) {
    let product = window.ProductStore ? ProductStore.getById(productId) : null;
    if (!product && triggerElement) {
      const card = triggerElement.closest('.video-product-card, .product-card');
      if (card) {
        const title = card.querySelector('.card-title, .product-title')?.textContent?.trim() || 'MOCCA Garment';
        const priceText = card.querySelector('.card-price, .product-price')?.textContent?.replace(/[^0-9]/g, '') || '0';
        const mat = card.querySelector('.card-material, .product-material')?.textContent?.trim() || 'Fine Fabric';
        const img = card.querySelector('img')?.getAttribute('src') || 'assets/gent_oxford_shirt.jpg';
        product = {
          id: productId,
          name: title,
          price: parseInt(priceText, 10) || 1500,
          material: mat,
          images: [img],
          sizes: [size || 'Standard']
        };
        if (window.ProductStore) ProductStore.registerItem(product);
      }
    }
    if (!product) return;

    const selectedSize = size || (product.sizes && product.sizes[0]) || "Custom";
    const existingIndex = this.items.findIndex(
      item => item.id === productId && item.size === selectedSize
    );

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        material: product.material,
        image: product.images[0],
        category: product.category,
        size: selectedSize,
        quantity: quantity
      });
    }

    this.saveCart();

    // Trigger 3D parcel folding animation if element provided
    if (triggerElement) {
      this.playParcelFlyAnimation(triggerElement, product);
    } else {
      this.bounceCartIcon();
    }
  }

  removeItem(index) {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1);
      this.saveCart();
    }
  }

  updateQuantity(index, delta) {
    if (index >= 0 && index < this.items.length) {
      this.items[index].quantity += delta;
      if (this.items[index].quantity <= 0) {
        this.items.splice(index, 1);
      }
      this.saveCart();
    }
  }

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotalPrice() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  formatPrice(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN");
  }

  updateBadge() {
    const count = this.getItemCount();
    const badges = document.querySelectorAll(".cart-count-badge");
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-flex" : "none";
    });
  }

  bounceCartIcon() {
    const icon = document.querySelector(".header-cart-btn");
    if (!icon) return;
    if (window.gsap) {
      gsap.fromTo(icon, 
        { scale: 1 }, 
        { scale: 1.35, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" }
      );
    }
  }

  /**
   * Signature Add-to-Cart Parcel Animation:
   * Garment folds into a gift parcel, shrinks, and flies into the cart badge.
   */
  playParcelFlyAnimation(sourceElem, product) {
    const rect = sourceElem.getBoundingClientRect();
    const cartIcon = document.querySelector(".header-cart-btn");
    const cartRect = cartIcon ? cartIcon.getBoundingClientRect() : { left: window.innerWidth - 60, top: 25 };

    // Create luxury origami parcel element
    const parcel = document.createElement("div");
    parcel.className = "origami-parcel";
    parcel.innerHTML = `
      <div class="parcel-card">
        <div class="parcel-face front">
          <div class="parcel-ribbon"></div>
          <div class="parcel-seal">✂</div>
          <div class="parcel-text">${product.name}</div>
        </div>
      </div>
    `;

    document.body.appendChild(parcel);

    // Initial positioning on the source button
    const startX = rect.left + rect.width / 2 - 45;
    const startY = rect.top + rect.height / 2 - 35;
    const endX = cartRect.left + 15;
    const endY = cartRect.top + 15;

    parcel.style.left = `${startX}px`;
    parcel.style.top = `${startY}px`;

    if (window.gsap) {
      const tl = gsap.timeline({
        onComplete: () => {
          parcel.remove();
          this.bounceCartIcon();
        }
      });

      // Step 1: Quick fold-into-parcel 3D flip
      tl.to(parcel, {
        scale: 1.1,
        rotateX: -20,
        rotateY: 180,
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        duration: 0.35,
        ease: "back.out(1.7)"
      })
      // Step 2: Parabolic flight to cart
      .to(parcel, {
        left: endX,
        top: endY,
        scale: 0.18,
        opacity: 0.8,
        rotation: 360,
        duration: 0.65,
        ease: "power2.in"
      })
      // Step 3: Vanish into icon
      .to(parcel, {
        opacity: 0,
        duration: 0.1
      });
    } else {
      setTimeout(() => {
        parcel.remove();
        this.bounceCartIcon();
      }, 700);
    }
  }

  toggleDrawer(open) {
    this.isOpen = (open !== undefined) ? open : !this.isOpen;
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-overlay");
    if (drawer && overlay) {
      if (this.isOpen) {
        drawer.classList.add("open");
        overlay.classList.add("open");
        document.body.style.overflow = "hidden";
      } else {
        drawer.classList.remove("open");
        overlay.classList.remove("open");
        document.body.style.overflow = "";
      }
    }
  }

  renderCartDrawer() {
    const listContainer = document.getElementById("cart-items-list");
    const totalElem = document.getElementById("cart-total-amount");
    const subtotalElem = document.getElementById("cart-subtotal-amount");
    const emptyState = document.getElementById("cart-empty-state");
    const footerElem = document.getElementById("cart-drawer-footer");

    if (!listContainer) return;

    if (this.items.length === 0) {
      listContainer.innerHTML = "";
      if (emptyState) emptyState.style.display = "flex";
      if (footerElem) footerElem.style.display = "none";
      return;
    }

    if (emptyState) emptyState.style.display = "none";
    if (footerElem) footerElem.style.display = "block";

    const total = this.getTotalPrice();
    if (totalElem) totalElem.textContent = this.formatPrice(total);
    if (subtotalElem) subtotalElem.textContent = this.formatPrice(total);

    listContainer.innerHTML = this.items.map((item, idx) => `
      <div class="cart-item-row" data-index="${idx}">
        <div class="cart-item-thumb">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.name}</h4>
          <div class="cart-item-meta">
            <span class="cart-item-size">Size: <strong>${item.size}</strong></span>
            <span class="cart-item-cat">${item.category === 'boys' ? "Junior Collection" : "Gents Atelier"}</span>
          </div>
          <div class="cart-item-price">${this.formatPrice(item.price)}</div>
          <div class="cart-item-controls">
            <div class="qty-stepper">
              <button class="qty-btn" onclick="cartManager.updateQuantity(${idx}, -1)" title="Decrease quantity">−</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="cartManager.updateQuantity(${idx}, 1)" title="Increase quantity">+</button>
            </div>
            <button class="cart-remove-btn" onclick="cartManager.removeItem(${idx})" title="Remove item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Remove
            </button>
          </div>
        </div>
      </div>
    `).join("");
  }

  generateWhatsAppUrl() {
    if (this.items.length === 0) return "#";

    const total = this.getTotalPrice();
    const formattedTotal = this.formatPrice(total);

    let message = `*NEW SHOWROOM ORDER*\n`;
    message += `👑 *MOCCA Gents | Boys (Chattiparamba)*\n`;
    message += `📍 Boutique Location: https://maps.app.goo.gl/4NjPPbsudpmnT3JX6\n`;
    message += `──────────────────────\n`;
    message += `*ORDERED PIECES:*\n`;

    this.items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   • Size: ${item.size}\n`;
      message += `   • Qty: ${item.quantity}\n`;
      message += `   • Price: ${this.formatPrice(item.price * item.quantity)}\n`;
      message += `   • Fabric: ${item.material}\n\n`;
    });

    message += `──────────────────────\n`;
    message += `*TOTAL VALUATION:* ${formattedTotal}\n`;
    message += `*ATELIER SERVICES:* Complimentary Fitted Delivery\n`;
    message += `*NOTES:* Please confirm tailor measurements and dispatch timeline.\n`;

    const encoded = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
  }

  checkoutViaWhatsApp() {
    if (this.items.length === 0) {
      alert("Your tailoring bag is currently empty. Please select garments to order.");
      return;
    }
    const url = this.generateWhatsAppUrl();
    window.open(url, "_blank");
  }

  bindEvents() {
    const openBtns = document.querySelectorAll(".header-cart-btn, .open-cart-btn");
    openBtns.forEach(btn => btn.addEventListener("click", () => this.toggleDrawer(true)));

    const closeBtn = document.getElementById("close-cart-btn");
    if (closeBtn) closeBtn.addEventListener("click", () => this.toggleDrawer(false));

    const overlay = document.getElementById("cart-overlay");
    if (overlay) overlay.addEventListener("click", () => this.toggleDrawer(false));

    const checkoutBtn = document.getElementById("whatsapp-checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => this.checkoutViaWhatsApp());
    }
  }
}

// Global instance
var cartManager;
function initCart() {
  cartManager = new CartManager();
  window.cartManager = cartManager;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCart);
} else {
  initCart();
}
