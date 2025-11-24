import React, { ReactNode } from 'react';

import { Button, CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  btn: {
    minWidth: 120,
  },
  buttonProgress: {
    top: '50%',
    left: '50%',
    marginLeft: -13,
    marginTop: -13,
    position: 'absolute',
  },
});

type Props = {
  label: string,
  func?: () => void,
  icon?: ReactNode,
  isLoading?: boolean,
  color?: "inherit" | "primary" | "secondary",
  size?: "small" | "medium" | "large",
  variant?: "contained" | "outlined" | "text",
  className?: any,
  componentSpan?: boolean,
}

function CustomButton({ label, func = ()=>{}, icon, isLoading, color='primary', size="medium", variant='contained', className, componentSpan }: Props) {
  const classes = useStyles();
  return (
    <Button
      variant={variant}
      size={size}
      color={color}
      disabled={isLoading}
      className={className || classes.btn}
      startIcon={icon && icon}
      onClick={func}
      component={componentSpan ? 'span' : 'button'}
    >
      {label}
      {isLoading && (
        <CircularProgress
          size={26}
          color={color}
          className={classes.buttonProgress}
        />
      )}
    </Button>
  );
}

export default CustomButton;
