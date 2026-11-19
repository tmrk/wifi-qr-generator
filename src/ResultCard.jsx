import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import ShareIcon from '@mui/icons-material/IosShare';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/LockOutlined';
import LockOpenIcon from '@mui/icons-material/LockOpenOutlined';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { EXPORTERS, canShareFiles, sharePNG } from './exporters';
import useBackClose from './useBackClose';
import { securityLabel } from './wifi';

const FORMATS = ['png', 'pdf', 'docx', 'svg'];
const PRIMARY_LABEL = {
  png: 'downloadPNG',
  pdf: 'exportPDF',
  docx: 'exportDOCX',
  svg: 'downloadSVG',
};
const FORMAT_DESC = { png: 'formatPNG', pdf: 'formatPDF', docx: 'formatDOCX', svg: 'formatSVG' };

// The white "sign" always stays white so the code scans in dark mode too.
const sign = { bgcolor: '#ffffff', color: '#14181f', borderRadius: 3, p: { xs: 2.5, sm: 3 } };

const ResultCard = ({ result, downloadButtons, onError }) => {
  const { t } = useTranslation();
  const qrRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [canShare] = useState(canShareFiles);

  const closeMenu = () => setMenuAnchor(null);
  useBackClose(Boolean(menuAnchor), closeMenu);

  const { ssid, password, encryption, isHidden, qrValue } = result;
  const hasPassword = encryption !== 'nopass' && password !== '';

  const enabled = FORMATS.filter((f) => downloadButtons[f]);
  const share = canShare && downloadButtons.png;
  const primary = share ? 'share' : enabled[0];
  const menuFormats = share ? enabled : enabled.slice(1);

  const run = async (fn) => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    setBusy(true);
    try {
      await fn(svg);
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error(err);
        onError(t('exportFailed'));
      }
    } finally {
      setBusy(false);
    }
  };

  const exportAs = (format) =>
    run((svg) =>
      EXPORTERS[format](svg, {
        ssid,
        password,
        hasPassword,
        labels: { networkName: t('networkName'), password: t('password') },
      })
    );

  const handlePrimary = () =>
    primary === 'share' ? run((svg) => sharePNG(svg, t('shareTitle'))) : exportAs(primary);

  return (
    <Paper variant="outlined" className="rise" sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Box sx={sign}>
        <Typography
          variant="h2"
          component="h2"
          sx={{ textAlign: 'center', overflowWrap: 'anywhere', color: 'inherit' }}
        >
          {ssid}
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
          <Chip
            size="small"
            icon={encryption === 'nopass' ? <LockOpenIcon /> : <LockIcon />}
            label={securityLabel(encryption, t)}
            sx={{ bgcolor: '#eef1f6', color: '#14181f', '& .MuiChip-icon': { color: '#4a5463' } }}
          />
          {isHidden && (
            <Chip size="small" label={t('hiddenBadge')} sx={{ bgcolor: '#eef1f6', color: '#14181f' }} />
          )}
        </Stack>
        <Box
          ref={qrRef}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            my: 2.5,
            lineHeight: 0,
            '& svg': { width: '100%', height: 'auto', maxWidth: 288 },
          }}
        >
          <QRCodeSVG value={qrValue} size={256} level="H" />
        </Box>
        {hasPassword && (
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
            <Typography sx={{ color: '#4a5463' }}>{t('password')}</Typography>
            <Typography
              sx={{ fontFamily: 'ui-monospace, monospace', fontWeight: 600, overflowWrap: 'anywhere' }}
            >
              {showPassword ? password : '••••••••'}
            </Typography>
            <IconButton
              size="small"
              aria-label={showPassword ? t('hidePassword') : t('showPassword')}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((v) => !v)}
              sx={{ color: '#4a5463' }}
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Stack>
        )}
        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', color: '#4a5463' }}>
          {t('scanHint')}
        </Typography>
      </Box>

      {primary && (
        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={busy}
            onClick={handlePrimary}
            startIcon={
              busy ? (
                <CircularProgress size={20} color="inherit" />
              ) : primary === 'share' ? (
                <ShareIcon />
              ) : (
                <DownloadIcon />
              )
            }
            sx={{ flex: 1 }}
          >
            {primary === 'share' ? t('share') : t(PRIMARY_LABEL[primary])}
          </Button>
          {menuFormats.length > 0 && (
            <>
              <Button
                variant="outlined"
                size="large"
                disabled={busy}
                aria-label={t('moreFormats')}
                aria-haspopup="menu"
                aria-expanded={Boolean(menuAnchor)}
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                endIcon={<ExpandMoreIcon />}
                startIcon={share ? <DownloadIcon /> : null}
              >
                {share ? t('download') : t('more')}
              </Button>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={closeMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                {menuFormats.map((f) => (
                  <MenuItem
                    key={f}
                    onClick={() => {
                      closeMenu();
                      exportAs(f);
                    }}
                  >
                    <ListItemText primary={t(f)} secondary={t(FORMAT_DESC[f])} />
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Stack>
      )}
    </Paper>
  );
};

export default ResultCard;
