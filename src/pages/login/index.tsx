import cookie from "js-cookie";

import React, { useState } from "react";
import { useRouter } from "next/router";
import { useToasts } from "react-toast-notifications";
import {
  TextField,
  Paper,
  Box,
  Typography,
  // Link,
  Button,
  CircularProgress,
  Link,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material/styles";

import api from "../../util/Api";
import { GetServerSideProps, NextPage } from "next";
import { FormatarCpfCnpj } from "../../util/functions";

const useStyles = makeStyles((theme: Theme) => ({
  themeError: {
    color: theme.palette.background.paper,
  },
  root: {
    width: "100%",
    margin: "0 auto",
  },
  loginContainer: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    background: "#EBEEEF",
  },
  loginWrap: {
    width: 550,
    background: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  loginTitleBackground: {
    width: "100%",
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "column",
    alignItems: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: "45px 15px",
    backgroundImage: "url(/assets/images/bg-login.jpg)",
    "&::before": {
      content: "''",
      display: "block",
      position: "absolute",
      zIndex: -1,
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
      backgroundColor: "rgba(54,84,99,0.7)",
    },
  },
  loginTitle: {
    fontSize: 30,
    color: "#FFFFFF",
    textTransform: "uppercase",
    lineHeight: 1.2,
    textAlign: "center",
  },
  form: {
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: "40px",
  },
  options: {
    width: "100%",
    fontSize: 15,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  input: {
    fontSize: 15,
    color: "#555555",
    lineHeight: 1.2,
    display: "block",
    width: "100%",
    paddingBottom: 15,
    background: "transparent",
  },
  loginButtonWrapper: {
    width: "100%",
    position: "relative",
  },
  loginButton: {
    width: "100%",
    padding: 15,
    marginBottom: 30,
  },
  buttonProgress: {
    top: "50%",
    left: "50%",
    marginLeft: -18,
    marginTop: -18,
    position: "absolute",
  },
  alternarLogin: {
    cursor: "pointer",
  },
}));

type Props = {};

const SignIn: NextPage<Props> = (props) => {
  const classes = useStyles();
  const router = useRouter();

  const { addToast, removeAllToasts } = useToasts();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginCliente, setLoginCliente] = useState(true);

  const handleSignIn = async () => {
    setLoading(true);
    removeAllToasts();

    if (!usuario || !senha) {
      addToast(
        `Informe ${
          loginCliente ? "CPF/CNPJ" : "usuário"
        } e senha para continuar!`,
        {
          appearance: "warning",
        }
      );
    } else {
      try {
        const response = await api.post(
          "/login?pessoa=" + (loginCliente ? "true" : "false"),
          { usuario, senha }
        );

        if (!response?.data?.error) {
          await cookie.set("user", response.data.usuario || null, {
            expires: (1 / 24) * 6,
          }); // 6 horas
          await cookie.set("token", response.data.token || null, {
            expires: (1 / 24) * 6,
          });
          router.replace("/app/home");
          return;
        }

        throw new Error(response.data.error);
      } catch (err) {
        addToast(err.message, { appearance: "error" });
      }
    }
    setLoading(false);
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.loginContainer}>
        <Paper className={classes.loginWrap}>
          <Box className={classes.loginTitleBackground}>
            <Typography variant="body2" className={classes.loginTitle}>
              {`PORTAL DO ${loginCliente ? "CLIENTE" : "FUNCIONÁRIO"}`}
            </Typography>
          </Box>
          <form className={classes.form}>
            <TextField
              variant="outlined"
              autoComplete="off"
              label={loginCliente ? "CPF/CNPJ" : "Usuário"}
              type="text"
              name="usuario"
              className={classes.input}
              fullWidth
              autoFocus
              value={usuario}
              onChange={(event) => {
                if (loginCliente) {
                  setUsuario(FormatarCpfCnpj(event.target.value));
                } else {
                  setUsuario(event.target.value);
                }
              }}
            />
            <TextField
              variant="outlined"
              autoComplete="off"
              label="Senha"
              type="password"
              name="senha"
              className={classes.input}
              fullWidth
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              onKeyPress={(event) => {
                if (event.key === "Enter" && usuario && senha) {
                  handleSignIn();
                }
              }}
            />
            <Box className={classes.loginButtonWrapper}>
              <Button
                variant="contained"
                color="primary"
                disabled={loading}
                className={classes.loginButton}
                onClick={handleSignIn}
              >
                {loading
                  ? `Autenticando ${loginCliente ? "Cliente" : "Funcionário"}`
                  : "Entrar"}
                {loading && (
                  <CircularProgress
                    size={36}
                    color="primary"
                    className={classes.buttonProgress}
                  />
                )}
              </Button>
            </Box>
            <Box className={classes.options}>
              <Link
                className={classes.alternarLogin}
                onClick={() => {
                  setLoginCliente(!loginCliente);
                  setUsuario("");
                  setSenha("");
                }}
              >
                {loginCliente ? "Sou funcionário." : "É cliente? Clique aqui."}
              </Link>
              <Link
                className={classes.alternarLogin}
                onClick={() => {
                  router.push("/login/redefinir");
                }}
              >
                Esqueci minha senha!
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default SignIn;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
