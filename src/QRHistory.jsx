import React from 'react';
import { Box, Button, ButtonBase, IconButton, Paper, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { buildWifiString, securityLabel } from './wifi';

const DATE_LOCALES = { en: 'en-GB', fr: 'fr-FR', es: 'es-ES' };

const formatDate = (id, lang) => {
  const d = new Date(id);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(DATE_LOCALES[lang] || lang, { dateStyle: 'medium' }).format(d);
};

const QRHistory = ({ history, activeId, onSelect, onDelete, onClear }) => {
  const { t, i18n } = useTranslation();
  if (!history.length) return null;

  return (
    <Paper variant="outlined" component="section" sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pl: { xs: 2, sm: 3 },
          pr: { xs: 1, sm: 2 },
          pt: 2,
          pb: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h2" component="h2">
            {t('previouslyGenerated')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('historyHint')}
          </Typography>
        </Box>
        <Button onClick={onClear} sx={{ color: 'text.secondary', flexShrink: 0 }}>
          {t('clearHistory')}
        </Button>
      </Box>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {history.map((entry) => {
          const active = entry.id === activeId;
          const meta = [
            securityLabel(entry.encryption, t),
            entry.isHidden ? t('hiddenBadge') : null,
            formatDate(entry.id, i18n.language),
          ].filter(Boolean);
          return (
            <Box
              component="li"
              key={entry.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: active ? 'action.selected' : 'transparent',
              }}
            >
              <ButtonBase
                data-history-id={entry.id}
                onClick={() => onSelect(entry)}
                aria-label={t('openCode', { ssid: entry.ssid })}
                aria-current={active ? 'true' : undefined}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: 72,
                  pl: { xs: 2, sm: 3 },
                  pr: 1,
                  py: 1,
                  gap: 2,
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  transition: 'transform 120ms',
                  '&:active': { transform: 'scale(0.985)' },
                }}
              >
                <Box
                  aria-hidden="true"
                  sx={{ bgcolor: '#fff', p: '8px', borderRadius: '6px', lineHeight: 0, flexShrink: 0 }}
                >
                  <QRCodeSVG value={buildWifiString(entry)} size={52} level="L" />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography noWrap sx={{ fontWeight: 600 }}>
                    {entry.ssid}
                  </Typography>
                  <Typography noWrap variant="body2" color="text.secondary">
                    {meta.join(' · ')}
                  </Typography>
                </Box>
                <ChevronRightIcon color="action" sx={{ display: { xs: 'none', sm: 'block' } }} />
              </ButtonBase>
              <IconButton
                onClick={() => onDelete(entry)}
                aria-label={t('deleteCode', { ssid: entry.ssid })}
                sx={{ mr: { xs: 0.5, sm: 1.5 }, color: 'text.secondary' }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default QRHistory;
