# thedoctorttv-extension

A browser extension with some functions TheDoctorTTV needs in Chrome, Brave, Edge, and Firefox:

- DuckDuckGo start page new tab redirect
- Configurable new tab destination
- Ko-fi system light or dark theme syncing
- Twitch chat message copy button
- fxtwitter link replacement for copied X or Twitter share URLs
- YouTube Shorts cleanup for home page, video page, and sidebar

## Layout

- `manifest.json` declares Chrome-compatible permissions, popup, background worker, and content scripts.
- `background/` contains shared background code. Chrome packages it as a service worker, and Firefox packages it as a background script.
- `content/` contains site-specific content scripts and injected styles.
- `popup/` contains extension popup HTML, CSS, and JavaScript.
- `icons/` contains extension icons.
- `manifests/` documents browser-specific manifest routes and stores Firefox manifest overrides.
- `scripts/package-chromium.sh` builds the Chromium route.
- `scripts/package-firefox.sh` builds the Firefox route.

## Install in Chrome or Brave

1. Open `chrome://extensions` or `brave://extensions`.
2. Enable Developer mode.
3. Choose Load unpacked.
4. Select this top-level `thedoctorttv-extension` folder, the one containing `manifest.json`.

## Install temporarily in Firefox

Run:

```sh
./scripts/package-firefox.sh
```

Then:

1. Open `about:debugging#/runtime/this-firefox`.
2. Choose Load Temporary Add-on.
3. Select `dist/firefox-unpacked/manifest.json`.

## Chrome Web Store package

Run:

```sh
./scripts/package-chromium.sh
```

Upload the generated zip from `dist/` in the Chrome Developer Dashboard. The zip contains `manifest.json` at the package root and excludes repository metadata.

`scripts/package-webstore.sh` remains available as a compatibility alias for the same Chromium package route.

## Firefox Add-ons package

Run:

```sh
./scripts/package-firefox.sh
```

Upload the generated `thedoctorttv-extension-firefox-<version>.zip` from `dist/` in the AMO Developer Hub. The generated Firefox manifest uses `background.scripts`, includes a Gecko extension ID, targets Firefox 142 or newer, and declares no data collection for AMO review.

## Verify packages

Run:

```sh
./scripts/verify-packages.sh
```

This builds both packages, checks that the Chrome zip keeps the service worker manifest route, checks that the Firefox zip uses the background script manifest route, and runs `web-ext lint` on the unpacked Firefox build.

The extension requests `storage`, `tabs`, and `clipboardWrite` permissions. Permission justification text and privacy answers are in `WEBSTORE_SUBMISSION.md` and `FIREFOX_SUBMISSION.md`.

## Popup

Click the extension icon to toggle each feature and change the new tab destination.
The default is `https://start.duckduckgo.com`.
