import { buildEntry, isValidForm } from './wifi';

export const LANGUAGES = ['en', 'fr', 'es'];

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

// First value found under any of the names, so aliases can follow the canonical name.
const readParam = (params, names) => {
  for (const name of names) {
    const v = params.get(name);
    if (v !== null) return v;
  }
  return null;
};

const TRUE_VALUES = ['true', '1', 'yes'];

// true, 1 and yes (any case) are on. Any other value that is present counts as off.
const parseBool = (value) => TRUE_VALUES.includes(value.trim().toLowerCase());

const readBool = (params, names, fallback) => {
  const v = readParam(params, [names].flat());
  return v !== null ? parseBool(v) : fallback;
};

// Accepted spellings of the security type, matched case-insensitively. The app has one
// WPA option and it writes T:WPA, which readers use for WPA2 and for WPA3 networks that
// still accept WPA2. WPA3 and SAE map to it instead of T:SAE, which many scanners ignore.
const ENCRYPTION_ALIASES = {
  wpa: 'WPA',
  wpa2: 'WPA',
  wpa3: 'WPA',
  sae: 'WPA',
  'wpa/wpa2': 'WPA',
  wep: 'WEP',
  nopass: 'nopass',
  none: 'nopass',
  open: 'nopass',
};

const parseEncryption = (value) =>
  value === null ? null : (ENCRYPTION_ALIASES[value.trim().toLowerCase()] ?? null);

const entryKey = (e) => JSON.stringify([e.ssid, e.password, e.encryption, Boolean(e.isHidden)]);

// Drops entries with the same network and settings as a newer one.
export const dedupeHistory = (history) => {
  const seen = new Set();
  return history.filter((e) => {
    if (!e || typeof e !== 'object') return false;
    const key = entryKey(e);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const findDuplicate = (history, entry) => history.find((e) => entryKey(e) === entryKey(entry));

// An id that is not in use yet. The id doubles as the creation date.
export const newEntryId = (history) => {
  let id = Date.now();
  while (history.some((e) => e.id === id)) id += 1;
  return id;
};

// Puts the entry at the top and drops any older entry with the same details.
export const addToHistory = (history, entry) => [
  entry,
  ...history.filter((e) => entryKey(e) !== entryKey(entry)),
];

export const saveHistory = (history) => {
  try {
    if (history.length) localStorage.setItem('qrHistory', JSON.stringify(history));
    else localStorage.removeItem('qrHistory');
  } catch {
    // Storage can be full or blocked. The list still works for this visit.
  }
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
  const history = dedupeHistory(Array.isArray(storedHistory) ? storedHistory : []);

  const params = new URLSearchParams(window.location.search);
  const form = { ssid: '', password: '', encryption: 'WPA', isHidden: false };
  if (params.get('ssid') !== null) form.ssid = params.get('ssid');
  if (params.get('password') !== null) form.password = params.get('password');
  form.encryption = parseEncryption(params.get('encryption')) ?? form.encryption;
  form.isHidden = readBool(params, ['isHidden', 'hidden'], false);

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
  const dynamic = params.get('dynamicUrlParams');
  if (dynamic !== null && !parseBool(dynamic)) {
    window.history.replaceState(window.history.state, '', window.location.pathname);
  }

  // generate=true shows the code straight away. It is only a view, nothing is saved.
  // An entry already in history is reused so it shows as the open one.
  let autoResult = null;
  if (readBool(params, ['generate', 'autogenerate'], false) && isValidForm(form)) {
    const entry = buildEntry(form, 0);
    const saved = findDuplicate(history, entry);
    autoResult = { ...entry, id: saved ? saved.id : newEntryId(history) };
  }

  return { settings, history, form, autoResult };
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
