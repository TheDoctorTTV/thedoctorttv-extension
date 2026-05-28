const DEFAULT_NEW_TAB_URL = "https://start.duckduckgo.com";
const DEFAULT_SETTINGS = {
  newTabEnabled: true,
  kofiThemeEnabled: true,
  twitchCopyEnabled: true,
  twitterFxShareEnabled: true,
  twitterAdBlockEnabled: true,
  youtubeShortsCleanupEnabled: true,
  newTabUrl: DEFAULT_NEW_TAB_URL
};

const form = document.querySelector("#popup-form");
const input = document.querySelector("#new-tab-url");
const resetButton = document.querySelector("#reset-default");
const status = document.querySelector("#status");
const settingsPanels = document.querySelectorAll(".settings-panel");
const featureActions = document.querySelectorAll(".feature-action");
const featureToggles = {
  newTabEnabled: document.querySelector("#new-tab-enabled"),
  kofiThemeEnabled: document.querySelector("#kofi-theme-enabled"),
  twitchCopyEnabled: document.querySelector("#twitch-copy-enabled"),
  twitterFxShareEnabled: document.querySelector("#twitter-fx-share-enabled"),
  twitterAdBlockEnabled: document.querySelector("#twitter-ad-block-enabled"),
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

function closeSettingsPanels() {
  settingsPanels.forEach((panel) => {
    panel.hidden = true;
  });

  featureActions.forEach((action) => {
    if (action.dataset.settingsTarget) {
      action.setAttribute("aria-expanded", "false");
    }
  });
}

function openSettingsPanel(panelId, action) {
  const panel = document.getElementById(panelId);

  if (!panel) {
    return;
  }

  const shouldOpen = panel.hidden;
  closeSettingsPanels();

  if (!shouldOpen) {
    return;
  }

  panel.hidden = false;
  action.setAttribute("aria-expanded", "true");

  if (panelId === "new-tab-settings") {
    input.focus();
    input.select();
  }
}

chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
  input.value = settings.newTabUrl;

  for (const [key, toggle] of Object.entries(featureToggles)) {
    toggle.checked = Boolean(settings[key]);
  }
});

featureActions.forEach((action) => {
  action.addEventListener("click", () => {
    const panelId = action.dataset.settingsTarget;

    if (panelId) {
      openSettingsPanel(panelId, action);
      return;
    }

    closeSettingsPanels();
    setStatus(`${action.dataset.settingsLabel} has no settings yet`);
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
