import cookie from 'js-cookie';
import React, { useState, useEffect } from 'react';
import { useToasts } from 'react-toast-notifications';
import { format } from "date-fns";

import { Box, Grid, Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import {
  PeopleRounded as PeopleRoundedIcon,
  SpeedRounded as SpeedRoundedIcon,
  EventNoteRounded as EventNoteRoundedIcon,
} from '@mui/icons-material';

import PageHeader from '../../components/Layout/PageHeader';

import api from '../../util/Api';
import { AbrirRelatorio, GetDataFromJwtToken } from '../../util/functions';
import { NomeRelatorio } from '../../reports/nomesRelatorios';
import PainelIndicador from '../../components/PainelIndicador';
import { IndicadoresType } from '../api/indicadores';

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
  timerBox: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 500,
  }
}));

const Indicadores = () => {
  const classes = useStyles();
  const { addToast } = useToasts();

  const token = cookie.get('token') || null;
  const pessoaId = GetDataFromJwtToken(token)?.pessoaId || null;

  const [isLoading, setLoading] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(0);
  
  const [data, setData] = useState<IndicadoresType>(null)

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/indicadores');

        if (!response?.data?.error) {
          setData(response.data);
        } else {
          throw new Error(response.data.error)
        }
      } catch (err) {
        addToast(err.message, { appearance: 'error' });
      }
      setLoading(false);
    }

    if (timer <= 0) {
      getData();
      setTimer(119); // Timer em segundos
    } else {
      setTimeout(() => setTimer(timer - 1), 1000);
    }

  }, [timer])

  const getTimer = () => {
    return (
      <Typography className={classes.timerBox}>
        {format(new Date().setHours(0,0,timer,0),'mm:ss')}
      </Typography>
    );
  }

  return (
    <Box>
      <PageHeader title="Painel de Indicadores" componentRight={getTimer()}/>
      <Paper className={classes.paperBox}> {/* Calibrações */}
        <Typography className={classes.paperBoxLabel} variant="h5">Calibrações</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <PainelIndicador
              isLoading={isLoading}
              value={data?.calibracoes_vencidas || 0}
              label={(data?.calibracoes_vencidas || 0) === 1 ? "Vencida" : "Vencidas"}
              strColor="#dc3545"
              icon={EventNoteRoundedIcon}
              func={() => {
                if ((data?.calibracoes_vencidas || 0) > 0) {
                  AbrirRelatorio(NomeRelatorio.listaInstrumentos, 'v.ativo = 1 and v.dias_vencer < 0');
                } else {
                  addToast('Não há dados a imprimir!', { appearance: 'warning' });
                }}}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <PainelIndicador
              isLoading={isLoading}
              value={data?.calibracoes_vencer_7 || 0}
              label="Vencendo em 7 dias"
              strColor="#ffc107"
              icon={EventNoteRoundedIcon}
              func={() => {
                if ((data?.calibracoes_vencer_7 || 0) > 0) {
                  AbrirRelatorio(NomeRelatorio.listaInstrumentos, 'v.ativo = 1 and v.dias_vencer between 0 and 7');
                } else {
                  addToast('Não há dados a imprimir!', { appearance: 'warning' });
                }}}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <PainelIndicador
              isLoading={isLoading}
              value={data?.calibracoes_vencer_15 || 0}
              label="Vencendo em 15 dias"
              strColor="#17a2b8"
              icon={EventNoteRoundedIcon}
              func={() => {
                if ((data?.calibracoes_vencer_15 || 0) > 0) {
                  AbrirRelatorio(NomeRelatorio.listaInstrumentos, 'v.ativo = 1 and v.dias_vencer between 0 and 15');
                } else {
                  addToast('Não há dados a imprimir!', { appearance: 'warning' });
                }}}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <PainelIndicador
              isLoading={isLoading}
              value={data?.calibracoes_vencer_30 || 0}
              label="Vencendo em 30 dias"
              strColor="#28a745"
              icon={EventNoteRoundedIcon}
              func={() => {
                if ((data?.calibracoes_vencer_30 || 0) > 0) {
                  AbrirRelatorio(NomeRelatorio.listaInstrumentos, 'v.ativo = 1 and v.dias_vencer between 0 and 30');
                } else {
                  addToast('Não há dados a imprimir!', { appearance: 'warning' });
                }}}
            />
          </Grid>
        </Grid>
      </Paper>
      <Paper className={classes.paperBox}> {/* Cadastros */}
        <Typography className={classes.paperBoxLabel} variant="h5">Cadastros</Typography>
        <Grid container spacing={2}>
          {!pessoaId && 
            <Grid item xs={12} sm={6} md={3}>
              <PainelIndicador
                isLoading={isLoading}
                value={data?.clientes_ativos || 0}
                label={(data?.clientes_ativos || 0) === 1 ? "Cliente ativo" : "Clientes ativos"}
                strColor="#4ce0b3"
                icon={PeopleRoundedIcon}
                func={() => {
                  if ((data?.clientes_ativos || 0) > 0) {
                    AbrirRelatorio(NomeRelatorio.listaClientes, 'p.ativo = 1');
                  } else {
                    addToast('Não há dados a imprimir!', { appearance: 'warning' });
                  }}}
              />
            </Grid>
          }
          <Grid item xs={12} sm={6} md={3}>
            <PainelIndicador
              isLoading={isLoading}
              value={data?.instrumentos_ativos || 0}
              label={(data?.instrumentos_ativos || 0) === 1 ? "Instrumento ativo" : "Instrumentos ativos"}
              strColor="#937666"
              icon={SpeedRoundedIcon}
              func={() => {
                if ((data?.instrumentos_ativos || 0) > 0) {
                  AbrirRelatorio(NomeRelatorio.listaInstrumentos, 'i.ativo = 1' + (Boolean(pessoaId) ? ` and p.id = '${pessoaId}'` : ''));
                } else {
                  addToast('Não há dados a imprimir!', { appearance: 'warning' });
                }}}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default Indicadores;
