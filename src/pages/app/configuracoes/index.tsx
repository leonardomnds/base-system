import React, { useState } from 'react'

import { useRouter } from 'next/router';
import { useToasts } from 'react-toast-notifications';

import { Box, Paper, Grid, Typography, Hidden } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import PageHeader from '../../../components/Layout/PageHeader';
import { GetServerSideProps } from 'next';
import prisma from '../../../prisma/PrismaInstance';
import { Configuracao } from '.prisma/client';
import TextField from '../../../components/FormControl/TextField';
import Select from '../../../components/FormControl/Select';
import Checkbox from '../../../components/FormControl/Checkbox';
import { SomenteNumeros } from '../../../util/functions';
import { Base64 } from 'js-base64';
import api from '../../../util/Api';
import CustomButton from '../../../components/CustomButton';

const useStyles = makeStyles((theme: Theme) => ({
  themeError: {
    color: theme.palette.background.paper,
  },
  paperBox: {
    padding: 20,
    paddingTop: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  paperBoxLabel: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: theme.typography.fontWeightMedium,
    textTransform: 'uppercase'
  },
  gridCheck: {
    display: 'flex',
    alignItems: 'center',
  },
}));

type Props = {
  configuracoes: Configuracao
}

const Configuracoes = (props: Props) => {
  const classes = useStyles();
  const router = useRouter();
  const { addToast } = useToasts();
  const config = props.configuracoes;

  const [isSaving, setSaving] = useState<boolean>(false);
  const [isTesting, setTesting] = useState<boolean>(false);

  const [emailSmtp, setEmailSmtp] = useState<string>(config.email_smtp)
  const [emailPorta, setEmailPorta] = useState<number>(config.email_porta)
  const [emailSsl, setEmailSsl] = useState<boolean>(config.email_ssl)
  const [emailTls, setEmailTls] = useState<boolean>(config.email_tls)
  const [emailUsuario, setEmailUsuario] = useState<string>(config.email_usuario)
  const [emailSenha, setEmailSenha] = useState<string>(config.email_senha ? Base64.decode(config.email_senha) : '')

  const [tipoAutenticacaoEmail, setTipoAutenticacao] = useState((config.email_ssl ? '1' : '0') + (config.email_tls ? '1' : '0'));

  const setTipoAutenticacaoEmail = (value : string) => {
    setEmailSsl(false);
    setEmailTls(false);
    setTipoAutenticacao(value);

    if (value === '10') {
      setEmailSsl(true);
    } else if (value === '01') {
      setEmailTls(true);
    } else if (value === '11') {
      setEmailSsl(true);
      setEmailTls(true);
    }
  }

  const salvar = async () => {
    setSaving(true);

    try {

      const configuracao : Configuracao = {
        id: null,
        email_smtp: emailSmtp,
        email_porta: emailPorta,
        email_usuario: emailUsuario,
        email_senha: emailSenha,
        email_ssl: emailSsl,
        email_tls: emailTls,
      };

      const response = await api.put('/configuracoes', configuracao);

      if (!response?.data?.error) {
        addToast(`Configurações salvas com sucesso!`, {
          appearance: 'success',
        });
        router.push('/app/home');
        return;
      }
      throw new Error(response.data.error);
    } catch (err) {
      addToast(err.message, { appearance: 'error' });
    }    

    setSaving(false);
  }

  const testarEmail = async () => {
    setTesting(true);

    try {

      const body = {
        email_smtp: emailSmtp,
        email_porta: emailPorta,
        email_usuario: emailUsuario,
        email_senha: emailSenha,
        email_ssl: emailSsl,
        email_tls: emailTls,
      };

      const response = await api.post('/utils/testar-email', body);

      if (response && response.status === 200) {
        addToast('E-mail enviado, verifique sua caixa de entrada!', {
          appearance: 'success',
        });
        setTesting(false);
        return;
      }
      throw new Error(response.data.error);
    } catch (err) {
      addToast(err.message, { appearance: 'error' });
    }    

    setTesting(false);    
  }

  return (
    <Box>
      <PageHeader
        title="Configurações"
        btnLabel="Salvar"
        btnIcon={<SaveRoundedIcon />}
        btnFunc={salvar}
        btnLoading={isSaving}
      />
      <Paper className={classes.paperBox}>
        <Typography className={classes.paperBoxLabel} variant="h5">E-mail de recuperação</Typography>
        <Grid container spacing={2}>
          <Grid item xs={8} sm={7} md={6} lg={5}>
            <TextField
              label="SMTP"
              value={emailSmtp}
              setValue={setEmailSmtp}
            />
          </Grid>
          <Grid item xs={4} sm={3} md={2}>
            <TextField
              label="Porta"
              value={emailPorta?.toString()}
              setValue={(v) => setEmailPorta(parseInt(SomenteNumeros(v),10))}
            />
          </Grid>
          <Grid item xs={12} sm={10} md={8} lg={7}>
            <TextField
              label="E-mail"
              value={emailUsuario}
              setValue={setEmailUsuario}
            />
          </Grid>
          <Grid item xs={12} sm={10} md={8} lg={7}>
            <TextField
              label="Senha"
              value={emailSenha}
              setValue={setEmailSenha}
              type="password"
            />
          </Grid>
          <Hidden xsDown>
            <Grid item xs={12} sm={2} md={4} lg={5}/>
          </Hidden>
          <Grid item xs={12} sm={6} md={4} lg={3}>
          <Select
            label="Tipo de autenticação"
            value={tipoAutenticacaoEmail}
            setValue={setTipoAutenticacaoEmail}
            itemZero={false}
            items={[
              {
                value: '00',
                text: 'Nenhuma'
              },
              {
                value: '10',
                text: 'SSL'
              },
              {
                value: '01',
                text: 'TLS'
              },
              {
                value: '11',
                text: 'SSL e TLS'
              },
            ]}
          />
          </Grid>
          <Hidden xsDown>
            <Grid item xs={12} sm={6} md={8} lg={9}/>
          </Hidden>
          <Grid item xs={12}>
            <CustomButton
              label="Testar e-mail"
              func={testarEmail}
              isLoading={isTesting}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default Configuracoes

export const getServerSideProps : GetServerSideProps = async () => {

  let configuracoes = await prisma.configuracao.findFirst();

  if (!configuracoes) {
    configuracoes = await prisma.configuracao.create({
      data: {}
    });
  }

  return { props: { configuracoes } }
}
