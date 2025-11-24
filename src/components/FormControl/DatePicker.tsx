import React from 'react';

import ptBrLocale from "date-fns/locale/pt-BR";
import { TextField } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const { v4: uuidv4 } = require('uuid');

type Props = {
  label: string,
  disabled?: boolean,
  value: Date | null,
  minValue?: Date,
  maxValue?: Date,
  setValue?: (v: Date | null) => void,
  variant?: 'inline' | 'dialog'
}

function CustomTextField({
  label,
  disabled,
  value,
  minValue,
  maxValue,
  setValue = (v: Date | null) => {},
}: Props) {
  const uuid = uuidv4();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBrLocale}>
      <DatePicker
        label={label}
        value={value}
        onChange={(newValue) => setValue(newValue)}
        minDate={minValue || new Date(1900, 1, 1)}
        maxDate={maxValue || new Date(2100, 1, 1)}
        slotProps={{
          textField: {
            id: uuid,
            disabled,
            fullWidth: true,
            autoComplete: "off",
            variant: "standard"
          },
        }}
      />
    </LocalizationProvider>
  );
}

export default CustomTextField;