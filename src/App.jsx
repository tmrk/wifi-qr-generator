import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  IconButton,
  Paper,
  Snackbar,
  ThemeProvider,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { useTranslation } from 'react-i18next';
import GeneratorForm from './GeneratorForm';
import ResultCard from './ResultCard';
import QRHistory from './QRHistory';
import AdPlaceholder from './AdPlaceholder';
import About from './About';
import ClearHistoryDialog from './ClearHistoryDialog';
import DrawerMenu from './DrawerMenu';
import UpdatePrompt from './UpdatePrompt';
import { createAppTheme, barColor } from './theme';
import { addToHistory, findDuplicate, loadInitialState, newEntryId, saveHistory, syncUrl } from './storage';
import { buildEntry, buildWifiString } from './wifi';
import './i18n';

const UNDO_MS = 8000;

function App() {
  const { t, i18n } = useTranslation();

  const [initial] = useState(loadInitialState);
  const [form, setForm] = useState(initial.form);
  const [result, setResult] = useState(initial.autoResult);
  const [history, setHistory] = useState(initial.history);
  const [appSettings, setAppSettings] = useState(initial.settings);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [notice, setNotice] = useState('');
  // The last deleted entry and where it was, so Undo can put it back.
  const [undo, setUndo] = useState(null);
  const resultRef = useRef(null);
  const mainRef = useRef(null);
  const focusMainAfterClear = useRef(false);
  const latest = useRef({ form: initial.form, appSettings: initial.settings });

  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const mode =
    appSettings.themeMode === 'light' || appSettings.themeMode === 'dark'
      ? appSettings.themeMode
      : prefersDark
        ? 'dark'
        : 'light';
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  // Keep the language, the browser theme colour and the page background in sync.
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.title = t('metaTitle');
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('metaDescription'));
  }, [i18n.language, t]);

  useEffect(() => {
    const color = barColor(mode);
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', color));
    const root = document.documentElement;
    if (appSettings.themeMode === 'system') delete root.dataset.theme;
    else root.dataset.theme = mode;
  }, [mode, appSettings.themeMode]);

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(appSettings));

    latest.current = { form, appSettings };
    syncUrl(form, appSettings);
  }, [appSettings, form]);

  // Closing an overlay pops the history entry it pushed, which brings back the
  // address saved on the entry below. Write the current address again after any pop.
  useEffect(() => {
    const resync = () => syncUrl(latest.current.form, latest.current.appSettings);
    window.addEventListener('popstate', resync);
    return () => window.removeEventListener('popstate', resync);
  }, []);

  // On narrow screens the result sits below the form, so bring it into view.
  const showResult = useCallback(() => {
    if (!window.matchMedia('(max-width: 899.95px)').matches) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    );
  }, []);

  // A link with generate=true opens on the code.
  useEffect(() => {
    if (initial.autoResult) showResult();
  }, [initial, showResult]);

  const updateHistory = (next) => {
    setHistory(next);
    saveHistory(next);
  };

  // Generating a code that is already saved moves it to the top with a new date.
  const generateQRCode = () => {
    const entry = buildEntry(form, newEntryId(history));
    setResult(entry);
    updateHistory(addToHistory(history, entry));
    showResult();
  };

  const focusRow = (index) => {
    requestAnimationFrame(() => {
      const rows = document.querySelectorAll('[data-history-id]');
      (rows[Math.min(index, rows.length - 1)] ?? mainRef.current)?.focus();
    });
  };

  // The code shown in the result card stays: the card is a view, not the saved entry.
  const handleDelete = (entry) => {
    const index = history.findIndex((e) => e.id === entry.id);
    if (index < 0) return;
    updateHistory(history.filter((e) => e.id !== entry.id));
    setUndo({ entry, index, open: true });
    focusRow(index);
  };

  const handleUndo = () => {
    if (!undo) return;
    const { entry, index } = undo;
    setUndo({ ...undo, open: false });
    // Skip it if the same network was generated again in the meantime.
    if (!findDuplicate(history, entry)) {
      const next = [...history];
      next.splice(Math.min(index, next.length), 0, entry);
      updateHistory(next);
    }
    requestAnimationFrame(() =>
      document.querySelector(`[data-history-id="${entry.id}"]`)?.focus()
    );
  };

  const handleClear = () => {
    setClearOpen(false);
    setUndo(null);
    updateHistory([]);
    setNotice(t('historyCleared'));
    focusMainAfterClear.current = true;
  };

  // Once the dialog is gone, focus lands on the page instead of the removed button.
  const handleClearExited = () => {
    if (!focusMainAfterClear.current) return;
    focusMainAfterClear.current = false;
    mainRef.current?.focus({ preventScroll: true });
  };

  const handleLoadHistory = (entry) => {
    setForm({
      ssid: entry.ssid,
      password: entry.password,
      encryption: entry.encryption,
      isHidden: entry.isHidden,
    });
    setResult({ ...entry, qrValue: buildWifiString(entry) });
    showResult();
  };

  const { displayGenerator, displayHistory } = appSettings;
  const showHistory = displayHistory && history.length > 0;
  const gutter = {
    pl: 'max(16px, env(safe-area-inset-left))',
    pr: 'max(16px, env(safe-area-inset-right))',
  };

  // The result slot exists when there is a code, a placeholder to show, or a hint to show.
  const hasResultSlot = Boolean(result) || displayGenerator || !showHistory;
  const areas = displayGenerator
    ? {
        xs: result ? '"form" "result" "history"' : '"form" "history"',
        md: '"form result" "history result"',
      }
    : hasResultSlot
      ? '"result" "history"'
      : '"history"';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <AppBar
        position="sticky"
        elevation={0}
        color="inherit"
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
          pt: 'env(safe-area-inset-top)',
        }}
      >
        <Toolbar sx={{ ...gutter, gap: 1.5, minHeight: 60 }}>
          <Box
            component="img"
            src={`${import.meta.env.BASE_URL}favicon.svg`}
            alt=""
            width={32}
            height={32}
            sx={{ borderRadius: '8px' }}
          />
          <Typography variant="h1" component="h1" sx={{ flexGrow: 1 }} noWrap>
            {t('appTitle')}
          </Typography>
          <IconButton edge="end" onClick={() => setDrawerOpen(true)} aria-label={t('settings')}>
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DrawerMenu
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        settings={appSettings}
        setSettings={setAppSettings}
      />

      <Container
        component="main"
        ref={mainRef}
        tabIndex={-1}
        maxWidth={displayGenerator ? 'lg' : 'sm'}
        disableGutters
        sx={{
          ...gutter,
          pt: { xs: 2, md: 4 },
          pb: 'calc(env(safe-area-inset-bottom) + 32px)',
          '&:focus': { outline: 'none' },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2, md: 3 },
            gridTemplateColumns: displayGenerator ? { xs: 'minmax(0, 1fr)', md: '5fr 6fr' } : 'minmax(0, 1fr)',
            gridTemplateRows: { md: displayGenerator ? 'auto 1fr' : 'auto' },
            gridTemplateAreas: areas,
            alignItems: 'start',
          }}
        >
          {displayGenerator && (
            <Box sx={{ gridArea: 'form' }}>
              <GeneratorForm
                values={form}
                onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                onSubmit={generateQRCode}
              />
            </Box>
          )}

          {hasResultSlot && (
            <Box
              ref={resultRef}
              sx={{
                gridArea: 'result',
                position: { md: 'sticky' },
                top: { md: 'calc(env(safe-area-inset-top) + 92px)' },
                scrollMarginTop: 'calc(env(safe-area-inset-top) + 76px)',
                display: !result && displayGenerator ? { xs: 'none', md: 'block' } : 'block',
              }}
            >
              {result ? (
                <ResultCard
                  key={result.id}
                  result={result}
                  downloadButtons={appSettings.downloadButtons}
                  onError={setNotice}
                />
              ) : displayGenerator ? (
                <Paper
                  variant="outlined"
                  sx={{
                    minHeight: 360,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'transparent',
                    borderStyle: 'dashed',
                  }}
                >
                  <QrCode2Icon sx={{ fontSize: 96, color: 'text.disabled' }} />
                  <Typography color="text.secondary">{t('qrPlaceholder')}</Typography>
                </Paper>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  {t('generatorHidden')}
                </Typography>
              )}
            </Box>
          )}

          {showHistory && (
            <Box sx={{ gridArea: 'history', display: 'grid', gap: 2, minWidth: 0 }}>
              <AdPlaceholder />
              <QRHistory
                history={history}
                activeId={result?.id}
                onSelect={handleLoadHistory}
                onDelete={handleDelete}
                onClear={() => setClearOpen(true)}
              />
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 3 }}>
          <AdPlaceholder />
        </Box>
        <Box sx={{ mt: 3 }}>
          <About />
        </Box>
      </Container>

      <ClearHistoryDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={handleClear}
        onExited={handleClearExited}
      />
      <Snackbar
        open={Boolean(undo?.open)}
        autoHideDuration={UNDO_MS}
        onClose={(_, reason) => {
          if (reason !== 'clickaway') setUndo((u) => u && { ...u, open: false });
        }}
        message={undo ? t('codeDeleted', { ssid: undo.entry.ssid }) : ''}
        action={
          <Button color="inherit" size="small" onClick={handleUndo}>
            {t('undo')}
          </Button>
        }
        sx={{ bottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
      />
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={5000}
        onClose={() => setNotice('')}
        message={notice}
        sx={{ bottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
      />
      <UpdatePrompt />
    </ThemeProvider>
  );
}

export default App;
