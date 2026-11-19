export const LANGUAGES = ['en', 'fr', 'es'];
export const ENCRYPTIONS = ['WPA', 'WEP', 'nopass'];

export const defaultSettings = {
  language: 'en',
  themeMode: 'system',
  displayGenerator: true,
  displayHistory: true,
  downloadButtons: { pdf: true, png: true, docx: true, svg: true },
  dynamicUrlParams: false,
};

const readJson = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const readBool = (params, name, fallback) => {
  const v = params.get(name);
  return v !== null ? v === 'true' : fallback;
};

// Language to start with, so the first paint is already translated.
export const initialLanguage = () => {
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (LANGUAGES.includes(urlLang)) return urlLang;
  const stored = readJson('appSettings');
  return stored && LANGUAGES.includes(stored.language) ? stored.language : 'en';
};

// Reads stored settings and history, then lets URL parameters override them.
export const loadInitialState = () => {
  const stored = readJson('appSettings');
  const storedSettings = stored && typeof stored === 'object' ? stored : {};
  let settings = {
    ...defaultSettings,
    ...storedSettings,
    downloadButtons: { ...defaultSettings.downloadButtons, ...storedSettings.downloadButtons },
  };
  if (!LANGUAGES.includes(settings.language)) settings.language = 'en';

  const storedHistory = readJson('qrHistory');
  const history = Array.isArray(storedHistory) ? storedHistory : [];

  const params = new URLSearchParams(window.location.search);
  const form = { ssid: '', password: '', encryption: 'WPA', isHidden: false };
  if (params.get('ssid') !== null) form.ssid = params.get('ssid');
  if (params.get('password') !== null) form.password = params.get('password');
  if (ENCRYPTIONS.includes(params.get('encryption'))) form.encryption = params.get('encryption');
  if (params.get('isHidden') !== null) form.isHidden = params.get('isHidden') === 'true';

  const urlLang = params.get('lang');
  const db = settings.downloadButtons;
  settings = {
    ...settings,
    language: LANGUAGES.includes(urlLang) ? urlLang : settings.language,
    displayGenerator: readBool(params, 'displayGenerator', settings.displayGenerator),
    displayHistory: readBool(params, 'displayHistory', settings.displayHistory),
    dynamicUrlParams: readBool(params, 'dynamicUrlParams', settings.dynamicUrlParams),
    downloadButtons: {
      pdf: readBool(params, 'downloadPDF', db.pdf),
      png: readBool(params, 'downloadPNG', db.png),
      docx: readBool(params, 'downloadDOCX', db.docx),
      svg: readBool(params, 'downloadSVG', db.svg),
    },
  };

  // dynamicUrlParams=false clears the query string on load.
  if (params.get('dynamicUrlParams') === 'false') {
    window.history.replaceState(window.history.state, '', window.location.pathname);
  }

  return { settings, history, form };
};

// Mirrors the form and non-default settings into the address (when enabled),
// otherwise clears the query string.
export const syncUrl = (form, settings) => {
  let url = window.location.pathname;
  if (settings.dynamicUrlParams) {
    const { ssid, password, encryption, isHidden } = form;
    const params = new URLSearchParams();
    if (ssid !== '') params.set('ssid', ssid);
    if (password !== '') params.set('password', password);
    if (encryption !== 'WPA') params.set('encryption', encryption);
    if (isHidden !== false) params.set('isHidden', isHidden.toString());
    if (settings.language !== 'en') params.set('lang', settings.language);
    if (settings.displayGenerator !== true) params.set('displayGenerator', settings.displayGenerator.toString());
    if (settings.displayHistory !== true) params.set('displayHistory', settings.displayHistory.toString());
    const db = settings.downloadButtons;
    if (db.pdf !== true) params.set('downloadPDF', db.pdf.toString());
    if (db.png !== true) params.set('downloadPNG', db.png.toString());
    if (db.docx !== true) params.set('downloadDOCX', db.docx.toString());
    if (db.svg !== true) params.set('downloadSVG', db.svg.toString());
    if (params.toString()) url += '?' + params.toString();
  }
  window.history.replaceState(window.history.state, '', url);
};
