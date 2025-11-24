import React from 'react'
import clsx from 'clsx';

import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { useTheme, Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import DetailIcon from '@mui/icons-material/PlaylistPlayRounded';
import CustomButton from '../CustomButton';

const useStyles = makeStyles((theme: Theme) => ({
  themeError: {
    color: theme.palette.background.paper,
  },
  btnDetail: {
    zIndex: 600,
    top: -82,
    margin: 0,
    padding: 2,
    width: 150,
    fontSize: 12,
    fontWeight: 500,
  },
  indicatorBoxInfo: {
    width: '100%',
    zIndex: 500,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    [theme.breakpoints.down('xs')]: {
      alignItems: 'center',
    },
  },  
  indicatorBoxInfoBackground: {    
    width: '100%',
    height: '100%',
    zIndex: 499,
    position: 'relative',
    top: -75,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  indicatorBoxInfoIcon: {
    fontSize: 100,
    color: 'black',
    opacity: 0.3,
  },
  indicatorBoxInfoValue: {
    fontSize: 32,
    fontWeight: 700,
  },
  indicatorBoxInfoLabel: {
    fontSize: 16,
    fontWeight: 400
  },
  loading: {
    color: "inherit",
    margin: 42
  }
}));

type Props = {
  isLoading: boolean,
  value: string | number,
  label: string,
  strColor: string,
  icon?: any,
  btnLabel?: string,
  func?: () => void,
}

const PainelIndicador = (props: Props) => {
  const classes = useStyles();
  const theme = useTheme();

  const { isLoading, value, label, strColor, icon, btnLabel = "Ver detalhes", func } = props;
  const Icon = icon;

  return (
    <Paper style={{
      height: 130,
      padding: '2px 10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: strColor,
      color: theme.palette.getContrastText(strColor)
    }}>
      {isLoading ? <CircularProgress className={classes.loading}/> : (
      <>
        <Box className={classes.indicatorBoxInfo}>
          <Typography className={classes.indicatorBoxInfoValue} variant="subtitle2">{value}</Typography>
          <Typography className={classes.indicatorBoxInfoLabel} variant="caption">{label}</Typography>
        </Box>
        <Box className={classes.indicatorBoxInfoBackground}>
          <Icon className={classes.indicatorBoxInfoIcon}/>
        </Box>
        {func &&
          <CustomButton
            className={classes.btnDetail}
            label={btnLabel}
            variant="outlined"
            color="inherit"
            icon={<DetailIcon/>}
            func={func}
          />}
      </>
      )}
    </Paper>
  )
}

export default PainelIndicador
