/**
 * SARTORIAL HERITAGE & SON - THREE.JS 3D SCENES & INTERACTIVE RUNTIMES
 * 
 * Includes:
 * 1. Mobile & Capability Detector (Auto-fallback to 2D)
 * 2. Procedural Fabric & Button Texture Synthesizer (Zero asset lag)
 * 3. Hero Scene: 3D Unrolling Fabric Bolt with Woven Gold Shop Crest
 * 4. Signature Scene: Pinned 3D Shirt Assembly Sequence (Scroll-scrubbed)
 * 5. Father & Son Diverging Walk Sequence
 * 6. 360° Interactive Product Turntable Viewer
 */

const ThreeShowroom = (() => {
  // Mobile / Low-Power Device Detector
  const isMobile = () => {
    return (
      window.innerWidth <= 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ('ontouchstart' in window && window.innerWidth <= 1024)
    );
  };

  // Helper: Procedural Canvas Texture Generator for Fabric Weaves
  const createFabricTexture = (type = 'oxford', colorHex = '#0B1325', accentHex = '#C5A880') => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 512, 512);

    if (type === 'oxford') {
      // Oxford basket-weave texture
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let x = 0; x < 512; x += 4) {
        for (let y = 0; y < 512; y += 4) {
          if ((x / 4 + y / 4) % 2 === 0) {
            ctx.fillRect(x, y, 4, 4);
          }
        }
      }
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      for (let x = 0; x < 512; x += 4) {
        ctx.fillRect(x, 0, 1, 512);
      }
      for (let y = 0; y < 512; y += 4) {
        ctx.fillRect(0, y, 512, 1);
      }
    } else if (type === 'herringbone') {
      // Chevron herringbone wool
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.lineWidth = 2;
      for (let x = -512; x < 1024; x += 16) {
        ctx.beginPath();
        for (let y = 0; y < 512; y += 16) {
          const dir = Math.floor(y / 16) % 2 === 0 ? 1 : -1;
          ctx.moveTo(x, y);
          ctx.lineTo(x + dir * 12, y + 16);
        }
        ctx.stroke();
      }
    } else if (type === 'woven-crest') {
      // Hero Bolt Fabric with Woven Shop Title
      // Base luxury royal navy weave
      ctx.fillStyle = '#09101d';
      ctx.fillRect(0, 0, 512, 512);

      // Fine golden thread weave background
      ctx.fillStyle = 'rgba(197, 168, 128, 0.12)';
      for (let x = 0; x < 512; x += 6) {
        for (let y = 0; y < 512; y += 6) {
          if ((x / 6 + y / 6) % 2 === 0) {
            ctx.fillRect(x, y, 3, 3);
          }
        }
      }

      // Elegant gold woven border
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 3;
      ctx.strokeRect(24, 24, 464, 464);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(32, 32, 448, 448);

      // MOCCA Crown / Emblem
      ctx.font = '32px serif';
      ctx.fillStyle = '#E5C07B';
      ctx.textAlign = 'center';
      ctx.fillText('👑', 256, 160);

      // Woven Shop Name
      ctx.font = 'bold 36px "Cinzel", "Playfair Display", serif';
      ctx.fillStyle = '#F5DEB3';
      ctx.letterSpacing = '6px';
      ctx.fillText('MOCCA', 256, 215);

      ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#D4AF37';
      ctx.letterSpacing = '3px';
      ctx.fillText('G E N T S  |  B O Y S', 256, 252);

      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#C5A880';
      ctx.letterSpacing = '1px';
      ctx.fillText('MODERN STYLE FOR EVERY GENERATION', 256, 285);
      ctx.fillText('CHATTIPARAMBA  •  MALAPPURAM', 256, 308);
    } else if (type === 'pearl') {
      // Mother-of-pearl iridescent button texture
      const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 250);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.3, '#F4F0E8');
      grad.addColorStop(0.6, '#E8E2D2');
      grad.addColorStop(0.85, '#D5DCD6');
      grad.addColorStop(1, '#B9B09F');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Rim sheen
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(256, 256, 240, 0, Math.PI * 2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  /* -------------------------------------------------------------------------- */
  /* SCENE 1: HERO FABRIC BOLT UNROLL                                          */
  /* -------------------------------------------------------------------------- */
  let heroScene, heroCamera, heroRenderer, heroBoltRoll, heroUnrolledCloth;
  let heroAnimProgress = 0;

  const initHeroScene = () => {
    const container = document.getElementById('hero-canvas-container');
    if (!container || isMobile()) {
      if (container) container.classList.add('mobile-fallback');
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    heroScene = new THREE.Scene();
    heroCamera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    heroCamera.position.set(0, 2.2, 5.8);
    heroCamera.lookAt(0, 0.35, 0);

    heroRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    heroRenderer.setSize(width, height);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    heroRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    heroRenderer.toneMappingExposure = 1.1;
    heroRenderer.shadowMap.enabled = true;
    container.appendChild(heroRenderer.domElement);

    // Warm Atelier Studio Lighting with Depth
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.7);
    heroScene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff0db, 1.8);
    keyLight.position.set(4, 6, 5);
    keyLight.castShadow = true;
    heroScene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xc5a880, 1.5);
    rimLight.position.set(-6, 3, -4);
    heroScene.add(rimLight);

    // Antique Tailor's Cutting Table
    const tableGeo = new THREE.BoxGeometry(10, 0.4, 6);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x1f140e,
      roughness: 0.6,
      metalness: 0.1
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -0.2;
    table.receiveShadow = true;
    heroScene.add(table);

    // Stacked Fabric Bolts in background
    const boltStackMat1 = new THREE.MeshStandardMaterial({
      map: createFabricTexture('herringbone', '#1A2130'),
      roughness: 0.8
    });
    const boltStackMat2 = new THREE.MeshStandardMaterial({
      map: createFabricTexture('oxford', '#6B2D24'),
      roughness: 0.75
    });

    const stack1 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 3.2, 32), boltStackMat1);
    stack1.rotation.z = Math.PI / 2;
    stack1.position.set(0, 0.45, -1.6);
    heroScene.add(stack1);

    const stack2 = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 3.2, 32), boltStackMat2);
    stack2.rotation.z = Math.PI / 2;
    stack2.position.set(0, 1.2, -1.6);
    heroScene.add(stack2);

    // Active Bolt that unrolls
    const crestTexture = createFabricTexture('woven-crest');
    crestTexture.repeat.set(1, 1);

    const rollCoreGeo = new THREE.CylinderGeometry(0.38, 0.38, 3.2, 32);
    const rollCoreMat = new THREE.MeshStandardMaterial({
      map: crestTexture,
      roughness: 0.7,
      metalness: 0.1
    });
    heroBoltRoll = new THREE.Mesh(rollCoreGeo, rollCoreMat);
    heroBoltRoll.rotation.z = Math.PI / 2;
    heroBoltRoll.position.set(0, 0.38, -0.6);
    heroBoltRoll.castShadow = true;
    heroScene.add(heroBoltRoll);

    // The Unrolling Cloth Plane
    const unrolledGeo = new THREE.PlaneGeometry(3.2, 4.2, 16, 24);
    const unrolledMat = new THREE.MeshStandardMaterial({
      map: crestTexture,
      roughness: 0.65,
      metalness: 0.12,
      side: THREE.DoubleSide
    });
    heroUnrolledCloth = new THREE.Mesh(unrolledGeo, unrolledMat);
    heroUnrolledCloth.rotation.x = -Math.PI / 2;
    heroUnrolledCloth.position.set(0, 0.02, -0.6);
    heroUnrolledCloth.scale.set(1, 0.001, 1);
    heroUnrolledCloth.receiveShadow = true;
    heroScene.add(heroUnrolledCloth);

    // Render loop
    const animateHero = () => {
      requestAnimationFrame(animateHero);
      if (heroRenderer && heroScene && heroCamera) {
        heroRenderer.render(heroScene, heroCamera);
      }
    };
    animateHero();

    window.addEventListener('resize', onHeroResize);
  };

  const onHeroResize = () => {
    const container = document.getElementById('hero-canvas-container');
    if (!container || !heroRenderer || !heroCamera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    heroCamera.aspect = width / height;
    heroCamera.updateProjectionMatrix();
    heroRenderer.setSize(width, height);
  };

  /**
   * Scrub Hero Fabric Unroll
   * progress: 0 to 1
   */
  const scrubHeroFabric = (progress) => {
    if (!heroBoltRoll || !heroUnrolledCloth) return;
    heroAnimProgress = progress;

    // Cylinder rolls forward along Z
    const startZ = -0.6;
    const endZ = 1.9;
    const curZ = startZ + (endZ - startZ) * Math.min(progress * 1.2, 1);

    heroBoltRoll.position.z = curZ;
    heroBoltRoll.rotation.x = (progress * 1.2) * (Math.PI * 3.5);

    // Unrolled cloth plane scales out behind the rolling cylinder
    const length = Math.max(0.001, curZ - startZ);
    heroUnrolledCloth.scale.y = length / 4.2;
    heroUnrolledCloth.position.z = startZ + length / 2;

    // Camera dynamic angle drift
    heroCamera.position.y = 2.2 - progress * 0.5;
    heroCamera.position.z = 5.8 - progress * 1.2;
    heroCamera.lookAt(0, 0.35, progress * 0.4);
  };

  /* -------------------------------------------------------------------------- */
  /* SCENE 2: SIGNATURE 3D SHIRT ASSEMBLY (THE ONE HEAVY 3D MOMENT)            */
  /* -------------------------------------------------------------------------- */
  let shirtScene, shirtCamera, shirtRenderer;
  let shirtParts = {};
  let shirtAssemblyGroup;

  const initShirtScene = () => {
    const container = document.getElementById('shirt-canvas-container');
    if (!container || isMobile()) {
      if (container) container.classList.add('mobile-fallback');
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    shirtScene = new THREE.Scene();
    shirtCamera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    shirtCamera.position.set(0, 0.2, 5.2);

    shirtRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    shirtRenderer.setSize(width, height);
    shirtRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    shirtRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    shirtRenderer.toneMappingExposure = 1.3;
    shirtRenderer.shadowMap.enabled = true;
    container.appendChild(shirtRenderer.domElement);

    // Studio Lighting for High-End Garment Reflection & Shadows
    const ambLight = new THREE.AmbientLight(0xfff5ea, 0.65);
    shirtScene.add(ambLight);

    const mainLight = new THREE.DirectionalLight(0xffeed6, 1.35);
    mainLight.position.set(4, 5, 5);
    shirtScene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0xc5a880, 0.9);
    rimLight.position.set(-4, -2, -3);
    shirtScene.add(rimLight);

    const topLight = new THREE.DirectionalLight(0xd4af37, 0.5);
    topLight.position.set(0, 6, 2);
    shirtScene.add(topLight);

    shirtAssemblyGroup = new THREE.Group();
    shirtScene.add(shirtAssemblyGroup);

    // Materials
    const shirtFabricTex = createFabricTexture('oxford', '#F0F3F7', '#C8D0DC');
    shirtFabricTex.repeat.set(6, 6);

    const whiteFabricMat = new THREE.MeshStandardMaterial({
      color: 0xe8ecf2,
      map: shirtFabricTex,
      roughness: 0.75,
      metalness: 0.04,
      side: THREE.DoubleSide
    });

    const navyAccentMat = new THREE.MeshStandardMaterial({
      color: 0x111c30,
      map: createFabricTexture('herringbone', '#111c30'),
      roughness: 0.6,
      metalness: 0.15
    });

    const pearlTex = createFabricTexture('pearl');
    const buttonMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: pearlTex,
      roughness: 0.2,
      metalness: 0.4
    });

    const goldThreadMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.3,
      metalness: 0.8
    });

    /* --- Part 1: Torso / Main Body Panels --- */
    // Back Panel
    const backGeo = new THREE.BoxGeometry(1.6, 2.2, 0.04);
    const backPanel = new THREE.Mesh(backGeo, whiteFabricMat);
    backPanel.position.set(0, -0.15, -0.18);
    shirtAssemblyGroup.add(backPanel);

    // Front Left Panel
    const frontLGeo = new THREE.BoxGeometry(0.78, 2.1, 0.04);
    const frontL = new THREE.Mesh(frontLGeo, whiteFabricMat);
    frontL.position.set(-0.39, -0.2, 0.18);
    shirtAssemblyGroup.add(frontL);

    // Front Right Panel (with Placket overlap)
    const frontRGeo = new THREE.BoxGeometry(0.82, 2.1, 0.04);
    const frontR = new THREE.Mesh(frontRGeo, whiteFabricMat);
    frontR.position.set(0.40, -0.2, 0.19);
    shirtAssemblyGroup.add(frontR);

    // Placket Center Strip
    const placketGeo = new THREE.BoxGeometry(0.18, 2.12, 0.06);
    const placket = new THREE.Mesh(placketGeo, whiteFabricMat);
    placket.position.set(0, -0.2, 0.22);
    shirtAssemblyGroup.add(placket);

    // Tailored Curved Hem Base
    const hemGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.12, 32, 1, false, 0, Math.PI);
    const hem = new THREE.Mesh(hemGeo, whiteFabricMat);
    hem.rotation.z = Math.PI;
    hem.position.set(0, -1.25, 0);
    shirtAssemblyGroup.add(hem);

    // Chest Pocket
    const pocketGeo = new THREE.BoxGeometry(0.38, 0.44, 0.02);
    const pocket = new THREE.Mesh(pocketGeo, whiteFabricMat);
    pocket.position.set(0.46, 0.18, 0.23);
    shirtAssemblyGroup.add(pocket);

    /* --- Part 2: Collar & Neckband --- */
    const collarGroup = new THREE.Group();
    collarGroup.position.set(0, 0.95, 0);

    // Neckband Ring
    const bandGeo = new THREE.CylinderGeometry(0.44, 0.48, 0.22, 32, 1, true);
    const neckband = new THREE.Mesh(bandGeo, whiteFabricMat);
    collarGroup.add(neckband);

    // Spread Collar Wings (Left & Right)
    const wingShapeL = new THREE.Shape();
    wingShapeL.moveTo(0, 0);
    wingShapeL.lineTo(-0.46, -0.42);
    wingShapeL.lineTo(-0.42, 0.1);
    wingShapeL.lineTo(0, 0.16);
    wingShapeL.closePath();

    const extrudeSettings = { depth: 0.03, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.01, bevelThickness: 0.01 };
    const wingLGeo = new THREE.ExtrudeGeometry(wingShapeL, extrudeSettings);
    const collarWingL = new THREE.Mesh(wingLGeo, whiteFabricMat);
    collarWingL.position.set(-0.06, 0.06, 0.44);
    collarWingL.rotation.y = 0.35;
    collarGroup.add(collarWingL);

    const wingShapeR = new THREE.Shape();
    wingShapeR.moveTo(0, 0);
    wingShapeR.lineTo(0.46, -0.42);
    wingShapeR.lineTo(0.42, 0.1);
    wingShapeR.lineTo(0, 0.16);
    wingShapeR.closePath();

    const wingRGeo = new THREE.ExtrudeGeometry(wingShapeR, extrudeSettings);
    const collarWingR = new THREE.Mesh(wingRGeo, whiteFabricMat);
    collarWingR.position.set(0.06, 0.06, 0.44);
    collarWingR.rotation.y = -0.35;
    collarGroup.add(collarWingR);

    shirtAssemblyGroup.add(collarGroup);

    /* --- Part 3: Sleeves & Barrel Cuffs --- */
    const sleeveLGroup = new THREE.Group();
    sleeveLGroup.position.set(-0.95, 0.72, 0);

    const sleeveLGeo = new THREE.CylinderGeometry(0.24, 0.18, 1.8, 24);
    const sleeveL = new THREE.Mesh(sleeveLGeo, whiteFabricMat);
    sleeveL.position.set(-0.55, -0.75, 0);
    sleeveL.rotation.z = 0.52;
    sleeveLGroup.add(sleeveL);

    // Left Cuff
    const cuffLGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.26, 24);
    const cuffL = new THREE.Mesh(cuffLGeo, whiteFabricMat);
    cuffL.position.set(-1.0, -1.55, 0);
    cuffL.rotation.z = 0.52;
    sleeveLGroup.add(cuffL);

    shirtAssemblyGroup.add(sleeveLGroup);

    const sleeveRGroup = new THREE.Group();
    sleeveRGroup.position.set(0.95, 0.72, 0);

    const sleeveRGeo = new THREE.CylinderGeometry(0.24, 0.18, 1.8, 24);
    const sleeveR = new THREE.Mesh(sleeveRGeo, whiteFabricMat);
    sleeveR.position.set(0.55, -0.75, 0);
    sleeveR.rotation.z = -0.52;
    sleeveRGroup.add(sleeveR);

    // Right Cuff
    const cuffRGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.26, 24);
    const cuffR = new THREE.Mesh(cuffRGeo, whiteFabricMat);
    cuffR.position.set(1.0, -1.55, 0);
    cuffR.rotation.z = -0.52;
    sleeveRGroup.add(cuffR);

    shirtAssemblyGroup.add(sleeveRGroup);

    /* --- Part 4: Mother-of-Pearl Buttons & Golden Stitch Accents --- */
    const buttonsGroup = new THREE.Group();
    buttonsGroup.position.set(0, 0, 0);
    const buttonList = [];

    const buttonGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.02, 24);
    buttonGeo.rotateX(Math.PI / 2);

    const buttonYPositions = [0.82, 0.52, 0.22, -0.08, -0.38, -0.68, -0.98];
    buttonYPositions.forEach((yPos) => {
      const bMesh = new THREE.Mesh(buttonGeo, buttonMat);
      bMesh.position.set(0, yPos, 0.25);

      // Gold cross stitch
      const stitchGeo = new THREE.BoxGeometry(0.038, 0.007, 0.005);
      const s1 = new THREE.Mesh(stitchGeo, goldThreadMat);
      s1.position.set(0, 0, 0.012);
      s1.rotation.z = 0.785;
      const s2 = new THREE.Mesh(stitchGeo, goldThreadMat);
      s2.position.set(0, 0, 0.012);
      s2.rotation.z = -0.785;
      bMesh.add(s1);
      bMesh.add(s2);

      buttonsGroup.add(bMesh);
      buttonList.push(bMesh);
    });

    shirtAssemblyGroup.add(buttonsGroup);

    // Store parts references for scrubbing
    shirtParts = {
      group: shirtAssemblyGroup,
      backPanel,
      frontL,
      frontR,
      placket,
      hem,
      pocket,
      collarGroup,
      collarWingL,
      collarWingR,
      sleeveLGroup,
      sleeveRGroup,
      buttonsGroup,
      buttonList
    };

    // Store original resting transforms
    shirtParts.rest = {
      backZ: backPanel.position.z,
      frontLZ: frontL.position.z,
      frontRZ: frontR.position.z,
      collarY: collarGroup.position.y,
      sleeveLX: sleeveLGroup.position.x,
      sleeveRX: sleeveRGroup.position.x,
      buttonsZ: 0.25
    };

    // Initial state: Start exploded
    scrubShirtAssembly(0);

    // Gentle mouse tilt reaction on desktop
    document.addEventListener('mousemove', (e) => {
      if (!shirtAssemblyGroup) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      shirtAssemblyGroup.rotation.y += (nx * 0.2 - shirtAssemblyGroup.rotation.y) * 0.05;
      shirtAssemblyGroup.rotation.x += (-ny * 0.15 - shirtAssemblyGroup.rotation.x) * 0.05;
    });

    // Render loop
    const animateShirt = () => {
      requestAnimationFrame(animateShirt);
      if (shirtRenderer && shirtScene && shirtCamera) {
        shirtRenderer.render(shirtScene, shirtCamera);
      }
    };
    animateShirt();

    window.addEventListener('resize', onShirtResize);
  };

  const onShirtResize = () => {
    const container = document.getElementById('shirt-canvas-container');
    if (!container || !shirtRenderer || !shirtCamera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    shirtCamera.aspect = width / height;
    shirtCamera.updateProjectionMatrix();
    shirtRenderer.setSize(width, height);
  };

  /**
   * Signature Scrubbing Function:
   * progress: 0.0 to 1.0 (Directly bound to scroll position via GSAP)
   * 
   * Stage 1 (0.00 - 0.25): Torso panels fly in and seam together
   * Stage 2 (0.25 - 0.50): Collar unit folds around neckband and snaps down
   * Stage 3 (0.50 - 0.75): Left and Right sleeves glide in and attach
   * Stage 4 (0.75 - 0.90): Mother-of-pearl buttons float in and snap down placket
   * Stage 5 (0.90 - 1.00): Master 360 showcase rotation
   */
  const scrubShirtAssembly = (p) => {
    if (!shirtParts.group) return;

    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    const smooth = (val) => val * val * (3 - 2 * val); // smoothstep ease

    // --- STAGE 1: Torso Assembly (0.0 -> 0.25) ---
    const tProgress = smooth(clamp(p / 0.25, 0, 1));
    const invT = 1 - tProgress;

    shirtParts.backPanel.position.z = shirtParts.rest.backZ - invT * 3.5;
    shirtParts.backPanel.position.y = -0.15 - invT * 1.5;
    shirtParts.backPanel.rotation.x = invT * 0.6;
    shirtParts.backPanel.material.opacity = 0.2 + tProgress * 0.8;

    shirtParts.frontL.position.x = -0.39 - invT * 2.2;
    shirtParts.frontL.position.z = shirtParts.rest.frontLZ + invT * 2.0;
    shirtParts.frontL.rotation.y = invT * 0.8;

    shirtParts.frontR.position.x = 0.40 + invT * 2.2;
    shirtParts.frontR.position.z = shirtParts.rest.frontRZ + invT * 2.0;
    shirtParts.frontR.rotation.y = -invT * 0.8;

    shirtParts.placket.position.z = 0.22 + invT * 2.5;
    shirtParts.hem.position.y = -1.25 - invT * 1.0;
    shirtParts.pocket.position.z = 0.23 + invT * 2.2;

    // --- STAGE 2: Collar Assembly (0.25 -> 0.50) ---
    const cProgress = smooth(clamp((p - 0.25) / 0.25, 0, 1));
    const invC = 1 - cProgress;

    shirtParts.collarGroup.position.y = shirtParts.rest.collarY + invC * 2.8;
    shirtParts.collarGroup.position.z = invC * 1.5;
    shirtParts.collarGroup.rotation.x = -invC * 1.2;
    shirtParts.collarWingL.rotation.y = 0.35 + invC * 0.9;
    shirtParts.collarWingR.rotation.y = -0.35 - invC * 0.9;

    // --- STAGE 3: Sleeves Assembly (0.50 -> 0.75) ---
    const sProgress = smooth(clamp((p - 0.50) / 0.25, 0, 1));
    const invS = 1 - sProgress;

    shirtParts.sleeveLGroup.position.x = shirtParts.rest.sleeveLX - invS * 3.2;
    shirtParts.sleeveLGroup.position.y = 0.72 + invS * 1.2;
    shirtParts.sleeveLGroup.rotation.z = invS * 0.8;

    shirtParts.sleeveRGroup.position.x = shirtParts.rest.sleeveRX + invS * 3.2;
    shirtParts.sleeveRGroup.position.y = 0.72 + invS * 1.2;
    shirtParts.sleeveRGroup.rotation.z = -invS * 0.8;

    // --- STAGE 4: Mother-of-Pearl Buttons (0.75 -> 0.90) ---
    const bProgress = clamp((p - 0.75) / 0.15, 0, 1);
    shirtParts.buttonList.forEach((btn, index) => {
      const staggerDelay = index / shirtParts.buttonList.length;
      const subProg = smooth(clamp((bProgress - staggerDelay * 0.5) / 0.5, 0, 1));
      const invB = 1 - subProg;

      btn.position.z = shirtParts.rest.buttonsZ + invB * 3.0;
      btn.scale.setScalar(subProg);
      btn.rotation.z = invB * Math.PI;
    });

    // --- STAGE 5: The Grand Showcase Rotation (0.90 -> 1.00) ---
    if (p >= 0.88) {
      const showcaseProg = (p - 0.88) / 0.12;
      shirtParts.group.rotation.y = showcaseProg * Math.PI * 2;
      shirtParts.group.position.y = Math.sin(showcaseProg * Math.PI) * 0.15;
    } else {
      shirtParts.group.rotation.y = 0;
      shirtParts.group.position.y = 0;
    }

    // Update dynamic stage callouts in HTML UI
    updateAssemblyHotspot(p);
  };

  const updateAssemblyHotspot = (p) => {
    const badges = document.querySelectorAll('.assembly-stage-card');
    let activeIdx = 0;
    if (p < 0.25) activeIdx = 0;
    else if (p < 0.50) activeIdx = 1;
    else if (p < 0.75) activeIdx = 2;
    else if (p < 0.90) activeIdx = 3;
    else activeIdx = 4;

    badges.forEach((b, i) => {
      if (i === activeIdx) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    const progressMeter = document.querySelector('.assembly-meter-fill');
    if (progressMeter) {
      progressMeter.style.height = `${Math.round(p * 100)}%`;
    }
  };

  /* -------------------------------------------------------------------------- */
  /* SCENE 3: 360° DRAG-TO-SPIN PRODUCT TURNTABLE                               */
  /* -------------------------------------------------------------------------- */
  let spinScene, spinCamera, spinRenderer, spinModelGroup;
  let isDraggingSpin = false;
  let previousMouseX = 0;
  let spinVelocity = 0;

  const init360Viewer = (containerId = 'product-360-container') => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    const width = container.clientWidth || 450;
    const height = container.clientHeight || 450;

    spinScene = new THREE.Scene();
    spinCamera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    spinCamera.position.set(0, 0.5, 4.2);

    spinRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    spinRenderer.setSize(width, height);
    spinRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    spinRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    spinRenderer.toneMappingExposure = 1.3;
    container.appendChild(spinRenderer.domElement);

    // Warm Studio Lighting with Balanced Contrast
    const amb = new THREE.AmbientLight(0xfff8ed, 0.65);
    spinScene.add(amb);

    const dir1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dir1.position.set(3, 4, 3);
    spinScene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0xc5a880, 0.8);
    dir2.position.set(-3, -1, -2);
    spinScene.add(dir2);

    spinModelGroup = new THREE.Group();
    spinScene.add(spinModelGroup);

    // Base Garment geometry for 360 inspection (Luxury Folded/Mannequin Bust)
    const bustMat = new THREE.MeshStandardMaterial({
      color: 0xe6eaf0,
      map: createFabricTexture('oxford', '#f0f3f7'),
      roughness: 0.72,
      metalness: 0.05
    });

    const torsoBust = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 1.6, 32), bustMat);
    spinModelGroup.add(torsoBust);

    // Collar
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.40, 0.28, 32), bustMat);
    collar.position.y = 0.85;
    spinModelGroup.add(collar);

    // Stand base
    const standMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 16), standMat);
    pole.position.y = -1.2;
    spinModelGroup.add(pole);

    const basePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 32), standMat);
    basePlate.position.y = -1.8;
    spinModelGroup.add(basePlate);

    // Drag-to-spin interaction handlers
    const dom = spinRenderer.domElement;

    const onPointerDown = (e) => {
      isDraggingSpin = true;
      previousMouseX = e.clientX || (e.touches && e.touches[0].clientX);
      dom.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
      if (!isDraggingSpin || !spinModelGroup) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const deltaX = clientX - previousMouseX;
      previousMouseX = clientX;
      spinModelGroup.rotation.y += deltaX * 0.015;
      spinVelocity = deltaX * 0.015;
    };

    const onPointerUp = () => {
      isDraggingSpin = false;
      dom.style.cursor = 'grab';
    };

    dom.style.cursor = 'grab';
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Animation Loop with Inertia Damping
    const animateSpin = () => {
      requestAnimationFrame(animateSpin);
      if (!isDraggingSpin && Math.abs(spinVelocity) > 0.0001) {
        spinModelGroup.rotation.y += spinVelocity;
        spinVelocity *= 0.92; // Friction damping
      }
      if (spinRenderer && spinScene && spinCamera) {
        spinRenderer.render(spinScene, spinCamera);
      }
    };
    animateSpin();
  };

  return {
    isMobile,
    initHeroScene,
    scrubHeroFabric,
    initShirtScene,
    scrubShirtAssembly,
    init360Viewer
  };
})();
