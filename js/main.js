/* ============================================================
   JAYSTRUCTURE — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // THEME TOGGLE
  // ============================================================
  (function () {
    const toggle = document.querySelector('[data-theme-toggle]');
    const root = document.documentElement;

    // Initialise from system preference (default dark for this site)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let currentTheme = root.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
    root.setAttribute('data-theme', currentTheme);
    updateToggleIcon(currentTheme);

    if (toggle) {
      toggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', currentTheme);
        toggle.setAttribute('aria-label', 'Switch to ' + (currentTheme === 'dark' ? 'light' : 'dark') + ' mode');
        updateToggleIcon(currentTheme);
      });
    }

    function updateToggleIcon(theme) {
      if (!toggle) return;
      if (theme === 'dark') {
        // Show sun (click to go light)
        toggle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
      } else {
        // Show moon (click to go dark)
        toggle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      }
    }
  })();


  // ============================================================
  // STICKY HEADER SCROLL EFFECT
  // ============================================================
  (function () {
    const header = document.getElementById('header');
    if (!header) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 20) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  })();


  // ============================================================
  // ACTIVE NAV LINK (scroll spy)
  // ============================================================
  (function () {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
  })();


  // ============================================================
  // MOBILE MENU TOGGLE
  // ============================================================
  (function () {
    const menuBtn = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    if (!menuBtn || !nav) return;

    menuBtn.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('nav--open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on nav link click (mobile)
    nav.querySelectorAll('.nav__link, .nav__cta').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('nav--open');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  })();


  // ============================================================
  // SCROLL REVEAL
  // ============================================================
  (function () {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );
      reveals.forEach((el) => revealObserver.observe(el));
    } else {
      // Fallback: show all immediately
      reveals.forEach((el) => el.classList.add('visible'));
    }
  })();


  // ============================================================
  // ANIMATED COUNTER (hero stats)
  // ============================================================
  (function () {
    const statNums = document.querySelectorAll('.hero__stat-number');
    if (!statNums.length) return;

    function animateValue(el, start, end, prefix, suffix, duration) {
      const startTime = performance.now();
      const range = end - start;
      function update(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(start + range * eased);
        el.textContent = prefix + value + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    }

    const stats = [
      { prefix: '$', num: 300, suffix: 'M+' },
      { prefix: '',  num: 4,   suffix: '+'  },
      { prefix: '',  num: 500, suffix: '+'  },
    ];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statNums.forEach((el, i) => {
            const stat = stats[i];
            if (!stat) return;
            setTimeout(() => {
              animateValue(el, 0, stat.num, stat.prefix, stat.suffix, 1200);
            }, i * 200);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero__stats');
    if (heroStats) observer.observe(heroStats);
  })();


  // ============================================================
  // CONTACT FORM
  // ============================================================
  (function () {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = form.querySelector('.form-submit');
      btn.textContent = 'Sending...';
      btn.disabled = true;

      // Simulate sending (since there's no backend on a static site)
      setTimeout(() => {
        if (status) {
          status.style.display = 'block';
          status.style.color = '#5aaa5a';
          status.textContent = "Thanks for reaching out! I'll get back to you within 24 hours.";
        }
        form.reset();
        btn.textContent = 'Send Message';
        btn.disabled = false;
      }, 1200);
    });
  })();


  // ============================================================
  // SMOOTH SCROLL for anchor links
  // ============================================================
  (function () {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  })();

})();
