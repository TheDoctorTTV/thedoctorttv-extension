(() => {
  const STORAGE_KEY = "youtubeShortsCleanupEnabled";
  const HIDDEN_ATTRIBUTE = "data-tdttv-youtube-shorts-hidden";
  const STYLE_ID = "tdttv-youtube-shorts-style";
  const HOME_PATHS = new Set(["/", "/feed/what_to_watch"]);
  const VIDEO_PATHS = new Set(["/watch"]);
  const SIDEBAR_LINK_SELECTORS = [
    'ytd-guide-entry-renderer a[href="/shorts"]',
    'ytd-guide-entry-renderer a[title="Shorts"]',
    'ytd-mini-guide-entry-renderer a[href="/shorts"]',
    'ytd-mini-guide-entry-renderer a[title="Shorts"]'
  ];
  const HOME_SHORTS_SELECTORS = [
    "ytd-rich-shelf-renderer[is-shorts]",
    "ytd-reel-shelf-renderer",
    'ytd-rich-section-renderer:has(a[href^="/shorts/"])',
    'ytd-rich-item-renderer:has(a[href^="/shorts/"])'
  ];
  const VIDEO_SHORTS_SELECTORS = [
    'ytd-watch-next-secondary-results-renderer ytd-compact-video-renderer:has(a[href^="/shorts/"])',
    'ytd-watch-next-secondary-results-renderer ytd-reel-shelf-renderer',
    'ytd-watch-next-secondary-results-renderer ytd-rich-shelf-renderer[is-shorts]',
    'ytd-watch-next-secondary-results-renderer ytd-rich-section-renderer:has(a[href^="/shorts/"])',
    'ytd-watch-next-secondary-results-renderer ytd-rich-item-renderer:has(a[href^="/shorts/"])'
  ];

  let enabled = true;
  let observer = null;
  let scanFrame = null;

  function isHomePage() {
    return HOME_PATHS.has(window.location.pathname);
  }

  function isVideoPage() {
    return VIDEO_PATHS.has(window.location.pathname);
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `[${HIDDEN_ATTRIBUTE}]{display:none!important;}`;
    document.documentElement.append(style);
  }

  function removeStyle() {
    document.getElementById(STYLE_ID)?.remove();
  }

  function queryAll(selector, root = document) {
    try {
      return [...root.querySelectorAll(selector)];
    } catch {
      return [];
    }
  }

  function hideElement(element, reason) {
    if (!(element instanceof HTMLElement)) {
      return;
    }

    element.setAttribute(HIDDEN_ATTRIBUTE, reason);
  }

  function showHiddenElements(reason) {
    document.querySelectorAll(`[${HIDDEN_ATTRIBUTE}="${reason}"]`).forEach((element) => {
      element.removeAttribute(HIDDEN_ATTRIBUTE);
    });
  }

  function hideSidebarShortsButton() {
    SIDEBAR_LINK_SELECTORS
      .flatMap((selector) => queryAll(selector))
      .forEach((link) => {
        const entry = link.closest("ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer");
        hideElement(entry, "sidebar");
      });
  }

  function getHomeShortsContainer(element) {
    if (element.matches("ytd-rich-section-renderer, ytd-rich-item-renderer")) {
      return element;
    }

    return element.closest("ytd-rich-section-renderer, ytd-rich-item-renderer") || element;
  }

  function hideHomeShorts() {
    if (!isHomePage()) {
      showHiddenElements("home");
      return;
    }

    HOME_SHORTS_SELECTORS
      .flatMap((selector) => queryAll(selector))
      .map(getHomeShortsContainer)
      .forEach((element) => hideElement(element, "home"));
  }

  function hideVideoShorts() {
    if (!isVideoPage()) {
      showHiddenElements("video");
      return;
    }

    VIDEO_SHORTS_SELECTORS
      .flatMap((selector) => queryAll(selector))
      .forEach((element) => hideElement(element, "video"));
  }

  function scan() {
    if (!enabled) {
      return;
    }

    ensureStyle();
    hideSidebarShortsButton();
    hideHomeShorts();
    hideVideoShorts();
  }

  function scheduleScan() {
    if (!enabled || scanFrame) {
      return;
    }

    scanFrame = window.requestAnimationFrame(() => {
      scanFrame = null;
      scan();
    });
  }

  function start() {
    if (observer) {
      scheduleScan();
      return;
    }

    scheduleScan();

    observer = new MutationObserver(scheduleScan);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    window.addEventListener("popstate", scheduleScan);
    window.addEventListener("pageshow", scheduleScan);
    document.addEventListener("yt-navigate-finish", scheduleScan);
  }

  function stop() {
    observer?.disconnect();
    observer = null;

    if (scanFrame) {
      window.cancelAnimationFrame(scanFrame);
      scanFrame = null;
    }

    window.removeEventListener("popstate", scheduleScan);
    window.removeEventListener("pageshow", scheduleScan);
    document.removeEventListener("yt-navigate-finish", scheduleScan);
    document.querySelectorAll(`[${HIDDEN_ATTRIBUTE}]`).forEach((element) => {
      element.removeAttribute(HIDDEN_ATTRIBUTE);
    });
    removeStyle();
  }

  chrome.storage.sync.get({ [STORAGE_KEY]: true }, (settings) => {
    enabled = Boolean(settings[STORAGE_KEY]);

    if (enabled) {
      start();
    }
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync" || !changes[STORAGE_KEY]) {
      return;
    }

    enabled = Boolean(changes[STORAGE_KEY].newValue);

    if (enabled) {
      start();
      return;
    }

    stop();
  });
})();
