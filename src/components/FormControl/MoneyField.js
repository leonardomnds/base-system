import React from 'react';
import PropTypes from 'prop-types';

import {
  Input,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import { FormatarStringToMoney, StringToDouble } from '../../util/functions';

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

function MoneyField({
  label,
  disabled,
  value,
  setValue,
  autoFocus,
  startText,
}) {
  const classes = useStyles();
  const uuid = uuidv4();

  return (
    <FormControl className={classes.input}>
      <InputLabel htmlFor={uuid}>{label}</InputLabel>
      <Input
        id={uuid}
        name={uuid}
        type="text"
        value={value.toLocaleString('pt-br', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        autoComplete="off"
        disabled={disabled}
        autoFocus={autoFocus}
        fullWidth
        onChange={(event) =>
          setValue(StringToDouble(FormatarStringToMoney(event.target.value)))
        }
        startAdornment={
          <InputAdornment position="start">{startText}</InputAdornment>
        }
      />
    </FormControl>
  );
}

MoneyField.prototypes = {
  label: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  value: PropTypes.number.isRequired,
  setValue: PropTypes.func.isRequired,
  autoFocus: PropTypes.bool,
  endItem: PropTypes.node,
  startText: PropTypes.string,
};

MoneyField.defaultProps = {
  startText: 'R$',
};

export default MoneyField;
