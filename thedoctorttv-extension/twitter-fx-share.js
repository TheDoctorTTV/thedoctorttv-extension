(() => {
  const STORAGE_KEY = "twitterFxShareEnabled";
  const STATE_ATTRIBUTE = "data-tdttv-twitter-fx-share-enabled";
  const STATE_EVENT = "tdttv-twitter-fx-share-state";
  const TWITTER_URL_PATTERN = /\bhttps?:\/\/(?:www\.|mobile\.)?(?:x|twitter)\.com(?=\/|[?#]|$)/gi;

  let enabled = true;

  function replaceTwitterShareUrls(text) {
    if (typeof text !== "string") {
      return text;
    }

    return text.replace(TWITTER_URL_PATTERN, "https://fxtwitter.com");
  }

  function publishState() {
    document.documentElement.setAttribute(STATE_ATTRIBUTE, enabled ? "true" : "false");
    window.dispatchEvent(new Event(STATE_EVENT));
  }

  function handleCopy(event) {
    if (!enabled || !event.clipboardData) {
      return;
    }

    const selectedText = window.getSelection()?.toString() || "";
    const replacementText = replaceTwitterShareUrls(selectedText);

    if (replacementText === selectedText) {
      return;
    }

    event.clipboardData.setData("text/plain", replacementText);
    event.preventDefault();
  }

  document.addEventListener("copy", handleCopy, true);

  chrome.storage.sync.get({ [STORAGE_KEY]: true }, (settings) => {
    enabled = Boolean(settings[STORAGE_KEY]);
    publishState();
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync" || !changes[STORAGE_KEY]) {
      return;
    }

    enabled = Boolean(changes[STORAGE_KEY].newValue);
    publishState();
  });
})();
