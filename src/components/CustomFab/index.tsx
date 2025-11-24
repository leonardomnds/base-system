import React from 'react';
import PropTypes from 'prop-types';
import { Fab } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

import AddCircleIcon from '@mui/icons-material/AddCircleOutlineRounded';

const useStyles = makeStyles((theme: Theme) => ({
  fab: {
    margin: 0,
    top: 'auto',
    left: 'auto',
    bottom: 20,
    right: 20,
    position: 'fixed',
  },
  icon: {
    marginRight: theme.spacing(1),
  },
}));

type Props = {
  icon?: any,
  label: string,
  onClick: () => void,
}

const CustomFab = (props: Props) => {
  const classes = useStyles();
  const { icon, label, onClick } = props;

  const Icon = icon ?? AddCircleIcon;
  return (
    <Fab
      color="secondary"
      variant="extended"
      onClick={onClick}
      className={classes.fab}
    >
      <Icon className={classes.icon} />
      {label}
    </Fab>
  );
}

export default CustomFab;
