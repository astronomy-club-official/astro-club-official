
// =============================================================================
// HERO METEOR & HYPERSPACE WARP ENGINE (Exclusive to Hero Section)
// =============================================================================
const canvasWarp = document.getElementById("stars-bg");
if (canvasWarp) {
  const ctxWarp = canvasWarp.getContext("2d");

  const STAR_COUNT = 360;
  const MAX_DEPTH = 1000;
  const BASE_SPEED = 0.65;
  const BOOST_SPEED = 4.8;
  const STREAK_RATIO = 0.28;
  const TRAIL_ALPHA = 0.22;

  let W = 0,
    H = 0,
    cx = 0,
    cy = 0;
  let dpr = 1;
  let speed = BASE_SPEED;
  let targetSpeed = BASE_SPEED;

  const SPECTRAL_COLORS = [
    { r: 255, g: 255, b: 255 }, // Pure Diamond
    { r: 210, g: 238, b: 255 }, // Electric Blue-White
    { r: 120, g: 195, b: 255 }, // Deep Cyan
    { r: 255, g: 242, b: 215 }, // Stellar Warm
  ];

  let warpStars = [];
  function initWarpStars() {
    warpStars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.pow(Math.random(), 0.6) * Math.max(W, H) * 0.55;
      const color = SPECTRAL_COLORS[Math.floor(Math.random() * SPECTRAL_COLORS.length)];
      warpStars.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        z: Math.random() * MAX_DEPTH,
        size: 0.7 + Math.random() * 1.5,
        color,
      });
    }
  }

  // Shooting Star Meteors System
  let meteors = [];
  function spawnMeteor() {
    const startX = Math.random() * W * 1.2 - W * 0.1;
    const startY = Math.random() * H * 0.45;
    const angle = (Math.PI / 180) * (32 + Math.random() * 16); // 32 to 48 degree slant
    const meteorSpeed = 16 + Math.random() * 10;
    const length = 140 + Math.random() * 120;
    meteors.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * meteorSpeed,
      vy: Math.sin(angle) * meteorSpeed,
      length,
      alpha: 1,
      decay: 0.016 + Math.random() * 0.012,
      thickness: 1.5 + Math.random() * 1.2,
    });
  }

  let meteorTimer = 0;

  function resizeWarp() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvasWarp.width = W * dpr;
    canvasWarp.height = H * dpr;
    canvasWarp.style.width = W + "px";
    canvasWarp.style.height = H + "px";
    ctxWarp.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2;
    cy = H / 2;
    initWarpStars();
  }

  function drawWarp() {
    requestAnimationFrame(drawWarp);

    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    if (isLight) {
      ctxWarp.fillStyle = `rgba(238, 246, 251, ${TRAIL_ALPHA})`;
    } else {
      ctxWarp.fillStyle = `rgba(5, 10, 20, ${TRAIL_ALPHA})`;
    }
    ctxWarp.fillRect(0, 0, W, H);

    // Inertial speed interpolation on scroll
    speed += (targetSpeed - speed) * 0.08;
    targetSpeed += (BASE_SPEED - targetSpeed) * 0.03;

    // 1. Draw Warp Starfield
    for (let i = 0; i < STAR_COUNT; i++) {
      const s = warpStars[i];
      s.z -= speed;

      if (s.z <= 0) {
        s.z = MAX_DEPTH;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.pow(Math.random(), 0.6) * Math.max(W, H) * 0.55;
        s.x = Math.cos(angle) * dist;
        s.y = Math.sin(angle) * dist;
      }

      const k = 180 / s.z;
      const px = s.x * k + cx;
      const py = s.y * k + cy;

      if (px < -30 || px > W + 30 || py < -30 || py > H + 30) continue;

      const r = s.size * (1 - s.z / MAX_DEPTH) * 2.8;
      const rgb = isLight ? "16, 52, 92" : `${s.color.r}, ${s.color.g}, ${s.color.b}`;

      if (s.z < MAX_DEPTH * STREAK_RATIO) {
        const tailK = 180 / (s.z + speed * 2.6);
        const oldX = s.x * tailK + cx;
        const oldY = s.y * tailK + cy;

        const streakAlpha = (1 - s.z / (MAX_DEPTH * STREAK_RATIO)) * (isLight ? 0.45 : 0.95);

        const streakGrad = ctxWarp.createLinearGradient(px, py, oldX, oldY);
        streakGrad.addColorStop(0, `rgba(${rgb}, ${streakAlpha})`);
        streakGrad.addColorStop(1, `rgba(${rgb}, 0)`);

        ctxWarp.beginPath();
        ctxWarp.moveTo(px, py);
        ctxWarp.lineTo(oldX, oldY);
        ctxWarp.strokeStyle = streakGrad;
        ctxWarp.lineWidth = Math.max(0.8, r * 1.2);
        ctxWarp.lineCap = "round";
        ctxWarp.stroke();

        // Glowing Star Head
        ctxWarp.beginPath();
        ctxWarp.arc(px, py, Math.max(0.6, r * 0.7), 0, Math.PI * 2);
        ctxWarp.fillStyle = `rgba(255, 255, 255, ${streakAlpha})`;
        ctxWarp.fill();
      } else {
        ctxWarp.beginPath();
        ctxWarp.arc(px, py, Math.max(0.5, r * 0.6), 0, Math.PI * 2);
        ctxWarp.fillStyle = `rgba(${rgb}, ${isLight ? 0.35 : 0.8})`;
        ctxWarp.fill();
      }
    }

    // 2. Periodic Cinematic Shooting Star Meteors
    meteorTimer++;
    if (meteorTimer > 120 && Math.random() < 0.04) {
      spawnMeteor();
      meteorTimer = 0;
    }

    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.alpha -= m.decay;

      if (m.alpha <= 0 || m.x > W + 100 || m.y > H + 100) {
        meteors.splice(i, 1);
        continue;
      }

      const tailX = m.x - (m.vx / Math.hypot(m.vx, m.vy)) * m.length;
      const tailY = m.y - (m.vy / Math.hypot(m.vx, m.vy)) * m.length;

      const grad = ctxWarp.createLinearGradient(m.x, m.y, tailX, tailY);
      if (isLight) {
        grad.addColorStop(0, `rgba(16, 75, 136, ${m.alpha * 0.9})`);
        grad.addColorStop(0.3, `rgba(79, 163, 232, ${m.alpha * 0.6})`);
        grad.addColorStop(1, "rgba(79, 163, 232, 0)");
      } else {
        grad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
        grad.addColorStop(0.25, `rgba(147, 215, 255, ${m.alpha * 0.85})`);
        grad.addColorStop(0.65, `rgba(79, 163, 232, ${m.alpha * 0.45})`);
        grad.addColorStop(1, "rgba(79, 163, 232, 0)");
      }

      ctxWarp.beginPath();
      ctxWarp.moveTo(m.x, m.y);
      ctxWarp.lineTo(tailX, tailY);
      ctxWarp.strokeStyle = grad;
      ctxWarp.lineWidth = m.thickness;
      ctxWarp.lineCap = "round";
      ctxWarp.stroke();

      // Ionized Glowing Meteor Head
      ctxWarp.beginPath();
      ctxWarp.arc(m.x, m.y, m.thickness * 1.5, 0, Math.PI * 2);
      ctxWarp.fillStyle = isLight
        ? `rgba(11, 73, 132, ${m.alpha})`
        : `rgba(255, 255, 255, ${m.alpha})`;
      ctxWarp.fill();
    }

    // 3. Smooth bottom fade to transparent
    const fadeGrad = ctxWarp.createLinearGradient(0, H * 0.84, 0, H);
    if (isLight) {
      fadeGrad.addColorStop(0, "rgba(238, 246, 251, 0)");
      fadeGrad.addColorStop(1, "rgba(238, 246, 251, 1)");
    } else {
      fadeGrad.addColorStop(0, "rgba(5, 10, 20, 0)");
      fadeGrad.addColorStop(1, "rgba(5, 10, 20, 1)");
    }
    ctxWarp.fillStyle = fadeGrad;
    ctxWarp.fillRect(0, H * 0.84, W, H * 0.16);
  }

  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY < window.innerHeight * 1.4) {
        targetSpeed = BOOST_SPEED;
        if (Math.random() < 0.25) spawnMeteor();
      }
    },
    { passive: true },
  );

  resizeWarp();
  window.addEventListener("resize", resizeWarp);
  drawWarp();
}

