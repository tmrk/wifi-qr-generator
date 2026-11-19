import React from 'react';
import { Button, IconButton, Snackbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useTranslation } from 'react-i18next';

// Shows a polite prompt when a new version is waiting. Nothing reloads until asked.
const UpdatePrompt = () => {
  const { t } = useTranslation();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  return (
    <Snackbar
      open={needRefresh}
      message={t('updateReady')}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
      action={
        <>
          <Button color="inherit" size="small" onClick={() => updateServiceWorker(true)}>
            {t('reload')}
          </Button>
          <IconButton color="inherit" aria-label={t('close')} onClick={() => setNeedRefresh(false)}>
            <CloseIcon />
          </IconButton>
        </>
      }
    />
  );
};

export default UpdatePrompt;
