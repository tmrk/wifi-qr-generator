import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';

const QRHistory = ({ history, onSelect }) => {
  const { t } = useTranslation();
  if (!history.length) return null;

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        {t('previouslyGenerated')}
      </Typography>
      <Grid container spacing={2}>
        {history.map((entry) => (
          <Grid item xs={6} sm={4} md={3} key={entry.id}>
            <Box
              onClick={() => onSelect(entry)}
              sx={{
                cursor: 'pointer',
                border: '1px solid #ccc',
                borderRadius: 1,
                p: 1,
                textAlign: 'center',
              }}
            >
              <QRCodeSVG value={entry.qrValue} size={100} level="H" />
              <Typography variant="caption" display="block" noWrap>
                {entry.ssid}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QRHistory;
