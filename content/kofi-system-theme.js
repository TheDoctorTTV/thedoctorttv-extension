(() => {
  const STORAGE_KEY = "kofiThemeEnabled";
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const toggleSelector = "#darkThemeToggle";
  const retryDelay = 250;
  const maxRetries = 80;
  let enabled = true;
  let observer = null;
  let applyFrame = null;
  let retryTimer = null;
  let retries = 0;

  function getShouldUseDark() {
    return media.matches;
  }

  function findToggle() {
    const toggle = document.querySelector(toggleSelector);

    return toggle instanceof HTMLInputElement ? toggle : null;
  }

  function themeFromValue(value) {
    if (typeof value !== "string") {
      return null;
    }

    const normalized = value.toLowerCase();

    if (/(^|[^a-z])(dark|night)([^a-z]|$)|darktheme|darkmode/.test(normalized)) {
      return true;
    }

    if (/(^|[^a-z])(light|day)([^a-z]|$)|lighttheme|lightmode/.test(normalized)) {
      return false;
    }

    return null;
  }

  function colorLuminance(color) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);

    if (!match || match[4] === "0") {
      return null;
    }

    const [red, green, blue] = match.slice(1, 4).map(Number);

    return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  }

  function getActiveTheme() {
    const themeTargets = [document.documentElement, document.body].filter(Boolean);

    for (const target of themeTargets) {
      const values = [
        target.dataset.theme,
        target.dataset.bsTheme,
        target.dataset.colorScheme,
        target.getAttribute("theme"),
        target.getAttribute("color-scheme"),
        target.className,
        target.style.colorScheme
      ];

      for (const value of values) {
        const theme = themeFromValue(value);

        if (theme !== null) {
          return theme;
        }
      }
    }

    for (const target of [document.body, document.documentElement].filter(Boolean)) {
      const styles = window.getComputedStyle(target);
      const backgroundLuminance = colorLuminance(styles.backgroundColor);

      if (backgroundLuminance !== null) {
        return backgroundLuminance < 0.5;
      }
    }

    return null;
  }

  function applyTheme() {
    const toggle = findToggle();
    const activeTheme = getActiveTheme();

    if (!toggle || activeTheme === null) {
      return false;
    }

    const shouldUseDark = getShouldUseDark();

    if (activeTheme !== shouldUseDark) {
      toggle.click();
    }

    return true;
  }

  function clearRetry() {
    if (retryTimer) {
      window.clearTimeout(retryTimer);
      retryTimer = null;
    }
  }

  function resetRetries() {
    retries = 0;
    clearRetry();
  }

  function scheduleRetry() {
    if (retryTimer || retries >= maxRetries) {
      return;
    }

    retries += 1;
    retryTimer = window.setTimeout(() => {
      retryTimer = null;
      scheduleApplyTheme();
    }, retryDelay);
  }

  function scheduleApplyTheme() {
    if (!enabled) {
      return;
    }

    if (applyFrame) {
      return;
    }

    applyFrame = window.requestAnimationFrame(() => {
      applyFrame = null;

      if (!enabled) {
        return;
      }

      if (applyTheme()) {
        clearRetry();
        return;
      }

      scheduleRetry();
    });
  }

  function start() {
    if (observer) {
      return;
    }

    scheduleApplyTheme();

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", scheduleApplyTheme, { once: true });
    } else {
      scheduleApplyTheme();
    }

    media.addEventListener("change", resetAndScheduleApplyTheme);
    window.addEventListener("load", resetAndScheduleApplyTheme, { once: true });
    window.addEventListener("pageshow", resetAndScheduleApplyTheme);
    window.addEventListener("focus", resetAndScheduleApplyTheme);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    observer = new MutationObserver(() => {
      if (!enabled) {
        return;
      }

      if (!findToggle() || getActiveTheme() !== getShouldUseDark()) {
        scheduleApplyTheme();
      }
    });

    observer.observe(document, {
      childList: true,
      subtree: true
    });
  }

  function stop() {
    observer?.disconnect();
    observer = null;
    clearRetry();

    if (applyFrame) {
      window.cancelAnimationFrame(applyFrame);
      applyFrame = null;
    }

    media.removeEventListener("change", resetAndScheduleApplyTheme);
    window.removeEventListener("load", resetAndScheduleApplyTheme);
    window.removeEventListener("pageshow", resetAndScheduleApplyTheme);
    window.removeEventListener("focus", resetAndScheduleApplyTheme);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  }

  function resetAndScheduleApplyTheme() {
    resetRetries();
    scheduleApplyTheme();
  }

  function handleVisibilityChange() {
    if (document.visibilityState === "visible") {
      resetAndScheduleApplyTheme();
    }
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
