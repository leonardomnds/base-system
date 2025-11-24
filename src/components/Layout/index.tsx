import cookie from 'js-cookie';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { Box } from '@mui/material';
import { useTheme, Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

import TopBar from './TopBar';
import Sidebar from './SideBar';
import useWindowSize from '../../util/WindowSize';

const useStyles = makeStyles((theme: Theme) => ({
  themeError: {
    backgroundColor: theme.palette.background.default,
  },
  root: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    width: '100vw',
  },
  wrapper: {
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden',
    paddingTop: 55,
  },
  contentContainer: {
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden',
  },
  content: {
    flex: '1 1 auto',
    height: '100%',
    overflow: 'auto',
    wordWrap: 'break-word',
    padding: '0px 26px',
    '&::-webkit-scrollbar': {
      width: 8,
    },
    '&::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,.3)',
    },
  },
}));

function Layout({ children }) {
  const classes = useStyles();
  const size = useWindowSize();
  const theme = useTheme();
  const router = useRouter();

  const [isDrawerOpen, setDrawerOpen] = useState(true);

  const needAuthInThisRoute = () => {
    return `${router.pathname}/`.startsWith('/app/');
  };

  const handleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  }

  useEffect(() => {

    const auth = cookie.get('token') || null;

    if (!auth && needAuthInThisRoute()) {
      router.replace('/login');
    }
  }, []);

  return needAuthInThisRoute() && !(router.pathname+'/').startsWith('/app/pdf/') ?
  (
    <div className={classes.root}>
      <TopBar isDrawerOpen={isDrawerOpen} setDrawerOpen={handleDrawer} />
      <Sidebar isDrawerOpen={isDrawerOpen} setDrawerOpen={handleDrawer}/>
      <div
        className={classes.wrapper}
        style={{
          paddingLeft:
          isDrawerOpen && size.width >= theme.breakpoints.values.lg ? 240 : 0,
        }}
      >
        <div className={classes.contentContainer}>
          <Box className={classes.content}>{children}</Box>
        </div>       
      </div>
    </div>
  ) : <Box>{children}</Box>;
}

export default Layout;