// =============================================================================
// CELESTIAL CONSTELLATION ENGINE (High-Visibility Organic Cosmic Mesh)
// =============================================================================
const canvasBody = document.getElementById("stars-bg-body");
if (canvasBody) {
  const ctxBody = canvasBody.getContext("2d");

  let WB = 0,
    HB = 0,
    dprB = 1;
  const CONNECT_DIST = 135;
  const MOUSE_RADIUS = 175;

  const SPECTRAL_PALETTE = [
    { r: 255, g: 255, b: 255 }, // Pure Diamond White
    { r: 185, g: 228, b: 255 }, // High-Luminosity Ice Blue
    { r: 79,  g: 163, b: 232 }, // Electric Celestial Cyan
    { r: 255, g: 242, b: 210 }, // Solar Gold
  ];

  let dust = [];
  let stars = [];
  let mouse = {
    currX: -9999,
    currY: -9999,
    targetX: -9999,
    targetY: -9999,
    active: false,
  };

  let lastScrollY = window.scrollY;

  // Layer 0: Ambient micro-stars
  function createDust() {
    return {
      x: Math.random() * WB,
      y: Math.random() * HB,
      radius: 0.45 + Math.random() * 0.55,
      baseAlpha: 0.25 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.015 + Math.random() * 0.025,
      vx: (Math.random() - 0.5) * 0.14,
      vy: (Math.random() - 0.5) * 0.14,
    };
  }

  // Layer 1 & 2: Constellation nodes & Major Beacons
  function createConstellationStar() {
    const tier = Math.random();
    const isMajor = tier < 0.12; // 12% bright alpha beacons
    const isMedium = tier >= 0.12 && tier < 0.5;

    const radius = isMajor
      ? 2.8 + Math.random() * 1.0
      : isMedium
      ? 1.6 + Math.random() * 0.5
      : 0.9 + Math.random() * 0.4;

    const baseAlpha = isMajor
      ? 0.95
      : isMedium
      ? 0.75 + Math.random() * 0.2
      : 0.55 + Math.random() * 0.25;

    const color = SPECTRAL_PALETTE[Math.floor(Math.random() * SPECTRAL_PALETTE.length)];

    return {
      x: Math.random() * WB,
      y: Math.random() * HB,
      radius,
      baseAlpha,
      isMajor,
      color,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.015 + Math.random() * 0.025,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      angle: Math.random() * Math.PI * 2,
      angularSpeed: (Math.random() - 0.5) * 0.009,
      connections: 0,
    };
  }

  function resizeBody() {
    dprB = Math.min(window.devicePixelRatio || 1, 2);
    WB = window.innerWidth;
    HB = window.innerHeight;
    canvasBody.width = WB * dprB;
    canvasBody.height = HB * dprB;
    canvasBody.style.width = WB + "px";
    canvasBody.style.height = HB + "px";
    ctxBody.setTransform(dprB, 0, 0, dprB, 0, 0);

    const starCount = Math.max(70, Math.min(125, Math.floor((WB * HB) / 12500)));
    const dustCount = Math.max(60, Math.min(110, Math.floor((WB * HB) / 14000)));

    stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push(createConstellationStar());
    }

    dust = [];
    for (let i = 0; i < dustCount; i++) {
      dust.push(createDust());
    }
  }

  window.addEventListener("mousemove", (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.active = true;
  });

  window.addEventListener("mouseleave", () => {
    mouse.targetX = -9999;
    mouse.targetY = -9999;
    mouse.active = false;
  });

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;
    const deltaY = currentScroll - lastScrollY;
    lastScrollY = currentScroll;

    for (let i = 0; i < dust.length; i++) {
      dust[i].y -= deltaY * 0.06;
      if (dust[i].y < -10) dust[i].y = HB + 10;
      if (dust[i].y > HB + 10) dust[i].y = -10;
    }
    for (let i = 0; i < stars.length; i++) {
      stars[i].y -= deltaY * 0.03;
      if (stars[i].y < -15) stars[i].y = HB + 15;
      if (stars[i].y > HB + 15) stars[i].y = -15;
    }
  }, { passive: true });

  function drawBody() {
    requestAnimationFrame(drawBody);
    ctxBody.clearRect(0, 0, WB, HB);

    // Hero Isolation: On pages with a hero (.hero), completely hide the constellation
    // in the hero section so only the meteors run there. Fade in as user scrolls down.
    const heroEl = document.querySelector(".hero");
    if (heroEl) {
      const heroH = heroEl.offsetHeight || window.innerHeight;
      const sy = window.scrollY;
      const progress = Math.min(1, Math.max(0, (sy - heroH * 0.3) / (heroH * 0.4)));
      canvasBody.style.opacity = progress.toString();
    } else {
      canvasBody.style.opacity = "1";
    }

    const isLight = document.documentElement.getAttribute("data-theme") === "light";

    // Smooth cursor interpolation
    if (mouse.active) {
      mouse.currX += (mouse.targetX - mouse.currX) * 0.14;
      mouse.currY += (mouse.targetY - mouse.currY) * 0.14;
    } else {
      mouse.currX = -9999;
      mouse.currY = -9999;
    }

    // 1. Draw Layer 0: Ambient Micro-Star Dust
    for (let i = 0; i < dust.length; i++) {
      const d = dust[i];
      d.phase += d.pulseSpeed;
      d.x += d.vx;
      d.y += d.vy;

      if (d.x < 0) d.x = WB;
      if (d.x > WB) d.x = 0;
      if (d.y < 0) d.y = HB;
      if (d.y > HB) d.y = 0;

      const twinkle = 0.55 + 0.45 * Math.sin(d.phase);
      const alpha = d.baseAlpha * twinkle * (isLight ? 0.45 : 0.85);

      ctxBody.beginPath();
      ctxBody.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      ctxBody.fillStyle = isLight
        ? `rgba(16, 75, 136, ${alpha})`
        : `rgba(215, 238, 255, ${alpha})`;
      ctxBody.fill();
    }

    // 2. Update Constellation Nodes & Physics
    const starCount = stars.length;
    for (let i = 0; i < starCount; i++) {
      const s = stars[i];
      s.connections = 0;

      // Mouse Gravitational Attraction
      if (mouse.active) {
        const dxM = mouse.currX - s.x;
        const dyM = mouse.currY - s.y;
        const distM = Math.hypot(dxM, dyM);
        if (distM < MOUSE_RADIUS && distM > 8) {
          const force = (1 - distM / MOUSE_RADIUS) * 0.026;
          s.vx += (dxM / distM) * force;
          s.vy += (dyM / distM) * force;
        }
      }

      s.angle += s.angularSpeed;
      s.vx += Math.cos(s.angle) * 0.007;
      s.vy += Math.sin(s.angle) * 0.007;
      s.vx *= 0.985;
      s.vy *= 0.985;

      s.x += s.vx;
      s.y += s.vy;
      s.phase += s.pulseSpeed;

      if (s.x < -15) s.x = WB + 15;
      if (s.x > WB + 15) s.x = -15;
      if (s.y < -15) s.y = HB + 15;
      if (s.y > HB + 15) s.y = -15;
    }

    // 3. Draw High-Visibility Constellation Lines
    for (let i = 0; i < starCount; i++) {
      const a = stars[i];
      for (let j = i + 1; j < starCount; j++) {
        const b = stars[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;

        if (Math.abs(dx) > CONNECT_DIST || Math.abs(dy) > CONNECT_DIST) continue;

        const dist = Math.hypot(dx, dy);
        if (dist < CONNECT_DIST) {
          a.connections++;
          b.connections++;

          const ratio = 1 - dist / CONNECT_DIST;
          const alpha = Math.pow(ratio, 1.25) * (isLight ? 0.22 : 0.48);

          const grad = ctxBody.createLinearGradient(a.x, a.y, b.x, b.y);
          if (isLight) {
            grad.addColorStop(0, `rgba(16, 119, 136, ${alpha})`);
            grad.addColorStop(1, `rgba(11, 73, 132, ${alpha})`);
          } else {
            grad.addColorStop(
              0,
              `rgba(${a.color.r}, ${a.color.g}, ${a.color.b}, ${alpha})`
            );
            grad.addColorStop(
              1,
              `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, ${alpha})`
            );
          }

          ctxBody.beginPath();
          ctxBody.moveTo(a.x, a.y);
          ctxBody.lineTo(b.x, b.y);
          ctxBody.strokeStyle = grad;
          ctxBody.lineWidth = Math.max(0.6, ratio * 1.4);
          ctxBody.stroke();
        }
      }

      // 4. Mouse Interactive Laser Filament Ray Cast
      if (mouse.active) {
        const dxM = mouse.currX - a.x;
        const dyM = mouse.currY - a.y;
        if (Math.abs(dxM) < MOUSE_RADIUS && Math.abs(dyM) < MOUSE_RADIUS) {
          const distM = Math.hypot(dxM, dyM);
          if (distM < MOUSE_RADIUS) {
            const mRatio = 1 - distM / MOUSE_RADIUS;
            const mAlpha = Math.pow(mRatio, 1.2) * (isLight ? 0.35 : 0.72);

            ctxBody.beginPath();
            ctxBody.moveTo(a.x, a.y);
            ctxBody.lineTo(mouse.currX, mouse.currY);
            ctxBody.strokeStyle = isLight
              ? `rgba(16, 119, 136, ${mAlpha})`
              : `rgba(79, 163, 232, ${mAlpha})`;
            ctxBody.lineWidth = Math.max(0.7, mRatio * 1.6);
            ctxBody.stroke();
          }
        }
      }
    }

    // 5. Draw Prominent Glowing Constellation Stars & Diffraction Spikes
    for (let i = 0; i < starCount; i++) {
      const s = stars[i];
      const pulse = 0.75 + 0.25 * Math.sin(s.phase);
      const alpha = s.baseAlpha * pulse * (isLight ? 0.65 : 1.0);
      const rgb = isLight
        ? "16, 75, 136"
        : `${s.color.r}, ${s.color.g}, ${s.color.b}`;

      // Vibrant Corona Halo for Major Stars
      if (s.isMajor && !isLight) {
        const haloGrad = ctxBody.createRadialGradient(
          s.x,
          s.y,
          0,
          s.x,
          s.y,
          s.radius * 4.2
        );
        haloGrad.addColorStop(0, `rgba(${rgb}, ${alpha * 0.65})`);
        haloGrad.addColorStop(0.4, `rgba(79, 163, 232, ${alpha * 0.28})`);
        haloGrad.addColorStop(1, "rgba(79, 163, 232, 0)");

        ctxBody.beginPath();
        ctxBody.arc(s.x, s.y, s.radius * 4.2, 0, Math.PI * 2);
        ctxBody.fillStyle = haloGrad;
        ctxBody.fill();

        // 4-Point Optical Diffraction Spikes
        const spikeLen = s.radius * 4.6;
        ctxBody.beginPath();
        ctxBody.moveTo(s.x - spikeLen, s.y);
        ctxBody.lineTo(s.x + spikeLen, s.y);
        ctxBody.moveTo(s.x, s.y - spikeLen);
        ctxBody.lineTo(s.x, s.y + spikeLen);
        ctxBody.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.45})`;
        ctxBody.lineWidth = 0.75;
        ctxBody.stroke();
      }

      // Solid Star Core
      ctxBody.beginPath();
      ctxBody.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctxBody.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctxBody.fill();
    }
  }

  resizeBody();
  window.addEventListener("resize", resizeBody);
  drawBody();
}

// =============================================================================
// Stats Counter
// =============================================================================
const statsSection = document.querySelector(".stats");
if (statsSection) {
  const targets = [105, 24, 5, 6];
  const ids = ["s1", "s2", "s3", "s4"];
  let done = false;
  const obs = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !done) {
        done = true;
        const duration = 2000;
        const start = performance.now();
        function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = easeOut(progress);
          targets.forEach((t, i) => {
            const el = document.getElementById(ids[i]);
            if (el) el.textContent = Math.round(eased * t) + "+";
          });
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
    },
    { threshold: 0.3 },
  );
  obs.observe(statsSection);
}

// =============================================================================
// Card Entrance Animation
// =============================================================================
const co = new IntersectionObserver(
  (entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.style.opacity = "1";
          e.target.style.transform = "translateY(0)";
        }, i * 90);
        co.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 },
);
document.querySelectorAll(".program-card").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(28px)";
  el.style.transition = "opacity .5s ease, transform .5s ease";
  co.observe(el);
});

// =============================================================================
// Smooth Scroll
// =============================================================================
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id === "#") return;
    const t = document.querySelector(id);
    if (t) {
      e.preventDefault();
      t.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// =============================================================================
// Navbar Shrink on Scroll
// =============================================================================
window.addEventListener("scroll", () => {
  const nav = document.querySelector("nav");
  if (nav) nav.classList.toggle("nav-scrolled", window.scrollY > 50);
});

// =============================================================================
// Hamburger Menu
// =============================================================================
function initHamburger() {
  const hamburger = document.getElementById("nav-hamburger");
  const navLinks = document.getElementById("nav-links");

  if (!hamburger || !navLinks) return;

  function syncDrawerTop() {
    const nav = document.querySelector("nav");
    if (nav && window.innerWidth <= 868) {
      navLinks.style.top = nav.offsetHeight + "px";
    } else {
      navLinks.style.top = "";
    }
  }
  syncDrawerTop();
  window.addEventListener("resize", syncDrawerTop);

  function closeMenu() {
    navLinks.classList.remove("is-open");
    hamburger.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
  }

  hamburger.addEventListener("click", () => {
    const opening = !navLinks.classList.contains("is-open");
    syncDrawerTop();
    if (opening) {
      navLinks.classList.add("is-open");
      hamburger.classList.add("is-open");
      hamburger.setAttribute("aria-expanded", "true");
    } else {
      closeMenu();
    }
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 868) {
      closeMenu();
    }
  });
}

// Wait for components.js to inject the navbar, then init
const placeholder = document.getElementById("navbar-placeholder");
if (placeholder) {
  if (document.getElementById("nav-hamburger")) {
    initHamburger();
  } else {
    const mo = new MutationObserver(() => {
      if (document.getElementById("nav-hamburger")) {
        mo.disconnect();
        initHamburger();
      }
    });
    mo.observe(placeholder, { childList: true, subtree: true });
  }
} else {
  initHamburger();
}

// ═══════════════════════════════════════════════════════════════
// Gallery tab switcher - clean rewrite
// ═══════════════════════════════════════════════════════════════
(function () {
  const tabs = document.querySelectorAll(".gtab");
  const indicator = document.querySelector(".gtab-indicator");
  if (!tabs.length || !indicator) return; // All panel ids in order - direction is determined by index comparison

  const panelOrder = ["workshops", "astrophoto"];
  let current = "workshops";
  let animating = false;

  function switchTab(next) {
    if (next === current || animating) return;
    animating = true;

    const fromIdx = panelOrder.indexOf(current);
    const toIdx = panelOrder.indexOf(next);
    const goRight = toIdx > fromIdx; // moving to a later panel = slide in from right

    const outPanel = document.getElementById("panel-" + current);
    const inPanel = document.getElementById("panel-" + next); // 1. Move indicator pill

    indicator.classList.toggle("slide-right", goRight); // 2. Active tab highlight

    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === next)); // 3. Position incoming panel just off-screen (no transition yet)

    inPanel.style.transition = "none";
    inPanel.style.transform = goRight
      ? "translateX(100%)"
      : "translateX(-100%)";
    inPanel.style.opacity = "0";
    inPanel.style.position = "absolute";
    inPanel.style.top = "0";
    inPanel.style.left = "0";
    inPanel.style.width = "100%";
    inPanel.style.pointerEvents = "none"; // Force reflow - makes the browser register the starting position

    void inPanel.offsetWidth; // 4. Slide both panels simultaneously

    const TRANSITION =
      "opacity 0.38s ease, transform 0.38s cubic-bezier(0.4,0,0.2,1)"; // outgoing slides away

    outPanel.style.transition = TRANSITION;
    outPanel.style.transform = goRight
      ? "translateX(-100%)"
      : "translateX(100%)";
    outPanel.style.opacity = "0";
    outPanel.style.position = "absolute";
    outPanel.style.top = "0";
    outPanel.style.left = "0";
    outPanel.style.width = "100%";
    outPanel.style.pointerEvents = "none"; // incoming slides in

    inPanel.style.transition = TRANSITION;
    inPanel.style.transform = "translateX(0)";
    inPanel.style.opacity = "1"; // 5. After transition: make inPanel the layout owner, clean up outPanel

    setTimeout(() => {
      // Reset outgoing to hidden default (off right so it enters correctly next time)
      outPanel.style.transition = "none";
      outPanel.style.transform = goRight
        ? "translateX(100%)"
        : "translateX(-100%)";
      outPanel.style.opacity = "0";
      outPanel.style.position = "absolute";
      outPanel.style.pointerEvents = "none";
      outPanel.classList.remove("active"); // Make incoming the flow element

      inPanel.style.transition = "";
      inPanel.style.transform = "";
      inPanel.style.opacity = "";
      inPanel.style.position = "relative";
      inPanel.style.top = "";
      inPanel.style.left = "";
      inPanel.style.width = "";
      inPanel.style.pointerEvents = "";
      inPanel.classList.add("active");

      current = next;
      animating = false;
    }, 420);
  } // Init: ensure only workshops is visible, astrophoto is hidden off-right

  const initOut = document.getElementById("panel-astrophoto");
  if (initOut) {
    initOut.style.transition = "none";
    initOut.style.transform = "translateX(100%)";
    initOut.style.opacity = "0";
    initOut.style.position = "absolute";
    initOut.style.pointerEvents = "none";
    initOut.classList.remove("active");
  }
  const initIn = document.getElementById("panel-workshops");
  if (initIn) {
    initIn.style.position = "relative";
    initIn.style.transform = "";
    initIn.style.opacity = "";
    initIn.style.pointerEvents = "";
    initIn.classList.add("active");
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });
})();

// =============================================================================
// PROGRAM CARDS 3D TILT & SPOTLIGHT INTERACTION
// =============================================================================
(function initCardTilt() {
  const cards = document.querySelectorAll(".prog-intro-card");
  if (!cards.length) return;

  cards.forEach((card) => {
    const glow = card.querySelector(".prog-card-glow");

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;

      if (glow) {
        glow.style.opacity = "1";
        glow.style.background = `radial-gradient(500px circle at ${x}px ${y}px, rgba(79, 163, 232, 0.16), transparent 70%)`;
      }
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
      if (glow) glow.style.opacity = "0";
    });
  });
})();
