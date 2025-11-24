import React, { useState, useEffect } from "react";
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
  loginTitle: {
    marginTop: 40,
    fontSize: 24,
    fontWeight: 500,
    color: "#000",
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
    justifyContent: "center",
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

type Props = {
  hash: string;
};

const Redefinir: NextPage<Props> = (props: Props) => {
  const classes = useStyles();
  const router = useRouter();
  const { hash } = props;

  const { addToast, removeAllToasts } = useToasts();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginCliente, setLoginCliente] = useState(true);

  const handleSignIn = async () => {
    setLoading(true);
    removeAllToasts();

    if (!hash && !usuario) {
      addToast(
        `Informe seu ${
          loginCliente ? "CPF/CNPJ" : "usuário ou e-mail"
        } para continuar!`,
        {
          appearance: "warning",
        }
      );
    } else if (hash && (!senha || !senha2)) {
      addToast("Preencha a nova senha", {
        appearance: "warning",
      });
    } else if (hash && senha !== senha2) {
      addToast("As senhas não conferem!", {
        appearance: "warning",
      });
    } else {
      try {
        let response;

        if (hash) {
          response = await api.post(`/login/${hash}/redefinir`, { senha });
        } else {
          response = await api.post(
            `/login/recuperar?pessoa=${loginCliente ? "true" : "false"}`,
            { usuario }
          );
        }

        if (!response?.data?.error) {
          addToast(response.data.message, {
            appearance: hash ? "success" : "info",
          });
          setTimeout(() => {}, 5000);
          router.replace("/login");
          return;
        }

        throw new Error(response.data.error);
      } catch (err) {
        addToast(err.message, { appearance: "error" });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await api.get(`/login/${hash}/redefinir`);

        if (!response?.data?.error) {
          return;
        }

        throw new Error(response.data.error);
      } catch (err) {
        addToast(err.message, { appearance: "error" });
      }
    };

    if (hash) {
      getData();
    }
  }, []);

  const getCampos = () => {
    if (hash) {
      // Trocar senha
      return (
        <>
          <TextField
            variant="outlined"
            label="Nova senha"
            type="password"
            name="senha"
            className={classes.input}
            fullWidth
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
          />
          <TextField
            variant="outlined"
            label="Confirmar nova senha"
            type="password"
            name="senha2"
            className={classes.input}
            fullWidth
            value={senha2}
            onChange={(event) => setSenha2(event.target.value)}
            onKeyPress={(event) => {
              if (event.key === "Enter" && senha && senha2) {
                handleSignIn();
              }
            }}
          />
        </>
      );
    } else {
      // Solicitar recuperação
      return (
        <TextField
          variant="outlined"
          label={loginCliente ? "CPF/CNPJ" : "Usuário ou e-mail"}
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
          onKeyPress={(event) => {
            if (event.key === "Enter" && usuario) {
              handleSignIn();
            }
          }}
        />
      );
    }
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.loginContainer}>
        <Paper className={classes.loginWrap}>
          <Typography variant="body2" className={classes.loginTitle}>
            {`${hash ? "Redefinir" : "Recuperar"} Senha`}
          </Typography>
          <form className={classes.form}>
            {getCampos()}
            <Box className={classes.loginButtonWrapper}>
              <Button
                variant="contained"
                color="primary"
                disabled={loading}
                className={classes.loginButton}
                onClick={handleSignIn}
              >
                {loading ? "Recuperando" : "Recuperar"}
                {loading && (
                  <CircularProgress
                    size={36}
                    color="primary"
                    className={classes.buttonProgress}
                  />
                )}
              </Button>
            </Box>
            {!hash && (
              <Box className={classes.options}>
                <Link
                  className={classes.alternarLogin}
                  onClick={() => {
                    setLoginCliente((prevState) => !prevState);
                    setUsuario("");
                    setSenha("");
                    setSenha2("");
                  }}
                >
                  {loginCliente
                    ? "Não sou cliente."
                    : "É cliente? Clique aqui para recuperar sua senha."}
                </Link>
              </Box>
            )}
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default Redefinir;

export const getServerSideProps: GetServerSideProps = async ({
  query: { hash },
}) => {
  return {
    props: {
      hash: hash || null,
    },
  };
};
