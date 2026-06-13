const DEFAULT_NEW_TAB_URL = "https://start.duckduckgo.com";
const DEFAULT_SETTINGS = {
  newTabEnabled: true,
  kofiThemeEnabled: true,
  twitchCopyEnabled: true,
  twitterFxShareEnabled: true,
  youtubeShortsCleanupEnabled: true,
  newTabUrl: DEFAULT_NEW_TAB_URL
};

const form = document.querySelector("#popup-form");
const input = document.querySelector("#new-tab-url");
const resetButton = document.querySelector("#reset-default");
const status = document.querySelector("#status");
const pages = document.querySelectorAll(".page");
const pageButtons = document.querySelectorAll("[data-page-target]");
const featureToggles = {
  newTabEnabled: document.querySelector("#new-tab-enabled"),
  kofiThemeEnabled: document.querySelector("#kofi-theme-enabled"),
  twitchCopyEnabled: document.querySelector("#twitch-copy-enabled"),
  twitterFxShareEnabled: document.querySelector("#twitter-fx-share-enabled"),
  youtubeShortsCleanupEnabled: document.querySelector("#youtube-shorts-cleanup-enabled")
};

function setStatus(message) {
  status.textContent = message;

  if (!message) {
    return;
  }

  window.setTimeout(() => {
    if (status.textContent === message) {
      status.textContent = "";
    }
  }, 3000);
}

function normalizeUrl(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    return DEFAULT_NEW_TAB_URL;
  }

  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const url = new URL(candidate);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Unsupported protocol");
  }

  return url.href;
}

function focusPageStart(page) {
  const preferredFocus = page.querySelector("#new-tab-url, .back-button, .feature-action");

  if (preferredFocus) {
    preferredFocus.focus();
  }
}

function openPage(pageId) {
  const targetPage = document.getElementById(pageId);

  if (!targetPage) {
    return;
  }

  pages.forEach((page) => {
    page.hidden = page !== targetPage;
  });

  setStatus("");
  focusPageStart(targetPage);

  if (pageId === "new-tab-settings") {
    input.select();
  }
}

chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
  input.value = settings.newTabUrl;

  for (const [key, toggle] of Object.entries(featureToggles)) {
    toggle.checked = Boolean(settings[key]);
  }
});

pageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openPage(button.dataset.pageTarget);
  });
});

for (const [key, toggle] of Object.entries(featureToggles)) {
  toggle.addEventListener("change", () => {
    chrome.storage.sync.set({ [key]: toggle.checked }, () => {
      setStatus("Saved");
    });
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  let newTabUrl;

  try {
    newTabUrl = normalizeUrl(input.value);
  } catch {
    setStatus("Enter valid http or https URL");
    input.focus();
    return;
  }

  chrome.storage.sync.set({ newTabUrl }, () => {
    input.value = newTabUrl;
    setStatus("Saved");
  });
});

resetButton.addEventListener("click", () => {
  chrome.storage.sync.set({ newTabUrl: DEFAULT_NEW_TAB_URL }, () => {
    input.value = DEFAULT_NEW_TAB_URL;
    setStatus("Reset");
  });
});
