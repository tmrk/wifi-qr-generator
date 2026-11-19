// Backslash-escape the characters that are special in the ZXing Wi-Fi format.
export const escapeWifi = (value) => String(value).replace(/([\\;,:"])/g, '\\$1');

export const securityLabel = (encryption, t) =>
  encryption === 'nopass' ? t('none') : encryption === 'WPA' ? 'WPA/WPA2' : encryption;

export const buildWifiString = ({ ssid, password, encryption, isHidden }) => {
  const pass = encryption === 'nopass' ? '' : `P:${escapeWifi(password)};`;
  return `WIFI:T:${encryption};S:${escapeWifi(ssid)};${pass}${isHidden ? 'H:true;' : ''};`;
};
