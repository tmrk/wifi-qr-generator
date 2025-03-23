import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const AdPlaceholder = () => {
  const { t } = useTranslation();
  return (
    <Box sx={{ my: 2, p: 2, border: '1px solid #ccc', borderRadius: 1, textAlign: 'center' }}>
      <Typography variant="body2">
        {t('advertisement')}
      </Typography>
      {/* Insert Google AdSense code here */}
    </Box>
  );
};

export default AdPlaceholder;
