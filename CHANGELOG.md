# Changelog

All notable changes to Wi-Fi QR Generator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
