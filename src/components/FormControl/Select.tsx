import React from 'react';

import {
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Box,
  Tooltip,
  IconButton,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

import AddCircleIcon from '@mui/icons-material/AddCircleRounded';

const { v4: uuidv4 } = require('uuid');

const useStyles = makeStyles((theme: Theme) => ({
  themeError: {
    color: theme.palette.background.paper,
  },
  box: {
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    color: '#555555',
    lineHeight: 1.2,
    display: 'block',
    width: '100%',
    background: 'transparent',
  },
}));

export const getSelectItem = (value: any, text: string) => {
  return { value, text };
};

type ItemList = {
  value: any,
  text: string,
}

type Props = {
  label: string,
  disabled?: boolean,
  value: any,
  setValue: (v: any) => void,
  autoFocus?: boolean,
  items: Array<ItemList>,
  itemZero?: boolean,
  textItemZero?: string,
  btnAction?: (v: any) => void,
}

function CustomSelect({
  label,
  disabled,
  value,
  setValue,
  autoFocus,
  items = [],
  itemZero = true,
  textItemZero,
  btnAction,
}: Props) {
  const classes = useStyles();
  const uuid = uuidv4();
  return (
    <Box className={classes.box}>
      <FormControl className={classes.input} variant="standard">
        <InputLabel htmlFor={uuid}>{label}</InputLabel>
        <Select
          labelId={uuid}
          id={uuid}
          value={value}
          autoComplete="off"
          disabled={disabled}
          autoFocus={autoFocus}
          fullWidth
          onChange={(event) => setValue(event.target.value)}
        >
          {itemZero && <MenuItem value={textItemZero ? " " : ""}>{textItemZero ? textItemZero : '-'}</MenuItem>}
          {items.map((item, key) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <MenuItem key={key} value={item.value}>
                {item.text}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      {btnAction && (
        <Tooltip title="Cadastrar" placement="top" arrow>
          <IconButton
            size="small"
            color="primary"
            component="span"
            onClick={btnAction}
          >
            <AddCircleIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

export default CustomSelect;