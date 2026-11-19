import React from 'react';
import { Box, ButtonBase, Paper, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { buildWifiString, securityLabel } from './wifi';

const DATE_LOCALES = { en: 'en-GB', fr: 'fr-FR', es: 'es-ES' };

const formatDate = (id, lang) => {
  const d = new Date(id);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(DATE_LOCALES[lang] || lang, { dateStyle: 'medium' }).format(d);
};

const QRHistory = ({ history, activeId, onSelect }) => {
  const { t, i18n } = useTranslation();
  if (!history.length) return null;

  return (
    <Paper variant="outlined" component="section" sx={{ overflow: 'hidden' }}>
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 1.5 }}>
        <Typography variant="h2" component="h2">
          {t('previouslyGenerated')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('historyHint')}
        </Typography>
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
            <Box component="li" key={entry.id} sx={{ borderTop: 1, borderColor: 'divider' }}>
              <ButtonBase
                onClick={() => onSelect(entry)}
                aria-label={t('openCode', { ssid: entry.ssid })}
                aria-current={active ? 'true' : undefined}
                sx={{
                  width: '100%',
                  minHeight: 72,
                  px: { xs: 2, sm: 3 },
                  py: 1,
                  gap: 2,
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  bgcolor: active ? 'action.selected' : 'transparent',
                  transition: 'transform 120ms',
                  '&:active': { transform: 'scale(0.985)' },
                }}
              >
                <Box
                  aria-hidden="true"
                  sx={{ bgcolor: '#fff', p: '6px', borderRadius: 1.5, lineHeight: 0, flexShrink: 0 }}
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
                <ChevronRightIcon color="action" />
              </ButtonBase>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default QRHistory;
