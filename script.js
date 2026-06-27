/* ============================================================
   SANJEEV RAJ G — PORTFOLIO
   script.js
   ============================================================ */

'use strict';

// ============================================================
// UTILITY
// ============================================================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (min, max) => Math.random() * (max - min) + min;

// ============================================================
// LOADING SCREEN
// ============================================================
(function initLoader() {
  const loader = $('#loader');
  const bar = $('#loaderBar');
  const pct = $('#loaderPercent');
  const letters = $$('.loader-letter');
  const roles = $$('.loader-role');
  const canvas = $('#loaderCanvas');
  const ctx2 = canvas.getContext('2d');

  // Size canvas
  function resizeLoader() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeLoader();
  window.addEventListener('resize', resizeLoader);

  // Neural network particles
  const nodes = Array.from({ length: 60 }, () => ({
    x: rand(0, canvas.width),
    y: rand(0, canvas.height),
    vx: rand(-0.4, 0.4),
    vy: rand(-0.4, 0.4),
    r: rand(1.5, 3.5),
  }));

  let animId;
  function drawLoader() {
    ctx2.clearRect(0, 0, canvas.width, canvas.height);

    // Connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.35;
          ctx2.beginPath();
          ctx2.strokeStyle = `rgba(0,245,160,${alpha})`;
          ctx2.lineWidth = 0.6;
          ctx2.moveTo(nodes[i].x, nodes[i].y);
          ctx2.lineTo(nodes[j].x, nodes[j].y);
          ctx2.stroke();
        }
      }
    }

    // Nodes
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

      ctx2.beginPath();
      ctx2.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx2.fillStyle = 'rgba(0,245,160,0.6)';
      ctx2.fill();
    });

    animId = requestAnimationFrame(drawLoader);
  }
  drawLoader();

  // Letter reveal
  let li = 0;
  const letterTimer = setInterval(() => {
    if (li < letters.length) { letters[li].classList.add('visible'); li++; }
    else clearInterval(letterTimer);
  }, 70);

  // Role cycling
  let ri = 0;
  const roleTimer = setInterval(() => {
    roles.forEach(r => r.classList.remove('active'));
    ri = (ri + 1) % roles.length;
    roles[ri].classList.add('active');
  }, 900);

  // Progress bar
  let progress = 0;
  const barTimer = setInterval(() => {
    const step = Math.random() * 4 + 1;
    progress = Math.min(100, progress + step);
    bar.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '%';
    if (progress >= 100) {
      clearInterval(barTimer);
      clearInterval(roleTimer);
      setTimeout(() => {
        cancelAnimationFrame(animId);
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        initHero();
        startReveal();
        initCounters();
      }, 500);
    }
  }, 40);

  document.body.style.overflow = 'hidden';
})();

// ============================================================
// CUSTOM CURSOR
// ============================================================
(function initCursor() {
  const cursor = $('#cursor');
  const trail = $('#cursorTrail');
  let mx = 0, my = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  function animateCursor() {
    tx = lerp(tx, mx, 0.12);
    ty = lerp(ty, my, 0.12);
    trail.style.left = tx + 'px';
    trail.style.top = ty + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; trail.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; trail.style.opacity = '1'; });
})();

// ============================================================
// NAVBAR
// ============================================================
(function initNav() {
  const nav = $('#navbar');
  const toggle = $('#navToggle');
  const links = $('#navLinks');
  const navLinkEls = $$('.nav-link');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });

  // Close mobile menu on link click
  navLinkEls.forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
    });
  });

  // Active section highlight
  const sections = $$('section[id], footer');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinkEls.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach(s => obs.observe(s));
})();

