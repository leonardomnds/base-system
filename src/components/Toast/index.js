import React from 'react';
import { DefaultToast, DefaultToastContainer } from 'react-toast-notifications';
import { makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  toast: {
    minHeight: 60,
  },
  message: {
    fontSize: 15,
    minHeight: 60,
    margin: 0,
    padding: 0,
    fontFamily: theme.typography.fontFamily,
  },
}));

export function ToastContainer({ ...rest }) {
  const classes = useStyles();

  return (
    <DefaultToastContainer
      className={classes.container}
      style={{ zIndex: 9999, padding: 15 }}
      {...rest}
    />
  );
}

function Toast({ children, ...rest }) {
  const classes = useStyles();

  return (
    <DefaultToast {...rest}>
      <Typography className={classes.message}>{children}</Typography>
    </DefaultToast>
  );
}

export default Toast;