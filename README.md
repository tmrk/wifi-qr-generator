# Wi-Fi QR Generator

Create a QR code that lets anyone join your Wi-Fi network. Enter the network name, pick the security type, add the password and scan the result with a phone camera. Export it as PNG, PDF, DOCX or SVG, or share the PNG.

Live: https://tmrk.github.io/wifi-qr-generator/

It installs as an app (use "Install" or "Add to Home Screen" in your browser) and works offline once it has loaded. Everything runs in the browser. Settings and recent codes are stored in local storage on your device.

## URL parameters

Parameters override stored settings on load.

| Parameter | Values | Meaning |
| --- | --- | --- |
| `ssid` | text | Network name |
| `password` | text | Password |
| `encryption` | `WPA`, `WEP`, `nopass` | Security type (default `WPA`) |
| `isHidden` | `true`, `false` | Hidden network |
| `lang` | `en`, `fr`, `es` | Language |
| `displayGenerator` | `true`, `false` | Show the form |
| `displayHistory` | `true`, `false` | Show recent codes |
| `dynamicUrlParams` | `true`, `false` | Keep the page address in sync with the form and settings. `false` clears the query string. |
| `downloadPDF`, `downloadPNG`, `downloadDOCX`, `downloadSVG` | `true`, `false` | Offer that export format |

Example: `?ssid=Cafe&password=karibu123&lang=fr`

## Development

```
npm install
npm run dev
npm run lint
npm run build
```

Set `VITE_ADS_ENABLED=true` to show the advertisement placeholders.
