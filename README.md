# Wi-Fi QR Generator

**https://wifiqr.marki.im**

Create a QR code that lets anyone join your Wi-Fi network. Enter the network name, pick the security type, add the password and scan the result with a phone camera. Export it as PNG, PDF, DOCX or SVG, or share the PNG. The app is available in English, French and Spanish.

## How to use it

1. Open https://wifiqr.marki.im.
2. Type the network name (SSID), choose the security type (WPA, WEP or none) and enter the password. Tick "hidden" if the network does not broadcast its name.
3. Generate the code. Point a phone camera at it to join the network.
4. Download it, print it or share it. Recent codes are listed below the form, and you can delete them one by one or all at once.

## Install it as an app

Use "Install" or "Add to Home Screen" in your browser. The app is a PWA and works offline once it has loaded.

## Privacy

Everything runs in your browser. The network name and password are never sent to a server. Settings and recent codes stay in local storage on your device.

## Share a link

You can open the app with parameters in the address to pre-fill the form or to open straight on a finished code. Parameters override stored settings on load. Percent-encode the values.

A link that contains a password can end up in browser history, in the logs of whoever carries the link (chat, mail, messaging services) and with anyone it is forwarded to. Share such links carefully.

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

- `https://wifiqr.marki.im/?ssid=Cafe&password=karibu123&lang=fr`
- `https://wifiqr.marki.im/?ssid=Office%20Guest&password=correct-horse-battery&generate=true` opens on the code
- `https://wifiqr.marki.im/?ssid=Cafe%20Free%20WiFi&encryption=open&generate=true` open network
- `https://wifiqr.marki.im/?ssid=Lab%20Net&password=s3cret&hidden=yes&generate=true` hidden network
- `https://wifiqr.marki.im/?ssid=Office%20Guest&password=correct-horse-battery&generate=true&displayGenerator=false&displayHistory=false` code only

The Wi-Fi payload inside the code is `WIFI:T:WPA;S:<ssid>;P:<password>;H:true;;` with `\ ; , : "` escaped by a backslash. Open networks leave out `P:` and use `T:nopass`.

## For AI agents

Agents can read [/llms.txt](https://wifiqr.marki.im/llms.txt) (with a longer [/llms-full.txt](https://wifiqr.marki.im/llms-full.txt)) and [/link-api.json](https://wifiqr.marki.im/link-api.json), an OpenAPI 3.1 description of the link parameters. It describes a link into a web page, not a server API.

## Development

```
npm install
npm run dev
npm run build
npm run deploy
```

`npm run deploy` builds the app and publishes `dist` to Cloudflare as a Worker with static assets (see `wrangler.jsonc`). Run it from a machine that is logged in with `wrangler`. Set `VITE_ADS_ENABLED=true` to show the advertisement placeholders.

The social image `public/og-image.png` is rendered from `public/og-image.svg`. The page text for crawlers in `index.html` and its FAQ data repeat the `about*` strings of `src/locales/en.json`, so change them together.
