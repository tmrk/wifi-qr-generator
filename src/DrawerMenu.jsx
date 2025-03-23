import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  FormGroup,
  Checkbox,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

const DrawerMenu = ({ open, onClose, settings, setSettings }) => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    setSettings(prev => ({ ...prev, language: newLang }));
    i18n.changeLanguage(newLang);
  };

  const handleToggle = (field) => (event) => {
    setSettings(prev => ({ ...prev, [field]: event.target.checked }));
  };

  const handleDownloadCheckboxChange = (key) => (event) => {
    setSettings(prev => ({
      ...prev,
      downloadButtons: {
        ...prev.downloadButtons,
        [key]: event.target.checked,
      },
    }));
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 300, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{t('settings')}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>{t('language')}</InputLabel>
            <Select
              value={settings.language}
              label={t('language')}
              onChange={handleLanguageChange}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="es">Español</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ mt: 2 }}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.displayGenerator}
                  onChange={handleToggle('displayGenerator')}
                />
              }
              label={t('displayGenerator')}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.displayHistory}
                  onChange={handleToggle('displayHistory')}
                />
              }
              label={t('displayHistory')}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.dynamicUrlParams}
                  onChange={handleToggle('dynamicUrlParams')}
                />
              }
              label={t('dynamicUrlParams')}
            />
          </FormGroup>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">{t('downloadButtons')}</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.downloadButtons.pdf}
                  onChange={handleDownloadCheckboxChange('pdf')}
                />
              }
              label={t('pdf')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.downloadButtons.png}
                  onChange={handleDownloadCheckboxChange('png')}
                />
              }
              label={t('png')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.downloadButtons.docx}
                  onChange={handleDownloadCheckboxChange('docx')}
                />
              }
              label={t('docx')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.downloadButtons.svg}
                  onChange={handleDownloadCheckboxChange('svg')}
                />
              }
              label={t('svg')}
            />
          </FormGroup>
        </Box>
      </Box>
    </Drawer>
  );
};

export default DrawerMenu;
