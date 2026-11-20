# Changelog

All notable changes to Wi-Fi QR Generator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-11-20

### Changed
- The app has moved to https://wifiqr.marki.im and is now hosted on Cloudflare.
- `robots.txt` and `sitemap.xml` are now served from the domain root, so search engines read them.
- The README is rewritten around the live app: what it does, how to use and install it, privacy and link parameters.

### Removed
- The GitHub Pages deployment.

## [1.1.1] - 2026-11-20

### Fixed
- Recent codes: smaller corner rounding and more white space around each thumbnail, so the rounded frame no longer cuts into the code's corners.

## [1.1.0] - 2026-11-19

### Added
- Delete a recent code from the list, with an Undo message. The code open in the result card stays on screen.
- Clear history, with a confirmation that the back gesture closes.
- A collapsed "How it works" section with a short guide and answers to common questions, in English, French and Spanish.
- Link options: `hidden` as another name for `isHidden`, `generate=true` (or `autogenerate`) to open straight on the QR code, and `true`/`false`, `1`/`0` or `yes`/`no` for every on/off option, in any letter case.
- `encryption` accepts any letter case, plus `WPA2`, `WPA3`, `SAE` and `WPA/WPA2` (all written as WPA in the code), and `none` or `open` for an open network.
- Search and sharing: page title and description, canonical address, language alternates, Open Graph and Twitter previews with a social image, structured data, `robots.txt` and `sitemap.xml`.
- For AI agents and developers: `llms.txt`, `llms-full.txt` and a machine-readable description of the link options (`link-api.json`, OpenAPI 3.1).
- The page text is also in the first HTML, so crawlers and no-JavaScript visitors can read it.

### Changed
- Generating a code that is already in the list moves it to the top with a new date instead of adding a copy. Duplicates already stored are merged when the page loads.
- Form fields have stable ids and names (`ssid`, `password`), the form has a name, and the export menu button is called "More export formats".
- The page title and description follow the selected language.
- Link previews and files for crawlers are not stored for offline use, and the offline fallback no longer replaces those files.

## [1.0.0] - 2026-11-19

### Added
- Installable app that works offline, with app icons, a web manifest and a prompt when a new version is ready.
- Light and dark themes that follow the system, with a manual Theme setting (System, Light, Dark).
- Show and hide button on the password field.
- Share the QR code as a PNG on devices that support it.
- The back gesture closes the settings panel or the export menu before leaving the app.

### Changed
- New layout: the form and a large QR card sit side by side on wide screens. The card shows the network name and password.
- One main Download or Share button, with the other formats in a menu. Format settings still apply.
- Security is a three-way choice, and the settings panel is grouped into sections.
- Recent codes are a list with network name, security and date.
- Advertisement slots only render when `VITE_ADS_ENABLED` is `true`.
- PDF and DOCX exports load on demand, so the first load is much smaller.

### Fixed
- The password is no longer required, and is left out of the code, when security is None.
- The characters `\ ; , : "` in the network name and password are escaped so those networks work.
- Exports use the network shown in the QR card, not whatever is currently typed in the form.
