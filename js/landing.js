/* ═══ Landing — Progressive Enhancements ═══
   Features: anti-framing (clickjacking) guard, app URL sync, live app preview
   embed, smooth scroll reveals, mobile navigation menu, interactive mood
   switcher, character dialogues, FAQ accordion, install guide OS hint, and
   scrollspy navigation. Zero external dependencies, strict same-origin CSP. */
(function () {
  'use strict';

  /* Mark page as interactive for CSS failsafe rules */
  document.documentElement.classList.add('lp-live');

  var header = document.querySelector('.lp-header');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 0. Clean URLs normalizer ──
     On static hosts without server-side rewrite rules (e.g., direct hits to
     /index.html on GitHub Pages), immediately strips the
     .html extension from the address bar via history.replaceState so visitors
     see clean URLs without extra roundtrips or page reloads. */
  function initCleanUrls() {
    try {
      if (typeof window === 'undefined' || !window.location) return;
      var protocol = window.location.protocol;
      if (protocol !== 'http:' && protocol !== 'https:') return;
      if (!window.history || !window.history.replaceState) return;

      var path = window.location.pathname;
      if (path === '/404.html' || path.endsWith('/404.html')) return;

      var cleanPath = null;

      if (path === '/index.html' || path.endsWith('/index.html')) {
        cleanPath = path.slice(0, -10) || '/';
      } else if (path.endsWith('.html')) {
        cleanPath = path.slice(0, -5);
      } else if (path.length > 1 && path.endsWith('/')) {
        cleanPath = path.slice(0, -1);
      }

      if (cleanPath !== null && cleanPath !== path) {
        var newUrl = cleanPath + window.location.search + window.location.hash;
        window.history.replaceState(window.history.state, '', newUrl);
      }
    } catch (e) {
      /* non-critical progressive enhancement */
    }
  }

  /* ── 0b. Anti-framing (clickjacking) guard ──
     Meta CSP cannot deliver frame-ancestors (GitHub Pages serves no custom
     headers), so the page defends in script. A same-origin parent frame is
     broken out by re-navigating the top context; a foreign frame gets a
     full-page notice covering everything else. Strictly CSP-safe: built
     with DOM APIs and textContent, no inline styles or handlers. */
  function initFrameGuard() {
    if (window.top === window.self) return;

    try {
      window.top.location.replace(window.location.href);
      return;
    } catch (e) {
      /* cross-origin or sandboxed parent — cover below */
    }

    document.documentElement.classList.add('lp-framed');
    var guard = document.createElement('div');
    guard.className = 'lp-frame-guard';
    guard.setAttribute('role', 'alert');
    var title = document.createElement('h2');
    title.textContent = 'این صفحه در قالب فریم باز شده است.';
    var text = document.createElement('p');
    text.textContent = 'برای ادامه، نشانی این صفحه را مستقیم در مرورگر باز کن.';
    var url = document.createElement('code');
    url.textContent = window.location.href;
    guard.appendChild(title);
    guard.appendChild(text);
    guard.appendChild(url);
    document.body.appendChild(guard);
  }

  /* ── 1. App entry links ──
     Sync [data-app-link] anchors and [data-app-embed] frames with
     window.DAFTARCHE_APP_URL. Only allows https: URLs on the standard port
     for the trusted daftrche.ir domain. */
  function initAppLinks() {
    var appUrl = window.DAFTARCHE_APP_URL;
    if (typeof appUrl !== 'string') return;
    var isAllowed = false;
    try {
      var parsedUrl = new URL(appUrl, window.location.href);
      var isStandardPort = parsedUrl.port === '' || parsedUrl.port === '443';
      isAllowed = isStandardPort &&
        parsedUrl.protocol === 'https:' &&
        (parsedUrl.hostname === 'daftrche.ir' ||
         parsedUrl.hostname.endsWith('.daftrche.ir'));
    } catch (e) {
      isAllowed = false;
    }
    if (isAllowed) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-app-link]'), function (a) {
        a.href = appUrl;
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-app-embed]'), function (frame) {
        /* Assign only on a real change so the live preview is not reloaded. */
        if (frame.src !== appUrl) frame.src = appUrl;
      });
    }
  }

  /* ── 2. Mobile navigation menu ──
     Toggles the header disclosure menu on small viewports.
     Closes on link click, outside tap, Escape key, or window resize. */
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
      if (window.matchMedia('(min-width: 941px)').matches) setOpen(false);
    });
  }

  /* ── 3. Scroll reveals ──
     Uses IntersectionObserver for zero-reflow 60/120fps GPU reveals,
     falling back to viewport rectangle checks on older browsers. */
  var updateReveals = null;
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.lp-reveal'));
    if (!items.length) {
      updateReveals = function () {};
      return;
    }

    if (reduce) {
      for (var i = 0; i < items.length; i++) {
        items[i].classList.add('is-in');
      }
      updateReveals = function () {};
      return;
    }

    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function (entries, observer) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            entries[i].target.classList.add('is-in');
            observer.unobserve(entries[i].target);
          }
        }
      }, {
        rootMargin: '0px 0px -6% 0px',
        threshold: 0.05
      });

      for (var j = 0; j < items.length; j++) {
        revealObserver.observe(items[j]);
      }

      updateReveals = function () {};
      return;
    }

    // Fallback for browsers without IntersectionObserver
    var pendingReveals = true;
    updateReveals = function () {
      if (!pendingReveals) return;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var remaining = 0;
      for (var k = 0; k < items.length; k++) {
        var el = items[k];
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

  /* ── 4. Interactive mood switcher widget ── */
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
    var rows = moodWidget.querySelectorAll('.lp-receipt-row');

    Array.prototype.forEach.call(pills, function (btn) {
      btn.addEventListener('click', function () {
        var moodKey = btn.dataset.mood;
        if (!moodKey || !Object.prototype.hasOwnProperty.call(moodData, moodKey)) return;
        Array.prototype.forEach.call(pills, function (p) {
          var isCurrent = p === btn;
          p.classList.toggle('is-active', isCurrent);
          p.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
        });

        if (!reduce && rows.length) {
          Array.prototype.forEach.call(rows, function (row) {
            row.classList.add('is-swapping');
          });
          setTimeout(function () {
            var data = moodData[moodKey];
            if (moodEl) moodEl.textContent = data.mood;
            if (timeEl) timeEl.textContent = data.time;
            if (taskEl) taskEl.textContent = data.task;
            if (whyEl) whyEl.textContent = data.why;
            Array.prototype.forEach.call(rows, function (row, idx) {
              setTimeout(function () {
                row.classList.remove('is-swapping');
              }, idx * 45);
            });
          }, 85);
        } else {
          var data = moodData[moodKey];
          if (moodEl) moodEl.textContent = data.mood;
          if (timeEl) timeEl.textContent = data.time;
          if (taskEl) taskEl.textContent = data.task;
          if (whyEl) whyEl.textContent = data.why;
        }
      });
    });
  }

  /* ── 5. Characters showcase ── */
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
      if (!charKey || !Object.prototype.hasOwnProperty.call(charQuotes, charKey)) return;
      Array.prototype.forEach.call(charCards, function (c) {
        var isTarget = c === card;
        c.classList.toggle('is-active', isTarget);
        c.setAttribute('aria-pressed', isTarget ? 'true' : 'false');
      });
      var q = charQuotes[charKey];
      if (!reduce) {
        bubble.classList.remove('is-swapping');
        void bubble.offsetWidth;
        bubble.classList.add('is-swapping');
        setTimeout(function () {
          bubbleSpeaker.textContent = q.speaker;
          bubbleText.textContent = q.quote;
        }, 75);
      } else {
        bubbleSpeaker.textContent = q.speaker;
        bubbleText.textContent = q.quote;
      }
    };

    /* Cards are native <button> elements, so Enter/Space activation and focus
       handling come from the platform. */
    Array.prototype.forEach.call(charCards, function (card) {
      card.addEventListener('click', function () { selectChar(card); });
    });
  }

  /* ── 6. FAQ exclusive accordion ── */
  var refreshSectionCache = null;
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
        if (typeof refreshSectionCache === 'function') {
          setTimeout(refreshSectionCache, 20);
        }
      });
    });
  }

  /* ── 7. Install guide platform detection hint ── */
  function initInstallGuide() {
    var grid = document.querySelector('.lp-install-grid');
    if (!grid) return;

    var ua = navigator.userAgent || '';
    var platform = (navigator.userAgentData && navigator.userAgentData.platform) ||
      navigator.platform || '';
    var isIos = /iPad|iPhone|iPod/.test(ua) ||
      (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var isAndroid = /Android/.test(ua);
    if (!isIos && !isAndroid) return;

    var os = isIos ? 'ios' : 'android';
    var card = grid.querySelector('.lp-install-' + os);
    if (!card) return;
    card.classList.add('is-current');

    var head = card.querySelector('.lp-install-head');
    if (head) {
      var youTag = document.createElement('span');
      youTag.className = 'lp-install-you';
      youTag.textContent = 'برای دستگاه شما';
      head.appendChild(youTag);
    }
  }

  /* ── 8. Scroll manager & Navbar Drag-Swap ──
     Features:
     - Sliding indicator pill with soft spring settling
     - Mouse / touch Drag-to-Swap with physical sticky adhesion ("حالت چسبندگی ریز")
     - Butter-smooth RAF scroll with pleasant anticipation delay ("تاخیر دلنشین")
     - Subtle arrival breath animation on target sections
     - Continuous scrollspy tracking and viewport header hairline updates */
  function initScrollManager() {
    var mobileBar = document.getElementById('lpMobileBar');
    var nav = document.getElementById('lpNav');
    if (!nav) return;
    var ul = nav.querySelector('ul');
    if (!ul) return;
    var navLinks = nav.querySelectorAll('a');
    var internalNavLinks = nav.querySelectorAll('a[href^="#"]');
    var sectionData = [];
    var lastActiveLink = null;
    var isClickScrolling = false;
    var clickScrollTimer = null;
    var activeScrollAnimationId = null;

    /* Progressive enhancement: Create the sliding indicator pill */
    var indicator = ul.querySelector('.lp-nav-indicator');
    if (!indicator) {
      indicator = document.createElement('span');
      indicator.className = 'lp-nav-indicator';
      indicator.setAttribute('aria-hidden', 'true');
      ul.appendChild(indicator);
    }

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

    /* Measure and position the sliding pill indicator */
    var settlingTimer = null;
    var updateIndicator = function (targetLink, isSettling) {
      if (!indicator || !ul) return;
      if (!targetLink || window.matchMedia('(max-width: 940px)').matches) {
        nav.classList.remove('has-active');
        return;
      }
      var ulRect = ul.getBoundingClientRect();
      var linkRect = targetLink.getBoundingClientRect();
      var x = linkRect.left - ulRect.left;
      var w = linkRect.width;

      indicator.style.transform = 'translate3d(' + Math.round(x) + 'px, 0, 0)';
      indicator.style.width = Math.round(w) + 'px';
      nav.classList.add('has-active');

      if (isSettling) {
        nav.classList.add('is-settling');
        clearTimeout(settlingTimer);
        settlingTimer = setTimeout(function () {
          nav.classList.remove('is-settling');
        }, 500);
      }
    };

    /* Smooth scroll with custom easing and interruption defense */
    var cancelActiveScroll = function () {
      if (activeScrollAnimationId) {
        window.cancelAnimationFrame(activeScrollAnimationId);
        activeScrollAnimationId = null;
      }
    };

    window.addEventListener('wheel', cancelActiveScroll, { passive: true });
    window.addEventListener('touchmove', cancelActiveScroll, { passive: true });

    var smoothScrollTo = function (targetY, duration, callback) {
      cancelActiveScroll();
      if (reduce) {
        window.scrollTo(0, targetY);
        if (callback) callback();
        return;
      }

      var startY = window.pageYOffset || document.documentElement.scrollTop || 0;
      var diff = targetY - startY;
      if (Math.abs(diff) < 2) {
        if (callback) callback();
        return;
      }

      var startTime = null;
      var easeOutQuart = function (t) {
        return 1 - Math.pow(1 - t, 4);
      };

      var step = function (currentTime) {
        if (!startTime) startTime = currentTime;
        var elapsed = currentTime - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased = easeOutQuart(progress);

        window.scrollTo(0, Math.round(startY + (diff * eased)));

        if (progress < 1) {
          activeScrollAnimationId = window.requestAnimationFrame(step);
        } else {
          window.scrollTo(0, targetY);
          activeScrollAnimationId = null;
          if (callback) callback();
        }
      };

      activeScrollAnimationId = window.requestAnimationFrame(step);
    };

    var triggerArrivalBreath = function (element) {
      if (!element || reduce) return;
      var targetWrap = element.querySelector('.lp-wrap') || element;
      targetWrap.classList.remove('lp-section-arrived');
      void targetWrap.offsetWidth;
      targetWrap.classList.add('lp-section-arrived');
      setTimeout(function () {
        targetWrap.classList.remove('lp-section-arrived');
      }, 750);
    };

    /* Smooth page switch with pleasant delay ("تاخیر دلنشین") */
    var handleSectionSwitch = function (link, customDelay) {
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href) return;

      if (href.charAt(0) === '#') {
        var sectionId = href.substring(1);
        var targetEl = document.getElementById(sectionId);
        if (targetEl) {
          setActiveLink(link);
          lastActiveLink = link;
          updateIndicator(link, true);

          isClickScrolling = true;
          clearTimeout(clickScrollTimer);
          clickScrollTimer = setTimeout(function () {
            isClickScrolling = false;
          }, 1100);

          var delay = (typeof customDelay === 'number') ? customDelay : (reduce ? 0 : 85);
          setTimeout(function () {
            var headerH = header ? header.offsetHeight : 64;
            var targetTop = Math.max(0, getDocumentTop(targetEl) - headerH - 12);
            smoothScrollTo(targetTop, 680, function () {
              triggerArrivalBreath(targetEl);
            });

            if (window.history && window.history.replaceState) {
              window.history.replaceState(null, '', href);
            }
          }, delay);
        }
      } else {
        window.location.href = href;
      }
    };

    /* Cache section anchors and precomputed document tops for zero-reflow scrollspy */
    var cacheSections = function () {
      sectionData = [];
      Array.prototype.forEach.call(internalNavLinks, function (link) {
        var href = link.getAttribute('href');
        if (!href || href.charAt(0) !== '#' || href.length < 2) return;
        var sectionId = href.substring(1);
        if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(sectionId)) return;
        var target = document.getElementById(sectionId);
        if (target) {
          sectionData.push({
            link: link,
            target: target,
            id: href,
            top: getDocumentTop(target)
          });
        }
      });
      sectionData.sort(function (a, b) {
        return a.top - b.top;
      });
    };
    refreshSectionCache = cacheSections;

    cacheSections();

    /* ── Drag-to-Swap in Navbar with Sticky Adhesion ("چسبندگی ریز") ── */
    var isPointerDown = false;
    var isDragging = false;
    var stickyBroken = false;
    var preventNextClick = false;
    var activePointerId = null;
    var startX = 0;
    var startY = 0;
    var startLink = null;
    var startLinkPos = 0;
    var startLinkWidth = 0;
    var dragTargetLink = null;

    var findClosestNavLink = function (clientX) {
      var closest = null;
      var minDistance = Infinity;
      Array.prototype.forEach.call(navLinks, function (link) {
        var r = link.getBoundingClientRect();
        var center = r.left + r.width / 2;
        var dist = Math.abs(clientX - center);
        if (dist < minDistance) {
          minDistance = dist;
          closest = link;
        }
      });
      return closest;
    };

    /* Prevent browser native link drag & drop which fires pointercancel */
    var preventNativeDrag = function (e) {
      e.preventDefault();
      return false;
    };
    ul.addEventListener('dragstart', preventNativeDrag);
    Array.prototype.forEach.call(navLinks, function (link) {
      link.addEventListener('dragstart', preventNativeDrag);
    });

    ul.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      if (window.matchMedia('(max-width: 940px)').matches) return;

      startX = e.clientX;
      startY = e.clientY;
      isPointerDown = true;
      isDragging = false;
      stickyBroken = false;
      dragTargetLink = null;
      activePointerId = e.pointerId;

      var linkUnderPointer = e.target.closest('a');
      startLink = linkUnderPointer || lastActiveLink || findClosestNavLink(startX);
      if (startLink) {
        var ulRect = ul.getBoundingClientRect();
        var sRect = startLink.getBoundingClientRect();
        startLinkPos = sRect.left - ulRect.left;
        startLinkWidth = sRect.width;
      }
    });

    window.addEventListener('pointermove', function (e) {
      if (!isPointerDown || !startLink) return;

      var deltaX = e.clientX - startX;
      var deltaY = e.clientY - startY;

      if (!isDragging) {
        if (Math.abs(deltaY) > 12 && Math.abs(deltaY) > Math.abs(deltaX)) {
          isPointerDown = false;
          return;
        }
        if (Math.abs(deltaX) > 6) {
          isDragging = true;
          preventNextClick = true;
          nav.classList.add('is-dragging', 'has-active');

          if (ul.setPointerCapture && activePointerId !== undefined) {
            try {
              ul.setPointerCapture(activePointerId);
            } catch (err) {}
          }
        }
      }

      if (isDragging) {
        if (e.cancelable) e.preventDefault();
        var ulRect = ul.getBoundingClientRect();

        /* Sticky Adhesion Physics:
           Within threshold of 24px, the indicator clings to startLink with
           viscous elastic resistance (pulls 32% of cursor travel while remaining
           anchored on the opposite side). Beyond 24px, adhesion pops free. */
        var stickyThreshold = 24;
        if (!stickyBroken) {
          if (Math.abs(deltaX) < stickyThreshold) {
            var stickyPull = deltaX * 0.32;
            var sLeft = startLinkPos;
            var sWidth = startLinkWidth;
            var sRight = sLeft + sWidth;

            var curLeft, curRight;
            if (deltaX < 0) {
              // Pulling left (in RTL: toward next tabs) -> anchor stays on right, stretches left
              curLeft = sLeft + stickyPull;
              curRight = sRight;
            } else {
              // Pulling right -> anchor stays on left, stretches right
              curLeft = sLeft;
              curRight = sRight + stickyPull;
            }
            var curWidth = Math.max(sWidth, curRight - curLeft);

            indicator.style.transform = 'translate3d(' + Math.round(curLeft) + 'px, 0, 0)';
            indicator.style.width = Math.round(curWidth) + 'px';
            nav.classList.add('is-sticky');
            nav.classList.remove('is-detached');
            dragTargetLink = startLink;
          } else {
            stickyBroken = true;
            nav.classList.remove('is-sticky');
            nav.classList.add('is-detached');
          }
        }

        if (stickyBroken) {
          var cursorX = e.clientX;
          var targetCandidate = findClosestNavLink(cursorX);
          dragTargetLink = targetCandidate || startLink;

          var tRect = dragTargetLink.getBoundingClientRect();
          var tCenter = tRect.left + tRect.width / 2;
          var distCenter = cursorX - tCenter;
          var tWidth = tRect.width;

          // Continuous magnetic detent (zero-jump smooth blend)
          var detentRadius = 38;
          var effectiveCenter = cursorX;
          if (Math.abs(distCenter) < detentRadius) {
            var factor = 1 - (Math.abs(distCenter) / detentRadius);
            var magnetStrength = factor * factor * 0.68;
            effectiveCenter = cursorX - (distCenter * magnetStrength);
          }

          var curWidth = tWidth;
          var indLeft = (effectiveCenter - ulRect.left) - (curWidth / 2);
          indLeft = Math.max(3, Math.min(indLeft, ulRect.width - curWidth - 3));

          indicator.style.transform = 'translate3d(' + Math.round(indLeft) + 'px, 0, 0)';
          indicator.style.width = Math.round(curWidth) + 'px';

          Array.prototype.forEach.call(navLinks, function (l) {
            l.classList.toggle('is-drag-candidate', l === dragTargetLink);
          });
        }
      }
    });

    var onPointerRelease = function (e) {
      if (!isPointerDown) return;
      isPointerDown = false;

      if (activePointerId !== null && ul.releasePointerCapture) {
        try {
          if (ul.hasPointerCapture(activePointerId)) {
            ul.releasePointerCapture(activePointerId);
          }
        } catch (err) {}
        activePointerId = null;
      }

      nav.classList.remove('is-dragging', 'is-sticky', 'is-detached');
      Array.prototype.forEach.call(navLinks, function (l) {
        l.classList.remove('is-drag-candidate');
      });

      if (isDragging) {
        isDragging = false;
        var chosenLink = (stickyBroken && dragTargetLink) ? dragTargetLink : startLink;
        if (!chosenLink) chosenLink = startLink;

        updateIndicator(chosenLink, true);

        if (chosenLink && chosenLink !== startLink) {
          setTimeout(function () {
            handleSectionSwitch(chosenLink, 0);
          }, 85);
        } else {
          setActiveLink(startLink);
        }

        setTimeout(function () {
          preventNextClick = false;
        }, 160);
      } else {
        preventNextClick = false;
      }
    };

    window.addEventListener('pointerup', onPointerRelease);
    window.addEventListener('pointercancel', onPointerRelease);
    if (window.PointerEvent) {
      ul.addEventListener('lostpointercapture', onPointerRelease);
    }

    /* Handle clicks on internal navigation links */
    nav.addEventListener('click', function (e) {
      if (preventNextClick) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      var link = e.target.closest('a');
      if (!link) return;

      var href = link.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        e.preventDefault();
        setActiveLink(link);
        updateIndicator(link, true);
        handleSectionSwitch(link, 75);
      }
    });

    /* Intercept clicks on page-wide internal anchors for smooth scroll */
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link || nav.contains(link)) return;

      var href = link.getAttribute('href');
      if (href && href.length > 1) {
        var sectionId = href.substring(1);
        if (/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(sectionId)) {
          var targetEl = document.getElementById(sectionId);
          if (targetEl) {
            e.preventDefault();
            var matchedNavLink = null;
            for (var i = 0; i < navLinks.length; i++) {
              if (navLinks[i].getAttribute('href') === href) {
                matchedNavLink = navLinks[i];
                break;
              }
            }
            if (matchedNavLink) {
              setActiveLink(matchedNavLink);
              lastActiveLink = matchedNavLink;
              updateIndicator(matchedNavLink, true);
            }
            isClickScrolling = true;
            clearTimeout(clickScrollTimer);
            clickScrollTimer = setTimeout(function () {
              isClickScrolling = false;
            }, 1100);

            setTimeout(function () {
              var headerH = header ? header.offsetHeight : 64;
              var targetTop = Math.max(0, getDocumentTop(targetEl) - headerH - 12);
              smoothScrollTo(targetTop, 680, function () {
                triggerArrivalBreath(targetEl);
              });
              if (window.history && window.history.replaceState) {
                window.history.replaceState(null, '', href);
              }
            }, 75);
          }
        }
      }
    });

    // Activate matching link if page loads with a valid hash
    if (window.location.hash && window.location.hash.length > 1) {
      var rawHash = window.location.hash;
      var hashId = rawHash.substring(1);
      if (/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(hashId)) {
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
          updateIndicator(initialLink, true);
          isClickScrolling = true;
          setTimeout(function () { isClickScrolling = false; }, 900);
        }
      }
    }

    // Initialize indicator on pre-active tab if present
    if (!lastActiveLink) {
      var currentActive = nav.querySelector('a.is-active');
      if (currentActive) {
        lastActiveLink = currentActive;
        updateIndicator(currentActive, false);
      }
    }

    var onRenderFrame = function () {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

      // 1. Header hairline elevation
      if (header) {
        header.classList.toggle('is-scrolled', scrollY > 8);
      }

      // 2. Mobile bottom bar visibility
      if (mobileBar) {
        mobileBar.classList.toggle('is-visible', scrollY > 400);
      }

      // 3. Progressive scroll reveals
      if (typeof updateReveals === 'function') {
        updateReveals();
      }

      // 4. Scrollspy navigation links & sliding indicator
      if (sectionData.length && !isClickScrolling && !isDragging) {
        var scrollBottom = scrollY + window.innerHeight;
        var docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        var isAtBottom = (scrollBottom >= docHeight - 70);

        var activeItem = null;

        if (isAtBottom) {
          // Bottom of page -> activate last section
          activeItem = sectionData[sectionData.length - 1];
        } else if (scrollY < 120) {
          // Top of page (Hero) -> no section link active
          activeItem = null;
        } else {
          // Check visible section from bottom up using precomputed tops (zero reflow!)
          var scrollAnchor = scrollY + (window.innerHeight * 0.38);
          for (var j = sectionData.length - 1; j >= 0; j--) {
            var item = sectionData[j];
            if (item.top <= scrollAnchor) {
              activeItem = item;
              break;
            }
          }
        }

        var activeLink = activeItem ? activeItem.link : null;
        if (activeLink !== lastActiveLink) {
          lastActiveLink = activeLink;
          setActiveLink(activeLink);
          updateIndicator(activeLink, false);
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
      if (lastActiveLink) {
        updateIndicator(lastActiveLink, false);
      }
      requestTick();
    }, { passive: true });
    window.addEventListener('load', function () {
      cacheSections();
      if (lastActiveLink) {
        updateIndicator(lastActiveLink, false);
      }
    }, { passive: true });

    onRenderFrame();
  }

  /* ── 9. Clean & Minimalist Hero Showcase ──
     Conveys the core concept of Daftarche at a glance:
     One focused focal task (the Frog) + quiet 2-step progress. */
  function initHeroShowcase() {
    var showcase = document.getElementById('heroShowcase');
    if (!showcase) return;

    var toFaNum = function (num) {
      return String(num).replace(/[0-9]/g, function (d) {
        return '۰۱۲۳۴۵۶۷۸۹'[Number(d)];
      });
    };

    /* 1. Format today's Persian date */
    var dateEl = document.getElementById('heroTodayDate');
    if (dateEl) {
      try {
        var now = new Date();
        var formatter = new Intl.DateTimeFormat('fa-IR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });
        dateEl.textContent = formatter.format(now);
      } catch (e) {
        dateEl.textContent = 'امروز';
      }
    }

    /* 2. Dice button: Shuffle focal task */
    var taskPool = [
      '۳۰ دقیقه تمرکز روی مهم‌ترین کار امروز',
      'طراحی ساختار بدون حواس‌پرتی و شلوغی',
      'نوشتن ۳ فکر اصلی صبحگاهی در دفترچه',
      'پاسخ به مهم‌ترین پیام کاری روز',
      '۱۰ دقیقه پیاده‌روی و نوشتن ایده‌ها'
    ];
    var taskPoolIndex = 0;
    var frogTask = document.getElementById('heroFrogTask');
    var diceBtn = document.getElementById('heroDiceBtn');

    if (diceBtn && frogTask) {
      diceBtn.addEventListener('click', function () {
        if (!reduce) {
          diceBtn.classList.remove('is-rolling');
          void diceBtn.offsetWidth;
          diceBtn.classList.add('is-rolling');
          frogTask.classList.add('is-swapping');
          setTimeout(function () {
            taskPoolIndex = (taskPoolIndex + 1) % taskPool.length;
            frogTask.textContent = taskPool[taskPoolIndex];
            frogTask.classList.remove('is-swapping');
          }, 110);
        } else {
          taskPoolIndex = (taskPoolIndex + 1) % taskPool.length;
          frogTask.textContent = taskPool[taskPoolIndex];
        }
      });
    }

    /* 3. Simple 2-task checklist & progress */
    var tasksList = document.getElementById('heroTasksList');
    var progText = document.getElementById('heroProgText');
    var progTrack = document.getElementById('heroProgTrack');
    var celebrateBanner = document.getElementById('heroCelebrateBanner');
    var frogAvatar = document.getElementById('heroFrogSvgUse');

    var progFill = document.getElementById('heroProgFill');

    var setSvgUse = function (el, href) {
      if (!el) return;
      el.setAttribute('href', href);
      try {
        el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);
      } catch (err) {}
    };

    function updateProgress() {
      if (!tasksList) return;
      var items = tasksList.querySelectorAll('.lp-simple-item');
      var total = items.length;
      var done = tasksList.querySelectorAll('.lp-simple-item.is-done').length;
      var pct = total === 0 ? 0 : Math.round((done / total) * 100);

      var faDone = toFaNum(done);
      var faTotal = toFaNum(total);
      var faPct = toFaNum(pct);

      if (progText) {
        progText.textContent = faDone + ' از ' + faTotal + ' انجام شده (' + faPct + '٪)';
      }
      if (progTrack) {
        progTrack.setAttribute('aria-valuenow', String(pct));
      }
      if (progFill) {
        progFill.style.width = pct + '%';
      }

      if (celebrateBanner) {
        if (pct === 100 && total > 0) {
          celebrateBanner.hidden = false;
          if (frogAvatar) setSvgUse(frogAvatar, 'assets/characters/qorqori/qorqori.svg#qorqori-celebrating');
        } else {
          celebrateBanner.hidden = true;
          if (frogAvatar) setSvgUse(frogAvatar, 'assets/characters/qorqori/qorqori.svg#qorqori-happy');
        }
      }
    }

    if (tasksList) {
      tasksList.addEventListener('click', function (e) {
        var item = e.target.closest('.lp-simple-item');
        if (!item) return;
        item.classList.toggle('is-done');
        if (!reduce) {
          setTimeout(updateProgress, 50);
        } else {
          updateProgress();
        }
      });
    }

    updateProgress();
  }

  /* ── Initialization ── */
  initCleanUrls();
  initFrameGuard();
  initAppLinks();
  initMenu();
  initReveal();
  initMoodSwitcher();
  initCharacters();
  initFaq();
  initInstallGuide();
  initScrollManager();
  initHeroShowcase();
})();
