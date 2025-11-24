import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';

import {
  Typography,
  Box,
  Button,
  IconButton,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

import AddCircleIcon from '@mui/icons-material/AddCircleOutlineRounded';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    display: 'flex',
    alignItems: 'end',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  leftSection: {
    display: 'flex',
  },
  title: {
    padding: '8px 0px',
    fontWeight: theme.typography.fontWeightMedium,
  },
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
}));

type Props = {
  title: string,
  btnLabel?: string,
  btnFunc?: () => void,
  btnIcon?: any,
  btnLoading?: boolean,
  btnBack?: boolean,
  componentRight?: React.ReactNode,
}

const PageHeader = (props: Props) => {
  const classes = useStyles();
  const router = useRouter();

  const {
    title,
    btnLabel = null,
    btnFunc = () => {},
    btnIcon = <AddCircleIcon />,
    btnLoading,
    btnBack,
    componentRight
  } = props;

  return (
    <Box>
      <Box className={classes.header}>
        <Box className={classes.leftSection}>
          {btnBack && (
            <Tooltip title="Voltar" placement="top" arrow>
              <IconButton
                onClick={() => {
                  router.back();
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          )}

          <Typography variant="h5" className={classes.title}>
            {title}
          </Typography>
        </Box>
        {btnLabel && (
          <Button
            variant="contained"
            color="primary"
            disabled={btnLoading}
            className={classes.btn}
            startIcon={btnIcon}
            onClick={btnFunc}
          >
            {`${btnLabel}`}
            {btnLoading && (
              <CircularProgress
                size={26}
                color="primary"
                className={classes.buttonProgress}
              />
            )}
          </Button>
        )}
        {componentRight && componentRight}
      </Box>
    </Box>
  );
}

export default PageHeader;
