import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useTranslation } from 'react-i18next';

const textProps = {
  autoComplete: 'off',
  autoCapitalize: 'none',
  autoCorrect: 'off',
  spellCheck: false,
};

const GeneratorForm = ({ values, onChange, onSubmit }) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { ssid, password, encryption, isHidden } = values;
  const open = encryption === 'nopass';
  const canSubmit = ssid !== '' && (open || password !== '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) onSubmit();
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h2" component="h2" sx={{ mb: 2.5 }}>
        {t('networkDetails')}
      </Typography>
      <Stack spacing={2.5}>
        <TextField
          fullWidth
          label={t('networkName')}
          value={ssid}
          onChange={(e) => onChange({ ssid: e.target.value })}
          required
          slotProps={{ htmlInput: { ...textProps, enterKeyHint: open ? 'go' : 'next' } }}
        />

        <Box>
          <Typography
            id="security-label"
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            {t('encryption')}
          </Typography>
          <ToggleButtonGroup
            fullWidth
            exclusive
            color="primary"
            value={encryption}
            aria-labelledby="security-label"
            onChange={(_, v) => v && onChange({ encryption: v })}
          >
            <ToggleButton value="WPA">WPA/WPA2</ToggleButton>
            <ToggleButton value="WEP">WEP</ToggleButton>
            <ToggleButton value="nopass">{t('none')}</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {open ? (
          <Typography className="rise" variant="body2" color="text.secondary">
            {t('noPasswordNeeded')}
          </Typography>
        ) : (
          <TextField
            className="rise"
            fullWidth
            label={t('password')}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => onChange({ password: e.target.value })}
            required
            slotProps={{
              htmlInput: { ...textProps, enterKeyHint: 'go' },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((v) => !v)}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        )}

        <FormControlLabel
          labelPlacement="start"
          sx={{ m: 0, justifyContent: 'space-between', minHeight: 56, alignItems: 'center' }}
          control={
            <Switch checked={isHidden} onChange={(e) => onChange({ isHidden: e.target.checked })} />
          }
          label={
            <Box sx={{ pr: 2 }}>
              <Typography>{t('hiddenNetwork')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('hiddenNetworkHint')}
              </Typography>
            </Box>
          }
        />

        <Button type="submit" variant="contained" size="large" fullWidth disabled={!canSubmit}>
          {t('generateQRCode')}
        </Button>
      </Stack>
    </Paper>
  );
};

export default GeneratorForm;
