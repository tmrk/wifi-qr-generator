// Backslash-escape the characters that are special in the ZXing Wi-Fi format.
export const escapeWifi = (value) => String(value).replace(/([\\;,:"])/g, '\\$1');

export const securityLabel = (encryption, t) =>
  encryption === 'nopass' ? t('none') : encryption === 'WPA' ? 'WPA/WPA2' : encryption;

export const buildWifiString = ({ ssid, password, encryption, isHidden }) => {
  const pass = encryption === 'nopass' ? '' : `P:${escapeWifi(password)};`;
  return `WIFI:T:${encryption};S:${escapeWifi(ssid)};${pass}${isHidden ? 'H:true;' : ''};`;
};

// A code can be made when there is a name, and a password unless the network is open.
export const isValidForm = ({ ssid, password, encryption }) =>
  ssid !== '' && (encryption === 'nopass' || password !== '');

// Builds a history entry from the form. Open networks have no password.
export const buildEntry = (form, id) => {
  const entry = {
    id,
    ssid: form.ssid,
    password: form.encryption === 'nopass' ? '' : form.password,
    encryption: form.encryption,
    isHidden: form.isHidden,
  };
  entry.qrValue = buildWifiString(entry);
  return entry;
};
