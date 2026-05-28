(() => {
  const STATE_ATTRIBUTE = "data-tdttv-twitter-fx-share-enabled";
  const STATE_EVENT = "tdttv-twitter-fx-share-state";
  const TWITTER_URL_PATTERN = /\bhttps?:\/\/(?:www\.|mobile\.)?(?:x|twitter)\.com(?=\/|[?#]|$)/gi;

  let enabled = document.documentElement.getAttribute(STATE_ATTRIBUTE) !== "false";

  function replaceTwitterShareUrls(text) {
    if (typeof text !== "string") {
      return text;
    }

    return text.replace(TWITTER_URL_PATTERN, "https://fxtwitter.com");
  }

  function readState() {
    enabled = document.documentElement.getAttribute(STATE_ATTRIBUTE) !== "false";
  }

  const originalWriteText = navigator.clipboard?.writeText?.bind(navigator.clipboard);

  if (!originalWriteText || navigator.clipboard.__tdttvTwitterFxSharePatched) {
    return;
  }

  try {
    Object.defineProperty(navigator.clipboard, "__tdttvTwitterFxSharePatched", {
      value: true
    });

    Object.defineProperty(navigator.clipboard, "writeText", {
      configurable: true,
      value(text) {
        return originalWriteText(enabled ? replaceTwitterShareUrls(text) : text);
      }
    });
  } catch {
    return;
  }

  window.addEventListener(STATE_EVENT, readState);
})();
