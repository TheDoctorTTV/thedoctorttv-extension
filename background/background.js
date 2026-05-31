const DEFAULT_NEW_TAB_URL = "https://start.duckduckgo.com";
const DEFAULT_SETTINGS = {
  newTabEnabled: true,
  newTabUrl: DEFAULT_NEW_TAB_URL
};
const NEW_TAB_URLS = new Set([
  "about:home",
  "about:newtab",
  "brave://newtab/",
  "brave://new-tab-page/",
  "chrome://newtab/",
  "chrome://new-tab-page/",
  "edge://newtab/",
  "edge://new-tab-page/"
]);

function isNewTabUrl(url) {
  return typeof url === "string" && NEW_TAB_URLS.has(url);
}

function normalizeStoredUrl(url) {
  return typeof url === "string" && url.trim() ? url : DEFAULT_NEW_TAB_URL;
}

function redirectNewTab(tabId, url) {
  if (typeof tabId !== "number" || !isNewTabUrl(url)) {
    return;
  }

  chrome.storage.sync.get(DEFAULT_SETTINGS, ({ newTabEnabled, newTabUrl }) => {
    if (!newTabEnabled) {
      return;
    }

    chrome.tabs.update(
      tabId,
      { url: normalizeStoredUrl(newTabUrl) },
      () => {
        void chrome.runtime.lastError;
      }
    );
  });
}

chrome.tabs.onCreated.addListener((tab) => {
  redirectNewTab(tab.id, tab.pendingUrl || tab.url);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  redirectNewTab(tabId, changeInfo.url);
});
