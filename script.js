/* ============================================================
   SleekSites by Saviour Gbordzor — Portfolio interactions
   ============================================================ */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "233246625602";
  var WHATSAPP_URL = "https://wa.me/" + WHATSAPP_NUMBER;
  var root = document.documentElement;
  root.classList.add("js");

  /* ---------- Theme system ---------- */
  var themeToggle = document.getElementById("themeToggle");
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      var label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
      themeToggle.setAttribute("aria-label", label);
      themeToggle.setAttribute("title", label);
    }
    if (themeMeta) {
      themeMeta.setAttribute("content", theme === "dark" ? "#070B14" : "#F8FAFC");
    }
    try {
      localStorage.setItem("sg-theme", theme);
    } catch (e) {}
  }

  applyTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");

  function setMenu(open) {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    navMenu.classList.toggle("is-open", open);
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      setMenu(navToggle.getAttribute("aria-expanded") !== "true");
    });

    navMenu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });

    document.addEventListener("click", function (event) {
      if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) setMenu(false);
    });
  }

  /* ---------- Toast helper ---------- */
  var toast = document.getElementById("toast");
  var toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 3800);
  }

  /* ---------- Scroll progress bar ---------- */
  var progressBar = document.getElementById("scrollProgress");
  var scrollTicking = false;

  function updateScrollProgress() {
    var doc = document.documentElement;
    var max = Math.max(1, doc.scrollHeight - window.innerHeight);
    var progress = Math.min(1, Math.max(0, window.scrollY / max));
    if (progressBar) progressBar.style.transform = "scaleX(" + progress.toFixed(4) + ")";
    scrollTicking = false;
  }

  window.addEventListener("scroll", function () {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(updateScrollProgress);
    }
  }, { passive: true });
  window.addEventListener("resize", updateScrollProgress);
  updateScrollProgress();

  /* ---------- Project filters + scroll-linked glide reveals ---------- */
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".project-card"));
  var filterStatus = document.getElementById("filterStatus");

  /* Progress of a card through the viewport-based reveal window (0 -> 1). */
  function cardScrollProgress(card) {
    var rect = card.getBoundingClientRect();
    var viewport = window.innerHeight || root.clientHeight;
    var travel = Math.max(1, viewport * 0.45 + rect.height * 0.2);
    var progress = (viewport - rect.top) / travel;
    return Math.min(1, Math.max(0, progress));
  }

  function revealCard(card, delay) {
    if (card.classList.contains("is-visible")) return;
    card.style.setProperty("--glide-progress", cardScrollProgress(card).toFixed(3));
    card.style.setProperty("--stagger", delay.toFixed(2) + "s");
    window.requestAnimationFrame(function () {
      card.classList.add("is-visible");
    });
  }

  /* Crisp staggered glide that replays every time a filter tab is chosen. */
  function replayFilterReveal(visibleCards) {
    visibleCards.forEach(function (card, index) {
      card.classList.add("no-transition");
      card.classList.remove("is-visible");
      card.style.setProperty("--glide-progress", "0");
      card.style.setProperty("--stagger", (index * 0.08).toFixed(2) + "s");
    });
    void document.body.offsetWidth;
    visibleCards.forEach(function (card) { card.classList.remove("no-transition"); });
    window.requestAnimationFrame(function () {
      visibleCards.forEach(function (card) { card.classList.add("is-visible"); });
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter");
      var visibleCards = [];

      filterButtons.forEach(function (btn) {
        var active = btn === button;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
      });

      cards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-category") === filter;
        card.hidden = !match;
        if (match) visibleCards.push(card);
      });

      replayFilterReveal(visibleCards);

      if (filterStatus) {
        if (filter === "all") {
          filterStatus.textContent = "Showing all " + visibleCards.length + " projects";
        } else {
          var label = button.textContent.trim();
          filterStatus.textContent = "Showing " + visibleCards.length + " " + (visibleCards.length === 1 ? "project" : "projects") + " in " + label;
        }
      }
    });
  });

  if ("IntersectionObserver" in window) {
    var cardObserver = new IntersectionObserver(function (entries) {
      var entering = entries
        .filter(function (entry) { return entry.isIntersecting; })
        .sort(function (a, b) { return cards.indexOf(a.target) - cards.indexOf(b.target); });

      entering.forEach(function (entry, index) {
        var card = entry.target;
        var progress = cardScrollProgress(card);
        card.style.setProperty("--glide-progress", progress.toFixed(3));
        if (progress > 0.03) revealCard(card, index * 0.1);
      });
    }, { rootMargin: "0px 0px -4% 0px", threshold: 0.06 });

    cards.forEach(function (card) { cardObserver.observe(card); });
  } else {
    cards.forEach(function (card, index) { revealCard(card, (index % 3) * 0.1); });
  }

  /* ---------- Scroll reveals for process, packages and inquiry ---------- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal-up"));

  document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
    group.querySelectorAll(".reveal-up").forEach(function (item, index) {
      item.style.setProperty("--stagger", (index * 0.11).toFixed(2) + "s");
    });
  });

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
  }

  /* ---------- Scaled, non-interactive live mini previews ---------- */
  var BASE_WIDTH = 1440;
  var BASE_HEIGHT = 900;
  var shells = Array.prototype.slice.call(document.querySelectorAll("[data-preview]"));

  shells.forEach(function (shell) {
    var frame = shell.querySelector(".preview-frame");
    if (!frame) return;

    frame.style.width = BASE_WIDTH + "px";
    frame.style.height = BASE_HEIGHT + "px";

    function scalePreview() {
      var width = shell.clientWidth;
      if (!width) return;
      var scale = width / BASE_WIDTH;
      frame.style.transform = "scale(" + scale + ")";
    }

    scalePreview();

    if (typeof ResizeObserver !== "undefined") {
      var observer = new ResizeObserver(scalePreview);
      observer.observe(shell);
    } else {
      window.addEventListener("resize", scalePreview);
    }

    var loaded = false;
    function markLoaded() {
      if (loaded) return;
      loaded = true;
      shell.classList.add("is-loaded");
    }

    frame.addEventListener("load", markLoaded);
    frame.addEventListener("error", markLoaded);
    /* Some sites refuse framing and never fire load: never leave a loader hanging. */
    setTimeout(markLoaded, 7000);

    frame.dataset.ready = "true";
  });

  if ("IntersectionObserver" in window) {
    var previewObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var frame = entry.target.querySelector(".preview-frame");
        if (frame && frame.dataset.src && !frame.src) {
          frame.src = frame.dataset.src;
        }
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "300px 0px" });

    shells.forEach(function (shell) { previewObserver.observe(shell); });
  } else {
    shells.forEach(function (shell) {
      var frame = shell.querySelector(".preview-frame");
      if (frame && frame.dataset.src) frame.src = frame.dataset.src;
    });
  }

  /* ---------- Package CTA -> preselect tier and scroll to form ---------- */
  var tierSelect = document.getElementById("packageTier");
  var contactSection = document.getElementById("contact");

  document.querySelectorAll("[data-tier]").forEach(function (button) {
    button.addEventListener("click", function () {
      var tier = button.getAttribute("data-tier");
      if (tierSelect) tierSelect.value = tier;

      if (contactSection && typeof contactSection.scrollIntoView === "function") {
        contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      showToast(tier + " selected — tell me about your project.");
      if (tierSelect) {
        setTimeout(function () { tierSelect.focus({ preventScroll: true }); }, 650);
      }
    });
  });

  /* ---------- Inquiry form -> compiled WhatsApp message ---------- */
  var form = document.getElementById("inquiryForm");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = (form.elements.yourName.value || "").trim();
      var business = (form.elements.businessName.value || "").trim();
      var tier = (form.elements.packageTier.value || "").trim();
      var details = (form.elements.projectDetails.value || "").trim();

      if (!name || !business || !tier || !details) {
        showToast("Please fill in every field before sending.");
        return;
      }

      var message = [
        "Hello SleekSites, I'd like to request a website project.",
        "",
        "*Name:* " + name,
        "*Business:* " + business,
        "*Package Tier:* " + tier,
        "",
        "*Project Details:*",
        details
      ].join("\n");

      var url = WHATSAPP_URL + "?text=" + encodeURIComponent(message);
      var link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("SleekSites is opening WhatsApp with your inquiry ready to send.");
    });
  }
})();
