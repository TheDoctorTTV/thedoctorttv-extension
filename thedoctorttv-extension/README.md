# thedoctorttv-extension

Merged Chromium extension containing:

- DuckDuckGo start page new tab redirect
- Configurable new tab destination
- Ko-fi system light or dark theme syncing
- Twitch chat message copy button
- fxtwitter link replacement for copied X or Twitter share URLs
- X or Twitter promoted post and ad hiding
- YouTube Shorts cleanup for home page, video page, and sidebar

## Install

1. Open `chrome://extensions` or `brave://extensions`.
2. Enable Developer mode.
3. Choose Load unpacked.
4. Select this `thedoctorttv-extension` folder.

## Popup

Click the extension icon to toggle each feature and change the new tab destination.
The default is `https://start.duckduckgo.com`.

## Pack

From the parent folder:

```sh
chromium --pack-extension=thedoctorttv-extension
```

This creates `thedoctorttv-extension.crx` and a matching private key next to the extension folder.

Chromium may reject dragging the `.crx` into the browser with `CRX_REQUIRED_PROOF_MISSING`.
For local installs, use Load unpacked instead. For Chrome Web Store submission or sharing source,
zip the extension files:

```sh
cd thedoctorttv-extension
zip -r ../thedoctorttv-extension-store.zip manifest.json background.js popup.html popup.css popup.js kofi-system-theme.js twitter-fx-share.js twitter-fx-share-main.js twitter-ad-block.js youtube-hide-shorts.js twitch-copy-chat.js twitch-copy-chat.css README.md icons
```
