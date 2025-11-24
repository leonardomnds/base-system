import React from 'react';
import Head from 'next/head';
import Router from 'next/router';
import NProgress from 'nprogress';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastProvider } from 'react-toast-notifications';

import { theme2 } from '../theme';
import Toast, { ToastContainer } from '../components/Toast';
import Layout from '../components/Layout';

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

export default function MyApp(props) {
  const { Component, pageProps } = props;

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Nizatech</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="stylesheet" type="text/css" href="/nprogress.css" />
      </Head>
      <ThemeProvider theme={theme2}>
        <ToastProvider
          autoDismiss
          placement="top-right"
          components={{ Toast, ToastContainer }}
        >
          <CssBaseline />
          <Layout>
            <Component {...pageProps} />
          </Layout>          
        </ToastProvider>
      </ThemeProvider>
    </>
  );
}
