import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AppBar,
  Box,
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
import DrawerMenu from './DrawerMenu';
import UpdatePrompt from './UpdatePrompt';
import { createAppTheme, barColor } from './theme';
import { loadInitialState, syncUrl } from './storage';
import { buildWifiString } from './wifi';
import './i18n';

function App() {
  const { t, i18n } = useTranslation();

  const [initial] = useState(loadInitialState);
  const [form, setForm] = useState(initial.form);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(initial.history);
  const [appSettings, setAppSettings] = useState(initial.settings);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const resultRef = useRef(null);
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
  }, [i18n.language]);

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
  const showResult = () => {
    if (!window.matchMedia('(max-width: 899.95px)').matches) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    );
  };

  const generateQRCode = () => {
    const entry = {
      id: Date.now(),
      ssid: form.ssid,
      // Open networks have no password.
      password: form.encryption === 'nopass' ? '' : form.password,
      encryption: form.encryption,
      isHidden: form.isHidden,
    };
    entry.qrValue = buildWifiString(entry);
    setResult(entry);
    const updatedHistory = [entry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('qrHistory', JSON.stringify(updatedHistory));
    showResult();
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
        maxWidth={displayGenerator ? 'lg' : 'sm'}
        disableGutters
        sx={{ ...gutter, pt: { xs: 2, md: 4 }, pb: 'calc(env(safe-area-inset-bottom) + 32px)' }}
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
                  onError={setErrorMessage}
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
              <QRHistory history={history} activeId={result?.id} onSelect={handleLoadHistory} />
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 3 }}>
          <AdPlaceholder />
        </Box>
      </Container>

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={5000}
        onClose={() => setErrorMessage('')}
        message={errorMessage}
        sx={{ bottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
      />
      <UpdatePrompt />
    </ThemeProvider>
  );
}

export default App;
