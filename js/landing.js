/* ═══ Landing — enhancements only ═══
   The page is complete without this file: with scripting off it stays visible,
   readable and navigable. Everything here is progressive — the app-entry
   address from js/config.js, the scroll reveal, the hairline that appears
   under the header once the page has moved, and the phone menu. No external
   dependencies, no data, nothing to fetch. */
(function () {
  'use strict';

  /* ── Arming ──
     First statement on purpose. css/landing.css hides the `.lp-reveal` blocks
     whenever scripting is available, and a failsafe rule reveals them at 2.5s
     *unless* this class says otherwise. Setting it here — before anything can
     throw — is what keeps the scroll reveal in charge for as long as this file
     is alive, and hands the page back to CSS the moment it is not. */
  document.documentElement.classList.add('lp-live');

  var header = document.querySelector('.lp-header');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── App entry ──
     Every «ورود به دَفتَرچه» link points at one place: the app address from
     js/config.js. Editing that single value moves all of them at once. The
     markup already carries the same placeholder, so nothing here is
     load-bearing — a scripting-off visit still reaches the app. */
  var appUrl = window.DAFTARCHE_APP_URL;
  if (appUrl) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-app-link]'), function (a) {
      a.href = appUrl;
    });
  }

  /* ── Phone menu ──
     A plain disclosure: one button, aria-expanded kept honest, closed by a tap
     outside the panel, by Escape, or by a resize back to the full nav. */
  var menuBtn = document.querySelector('.lp-menu-btn');
  var nav = document.getElementById('lpNav');
  if (header && menuBtn && nav) {
    var setOpen = function (open) {
      header.dataset.open = open ? 'true' : 'false';
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'بستن منو' : 'منوی صفحه');
    };
    menuBtn.addEventListener('click', function () {
      setOpen(header.dataset.open !== 'true');
    });
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

  /* ── Reveal on scroll ──
     The brief hidden state comes from css/landing.css, which arms it as soon as
     scripting is available; `lp-live` above keeps the CSS failsafe out of the
     way. The check below is driven by the viewport itself rather than by
     IntersectionObserver: the observer is skipped in some rendering
     environments, and content that depends on a callback that never runs is
     content that never appears. A rect test always answers.

     Anyone who asked for less motion gets the visible page with no transition,
     and a browser that never scrolls still shows whatever is on screen. */
  var items = Array.prototype.slice.call(document.querySelectorAll('.lp-reveal'));

  var revealInView = function () {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var left = 0;
    for (var i = 0; i < items.length; i++) {
      var el = items[i];
      if (el.classList.contains('is-in')) continue;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add('is-in');
      else left++;
    }
    return left;
  };

  if (reduce) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    revealInView();
  }

  /* ── Interactive Mood Switcher ── */
  var moodWidget = document.getElementById('whatNowWidget');
  if (moodWidget) {
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

  /* ── Interactive Characters Showcase ── */
  var charGrid = document.querySelector('.lp-char-grid');
  var bubble = document.getElementById('charBubble');
  var bubbleSpeaker = document.getElementById('bubbleSpeaker');
  var bubbleText = document.getElementById('bubbleText');

  if (charGrid && bubble && bubbleSpeaker && bubbleText) {
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
        // trigger reflow without inline style
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

  /* ── FAQ Exclusive Accordion ── */
  var faqItems = document.querySelectorAll('.lp-faq-item');
  if (faqItems.length) {
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

  /* ── Consolidated Unified Scroll & Resize Manager (Header, Reveals, Mobile Bar, Scrollspy) ── */
  var mobileBar = document.getElementById('lpMobileBar');
  var navLinks = document.querySelectorAll('.lp-nav a[href^="#"]');
  var sectionData = [];
  var lastActiveLink = null;
  var isClickScrolling = false;
  var clickScrollTimer = null;

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
      var target = document.querySelector(href);
      if (target) {
        sectionData.push({
          link: link,
          target: target,
          id: href
        });
      }
    });
    // Sort strictly by vertical position in the document
    sectionData.sort(function (a, b) {
      return a.target.offsetTop - b.target.offsetTop;
    });
  };

  cacheSections();

  if (nav) {
    nav.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;

      var href = link.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        setActiveLink(link);
        lastActiveLink = link;

        // Lock scrollspy updates briefly so smooth scrolling doesn't flicker other links
        isClickScrolling = true;
        clearTimeout(clickScrollTimer);
        clickScrollTimer = setTimeout(function () {
          isClickScrolling = false;
        }, 900);
      }
    });
  }

  // If page loaded with a hash, activate that link
  if (window.location.hash) {
    var initialLink = document.querySelector('.lp-nav a[href="' + window.location.hash + '"]');
    if (initialLink) {
      setActiveLink(initialLink);
      lastActiveLink = initialLink;
      isClickScrolling = true;
      setTimeout(function () { isClickScrolling = false; }, 900);
    }
  }

  var pendingReveals = !reduce;

  var onRenderFrame = function () {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

    // 1. Header hairline
    if (header) {
      header.classList.toggle('is-scrolled', scrollY > 8);
    }

    // 2. Mobile sticky bottom bar
    if (mobileBar) {
      mobileBar.classList.toggle('is-visible', scrollY > 400);
    }

    // 3. Scroll reveals (stops once all items are revealed)
    if (pendingReveals) {
      var remaining = revealInView();
      if (remaining === 0) pendingReveals = false;
    }

    // 4. Scrollspy navigation links
    if (sectionData.length && !isClickScrolling) {
      var scrollBottom = scrollY + window.innerHeight;
      var docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      var isAtBottom = (scrollBottom >= docHeight - 70);

      var activeItem = null;

      if (isAtBottom) {
        // At the very bottom of the page -> activate the last section (#about)
        activeItem = sectionData[sectionData.length - 1];
      } else if (scrollY < 120) {
        // At the top of the page (Hero) -> no section link active
        activeItem = null;
      } else {
        // Standard scan: check from bottom section upward
        var scrollAnchor = scrollY + (window.innerHeight * 0.38);
        for (var i = sectionData.length - 1; i >= 0; i--) {
          var item = sectionData[i];
          if (item.target.offsetTop <= scrollAnchor) {
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

  // Initial draw
  onRenderFrame();
})();
