import React from 'react';
import PropTypes from 'prop-types';

import {
  makeStyles,
  Input,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@material-ui/core';

const { v4: uuidv4 } = require('uuid');

const useStyles = makeStyles((theme) => ({
  themeError: {
    color: theme.palette.background.paper,
  },
  input: {
    color: '#555555',
    lineHeight: 1.2,
    display: 'block',
    width: '100%',
    background: 'transparent',
  },
}));

export const getEndItemIconButton = (icon, onClick, tooltip = '') => (
  <InputAdornment position="end">
    <Tooltip title={tooltip} placement="top" arrow>
      <IconButton onClick={onClick}>{icon}</IconButton>
    </Tooltip>
  </InputAdornment>
);

getEndItemIconButton.prototypes = {
  icon: PropTypes.element.isRequired,
  onClick: PropTypes.func.isRequired,
  tooltip: PropTypes.string,
};

function CustomTextField({
  label,
  type,
  disabled,
  value,
  setValue,
  autoFocus,
  endItem,
}) {
  const classes = useStyles();

  const uuid = uuidv4();

  return (
    <FormControl className={classes.input}>
      <InputLabel htmlFor={uuid}>{label}</InputLabel>
      <Input
        id={uuid}
        name={uuid}
        type={type}
        value={value || ''}
        autoComplete="off"
        disabled={disabled}
        autoFocus={autoFocus}
        fullWidth
        onChange={(event) => setValue && setValue(event.target.value)}
        endAdornment={endItem && endItem}
      />
    </FormControl>
  );
}

CustomTextField.prototypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  autoFocus: PropTypes.bool,
  endItem: PropTypes.node,
};

CustomTextField.defaultProps = {
  type: 'text',
};

export default CustomTextField;
