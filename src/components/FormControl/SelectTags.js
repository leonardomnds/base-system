import React from 'react';
import PropTypes from 'prop-types';

import { Checkbox, TextField, Autocomplete } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CheckBoxIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxSelectedIcon from '@mui/icons-material/CheckBox';

const { v4: uuidv4 } = require('uuid');

const useStyles = makeStyles((theme) => ({
  themeError: {
    color: theme.palette.background.paper,
  },
  checkbox: {
    marginRight: 8,
    color: theme.palette.primary.main,
  },
}));

export const getTag = (id, label) => {
  return { id, label };
};

function SelectTags({ label, items, limitTags, value, setValue }) {
  const uuid = uuidv4();
  const classes = useStyles();

  return (
    <Autocomplete
      multiple
      id={uuid}
      limitTags={limitTags}
      options={items}
      value={value}
      onChange={(evt, newValue) => {
        setValue(newValue);
      }}
      disableCloseOnSelect
      getOptionLabel={(item) => item.label}
      isOptionEqualToValue={(item, val) => item.id === val.id}
      renderOption={(optionProps, item, { selected }) => (
        <li {...optionProps}>
          <Checkbox
            icon={<CheckBoxIcon className={classes.checkbox} fontSize="small" />}
            checkedIcon={
              <CheckBoxSelectedIcon
                className={classes.checkbox}
                fontSize="small"
              />
            }
            checked={selected}
          />
          {item.label}
        </li>
      )}
      ChipProps={{ size: 'small', color: 'primary' }}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
}

SelectTags.prototypes = {
  label: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  items: PropTypes.array,
  limitTags: PropTypes.number,
  value: PropTypes.array.isRequired,
  setValue: PropTypes.func.isRequired,
};

SelectTags.defaultProps = {
  items: [],
  limitTags: -1,
};

export default SelectTags;
