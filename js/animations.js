/**
 * SARTORIAL HERITAGE & SON - GSAP SCROLLTRIGGER ORCHESTRATION
 * 
 * Choreographs:
 * 1. Hero Fabric Bolt Unrolling (pinned, scroll-scrubbed)
 * 2. Signature 3D Shirt Assembly Sequence (pinned, scrubbed progress)
 * 3. Father & Son Diverging Walk & Flip-Card Reveal (pinned, scrubbed)
 * 4. Data-Driven New Arrivals Conveyor Belt (continuous + scroll-boosted)
 * 5. Mobile 2D Fallback Parallax & Layered Transforms
 */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.error("GSAP or ScrollTrigger not loaded.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const isMobile = ThreeShowroom.isMobile();
  if (isMobile) {
    document.body.classList.add("is-mobile-device");
  }

  /* -------------------------------------------------------------------------- */
  /* 1. HERO FABRIC UNROLL SCRUBBING                                            */
  /* -------------------------------------------------------------------------- */
  if (!isMobile) {
    ThreeShowroom.initHeroScene();

    ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: "+=120%",
      pin: true,
      scrub: 0.8,
      onUpdate: (self) => {
        ThreeShowroom.scrubHeroFabric(self.progress);
        
        // Dynamic Hero UI Fades
        const heroPrompt = document.querySelector(".hero-scroll-indicator");
        const heroTitle = document.querySelector(".hero-header-content");
        if (heroPrompt) {
          heroPrompt.style.opacity = Math.max(0, 1 - self.progress * 4);
        }
        if (heroTitle) {
          heroTitle.style.opacity = Math.max(0, 1 - (self.progress - 0.5) * 2.5);
          heroTitle.style.transform = `translateY(${-self.progress * 60}px)`;
        }
      }
    });
  } else {
    // Mobile 2D Layered Fallback
    const mobileCloth = document.querySelector(".mobile-hero-cloth");
    if (mobileCloth) {
      gsap.to(mobileCloth, {
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "+=80%",
          scrub: 0.5,
          pin: true
        },
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        ease: "none"
      });
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 2. SIGNATURE 3D SHIRT ASSEMBLY (HEAVY 3D MOMENT - SCRUBBED PROGRESS)      */
  /* -------------------------------------------------------------------------- */
  if (!isMobile) {
    ThreeShowroom.initShirtScene();

    ScrollTrigger.create({
      trigger: "#shirt-assembly-section",
      start: "top top",
      end: "+=260%",
      pin: true,
      scrub: 0.6, // Direct scroll scrubbing
      anticipatePin: 1,
      onUpdate: (self) => {
        ThreeShowroom.scrubShirtAssembly(self.progress);
      }
    });
  } else {
    // Mobile 2D Exploded-View Garment Scrub
    initMobileShirtScrub();
  }

  /* -------------------------------------------------------------------------- */
  /* 3. FATHER & SON DIVERGING WALK SEQUENCE                                    */
  /* -------------------------------------------------------------------------- */
  initDuoSplitSequence();

  /* -------------------------------------------------------------------------- */
  /* 4. NEW ARRIVALS CONVEYOR BELT                                              */
  /* -------------------------------------------------------------------------- */
  initConveyorBelt();

  /* -------------------------------------------------------------------------- */
  /* 5. 360 INTERACTIVE TURNTABLE IN STUDIO                                     */
  /* -------------------------------------------------------------------------- */
  if (!isMobile) {
    ThreeShowroom.init360Viewer("studio-360-container");
  }
});

/**
 * Mobile 2D Exploded Assembly Sequence (0 WebGL, 60fps)
 */
function initMobileShirtScrub() {
  const parts = {
    torso: document.querySelector(".mobile-shirt-part.torso"),
    collar: document.querySelector(".mobile-shirt-part.collar"),
    sleeves: document.querySelector(".mobile-shirt-part.sleeves"),
    buttons: document.querySelector(".mobile-shirt-part.buttons")
  };

  if (!parts.torso) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#shirt-assembly-section",
      start: "top top",
      end: "+=180%",
      pin: true,
      scrub: 0.5
    }
  });

  tl.fromTo(parts.torso, { scale: 0.7, opacity: 0, y: 40 }, { scale: 1, opacity: 1, y: 0, duration: 0.25 })
    .fromTo(parts.collar, { y: -80, opacity: 0, scaleY: 0.5 }, { y: 0, opacity: 1, scaleY: 1, duration: 0.25 })
    .fromTo(parts.sleeves, { scaleX: 0.4, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.25 })
    .fromTo(parts.buttons, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25 });
}

