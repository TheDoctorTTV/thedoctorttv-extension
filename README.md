# thedoctorttv-extension

A chrome extension with some functions TheDoctorTTV needs in chromium browsers:

- DuckDuckGo start page new tab redirect
- Configurable new tab destination
- Ko-fi system light or dark theme syncing
- Twitch chat message copy button
- fxtwitter link replacement for copied X or Twitter share URLs
- X or Twitter promoted post and ad hiding
- YouTube Shorts cleanup for home page, video page, and sidebar

## Layout

- `manifest.json` declares permissions, popup, background worker, and content scripts.
- `background/` contains extension service worker code.
- `content/` contains site-specific content scripts and injected styles.
- `popup/` contains extension popup HTML, CSS, and JavaScript.
- `icons/` contains extension icons.

## Install

1. Open `chrome://extensions` or `brave://extensions`.
2. Enable Developer mode.
3. Choose Load unpacked.
4. Select this top-level `thedoctorttv-extension` folder, the one containing `manifest.json`.

## Popup

Click the extension icon to toggle each feature and change the new tab destination.
The default is `https://start.duckduckgo.com`.
