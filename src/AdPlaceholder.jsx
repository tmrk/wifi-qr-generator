import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const adsEnabled = import.meta.env.VITE_ADS_ENABLED === 'true';

const AdPlaceholder = () => {
  const { t } = useTranslation();
  if (!adsEnabled) return null;
  return (
    <Box
      component="aside"
      aria-label={t('advertisement')}
      sx={{
        minHeight: 100,
        borderRadius: 3,
        bgcolor: 'action.hover',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {t('advertisement')}
      </Typography>
      {/* Insert Google AdSense code here */}
    </Box>
  );
};

export default AdPlaceholder;
