# Firefox Add-ons Submission Notes

## Single purpose

Quality-of-life browser tools for TheDoctorTTV workflows across new tabs, Ko-fi, Twitch, X/Twitter, and YouTube.

## Short description

Quality-of-life browser tools for new tabs, Ko-fi themes, Twitch chat copying, X/Twitter shares, promoted posts, and YouTube Shorts.

## Detailed description

TheDoctorTTV Extension adds configurable browser workflow tools:

- Redirect new tabs to a saved destination, defaulting to DuckDuckGo.
- Match Ko-fi to the system light or dark theme.
- Add a copy button to Twitch chat messages.
- Rewrite copied X/Twitter share URLs to fxtwitter.com.
- Hide X/Twitter promoted posts and ads.
- Hide YouTube Shorts modules on the home page, video page, and sidebar.

All features run locally in the browser. No analytics, tracking, remote code, or external data collection is included.

## Permission justification

`storage`: Saves feature toggle states and the configured new tab destination.

`tabs`: Detects browser new tab pages and redirects them when the new tab redirect feature is enabled.

`clipboardWrite`: Copies Twitch chat messages when the user clicks the copy button and rewrites copied X/Twitter share links locally.

## Host access justification

`ko-fi.com`: Applies the system theme sync feature.

`twitch.tv`, `m.twitch.tv`, `player.twitch.tv`: Adds Twitch chat copy controls.

`x.com`, `twitter.com`, `mobile.twitter.com`: Rewrites copied share URLs and hides promoted posts.

`youtube.com`: Hides YouTube Shorts modules and navigation entries.

## Data collection

The extension declares `browser_specific_settings.gecko.data_collection_permissions.required` as `none`.

The extension does not collect user data.

The extension does not sell or transfer user data.

The extension does not use user data for purposes unrelated to the extension's visible features.

The extension does not use user data for creditworthiness or lending purposes.

See `PRIVACY.md` for the full privacy policy text.
