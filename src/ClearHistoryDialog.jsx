import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useBackClose from './useBackClose';

// Asks before removing every saved code. Keep is the default action.
const ClearHistoryDialog = ({ open, onClose, onConfirm, onExited }) => {
  const { t } = useTranslation();
  useBackClose(open, onClose);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="clear-history-title"
      aria-describedby="clear-history-body"
      fullWidth
      maxWidth="xs"
      slotProps={{ transition: { onExited } }}
    >
      <DialogTitle id="clear-history-title">{t('clearHistoryTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText id="clear-history-body">{t('clearHistoryBody')}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button autoFocus onClick={onClose}>
          {t('keep')}
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm}>
          {t('clearHistory')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClearHistoryDialog;
