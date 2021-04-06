import React, { useState/*, useEffect*/ } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { useToasts } from 'react-toast-notifications';
import {
  makeStyles,
  TextField,
  Paper,
  Box,
  Typography,
  // Link,
  Button,
  CircularProgress,
} from '@material-ui/core';
import { signIn } from '../../store/actions/accountAction';
import drawerClick from '../../store/actions/drawerAction';

import useApi from '../../services/useApi';
import authService from '../../services/AuthService';
import { GetServerSideProps, NextPage } from 'next';

const useStyles = makeStyles((theme) => ({
  themeError: {
    color: theme.palette.background.paper,
  },
  root: {
    width: '100%',
    margin: '0 auto',
  },
  loginContainer: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    background: '#EBEEEF',
  },
  loginWrap: {
    width: 550,
    background: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  loginTitleBackground: {
    width: '100%',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '45px 15px',
    backgroundImage: 'url(/assets/images/bg-login.jpg)',
    '&::before': {
      content: "''",
      display: 'block',
      position: 'absolute',
      zIndex: -1,
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      backgroundColor: 'rgba(54,84,99,0.7)',
    },
  },
  loginTitle: {
    fontSize: 30,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    lineHeight: 1.2,
    textAlign: 'center',
  },
  loginCompany: {
    fontSize: 18,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    lineHeight: 1.2,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: '40px',
  },
  options: {
    width: '100%',
    fontSize: 15,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    fontSize: 15,
    color: '#555555',
    lineHeight: 1.2,
    display: 'block',
    width: '100%',
    paddingBottom: 15,
    background: 'transparent',
  },
  loginButtonWrapper: {
    width: '100%',
    position: 'relative',
  },
  loginButton: {
    width: '100%',
    padding: 15,
    marginBottom: 30,
  },
  buttonProgress: {
    top: '50%',
    left: '50%',
    marginLeft: -18,
    marginTop: -18,
    position: 'absolute',
  },
}));

interface InfoEmpresa {
  fantasia?: string,
  logoBase64?: string,
}

type Props = {
  identificador: string,
  infoEmpresa: InfoEmpresa
}

const SignIn: NextPage<Props> = (props) => {
  const classes = useStyles();
  const router = useRouter();
  const { identificador, infoEmpresa } = props;

  const dispatch = useDispatch();
  const { addToast, removeAllToasts } = useToasts();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    removeAllToasts();

    if (!identificador) {
      addToast(
        'Você está tentando acessar uma empresa não localizada em nosso banco de dados. Confirme se está utilizando a URL correta!',
        {
          appearance: 'warning',
        },
      );
    } else if (!usuario || !senha) {
      addToast('Informe usuário e senha para continuar!', {
        appearance: 'warning',
      });
    } else {
      try {
        const response = await useApi.login({identificador, usuario, senha});

        if (!response.error) {
          await dispatch(
            signIn(response.data.login.usuario, response.data.login.token),
          );
          await authService.setIdentificadorEmpresa(identificador);

          if (infoEmpresa && infoEmpresa.logoBase64) {
            await authService.setLogoEmpresa(infoEmpresa.logoBase64);
          }

          dispatch(drawerClick(true));
          router.replace('/app/home');
          return;
        }
        throw new Error(response.error);
      } catch (err) {
        addToast(err.message, { appearance: 'error' });
      }
    }
    setLoading(false);
  }

  return (
    <Box className={classes.root}>
      <Box className={classes.loginContainer}>
        <Paper className={classes.loginWrap}>
          <Box className={classes.loginTitleBackground}>
            <Typography variant="body2" className={classes.loginTitle}>
              CONECTE-SE
            </Typography>
            <Typography variant="body2" className={classes.loginCompany}>
              {infoEmpresa ? infoEmpresa.fantasia : ''}
            </Typography>
          </Box>
          <form className={classes.form}>
            <TextField
              variant="outlined"
              label="Usuário"
              type="text"
              name="usuario"
              className={classes.input}
              fullWidth
              autoFocus
              value={usuario}
              onChange={(event) => setUsuario(event.target.value)}
            />
            <TextField
              variant="outlined"
              label="Senha"
              type="password"
              name="senha"
              className={classes.input}
              fullWidth
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
            />
            <Box className={classes.loginButtonWrapper}>
              <Button
                variant="contained"
                color="primary"
                disabled={loading}
                className={classes.loginButton}
                onClick={handleSignIn}
              >
                {loading ? 'Autenticando' : 'Entrar'}
                {loading && (
                  <CircularProgress
                    size={36}
                    color="primary"
                    className={classes.buttonProgress}
                  />
                )}
              </Button>
            </Box>
            {/* <Box className={classes.options}>
              <Link href="/account/recover_password">Esqueceu sua senha?</Link>
            </Box> */}
          </form>
        </Paper>
      </Box>
    </Box>
  );
}

export default SignIn;

export const getServerSideProps : GetServerSideProps = async (context) => {

  const identificador = context.query && context.query.login ? context.query.login : '';

  let response;
  if (identificador) {
    response = await useApi.findEmpresaById(identificador);
  }

  return {
    props: {
      identificador,
      infoEmpresa: response && response.data ? response.data.infoEmpresa : {}
    }
  }
}