# Wi-Fi QR Generator

Create a QR code that lets anyone join your Wi-Fi network. Enter the network name, pick the security type, add the password and scan the result with a phone camera. Export it as PNG, PDF, DOCX or SVG, or share the PNG.

Live: https://tmrk.github.io/wifi-qr-generator/

It installs as an app (use "Install" or "Add to Home Screen" in your browser) and works offline once it has loaded. Everything runs in the browser. Settings and recent codes are stored in local storage on your device. Recent codes can be deleted one by one or all at once.

## URL parameters

There is no server API. The page runs entirely in the browser, and parameters are read there. The app does not send the network name or password to any server.

A link that contains a password can still end up in browser history, in the logs of whoever carries the link (chat, mail, messaging services) and with anyone it is forwarded to. Share such links carefully.

Parameters override stored settings on load. Percent-encode the values.

| Parameter | Values | Meaning |
| --- | --- | --- |
| `ssid` | text | Network name |
| `password` | text | Password |
| `encryption` | `WPA`, `WEP`, `nopass` (any letter case). Aliases: `WPA2`, `WPA3`, `SAE`, `WPA/WPA2` for `WPA`; `none`, `open` for `nopass`. | Security type (default `WPA`). Unknown values are ignored. |
| `isHidden` | boolean | Hidden network. `hidden` is an alias; `isHidden` wins if both are given. |
| `generate` | boolean | Show the QR code straight away when the fields are valid. `autogenerate` is an alias. |
| `lang` | `en`, `fr`, `es` | Language |
| `displayGenerator` | boolean | Show the form |
| `displayHistory` | boolean | Show recent codes |
| `dynamicUrlParams` | boolean | Keep the page address in sync with the form and settings. `false` clears the query string. |
| `downloadPDF`, `downloadPNG`, `downloadDOCX`, `downloadSVG` | boolean | Offer that export format |

Booleans accept `true`, `1` and `yes` for on and `false`, `0` and `no` for off, in any letter case. Any other value counts as off.

Notes:

- `WPA3` and `SAE` are written as `T:WPA` in the code, which phones use for WPA2 and for WPA3 networks that also allow WPA2. The app does not write `T:SAE`, so a WPA3-only network may not join from the code on some devices.
- `generate=true` needs a network name, and a password unless the network is open. It shows the code but does not save it to recent codes.
- Settings found in a link (`lang`, `display*`, `download*`, `dynamicUrlParams`) are saved as your settings on that device. The network fields are not.
- When `dynamicUrlParams` is on, the address is written with the names in the table, never the aliases.

Examples:

- `?ssid=Cafe&password=karibu123&lang=fr`
- `?ssid=Office%20Guest&password=correct-horse-battery&generate=true` opens on the code
- `?ssid=Cafe%20Free%20WiFi&encryption=open&generate=true` open network
- `?ssid=Lab%20Net&password=s3cret&hidden=yes&generate=true` hidden network
- `?ssid=Office%20Guest&password=correct-horse-battery&generate=true&displayGenerator=false&displayHistory=false` code only

The Wi-Fi payload inside the code is `WIFI:T:WPA;S:<ssid>;P:<password>;H:true;;` with `\ ; , : "` escaped by a backslash. Open networks leave out `P:` and use `T:nopass`.

## For AI agents and crawlers

- [`llms.txt`](public/llms.txt) and [`llms-full.txt`](public/llms-full.txt) describe the app and the link options for language models.
- [`link-api.json`](public/link-api.json) is an OpenAPI 3.1 description of the query parameters. It describes a link into a web page, not a server API.
- `robots.txt` and `sitemap.xml` are in `public/`. They are published under `/wifi-qr-generator/`, so search engines will not read the robots file from there (it must sit at the root of the host).

## Development

```
npm install
npm run dev
npm run lint
npm run build
```

Set `VITE_ADS_ENABLED=true` to show the advertisement placeholders.

The social image `public/og-image.png` is rendered from `public/og-image.svg`. The page text for crawlers in `index.html` and its FAQ data repeat the `about*` strings of `src/locales/en.json`, so change them together.
