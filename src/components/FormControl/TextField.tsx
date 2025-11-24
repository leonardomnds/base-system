import React, { ReactNode } from 'react';

import {
  Input,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

const { v4: uuidv4 } = require('uuid');

const useStyles = makeStyles((theme: Theme) => ({
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

export const getEndItemIconButton = (
  icon: ReactNode,
  onClick: () => void,
  tooltip: string = ''
) => (
  <InputAdornment position="end">
    <Tooltip title={tooltip} placement="top" arrow>
      <IconButton onClick={onClick}>{icon}</IconButton>
    </Tooltip>
  </InputAdornment>
);

type Props = {
  label: string,
  type?: 'text' | 'password',
  disabled?: boolean,
  value: string,
  setValue?: (v: any) => void,
  autoFocus?: boolean,
  endItem?: ReactNode,
  numLinhas?: number,
  variant?: 'standard' | 'outlined' | 'filled'
}

function CustomTextField({
  label,
  type = 'text',
  disabled,
  value,
  setValue = (v) => {},
  autoFocus,
  endItem,
  numLinhas = 1,
  variant = 'standard'
}: Props) {
  const classes = useStyles();

  const uuid = uuidv4();

  return (
    <FormControl className={classes.input} variant={variant}>
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
        multiline={numLinhas !== 1}
        rows={numLinhas}
        onChange={(event) => setValue && setValue(event.target.value)}
        endAdornment={endItem && endItem}
      />
    </FormControl>
  );
}

export default CustomTextField;
