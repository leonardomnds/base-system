import React from 'react';
import PropTypes from 'prop-types';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

function CustomDialog({
  title,
  text,
  isOpen,
  onClose,
  btnCancelText,
  onConfirm,
  btnConfirmText,
}) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{text}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" autoFocus>
          {btnCancelText}
        </Button>
        <Button onClick={onConfirm} color="primary" variant="contained">
          {btnConfirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CustomDialog.prototypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  btnCancelText: PropTypes.string,
  btnConfirmText: PropTypes.string,
};

CustomDialog.defaultProps = {
  btnCancelText: 'Cancelar',
  btnConfirmText: 'Confirmar',
};

export default CustomDialog;
