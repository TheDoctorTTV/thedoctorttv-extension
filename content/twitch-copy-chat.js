(() => {
  const STORAGE_KEY = "twitchCopyEnabled";
  const BUTTON_CLASS = "tcmc-copy-button";
  const READY_CLASS = "tcmc-copy-ready";
  const CHAT_MESSAGE_SELECTORS = [
    '[data-a-target="chat-line-message"]',
    '[data-test-selector="chat-line-message"]',
    ".chat-line__message"
  ];
  const MESSAGE_TEXT_SELECTORS = [
    '[data-a-target="chat-line-message-body"]',
    ".chat-line__message-body",
    '[data-a-target="chat-message-text"]',
    ".message",
    ".text-fragment"
  ];
  const EXCLUDED_SELECTORS = [
    `.${BUTTON_CLASS}`,
    '[data-a-target="chat-badge"]',
    '[data-a-target="chat-message-username"]',
    '[data-a-target="chat-message-separator"]',
    '[data-a-target="chat-line-timestamp"]',
    ".chat-author__display-name",
    ".chat-line__username",
    ".chat-badge",
    ".chat-line__timestamp",
    "button"
  ].join(",");

  const messageSelector = CHAT_MESSAGE_SELECTORS.join(",");
  let enabled = true;
  let observer = null;

  function findMessageRows(root = document) {
    if (!(root instanceof Element) && root !== document) {
      return [];
    }

    const rows = [];

    if (root instanceof Element && root.matches(messageSelector)) {
      rows.push(root);
    }

    rows.push(...root.querySelectorAll(messageSelector));
    return rows;
  }

  function getMessageText(row) {
    const textTargets = uniqueMessageTargets(
      MESSAGE_TEXT_SELECTORS.flatMap((selector) => [
        ...row.querySelectorAll(selector)
      ]).filter((node) => !node.closest(EXCLUDED_SELECTORS))
    );

    return serializeMessageNodes(textTargets.length > 0 ? textTargets : [row]);
  }

  function uniqueMessageTargets(nodes) {
    const uniqueNodes = [...new Set(nodes)];

    return uniqueNodes.filter((node) => {
      return !uniqueNodes.some((otherNode) => {
        return otherNode !== node && otherNode.contains(node);
      });
    });
  }

  function serializeMessageNodes(nodes) {
    return normalizeMessageText(nodes.map(serializeMessageNode).join(" "));
  }

  function serializeMessageNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.nodeValue;
    }

    if (!(node instanceof Element) || node.matches(EXCLUDED_SELECTORS)) {
      return "";
    }

    if (node.tagName === "BR") {
      return " ";
    }

    const emoteLabel = getEmoteLabel(node);

    if (emoteLabel) {
      return ` ${emoteLabel} `;
    }

    return [...node.childNodes].map(serializeMessageNode).join("");
  }

  function getEmoteLabel(element) {
    if (!isEmoteElement(element)) {
      return "";
    }

    const label = [
      element.getAttribute("alt"),
      element.getAttribute("aria-label"),
      element.getAttribute("title"),
      element.getAttribute("data-emote-name"),
      element.getAttribute("data-name"),
      element.dataset?.emoteName,
      element.dataset?.name
    ].find((value) => value && value.trim());

    return label ? label.trim() : "";
  }

  function isEmoteElement(element) {
    return element.matches([
      "img",
      '[data-a-target="emote-name"]',
      "[data-emote-name]",
      ".chat-line__message--emote",
      ".seventv-chat-emote",
      ".bttv-emote",
      ".ffz-emote"
    ].join(","));
  }

  function normalizeMessageText(text) {
    return text
      .replace(/\s+/g, " ")
      .trim();
  }

  async function copyText(text) {
    if (!text) {
      return false;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    input.style.pointerEvents = "none";
    document.body.append(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();

    return copied;
  }

  function createCopyIcon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "14");
    rect.setAttribute("height", "14");
    rect.setAttribute("x", "8");
    rect.setAttribute("y", "8");
    rect.setAttribute("rx", "2");
    rect.setAttribute("ry", "2");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2");

    svg.append(rect, path);
    return svg;
  }

  function setButtonFeedback(button, copied) {
    button.classList.toggle("tcmc-copy-button--copied", copied);
    button.title = copied ? "Copied message" : "No message text to copy";
    button.setAttribute("aria-label", button.title);

    window.setTimeout(() => {
      button.classList.remove("tcmc-copy-button--copied");
      button.title = "Copy message";
      button.setAttribute("aria-label", "Copy chat message");
    }, 1200);
  }

  function addCopyButton(row) {
    if (!enabled) {
      return;
    }

    if (row.classList.contains(READY_CLASS) || row.querySelector(`:scope > .${BUTTON_CLASS}`)) {
      return;
    }

    row.classList.add(READY_CLASS);

    const button = document.createElement("button");
    button.type = "button";
    button.className = BUTTON_CLASS;
    button.title = "Copy message";
    button.setAttribute("aria-label", "Copy chat message");
    button.append(createCopyIcon());

    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();

      const copied = await copyText(getMessageText(row));
      setButtonFeedback(button, copied);
    });

    row.append(button);
  }

  function scan(root = document) {
    if (!enabled) {
      return;
    }

    findMessageRows(root).forEach(addCopyButton);
  }

  function removeCopyButtons() {
    document.querySelectorAll(`.${BUTTON_CLASS}`).forEach((button) => button.remove());
    document.querySelectorAll(`.${READY_CLASS}`).forEach((row) => row.classList.remove(READY_CLASS));
  }

  function start() {
    if (observer) {
      return;
    }

    scan();

    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          scan(node);
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function stop() {
    observer?.disconnect();
    observer = null;
    removeCopyButtons();
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
