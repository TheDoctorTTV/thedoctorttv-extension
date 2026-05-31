# Browser manifest routes

## Chromium

Chromium uses the root `manifest.json` directly.

- Local testing: load the project root folder in `chrome://extensions`.
- Packaging: run `scripts/package-chromium.sh` or `scripts/package-webstore.sh`.
- Background route: `background.service_worker`.

## Firefox

Firefox starts from the same root `manifest.json`, then applies `firefox-overrides.json` during packaging.

- Local testing: run `scripts/package-firefox.sh`, then load `dist/firefox-unpacked/manifest.json` in `about:debugging`.
- Packaging: run `scripts/package-firefox.sh`.
- Background route: `background.scripts`.
- AMO metadata: `browser_specific_settings.gecko`.
