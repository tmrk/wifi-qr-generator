import React from 'react';
import {
  Box,
  Checkbox,
  Drawer,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import useBackClose from './useBackClose';

const rowSx = {
  m: 0,
  px: 2,
  minHeight: 56,
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const Section = ({ title, hint, children }) => (
  <Box component="section" sx={{ mt: 3 }}>
    <Typography variant="overline" component="h3" color="text.secondary" sx={{ px: 0.5, fontWeight: 700 }}>
      {title}
    </Typography>
    {hint && (
      <Typography variant="body2" color="text.secondary" sx={{ px: 0.5, mb: 1 }}>
        {hint}
      </Typography>
    )}
    <Paper variant="outlined" sx={{ overflow: 'hidden', mt: hint ? 0 : 0.5 }}>
      {children}
    </Paper>
  </Box>
);

const Rows = ({ children }) => (
  <Box sx={{ '& > * + *': { borderTop: 1, borderColor: 'divider' } }}>{children}</Box>
);

const DrawerMenu = ({ open, onClose, settings, setSettings }) => {
  const { t, i18n } = useTranslation();
  useBackClose(open, onClose);

  const handleLanguageChange = (_, newLang) => {
    if (!newLang) return;
    setSettings((prev) => ({ ...prev, language: newLang }));
    i18n.changeLanguage(newLang);
  };

  const handleTheme = (_, mode) => {
    if (mode) setSettings((prev) => ({ ...prev, themeMode: mode }));
  };

  const handleToggle = (field) => (event) => {
    setSettings((prev) => ({ ...prev, [field]: event.target.checked }));
  };

  const handleDownloadCheckboxChange = (key) => (event) => {
    setSettings((prev) => ({
      ...prev,
      downloadButtons: { ...prev.downloadButtons, [key]: event.target.checked },
    }));
  };

  const switchRow = (field, label, hint) => (
    <FormControlLabel
      key={field}
      labelPlacement="start"
      sx={{ ...rowSx, py: 1 }}
      control={<Switch checked={settings[field]} onChange={handleToggle(field)} />}
      label={
        <Box sx={{ pr: 2 }}>
          <Typography>{label}</Typography>
          {hint && (
            <Typography variant="body2" color="text.secondary">
              {hint}
            </Typography>
          )}
        </Box>
      }
    />
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 'min(100vw, 400px)',
            bgcolor: 'background.default',
            pt: 'env(safe-area-inset-top)',
            pb: 'env(safe-area-inset-bottom)',
            pr: 'env(safe-area-inset-right)',
          },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pl: 2.5,
          pr: 1,
          minHeight: 64,
        }}
      >
        <Typography variant="h1" component="h2">
          {t('settings')}
        </Typography>
        <IconButton onClick={onClose} aria-label={t('close')}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ px: 2, pb: 4, overflowY: 'auto' }}>
        <Section title={t('appearance')}>
          <Rows>
            <Box sx={{ p: 2 }}>
              <Typography id="theme-label" variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                {t('theme')}
              </Typography>
              <ToggleButtonGroup
                fullWidth
                exclusive
                color="primary"
                value={settings.themeMode}
                onChange={handleTheme}
                aria-labelledby="theme-label"
              >
                <ToggleButton value="system">{t('themeSystem')}</ToggleButton>
                <ToggleButton value="light">{t('themeLight')}</ToggleButton>
                <ToggleButton value="dark">{t('themeDark')}</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ p: 2 }}>
              <Typography id="language-label" variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                {t('language')}
              </Typography>
              <ToggleButtonGroup
                fullWidth
                exclusive
                color="primary"
                value={settings.language}
                onChange={handleLanguageChange}
                aria-labelledby="language-label"
              >
                <ToggleButton value="en" lang="en">English</ToggleButton>
                <ToggleButton value="fr" lang="fr">Français</ToggleButton>
                <ToggleButton value="es" lang="es">Español</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Rows>
        </Section>

        <Section title={t('display')}>
          <Rows>
            {switchRow('displayGenerator', t('displayGenerator'))}
            {switchRow('displayHistory', t('displayHistory'))}
          </Rows>
        </Section>

        <Section title={t('downloadButtons')} hint={t('downloadButtonsHint')}>
          <Rows>
            {['png', 'pdf', 'docx', 'svg'].map((key) => (
              <FormControlLabel
                key={key}
                labelPlacement="start"
                sx={rowSx}
                control={
                  <Checkbox
                    checked={settings.downloadButtons[key]}
                    onChange={handleDownloadCheckboxChange(key)}
                    sx={{ p: 1.25 }}
                  />
                }
                label={t(key)}
              />
            ))}
          </Rows>
        </Section>

        <Section title={t('advanced')}>
          {switchRow('dynamicUrlParams', t('dynamicUrlParams'), t('dynamicUrlParamsHint'))}
        </Section>
      </Box>
    </Drawer>
  );
};

export default DrawerMenu;
