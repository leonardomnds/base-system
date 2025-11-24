import React from 'react';

import { FormControlLabel, Checkbox } from '@mui/material';

const { v4: uuidv4 } = require('uuid');

type Props = {
  label: string,
  checked: boolean,
  onChange: () => void,
  color?: 'primary' | 'secondary',
}

const CustomCheckbox = (props: Props) => {
  const uuid = uuidv4();
  const { checked, label, onChange, color = 'primary' } = props;

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={onChange}
          name={uuid}
          color={color}
        />
      }
      label={label}
    />
  );
}

export default CustomCheckbox;