// ============================================================
// HERO CANVAS — Floating Particles
// ============================================================
function initHero() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const particles = Array.from({ length: 80 }, () => ({
    x: rand(0, canvas.width),
    y: rand(0, canvas.height),
    vx: rand(-0.25, 0.25),
    vy: rand(-0.5, -0.1),
    size: rand(1, 2.5),
    opacity: rand(0.1, 0.5),
    life: rand(0, 1),
  }));

  function drawHero() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.life += 0.003;
      if (p.life > 1) {
        p.x = rand(0, canvas.width);
        p.y = canvas.height + 20;
        p.life = 0;
        p.opacity = rand(0.1, 0.5);
      }
      p.x += p.vx;
      p.y += p.vy;

      const fade = Math.sin(p.life * Math.PI);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,245,160,${p.opacity * fade})`;
      ctx.fill();
    });
    requestAnimationFrame(drawHero);
  }
  drawHero();
}

// ============================================================
// HERO ROLE SLIDER
// ============================================================
(function initRoleSlider() {
  const items = $$('.hero-role-item');
  let current = 0;

  function next() {
    items[current].classList.remove('active');
    items[current].classList.add('exit');
    setTimeout(() => items[current].classList.remove('exit'), 500);
    current = (current + 1) % items.length;
    items[current].classList.add('active');
  }

  setInterval(next, 2200);
})();

// ============================================================
// MAGNETIC BUTTONS
// ============================================================
(function initMagnetic() {
  function setupMagnetic() {
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.35;
        const dy = (e.clientY - cy) * 0.35;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }
  setupMagnetic();
})();

// ============================================================
// CARD TILT
// ============================================================
(function initTilt() {
  $$('.glass-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateZ(4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ============================================================
// MOUSE PARALLAX on stats card
// ============================================================
(function initParallax() {
  const card = $('#statsCard');
  if (!card) return;
  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 12;
    const y = (e.clientY / window.innerHeight - 0.5) * 12;
    card.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${-y}deg)`;
  });
})();

// ============================================================
// SCROLL REVEAL
// ============================================================
function startReveal() {
  const revealEls = $$('.reveal-up');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => obs.observe(el));
}

// ============================================================
// NUMBER COUNTERS
// ============================================================
function initCounters() {
  const counters = $$('.counter');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimal || '0');
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const start = performance.now();

      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        const val = target * ease;
        el.textContent = val.toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
}

// ============================================================
// PROJECT TABS
// ============================================================
(function initProjectTabs() {
  $$('.project-card').forEach(card => {
    const tabs = $$('.ptab', card);
    const contents = $$('.ptab-content', card);

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const targetId = tab.dataset.target;
        const target = $(`#${targetId}`);
        if (target) target.classList.add('active');
      });
    });
  });
})();

// ============================================================
// CONTACT FORM
// ============================================================
function handleFormSubmit(e) {
  e.preventDefault();
  const btn = $('#formSubmit');
  const success = $('#formSuccess');
  const name = $('#formName').value.trim();
  const email = $('#formEmail').value.trim();
  const subject = $('#formSubject').value.trim() || 'New Portfolio Message';
  const message = $('#formMessage').value.trim();

  if (!name || !email || !message) {
    btn.style.boxShadow = '0 0 0 2px #EF4444';
    setTimeout(() => btn.style.boxShadow = '', 1000);
    return;
  }

  btn.querySelector('span').textContent = 'Sending…';
  btn.disabled = true;

  Email.send({
    Host: "smtp.gmail.com",
    Username: "sr2249294@gmail.com",
    Password: "hwqu rzkb sobs ypih", // Gmail App Password
    To: "sr2249294@gmail.com",
    From: "[EMAIL_ADDRESS]",
    ReplyTo: email,
    Subject: `Portfolio Contact: ${subject}`,
    Body: `<strong>Name:</strong> ${name}<br><strong>Email:</strong> ${email}<br><br><strong>Message:</strong><br>${message}`
  }).then(res => {
    btn.querySelector('span').textContent = 'Send Message';
    btn.disabled = false;
    if (res === 'OK') {
      success.classList.add('visible');
      ['#formName', '#formEmail', '#formSubject', '#formMessage'].forEach(id => {
        const el = $(id);
        if (el) el.value = '';
      });
      setTimeout(() => success.classList.remove('visible'), 5000);
    } else {
      btn.style.boxShadow = '0 0 0 2px #EF4444';
      setTimeout(() => btn.style.boxShadow = '', 2000);
      alert('Failed to send email. Error: ' + res);
    }
  }).catch(err => {
    btn.querySelector('span').textContent = 'Send Message';
    btn.disabled = false;
    btn.style.boxShadow = '0 0 0 2px #EF4444';
    setTimeout(() => btn.style.boxShadow = '', 2000);
    alert('An error occurred while sending the email.');
  });
}

