/* ═══ Landing — progressive enhancements ═══
   The page is complete without this file: with scripting off it stays visible,
   readable and navigable. Progressive features: app-entry URL synchronization,
   smooth scroll reveals, header elevation border, mobile navigation disclosure,
   interactive mood switcher, character dialogues, FAQ exclusive accordion,
   and scrollspy navigation synchronization.
   Zero external dependencies, zero build requirements, strict same-origin CSP. */
(function () {
  'use strict';

  /* ── Arming ──
     Arm the page immediately for CSS progressive enhancement failsafes.
     css/landing.css hides `.lp-reveal` blocks when scripting is present,
     and a CSS failsafe reveals them at 2.5s unless this class is active. */
  document.documentElement.classList.add('lp-live');

  var header = document.querySelector('.lp-header');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. App entry links ──
     Syncs all [data-app-link] anchors with window.DAFTARCHE_APP_URL from js/config.js.
     Strict validation ensures only valid https: URLs are applied. */
  function initAppLinks() {
    var appUrl = window.DAFTARCHE_APP_URL;
    var isValidAppUrl = false;
    if (typeof appUrl === 'string') {
      try {
        var parsedUrl = new URL(appUrl, window.location.href);
        isValidAppUrl = parsedUrl.protocol === 'https:';
      } catch (e) {
        isValidAppUrl = false;
      }
    }
    if (isValidAppUrl) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-app-link]'), function (a) {
        a.href = appUrl;
      });
    }
  }

  /* ── 2. Mobile disclosure menu ──
     One disclosure button, aria-expanded state, auto-closes on outside tap,
     Escape key press, link click, or resize back to desktop viewport. */
  function initMenu() {
    var menuBtn = document.querySelector('.lp-menu-btn');
    var nav = document.getElementById('lpNav');
    if (!header || !menuBtn || !nav) return;

    var setOpen = function (open) {
      header.dataset.open = open ? 'true' : 'false';
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'بستن منو' : 'منوی صفحه');
    };

    menuBtn.addEventListener('click', function () {
      setOpen(header.dataset.open !== 'true');
    });

    // Close menu when navigation links are clicked
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.dataset.open === 'true') {
        setOpen(false);
        menuBtn.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (header.dataset.open !== 'true') return;
      if (!header.contains(e.target)) setOpen(false);
    });

    window.addEventListener('resize', function () {
      if (window.matchMedia('(min-width: 881px)').matches) setOpen(false);
    });
  }

  /* ── 3. Scroll reveals ──
     Viewport rect tests are used rather than IntersectionObserver for resilient
     rendering across all webview environments without missing frames. */
  var updateReveals = null;
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.lp-reveal'));
    if (!items.length) {
      updateReveals = function () {};
      return;
    }

    var pendingReveals = !reduce;
    updateReveals = function () {
      if (!pendingReveals) return;
      if (reduce) {
        for (var i = 0; i < items.length; i++) {
          items[i].classList.add('is-in');
        }
        pendingReveals = false;
        return;
      }
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var remaining = 0;
      for (var j = 0; j < items.length; j++) {
        var el = items[j];
        if (el.classList.contains('is-in')) continue;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) {
          el.classList.add('is-in');
        } else {
          remaining++;
        }
      }
      if (remaining === 0) {
        pendingReveals = false;
      }
    };

    updateReveals();
  }

  /* ── 4. Interactive Mood Switcher ── */
  function initMoodSwitcher() {
    var moodWidget = document.getElementById('whatNowWidget');
    if (!moodWidget) return;

    var moodData = {
      neutral: {
        mood: 'بد نیستم',
        time: 'کم (۱۵ دقیقه)',
        task: 'جواب یک ایمیل کاری',
        why: 'کاری کوتاه که بار ذهنی‌اش سبک می‌شود.'
      },
      tired: {
        mood: 'خسته‌ام و توان کارهای سنگین نیست',
        time: 'خیلی کم (۵ تا ۱۰ دقیقه)',
        task: 'جمع‌وجور کردن میز یا نوشیدن آب',
        why: 'وقتی انرژی پایینه، فقط یک شروع بسیار کوچک کمک می‌کند.'
      },
      energetic: {
        mood: 'سرحال و آماده تمرکز',
        time: '۴۵ دقیقه',
        task: 'پیش‌نویس طرح پروژه جدید',
        why: 'الان بهترین زمان برای کاری است که به خلاقیت نیاز دارد.'
      }
    };

    var pills = moodWidget.querySelectorAll('.lp-mood-pill');
    var moodEl = moodWidget.querySelector('.lp-receipt-mood');
    var timeEl = moodWidget.querySelector('.lp-receipt-time');
    var taskEl = moodWidget.querySelector('.lp-receipt-task');
    var whyEl = moodWidget.querySelector('.lp-receipt-why');

    Array.prototype.forEach.call(pills, function (btn) {
      btn.addEventListener('click', function () {
        var moodKey = btn.dataset.mood;
        if (!moodKey || !moodData[moodKey]) return;
        Array.prototype.forEach.call(pills, function (p) {
          var isCurrent = p === btn;
          p.classList.toggle('is-active', isCurrent);
          p.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
        });
        var data = moodData[moodKey];
        if (moodEl) moodEl.textContent = data.mood;
        if (timeEl) timeEl.textContent = data.time;
        if (taskEl) taskEl.textContent = data.task;
        if (whyEl) whyEl.textContent = data.why;
      });
    });
  }

  /* ── 5. Characters Showcase ── */
  function initCharacters() {
    var charGrid = document.querySelector('.lp-char-grid');
    var bubble = document.getElementById('charBubble');
    var bubbleSpeaker = document.getElementById('bubbleSpeaker');
    var bubbleText = document.getElementById('bubbleText');

    if (!charGrid || !bubble || !bubbleSpeaker || !bubbleText) return;

    var charQuotes = {
      qorqori: {
        speaker: 'قورقوری می‌گوید:',
        quote: '«امروز قرار نیست همه‌چیز را انجام بدهی؛ فقط همین یک قدم را بردار.»'
      },
      rizolo: {
        speaker: 'ریزولو می‌گوید:',
        quote: '«بلند شو! حتی ۵ دقیقه کار کردن هم یک شروع فوق‌العاده‌ست.»'
      },
      khabalo: {
        speaker: 'خوابالو می‌گوید:',
        quote: '«اگر امروز خسته‌ای، کارها رو سبک کن و به خودت سخت نگیر.»'
      },
      fekrbaz: {
        speaker: 'فکرباز می‌گوید:',
        quote: '«اول ببین چی از همه مهم‌تره؛ بقیه‌اش می‌تونه صبر کنه.»'
      },
      jingool: {
        speaker: 'جینگول می‌گوید:',
        quote: '«عالیه! وقتی تمومش کنی یه حس سبکی بی‌نظیر داری!»'
      }
    };

    var charCards = charGrid.querySelectorAll('.lp-char-card');
    var selectChar = function (card) {
      var charKey = card.dataset.char;
      if (!charKey || !charQuotes[charKey]) return;
      Array.prototype.forEach.call(charCards, function (c) {
        var isTarget = c === card;
        c.classList.toggle('is-active', isTarget);
        c.setAttribute('aria-pressed', isTarget ? 'true' : 'false');
      });
      var q = charQuotes[charKey];
      bubbleSpeaker.textContent = q.speaker;
      bubbleText.textContent = q.quote;
      if (!reduce) {
        bubble.classList.remove('is-swapping');
        void bubble.offsetWidth;
        bubble.classList.add('is-swapping');
      }
    };

    Array.prototype.forEach.call(charCards, function (card) {
      card.addEventListener('click', function () { selectChar(card); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectChar(card);
        }
      });
    });
  }

  /* ── 6. FAQ Exclusive Accordion ── */
  function initFaq() {
    var faqItems = document.querySelectorAll('.lp-faq-item');
    if (!faqItems.length) return;

    Array.prototype.forEach.call(faqItems, function (item) {
      item.addEventListener('toggle', function () {
        if (item.open) {
          Array.prototype.forEach.call(faqItems, function (other) {
            if (other !== item && other.open) other.open = false;
          });
        }
      });
    });
  }

  /* ── 7. Scroll Manager (Header hairline, reveals, mobile bar, scrollspy) ── */
  function initScrollManager() {
    var mobileBar = document.getElementById('lpMobileBar');
    var nav = document.getElementById('lpNav');
    var navLinks = document.querySelectorAll('.lp-nav a[href^="#"]');
    var sectionData = [];
    var lastActiveLink = null;
    var isClickScrolling = false;
    var clickScrollTimer = null;

    var getDocumentTop = function (element) {
      var rect = element.getBoundingClientRect();
      var pageY = window.pageYOffset || document.documentElement.scrollTop || 0;
      return rect.top + pageY;
    };

    var setActiveLink = function (activeLink) {
      Array.prototype.forEach.call(navLinks, function (link) {
        link.classList.toggle('is-active', link === activeLink);
      });
    };

    var cacheSections = function () {
      sectionData = [];
      Array.prototype.forEach.call(navLinks, function (link) {
        var href = link.getAttribute('href');
        if (!href || href.charAt(0) !== '#') return;
        var target = null;
        try {
          target = document.querySelector(href);
        } catch (e) {
          target = null;
        }
        if (target) {
          sectionData.push({
            link: link,
            target: target,
            id: href
          });
        }
      });
      sectionData.sort(function (a, b) {
        return getDocumentTop(a.target) - getDocumentTop(b.target);
      });
    };

    cacheSections();

    // In-page navigation click handling (kept distinct from menu toggle for clear separation)
    if (nav) {
      nav.addEventListener('click', function (e) {
        var link = e.target.closest('a');
        if (!link) return;

        var href = link.getAttribute('href');
        if (href && href.charAt(0) === '#') {
          setActiveLink(link);
          lastActiveLink = link;

          isClickScrolling = true;
          clearTimeout(clickScrollTimer);
          clickScrollTimer = setTimeout(function () {
            isClickScrolling = false;
          }, 900);
        }
      });
    }

    // Safe hash activation without selector interpolation
    if (window.location.hash) {
      var rawHash = window.location.hash;
      var initialLink = null;
      for (var i = 0; i < navLinks.length; i++) {
        if (navLinks[i].getAttribute('href') === rawHash) {
          initialLink = navLinks[i];
          break;
        }
      }
      if (initialLink) {
        setActiveLink(initialLink);
        lastActiveLink = initialLink;
        isClickScrolling = true;
        setTimeout(function () { isClickScrolling = false; }, 900);
      }
    }

    var onRenderFrame = function () {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

      // 1. Header elevation hairline
      if (header) {
        header.classList.toggle('is-scrolled', scrollY > 8);
      }

      // 2. Mobile sticky bottom bar
      if (mobileBar) {
        mobileBar.classList.toggle('is-visible', scrollY > 400);
      }

      // 3. Progressive scroll reveals
      if (typeof updateReveals === 'function') {
        updateReveals();
      }

      // 4. Scrollspy navigation links
      if (sectionData.length && !isClickScrolling) {
        var scrollBottom = scrollY + window.innerHeight;
        var docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        var isAtBottom = (scrollBottom >= docHeight - 70);

        var activeItem = null;

        if (isAtBottom) {
          // At the bottom of the page -> activate the final in-page section
          activeItem = sectionData[sectionData.length - 1];
        } else if (scrollY < 120) {
          // At the top of the page (Hero) -> no section link active
          activeItem = null;
        } else {
          // Check from bottom section upward
          var scrollAnchor = scrollY + (window.innerHeight * 0.38);
          for (var j = sectionData.length - 1; j >= 0; j--) {
            var item = sectionData[j];
            if (getDocumentTop(item.target) <= scrollAnchor) {
              activeItem = item;
              break;
            }
          }
        }

        var activeLink = activeItem ? activeItem.link : null;
        if (activeLink !== lastActiveLink) {
          lastActiveLink = activeLink;
          setActiveLink(activeLink);
        }
      }
    };

    var scrollTicking = false;
    var requestTick = function () {
      if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(function () {
          onRenderFrame();
          scrollTicking = false;
        });
      }
    };

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', function () {
      cacheSections();
      requestTick();
    }, { passive: true });

    onRenderFrame();
  }

  /* ── Initialization ── */
  initAppLinks();
  initMenu();
  initReveal();
  initMoodSwitcher();
  initCharacters();
  initFaq();
  initScrollManager();
})();
