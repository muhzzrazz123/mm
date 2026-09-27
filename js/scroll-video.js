/**
 * MOCCA GENTS & BOYS - SCROLL-DRIVEN VIDEO EXPERIENCE
 * 
 * Features:
 * - Fullscreen fixed <canvas> rendering 60 numbered WebP frames across clips 1-5
 * - Lenis Smooth Momentum Scrolling + GSAP ScrollTrigger
 * - Bidirectional frame scrubbing (scroll down = skater advances, scroll up = reverses)
 * - Progressive image preloader with loading screen %
 * - Mobile bandwidth-optimized frame set
 * - Prefers-reduced-motion compliance
 * - Dynamic New Arrivals loader from JSON
 */

const ScrollVideoExperience = (() => {
  const TOTAL_CLIPS = 5;
  const FRAMES_PER_CLIP = 12;
  const TOTAL_FRAMES = TOTAL_CLIPS * FRAMES_PER_CLIP; // 60 frames

  let canvas, ctx;
  let frames = [];
  let isMobile = false;
  let isReducedMotion = false;
  let currentFrameIndex = 0;
  let lenisInstance = null;

  const init = async () => {
    canvas = document.getElementById('video-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Detect reduced motion preference
    isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Detect mobile device
    isMobile = window.innerWidth <= 768 || ('ontouchstart' in window && window.innerWidth <= 1024);

    resizeCanvas();
    window.addEventListener('resize', onResize);

    if (isReducedMotion) {
      handleReducedMotion();
      return;
    }

    // Initialize smooth momentum scrolling via Lenis
    initLenis();

    // Preload frames progressively
    await preloadFrames();

    // Setup GSAP ScrollTrigger frame binding & section transitions
    initScrollTriggers();

    // Load New Arrivals from JSON
    loadNewArrivalsFromJSON();
  };

  const resizeCanvas = () => {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawFrame(currentFrameIndex);
  };

  const onResize = () => {
    resizeCanvas();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  };

  /**
   * Initialize Lenis Smooth Scroll
   */
  const initLenis = () => {
    if (typeof Lenis === 'undefined') {
      console.warn('Lenis library not detected, fallback to standard scroll.');
      return;
    }

    lenisInstance = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4
    });

    lenisInstance.on('scroll', () => {
      if (window.ScrollTrigger) ScrollTrigger.update();
    });

    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  };

  /**
   * Preload 60 WebP Frames Progressively
   */
  const preloadFrames = () => {
    return new Promise((resolve) => {
      const loaderScreen = document.getElementById('preloader-screen');
      const progressBar = document.getElementById('preloader-fill');
      const progressText = document.getElementById('preloader-percent');

      const basePath = isMobile ? 'frames/mobile/' : 'frames/';
      let loadedCount = 0;

      // Build sequence of paths for Clip 1 through Clip 5
      const framePaths = [];
      for (let clipIdx = 1; clipIdx <= TOTAL_CLIPS; clipIdx++) {
        for (let frameIdx = 1; frameIdx <= FRAMES_PER_CLIP; frameIdx++) {
          const frameNum = String(frameIdx).padStart(3, '0');
          framePaths.push(`${basePath}clip${clipIdx}/frame_${frameNum}.webp`);
        }
      }

      let dismissed = false;
      const dismissLoader = () => {
        if (dismissed) return;
        dismissed = true;
        drawFrame(currentFrameIndex);
        if (loaderScreen && window.gsap) {
          gsap.to(loaderScreen, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => {
              loaderScreen.style.display = 'none';
              resolve();
            }
          });
        } else {
          if (loaderScreen) loaderScreen.style.display = 'none';
          resolve();
        }
      };

      // Safety fallback: Never keep the screen blocked for more than 2.5s
      setTimeout(() => {
        if (!dismissed) {
          dismissLoader();
        }
      }, 2500);

      framePaths.forEach((path, index) => {
        const img = new Image();
        img.src = path;

        const onImageComplete = () => {
          loadedCount++;
          frames[index] = img;

          const pct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
          if (progressBar) progressBar.style.width = `${pct}%`;
          if (progressText) progressText.textContent = `${pct}%`;

          // Draw initial frame as soon as first one is ready
          if (index === 0) {
            drawFrame(0);
          }

          // Once hero clip (first 12 frames) is buffered or all frames ready, release loader
          if (loadedCount === TOTAL_FRAMES || (loadedCount >= 12 && index === 11)) {
            setTimeout(dismissLoader, 300);
          }
        };

        img.onload = onImageComplete;
        img.onerror = () => {
          onImageComplete();
        };
      });
    });
  };

  /**
   * Draw Current Frame on Fullscreen Canvas with 'cover' Aspect Ratio
   */
  const drawFrame = (frameIndex) => {
    if (!ctx || !canvas) return;
    const img = frames[frameIndex] || frames[0];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    currentFrameIndex = frameIndex;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Calculate aspect ratio cover
    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale;
    const nh = ih * scale;
    const cx = (cw - nw) / 2;
    const cy = (ch - nh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, cx, cy, nw, nh);
  };

  /**
   * Setup GSAP ScrollTrigger Frame Mapping & Section HUD Animations
   */
  const initScrollTriggers = () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const SECTION_CLIPS = [
      { id: '#section-hero', startFrame: 0, endFrame: 11, nav: 'hero' },
      { id: '#section-gents', startFrame: 12, endFrame: 23, nav: 'gents' },
      { id: '#section-boys', startFrame: 24, endFrame: 35, nav: 'boys' },
      { id: '#section-new-arrivals', startFrame: 36, endFrame: 47, nav: 'arrivals' },
      { id: '#section-counter', startFrame: 48, endFrame: 59, nav: 'counter' }
    ];

    SECTION_CLIPS.forEach((clip) => {
      ScrollTrigger.create({
        trigger: clip.id,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 0.25,
        onUpdate: (self) => {
          const frameSpan = clip.endFrame - clip.startFrame;
          const localFrame = Math.min(
            clip.endFrame,
            Math.max(clip.startFrame, Math.round(clip.startFrame + self.progress * frameSpan))
          );
          if (localFrame !== currentFrameIndex) {
            drawFrame(localFrame);
          }
        },
        onEnter: () => activateNav(clip.nav),
        onEnterBack: () => activateNav(clip.nav)
      });
    });

    // Global scroll progress meter on top edge
    ScrollTrigger.create({
      trigger: '#scroll-experience-container',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const meter = document.getElementById('global-scroll-meter-fill');
        if (meter) meter.style.width = `${Math.round(self.progress * 100)}%`;
      }
    });

    // Animate content entrance fades as user approaches each section
    gsap.utils.toArray('.clip-section-card').forEach((card) => {
      gsap.fromTo(card,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'top 40%',
            scrub: 0.5
          }
        }
      );
    });
  };

  const activateNav = (sectionId) => {
    document.querySelectorAll('.clip-nav-pill').forEach(pill => {
      if (pill.getAttribute('data-target') === sectionId) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  };

  /**
   * Load New Arrivals from data/new_arrivals.json
   */
  const loadNewArrivalsFromJSON = async () => {
    const grid = document.getElementById('new-arrivals-json-grid');
    if (!grid) return;

    try {
      const res = await fetch('data/new_arrivals.json');
      const items = await res.json();
      if (window.ProductStore) {
        items.forEach(item => ProductStore.registerItem(item));
      }

      grid.innerHTML = items.map(item => `
        <div class="video-product-card" data-id="${item.id}">
          <div class="card-tag ${item.category}">${item.tag}</div>
          <div class="card-img-wrap">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
          </div>
          <div class="card-info">
            <span class="card-cat">${item.category === 'boys' ? "Junior Suite" : "Gents Atelier"}</span>
            <h4 class="card-title">${item.name}</h4>
            <div class="card-material">${item.material}</div>
            
            <div class="card-sizes">
              ${item.sizes.map((s, idx) => `
                <button class="size-chip ${idx === 0 ? 'selected' : ''}" onclick="selectProductSize('${item.id}', '${s}', this)">${s}</button>
              `).join('')}
            </div>

            <div class="card-footer">
              <span class="card-price">₹${item.price.toLocaleString('en-IN')}</span>
              <button class="btn-card-add" onclick="handleAddProductToCart('${item.id}', this)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                <span>Add to Bag</span>
              </button>
            </div>
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.warn('Could not load data/new_arrivals.json, using fallback from products.js', err);
      // Fallback from ProductStore
      if (window.ProductStore) {
        const fallback = ProductStore.getNewArrivals();
        grid.innerHTML = fallback.map(item => `
          <div class="video-product-card">
            <div class="card-img-wrap"><img src="${item.images[0]}" alt="${item.name}"></div>
            <div class="card-info">
              <h4 class="card-title">${item.name}</h4>
              <div class="card-material">${item.material}</div>
              <div class="card-footer">
                <span class="card-price">₹${item.price.toLocaleString('en-IN')}</span>
                <button class="btn-card-add" onclick="handleAddProductToCart('${item.id}', this)">Add</button>
              </div>
            </div>
          </div>
        `).join('');
      }
    }
  };

  /**
   * Reduced Motion Accessibility Fallback
   */
  const handleReducedMotion = () => {
    document.body.classList.add('reduced-motion');
    const loaderScreen = document.getElementById('preloader-screen');
    if (loaderScreen) loaderScreen.style.display = 'none';

    // Draw poster fallback
    const poster = new Image();
    poster.src = 'frames/poster.webp';
    poster.onload = () => {
      frames[0] = poster;
      drawFrame(0);
    };
    loadNewArrivalsFromJSON();
  };

  return {
    init,
    drawFrame,
    lenis: () => lenisInstance
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ScrollVideoExperience.init();
  });
} else {
  ScrollVideoExperience.init();
}