// ============================================================
// FOOTER CONSTELLATION CANVAS
// ============================================================
(function initFooterCanvas() {
  const canvas = $('#footerCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const stars = Array.from({ length: 80 }, () => ({
    x: rand(0, canvas.width),
    y: rand(0, canvas.height),
    r: rand(0.5, 2),
    opacity: rand(0.1, 0.6),
    twinkle: rand(0, Math.PI * 2),
    speed: rand(0.01, 0.04),
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Constellation lines
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          const alpha = (1 - dist / 90) * 0.15;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(148,163,184,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
        }
      }
    }

    // Stars
    stars.forEach(s => {
      s.twinkle += s.speed;
      const a = s.opacity * (0.6 + 0.4 * Math.sin(s.twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(148,163,184,${a})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

// ============================================================
// SMOOTH SCROLL for anchor links
// ============================================================
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  const target = document.querySelector(id);
  if (target) {
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  }
});

// ============================================================
// MARQUEE PAUSE ON HOVER
// ============================================================
(function initMarquee() {
  $$('.marquee-track').forEach(track => {
    track.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    track.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
  });
})();

// ============================================================
// HERO SECTION PARALLAX SCROLL
// ============================================================
(function initHeroParallax() {
  const heroLeft = $('.hero-left');
  const aurora = $('.aurora');
  if (!heroLeft) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroLeft.style.transform = `translateY(${y * 0.12}px)`;
    if (aurora) aurora.style.transform = `translateY(${y * 0.06}px)`;
  }, { passive: true });
})();

// ============================================================
// TIMELINE LINE ANIMATION
// ============================================================
(function initTimelineReveal() {
  const line = $('.timeline-line');
  if (!line) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        line.style.transition = 'height 1.5s cubic-bezier(0.4,0,0.2,1)';
        line.style.height = line.scrollHeight + 'px';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  obs.observe(line);
})();

// ============================================================
// SKILL PILL GLOW ON HOVER — already handled in CSS
// Add interactive cloud shuffle on section enter
// ============================================================
(function initSkillCloud() {
  const pills = $$('.skill-pill');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      pills.forEach((pill, i) => {
        setTimeout(() => {
          pill.style.opacity = '0';
          pill.style.transform = 'translateY(10px)';
          pill.style.transition = 'none';
          requestAnimationFrame(() => {
            pill.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            pill.style.opacity = '';
            pill.style.transform = '';
          });
        }, i * 25);
      });
    });
  }, { threshold: 0.2 });

  const skillsSection = $('#skills');
  if (skillsSection) obs.observe(skillsSection);
})();

// ============================================================
// HERO NAME CHARACTER GLOW on hover
// ============================================================
(function initNameGlow() {
  const nameEl = $('.hero-name');
  if (!nameEl) return;
  nameEl.addEventListener('mousemove', e => {
    const rect = nameEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    nameEl.style.backgroundImage = `
      radial-gradient(circle at ${x}% ${y}%, #ffffff 0%, rgba(0,245,160,0.9) 30%, rgba(248,250,252,0.6) 100%)
    `;
    nameEl.style.webkitBackgroundClip = 'text';
    nameEl.style.webkitTextFillColor = 'transparent';
    nameEl.style.backgroundClip = 'text';
  });
  nameEl.addEventListener('mouseleave', () => {
    nameEl.style.backgroundImage = '';
    nameEl.style.webkitTextFillColor = '';
  });
})();

// ============================================================
// ACHIEVEMENT CARDS — staggered entrance
// ============================================================
(function initAchieveCards() {
  const cards = $$('.achieve-card');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  cards.forEach(c => obs.observe(c));
})();

// ============================================================
// FORM INPUT ANIMATION
// ============================================================
(function initFormAnimations() {
  $$('.form-input').forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.style.transform = 'scale(1.01)';
    });
    input.addEventListener('blur', () => {
      input.parentElement.style.transform = '';
    });
  });
})();

// ============================================================
// PERFORMANCE: Lazy load images
// ============================================================
(function initLazyLoad() {
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            obs.unobserve(img);
          }
        }
      });
    });
    $$('img[data-src]').forEach(img => obs.observe(img));
  }
})();

// Expose form handler globally (called from HTML onclick)
window.handleFormSubmit = handleFormSubmit;
