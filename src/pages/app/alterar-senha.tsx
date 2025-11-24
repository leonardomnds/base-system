import React, { useState } from 'react'
import { useToasts } from 'react-toast-notifications';
import { useRouter } from 'next/router';

import { Box, Grid, Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import PageHeader from '../../components/Layout/PageHeader';

import TextField from '../../components/FormControl/TextField';


import api from '../../util/Api';

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
}));

function AlterarSenha() {
  const classes = useStyles();
  const router = useRouter();
  const { addToast } = useToasts();

  const [isSaving, setSaving] = useState<boolean>(false);

  const [senhaAtual, setSenhaAtual] = useState<string>('')
  const [senha, setSenha] = useState<string>('')
  const [senha2, setSenha2] = useState<string>('')

  const handleSave = async () => {
    setSaving(true);

    if (!senhaAtual) {
      addToast('Informe sua senha atual!', { appearance: 'warning' });
    } else if (!senha) {
      addToast('Informe sua nova senha!', { appearance: 'warning' });
    } else if (!senha2) {
      addToast('Confirme sua nova senha!', { appearance: 'warning' });
    } else if (senha !== senha2) {
      addToast('As senhas não conferem!', { appearance: 'warning' });
    } else {
      try {
        const response = await api.put('/login/alterar-senha', { senha_atual: senhaAtual, nova_senha: senha });

        if (!response?.data?.error) {
          addToast('Senha alterada com sucesso!', { appearance: 'success' });
          router.push('/app/home');
          return;
        }
        throw new Error(response.data.error);
      } catch (err) {
        addToast(err.message, { appearance: 'error' });
      }
    }

    setSaving(false);
  }

  return (
    <Box>
      <PageHeader
        title="Alterar senha" 
        btnLabel="Salvar"
        btnIcon={<SaveRoundedIcon />}
        btnFunc={handleSave}
        btnLoading={isSaving}
      />
      <Paper className={classes.paperBox}>
        <Grid container spacing={2}>
          <Grid item xs={8} sm={6} md={3}>
            <TextField
              label="Senha atual"
              value={senhaAtual}
              setValue={setSenhaAtual}
              type='password'
            />
          </Grid>
          <Grid item xs={4} sm={6} md={9} />
          <Grid item xs={8} sm={6} md={3}>
            <TextField
              label="Nova senha"
              value={senha}
              setValue={setSenha}
              type='password'
            />
          </Grid>
          <Grid item xs={4} sm={6} md={9} />
          <Grid item xs={8} sm={6} md={3}>
            <TextField
              label="Confirmar nova senha"
              value={senha2}
              setValue={setSenha2}
              type='password'
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default AlterarSenha
