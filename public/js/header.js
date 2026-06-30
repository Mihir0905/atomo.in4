(function () {
  const header = document.getElementById("site-header");
  const toggle = document.getElementById("mobile-menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  if (!header) return;

  const OPEN_DELAY = 90;
  const CLOSE_DELAY = 180;
  const DURATION = 520;
  const SWITCH_DURATION = 640;
  const LINK_SWITCH_DELAY = 160;
  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DESKTOP = window.matchMedia("(min-width: 1024px)");

  function updateHeader() {
    const mobileOpen = mobileNav && mobileNav.classList.contains("is-open");
    header.classList.toggle("site-header--menu-open", mobileOpen);
  }

  updateHeader();

  let mobileMenuTimer = null;

  function isMobileMenuOpen() {
    return mobileNav && mobileNav.classList.contains("is-open");
  }

  function revealMobileNavItems() {
    if (!mobileNav) return;
    const animated = mobileNav.querySelectorAll("[data-mobile-nav-item], .mobile-nav__footer");
    if (REDUCED_MOTION) {
      animated.forEach(function (el) {
        el.classList.add("mobile-nav__item--visible");
      });
      return;
    }
    animated.forEach(function (el) {
      el.classList.remove("mobile-nav__item--visible");
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        animated.forEach(function (el) {
          el.classList.add("mobile-nav__item--visible");
        });
      });
    });
  }

  function hideMobileNavItems() {
    if (!mobileNav) return;
    mobileNav.querySelectorAll("[data-mobile-nav-item], .mobile-nav__footer").forEach(function (el) {
      el.classList.remove("mobile-nav__item--visible");
    });
  }

  function setMobileToggleState(open) {
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    toggle.querySelector(".menu-icon").classList.toggle("hidden", open);
    toggle.querySelector(".close-icon").classList.toggle("hidden", !open);
  }

  function openMobileMenu() {
    if (!toggle || !mobileNav || isMobileMenuOpen()) return;
    clearTimeout(mobileMenuTimer);
    mobileNav.classList.remove("is-closing");
    mobileNav.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setMobileToggleState(true);
    updateHeader();

    if (REDUCED_MOTION) {
      mobileNav.classList.add("is-open");
      revealMobileNavItems();
      return;
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        mobileNav.classList.add("is-open");
        revealMobileNavItems();
      });
    });
  }

  function closeMobileMenu() {
    if (!toggle || !mobileNav || !isMobileMenuOpen()) return;
    clearTimeout(mobileMenuTimer);
    closeAllMobilePanels();
    hideMobileNavItems();
    mobileNav.classList.remove("is-open");
    mobileNav.classList.add("is-closing");
    mobileNav.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setMobileToggleState(false);
    updateHeader();

    mobileMenuTimer = window.setTimeout(function () {
      mobileNav.classList.remove("is-closing");
    }, REDUCED_MOTION ? 0 : DURATION);
  }

  /* ── Mobile menu ── */
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      if (isMobileMenuOpen()) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  function revealMobileLinks(panel, options) {
    options = options || {};
    if (!panel) return;
    if (REDUCED_MOTION) {
      panel.querySelectorAll(".mobile-nav__link").forEach(function (link) {
        link.classList.add("mobile-nav__link--visible");
      });
      return;
    }
    panel.querySelectorAll(".mobile-nav__link").forEach(function (link) {
      link.classList.remove("mobile-nav__link--visible");
    });
    const reveal = function () {
      panel.querySelectorAll(".mobile-nav__link").forEach(function (link) {
        link.classList.add("mobile-nav__link--visible");
      });
    };
    if (options.defer) {
      requestAnimationFrame(function () {
        requestAnimationFrame(reveal);
      });
      return;
    }
    requestAnimationFrame(reveal);
  }

  function closeMobilePanel(item) {
    const trigger = item.querySelector("[data-mobile-nav-trigger]");
    const panel = item.querySelector("[data-mobile-nav-panel]");
    if (!trigger || !panel || !item.classList.contains("is-open")) return;

    item.classList.remove("is-open");
    panel.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    panel.querySelectorAll(".mobile-nav__link").forEach(function (link) {
      link.classList.remove("mobile-nav__link--visible");
    });

    window.setTimeout(function () {
      if (!panel.classList.contains("is-open")) {
        panel.hidden = true;
      }
    }, REDUCED_MOTION ? 0 : DURATION);
  }

  function closeAllMobilePanels() {
    if (!mobileNav) return;
    mobileNav.querySelectorAll("[data-mobile-nav-item].is-open").forEach(closeMobilePanel);
  }

  function openMobilePanel(item) {
    const trigger = item.querySelector("[data-mobile-nav-trigger]");
    const panel = item.querySelector("[data-mobile-nav-panel]");
    if (!trigger || !panel) return;

    panel.hidden = false;
    item.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");

    if (REDUCED_MOTION) {
      panel.classList.add("is-open");
      revealMobileLinks(panel);
      return;
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        panel.classList.add("is-open");
        revealMobileLinks(panel, { defer: true });
      });
    });
  }

  if (mobileNav) {
    mobileNav.querySelectorAll("[data-mobile-nav-trigger]").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        const item = trigger.closest("[data-mobile-nav-item]");
        if (!item) return;
        if (item.classList.contains("is-open")) {
          closeMobilePanel(item);
          return;
        }
        openMobilePanel(item);
      });
    });
  }

  /* ── Desktop mega menu ── */
  const mega = header.querySelector("[data-nav-mega]");
  if (!mega) return;

  const triggers = Array.from(header.querySelectorAll("[data-nav-trigger][data-has-dropdown='true']"));
  const panels = Array.from(mega.querySelectorAll("[data-nav-panel]"));

  let activeIndex = null;
  let openTimer = null;
  let closeTimer = null;
  let isOpen = false;
  let keyboardMode = false;

  function panelByIndex(index) {
    return panels.find(function (p) {
      return p.dataset.navPanel === String(index);
    });
  }

  function triggerByIndex(index) {
    return triggers.find(function (t) {
      return t.dataset.navIndex === String(index);
    });
  }

  function setAriaExpanded(index, expanded) {
    triggers.forEach(function (trigger) {
      const link = trigger.querySelector(".nav-link");
      if (!link) return;
      const match = index !== null && trigger.dataset.navIndex === String(index);
      link.setAttribute("aria-expanded", match && expanded ? "true" : "false");
    });
  }

  function revealLinks(panel, options) {
    options = options || {};
    if (!panel) return;
    if (REDUCED_MOTION) {
      panel.querySelectorAll(".nav-mega__link").forEach(function (link) {
        link.classList.add("nav-mega__link--visible");
      });
      return;
    }
    panel.querySelectorAll(".nav-mega__link").forEach(function (link) {
      link.classList.remove("nav-mega__link--visible");
    });
    const reveal = function () {
      panel.querySelectorAll(".nav-mega__link").forEach(function (link) {
        link.classList.add("nav-mega__link--visible");
      });
    };
    if (options.delay) {
      window.setTimeout(reveal, options.delay);
      return;
    }
    if (options.defer) {
      requestAnimationFrame(function () {
        requestAnimationFrame(reveal);
      });
      return;
    }
    requestAnimationFrame(reveal);
  }

  function showPanel(index, options) {
    options = options || {};
    const switching = isOpen && activeIndex !== null && String(activeIndex) !== String(index);

    if (switching) {
      mega.classList.add("is-switching");
    }

    panels.forEach(function (panel) {
      const active = panel.dataset.navPanel === String(index);
      panel.hidden = false;
      panel.classList.toggle("is-active", active);
      if (!active) {
        panel.querySelectorAll(".nav-mega__link").forEach(function (link) {
          link.classList.remove("nav-mega__link--visible");
        });
      }
    });

    triggers.forEach(function (trigger) {
      trigger.classList.toggle("is-active", trigger.dataset.navIndex === String(index));
    });

    revealLinks(panelByIndex(index), {
      defer: options.deferLinks || switching,
      delay: switching ? LINK_SWITCH_DELAY : 0,
    });
    activeIndex = index;
    setAriaExpanded(index, true);

    if (switching) {
      window.setTimeout(function () {
        mega.classList.remove("is-switching");
      }, SWITCH_DURATION + LINK_SWITCH_DELAY);
    }
  }

  function openMega(index) {
    if (!DESKTOP.matches) return;
    clearTimeout(closeTimer);
    clearTimeout(openTimer);

    openTimer = setTimeout(function () {
      if (activeIndex === index && isOpen) {
        return;
      }

      const firstOpen = !isOpen;

      if (firstOpen) {
        mega.setAttribute("aria-hidden", "false");
        header.classList.add("site-header--mega-open");
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            isOpen = true;
            mega.classList.add("is-open");
            showPanel(index, { deferLinks: true });
          });
        });
        return;
      }

      isOpen = true;
      mega.classList.add("is-open");
      mega.setAttribute("aria-hidden", "false");
      header.classList.add("site-header--mega-open");
      showPanel(index, { deferLinks: true, switching: true });
    }, OPEN_DELAY);
  }

  function closeMega() {
    if (!DESKTOP.matches || !isOpen) return;
    clearTimeout(openTimer);
    clearTimeout(closeTimer);

    closeTimer = setTimeout(function () {
      isOpen = false;
      keyboardMode = false;
      activeIndex = null;
      mega.classList.remove("is-open");
      mega.classList.add("is-closing");
      mega.setAttribute("aria-hidden", "true");
      header.classList.remove("site-header--mega-open");
      triggers.forEach(function (t) {
        t.classList.remove("is-active");
      });
      setAriaExpanded(null, false);

      window.setTimeout(function () {
        mega.classList.remove("is-closing", "is-switching");
        panels.forEach(function (panel) {
          panel.hidden = true;
          panel.classList.remove("is-active");
          panel.querySelectorAll(".nav-mega__link").forEach(function (link) {
            link.classList.remove("nav-mega__link--visible");
          });
        });
      }, REDUCED_MOTION ? 0 : DURATION);
    }, CLOSE_DELAY);
  }

  function cancelClose() {
    clearTimeout(closeTimer);
  }

  function handlePointerEnter(index) {
    if (!DESKTOP.matches) return;
    keyboardMode = false;
    openMega(index);
  }

  triggers.forEach(function (trigger) {
    const index = trigger.dataset.navIndex;

    trigger.addEventListener("mouseenter", function () {
      handlePointerEnter(index);
    });

    trigger.addEventListener("focusin", function () {
      if (keyboardMode) handlePointerEnter(index);
    });

    const link = trigger.querySelector(".nav-link");
    if (link) {
      link.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          if (trigger.dataset.hasDropdown !== "true") return;
          e.preventDefault();
          keyboardMode = true;
          openMega(index);
          const panel = panelByIndex(index);
          const first = panel && panel.querySelector(".nav-mega__link");
          if (first) first.focus();
        }
        if (e.key === "ArrowDown") {
          if (trigger.dataset.hasDropdown !== "true") return;
          e.preventDefault();
          keyboardMode = true;
          openMega(index);
          const panel = panelByIndex(index);
          const first = panel && panel.querySelector(".nav-mega__link");
          if (first) first.focus();
        }
      });
    }
  });

  mega.addEventListener("mouseenter", cancelClose);
  header.addEventListener("mouseenter", cancelClose);

  header.addEventListener("mouseleave", function (e) {
    if (!DESKTOP.matches) return;
    if (!header.contains(e.relatedTarget)) {
      closeMega();
    }
  });

  panels.forEach(function (panel) {
    panel.querySelectorAll(".nav-mega__link").forEach(function (link, i, links) {
      link.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          e.preventDefault();
          closeMega();
          const trigger = activeIndex !== null ? triggerByIndex(activeIndex) : null;
          const triggerLink = trigger && trigger.querySelector(".nav-link");
          if (triggerLink) triggerLink.focus();
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const next = links[i + 1] || links[0];
          next.focus();
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          const prev = links[i - 1] || links[links.length - 1];
          prev.focus();
        }
        if (e.key === "Tab" && e.shiftKey && i === 0) {
          closeMega();
        }
      });
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (mobileNav && isMobileMenuOpen()) {
        closeMobileMenu();
        return;
      }
      if (isOpen) {
        e.preventDefault();
        closeMega();
        if (activeIndex !== null) {
          const trigger = triggerByIndex(activeIndex);
          const link = trigger && trigger.querySelector(".nav-link");
          if (link) link.focus();
        }
      }
    }
  });

  document.addEventListener("click", function (e) {
    if (!header.contains(e.target)) closeMega();
  });

  DESKTOP.addEventListener("change", function () {
    closeMega();
  });
})();