/**
 * Father & Son Diverging Walk Sequence
 * Side-by-side walk -> Path split -> Flip-card landing
 */
function initDuoSplitSequence() {
  const fatherFigure = document.querySelector(".duo-walker.father");
  const sonFigure = document.querySelector(".duo-walker.son");
  const cardGents = document.querySelector(".collection-split-card.gents-card");
  const cardBoys = document.querySelector(".collection-split-card.boys-card");
  const stageHeader = document.querySelector(".duo-stage-title");

  if (!fatherFigure || !sonFigure) return;

  const splitTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#duo-split-section",
      start: "top top",
      end: "+=160%",
      pin: true,
      scrub: 0.8
    }
  });

  // Stage A (0% -> 30%): Walking together in center
  splitTl.fromTo([fatherFigure, sonFigure], 
    { y: 120, opacity: 0, scale: 0.85 },
    { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "power1.out" }
  )
  // Stage B (30% -> 70%): Diverging paths
  .to(fatherFigure, {
    x: -window.innerWidth * 0.24,
    scale: 1.08,
    duration: 0.4,
    ease: "power2.inOut"
  }, "split")
  .to(sonFigure, {
    x: window.innerWidth * 0.24,
    scale: 0.95,
    duration: 0.4,
    ease: "power2.inOut"
  }, "split")
  // Stage C (70% -> 100%): Flip-cards swing open
  .to([fatherFigure, sonFigure], {
    opacity: 0.25,
    duration: 0.3
  }, "cards")
  .fromTo(cardGents, {
    rotateY: -90,
    opacity: 0,
    scale: 0.9
  }, {
    rotateY: 0,
    opacity: 1,
    scale: 1,
    duration: 0.35,
    ease: "back.out(1.4)"
  }, "cards")
  .fromTo(cardBoys, {
    rotateY: 90,
    opacity: 0,
    scale: 0.9
  }, {
    rotateY: 0,
    opacity: 1,
    scale: 1,
    duration: 0.35,
    ease: "back.out(1.4)"
  }, "cards");
}

/**
 * Data-Driven New Arrivals Conveyor Belt
 * Automatically loads items with `isNewArrival: true` from products.js
 */
function initConveyorBelt() {
  const track = document.getElementById("conveyor-track");
  if (!track) return;

  const newArrivals = ProductStore.getNewArrivals();
  if (newArrivals.length === 0) return;

  // Render cards twice to create a seamless infinite loop
  const doubleList = [...newArrivals, ...newArrivals];
  track.innerHTML = doubleList.map((item, i) => `
    <div class="conveyor-card" data-product-id="${item.id}">
      <div class="conveyor-badge">New Arrival</div>
      <div class="conveyor-img-box">
        <img src="${item.images[0]}" alt="${item.name}" loading="lazy">
      </div>
      <div class="conveyor-body">
        <span class="conveyor-cat">${item.category === 'boys' ? "Junior Atelier" : "Gents Atelier"}</span>
        <h4 class="conveyor-title">${item.name}</h4>
        <div class="conveyor-material">${item.material}</div>
        <div class="conveyor-footer">
          <span class="conveyor-price">${cartManager ? cartManager.formatPrice(item.price) : '₹' + item.price}</span>
          <button class="conveyor-add-btn" onclick="cartManager.addItem('${item.id}', null, 1, this)">
            <span>Add</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>
      </div>
    </div>
  `).join("");

  // Smooth continuous animation
  const loopDuration = 32;
  const loopAnim = gsap.to(track, {
    xPercent: -50,
    ease: "none",
    duration: loopDuration,
    repeat: -1
  });

  // Pause on hover
  track.addEventListener("mouseenter", () => loopAnim.pause());
  track.addEventListener("mouseleave", () => loopAnim.play());

  // Scroll speed boost
  ScrollTrigger.create({
    trigger: "#new-arrivals",
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      // Temporarily speed up on scroll
      const velocity = Math.abs(self.getVelocity() / 300);
      loopAnim.timeScale(1 + Math.min(velocity, 4));
      gsap.to(loopAnim, { timeScale: 1, duration: 0.6, overwrite: "auto" });
    }
  });
}
