(() => {
  const STORAGE_KEY = "twitterAdBlockEnabled";
  const HIDDEN_ATTRIBUTE = "data-tdttv-twitter-ad-hidden";
  const STYLE_ID = "tdttv-twitter-ad-block-style";
  const AD_LABELS = new Set(["ad", "promoted", "sponsored"]);
  const DIRECT_AD_SELECTORS = [
    '[data-testid="placementTracking"]',
    '[data-testid="promotedIndicator"]',
    '[aria-label="Ad"]',
    '[aria-label="Promoted"]',
    '[aria-label="Sponsored"]'
  ];
  const AD_CONTAINER_SELECTOR = [
    '[data-testid="cellInnerDiv"]',
    'article[data-testid="tweet"]',
    'article[role="article"]',
    '[data-testid="trend"]',
    '[data-testid="UserCell"]'
  ].join(", ");
  const TEXT_SCAN_SELECTOR = [
    '[data-testid="cellInnerDiv"] span',
    'article[data-testid="tweet"] span',
    'article[role="article"] span',
    '[data-testid="trend"] span',
    '[data-testid="UserCell"] span'
  ].join(", ");
  const IGNORED_TEXT_CONTEXT_SELECTOR = [
    '[data-testid="tweetText"]',
    '[data-testid="User-Name"]',
    '[data-testid="UserAvatar-Container"]',
    'a[href*="/status/"]',
    "time"
  ].join(", ");

  let enabled = true;
  let observer = null;
  let scanFrame = null;

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

  function normalizeLabel(text) {
    return (text || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function isAdLabel(element) {
    const text = normalizeLabel(element.textContent);
    const ariaLabel = normalizeLabel(element.getAttribute("aria-label"));

    return AD_LABELS.has(text) || AD_LABELS.has(ariaLabel);
  }

  function isIgnoredTextContext(element) {
    return Boolean(element.closest(IGNORED_TEXT_CONTEXT_SELECTOR));
  }

  function getAdContainer(element) {
    return element.closest(AD_CONTAINER_SELECTOR);
  }

  function hideContainer(element) {
    if (!(element instanceof HTMLElement)) {
      return;
    }

    element.setAttribute(HIDDEN_ATTRIBUTE, "true");
  }

  function hideDirectMatches() {
    DIRECT_AD_SELECTORS
      .flatMap((selector) => queryAll(selector))
      .map(getAdContainer)
      .forEach(hideContainer);
  }

  function hideTextLabelMatches() {
    queryAll(TEXT_SCAN_SELECTOR)
      .filter((element) => isAdLabel(element) && !isIgnoredTextContext(element))
      .map(getAdContainer)
      .forEach(hideContainer);
  }

  function scan() {
    if (!enabled) {
      return;
    }

    ensureStyle();
    hideDirectMatches();
    hideTextLabelMatches();
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
