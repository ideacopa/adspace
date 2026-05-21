/* ==========================================================================
   Antigravity Linktree Portal - Main Script
   Features: Upwards Particle Canvas, Zero-Gravity Vector Physics, Click Stats
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE SYSTEM ---
  const state = {
    zeroGravity: false,
    mouse: { x: -1000, y: -1000, screenX: -1000, screenY: -1000 },
    stats: JSON.parse(localStorage.getItem('antigravity_link_stats')) || {
      'link-docs': 42,
      'link-sandbox': 18,
      'link-github': 105,
      'link-discord': 29,
      'sponsor-neon': 64,
      'sponsor-vapor': 51
    }
  };

  // Save initial stats if not present
  if (!localStorage.getItem('antigravity_link_stats')) {
    localStorage.setItem('antigravity_link_stats', JSON.stringify(state.stats));
  }

  // Track global mouse position
  window.addEventListener('mousemove', (e) => {
    state.mouse.screenX = e.clientX;
    state.mouse.screenY = e.clientY;
  });

  // --- 1. DYNAMIC CANVAS BACKGROUND (ANTIGRAVITY STARFIELD) ---
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let animationFrameId;

  let stars = [];
  const starCount = 80;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        // Moves slowly UPWARDS (defying gravity)
        speedY: -(Math.random() * 0.4 + 0.1),
        speedX: (Math.random() * 0.1 - 0.05),
        alpha: Math.random() * 0.8 + 0.2,
        decay: Math.random() * 0.015 + 0.005,
        color: Math.random() > 0.6 ? '#06b6d4' : (Math.random() > 0.7 ? '#8b5cf6' : '#ffffff')
      });
    }
  }

  function updateAndDrawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];

      // Update positions
      s.y += s.speedY;
      s.x += s.speedX;

      // Wrap-around logic (rising particles)
      if (s.y < -10) {
        s.y = canvas.height + 10;
        s.x = Math.random() * canvas.width;
      }
      if (s.x < -10 || s.x > canvas.width + 10) {
        s.x = Math.random() * canvas.width;
      }

      // Parallax hover effect from screen mouse
      let offsetX = 0;
      let offsetY = 0;
      if (state.mouse.screenX >= 0) {
        const dx = state.mouse.screenX - canvas.width / 2;
        const dy = state.mouse.screenY - canvas.height / 2;
        offsetX = dx * (s.size * 0.015);
        offsetY = dy * (s.size * 0.015);
      }

      // Pulse alpha
      s.alpha += s.decay;
      if (s.alpha > 0.95 || s.alpha < 0.15) {
        s.decay = -s.decay;
      }

      // Draw particle
      ctx.save();
      ctx.beginPath();
      ctx.arc(s.x + offsetX, s.y + offsetY, s.size, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
      
      // Dynamic neon glow for colored particles
      if (s.color !== '#ffffff') {
        ctx.shadowBlur = s.size * 4;
        ctx.shadowColor = s.color;
      }
      
      ctx.fill();
      ctx.restore();
    }

    animationFrameId = requestAnimationFrame(updateAndDrawStars);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  updateAndDrawStars();


  // --- 2. ZERO-GRAVITY VECTOR PHYSICS PORTAL ENGINE ---
  const cards = [];
  const cardElements = document.querySelectorAll('.link-card');
  const portalCard = document.querySelector('.portal-card');
  const gravityToggle = document.getElementById('gravity-toggle');

  // Initialize physics physics objects for each card
  cardElements.forEach((el, index) => {
    cards.push({
      el: el,
      x: 0,           // Current offset X
      y: 0,           // Current offset Y
      vx: 0,          // Velocity X
      vy: 0,          // Velocity Y
      phase: index * 1.3, // Distinct movement offset phase
      homeX: 0,
      homeY: 0
    });
  });

  // Track cursor relative coordinates for portal cards
  let portalRect = portalCard.getBoundingClientRect();
  window.addEventListener('scroll', () => {
    portalRect = portalCard.getBoundingClientRect();
  });
  window.addEventListener('resize', () => {
    portalRect = portalCard.getBoundingClientRect();
  });

  // Physics animation loop
  let lastTime = 0;
  function physicsLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 16.666, 3); // cap delta time
    lastTime = timestamp;

    portalRect = portalCard.getBoundingClientRect();

    cards.forEach((card) => {
      // Get the bounding box of the card to find its center
      const rect = card.el.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      if (state.zeroGravity) {
        // --- Zero Gravity Physics Engine (Active State) ---

        // 1. Organic slow drift target (Lissajous cosmic orbits)
        card.phase += 0.015 * dt;
        const driftTargetX = Math.sin(card.phase) * 14;
        const driftTargetY = Math.cos(card.phase * 0.7) * 14;

        // 2. Electrostatic Mouse Repulsion Force
        let forceX = 0;
        let forceY = 0;
        const dx = cardCenterX - state.mouse.screenX;
        const dy = cardCenterY - state.mouse.screenY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxRepulseDist = 140; // repulsion radius

        if (distance < maxRepulseDist && distance > 10) {
          // Force is strongest when cursor is closer
          const strength = (maxRepulseDist - distance) / maxRepulseDist;
          const pushForce = strength * strength * 3.5;
          forceX = (dx / distance) * pushForce;
          forceY = (dy / distance) * pushForce;
        }

        // Apply forces to velocity with custom inertia damping
        card.vx += (forceX + (driftTargetX - card.x) * 0.015) * dt;
        card.vy += (forceY + (driftTargetY - card.y) * 0.015) * dt;

        // Friction / drag coefficient
        card.vx *= Math.pow(0.88, dt);
        card.vy *= Math.pow(0.88, dt);

        // Apply displacement
        card.x += card.vx * dt;
        card.y += card.vy * dt;

        // Floating constraint boundary to prevent link boxes exiting card panel
        const maxDisplacement = 40;
        const currentDist = Math.sqrt(card.x * card.x + card.y * card.y);
        if (currentDist > maxDisplacement) {
          card.x = (card.x / currentDist) * maxDisplacement;
          card.y = (card.y / currentDist) * maxDisplacement;
          card.vx *= -0.5; // bounce back
          card.vy *= -0.5;
        }

        // Apply hardware-accelerated transformation matrix
        card.el.style.transform = `translate3d(${card.x.toFixed(2)}px, ${card.y.toFixed(2)}px, 0) scale(1.015)`;
        card.el.style.boxShadow = `
          ${-card.x * 0.4}px ${-card.y * 0.4 + 10}px 24px rgba(0, 0, 0, 0.25),
          0 0 15px rgba(139, 92, 246, ${0.1 + (Math.abs(card.vx) + Math.abs(card.vy)) * 0.05})
        `;
      } else {
        // --- Standard gravity recovery back to zero position ---
        const recoverySpeed = 0.15;
        card.x += (0 - card.x) * recoverySpeed * dt;
        card.y += (0 - card.y) * recoverySpeed * dt;
        
        // Decay speed
        card.vx = 0;
        card.vy = 0;

        if (Math.abs(card.x) < 0.05 && Math.abs(card.y) < 0.05) {
          card.x = 0;
          card.y = 0;
          card.el.style.transform = '';
          card.el.style.boxShadow = '';
        } else {
          card.el.style.transform = `translate3d(${card.x.toFixed(2)}px, ${card.y.toFixed(2)}px, 0)`;
        }
      }
    });

    requestAnimationFrame(physicsLoop);
  }

  // Start physics loop
  requestAnimationFrame(physicsLoop);

  // Toggle activation trigger
  gravityToggle.addEventListener('click', () => {
    state.zeroGravity = !state.zeroGravity;
    gravityToggle.classList.toggle('active', state.zeroGravity);
    portalCard.classList.toggle('zero-gravity-active', state.zeroGravity);

    // Dynamic label changes
    const toggleText = gravityToggle.querySelector('.toggle-text');
    if (state.zeroGravity) {
      toggleText.textContent = "GRAVITY: ZERO";
      createGlowFlash();
    } else {
      toggleText.textContent = "DEFY GRAVITY";
    }
  });

  // A visually stunning purple flash around the card when zero gravity is active
  function createGlowFlash() {
    portalCard.style.transition = 'box-shadow 0.1s ease-out, border-color 0.1s ease-out';
    portalCard.style.boxShadow = '0 0 50px rgba(6, 182, 212, 0.6)';
    portalCard.style.borderColor = 'rgba(6, 182, 212, 0.8)';
    setTimeout(() => {
      portalCard.style.transition = '';
      portalCard.style.boxShadow = '';
      portalCard.style.borderColor = '';
    }, 400);
  }


  // --- 3. PERSISTENT CLICK TRACKING (NO DATABASE SYSTEM) ---
  const clickables = document.querySelectorAll('[data-track]');
  
  // Render visual click counts in corresponding badges or subtitles
  function updateVisualStats() {
    clickables.forEach((el) => {
      const trackId = el.getAttribute('data-track');
      const count = state.stats[trackId] || 0;
      
      // Look for a stats counter child inside this element
      const statLabel = el.querySelector('.stat-counter');
      if (statLabel) {
        statLabel.textContent = `${count.toLocaleString()} clicks`;
      }
    });
  }

  // Handle click events
  clickables.forEach((el) => {
    el.addEventListener('click', (e) => {
      // Ensure zero-gravity active status doesn't block standard clicking
      const trackId = el.getAttribute('data-track');
      if (trackId) {
        state.stats[trackId] = (state.stats[trackId] || 0) + 1;
        localStorage.setItem('antigravity_link_stats', JSON.stringify(state.stats));
        updateVisualStats();
        
        // Dynamic console log
        console.log(`%c[Antigravity Telemetry]%c Click tracked for ${trackId}. Total: ${state.stats[trackId]}`, 'color: #06b6d4; font-weight: bold;', 'color: default;');
      }
    });
  });

  // Initialize visual stat states
  updateVisualStats();


  // --- 4. ADVANCED DEVELOPER CONSOLE TELEMETRY PANEL ---
  const asciiArt = `
    █████  ███  ████████ ████████ ████████  ██████  ████████  ██████  ████  ██████  ██
   ██   ██ ███     ██       ██    ██       ██   ██ ██    ██  ██   ██  ██  ██    ██  ██
   ███████ ███     ██       ██    ██████   ██████  ████████  ██   ██  ██  ██    ██  ██
   ██   ██ ███     ██       ██    ██       ██   ██ ██  ██    ██   ██  ██  ██    ██  
   ██   ██ ███     ██       ██    ████████ ██   ██ ██   ████  ██████  ████  ██████  ██
  `;
  
  console.log(`%c${asciiArt}`, 'color: #8b5cf6; font-weight: bold; font-family: monospace; font-size: 8px;');
  console.log('%c👽 ANTIGRAVITY LINKTREE SYSTEM LOADED SUCCESSFULLY 👽', 'color: #06b6d4; font-weight: bold; font-size: 14px; padding: 5px; background: #0a0e26; border-radius: 4px; border: 1.5px solid #06b6d4;');
  console.log('%cWe logged dashboard click telemetry using standard localStorage. Open the table below to see live counts!', 'color: #9ca3af; font-style: italic;');
  
  // Custom interactive telemetry stats dashboard console view
  console.log('%cCurrent Engagement Metrics:', 'color: #8b5cf6; font-weight: bold; margin-top: 10px;');
  console.table(state.stats);
});
