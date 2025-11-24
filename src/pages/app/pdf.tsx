import React, { useState, useEffect } from 'react'
import listaRelatorios from '../../reports';
import { GetServerSideProps } from 'next';
import { PDFViewer } from '@react-pdf/renderer';
import { Base64 } from 'js-base64';

import { Box, Typography, CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { NomeRelatorio } from '../../reports/nomesRelatorios';

// Relatórios
import ListaUsuarios from '../../reports/layouts/ListaUsuarios';
import ListaClientes from '../../reports/layouts/ListaClientes';
import ListaInstrumentos from '../../reports/layouts/ListaInstrumentos';
import ListaCalibracoes from '../../reports/layouts/ListaCalibracoes';
import CustomButton from '../../components/CustomButton';

const useStyles = makeStyles({
  pageContainer: {
    position: 'absolute',
    border: '0px',
    width: '100%',
    height: '100vh',
  },
  dataContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9990,
  },
  message: {
    fontSize: 20,
    marginBottom: 10,
  },
});

type Props = {
  data: [],
  relIndex: number,
  message: string,
}

const Pdf = (props: Props) => {
  const classes = useStyles();
  const { data, relIndex, message } = props;
  const [pdf, setPdf] = useState<JSX.Element>(null);

  useEffect(() => {    
    const gerarRelatorio = async () => {

      if (Boolean(window)) {
        window.history.replaceState(null, '', '/app/pdf')
      }

      if (Boolean(data)) {
        switch (relIndex) {
          case NomeRelatorio.listaUsuarios:
            setPdf(<ListaUsuarios dados={data} />);
            break;
          case NomeRelatorio.listaClientes:
            setPdf(<ListaClientes dados={data} />);
            break;
          case NomeRelatorio.listaInstrumentos:
            setPdf(<ListaInstrumentos dados={data} />);
            break;
          case NomeRelatorio.listaCalibracoes:
            setPdf(<ListaCalibracoes dados={data} />);
            break;
          default:
            break;
        }
      }
    }
    gerarRelatorio();
  }, [])

  const getViewer = () => {

    if (!Boolean(pdf)) {
      if (Boolean(data)) {
        return (
          <Box className={classes.dataContainer}>
            <CircularProgress />
          </Box>
        );
      } else {
        return (
          <Box className={classes.dataContainer}>
            <Typography variant="h3" className={classes.message}>
              {message}
            </Typography>
            <CustomButton
              label="Fechar Relatório"
              func={() => window.close()}
            />
          </Box>
        );
      }
    } else {
      return (
        <PDFViewer className={classes.pageContainer}>
          { pdf }
        </PDFViewer>
      );
    }    
  }

  return getViewer();
}

export default Pdf;

export const getServerSideProps : GetServerSideProps = async ({ query: { ref, filters }}) => {

  let relIndex: number = null;
  let data: any[] = null;
  let message = 'Não há dados para exibir!';

  const rel = listaRelatorios.filter((v) => v.name.toString() === (ref || -1).toString())

  let where = filters as string;
  where = where.split(' ').join('+');
  
  if (rel && rel[0]) {    
    relIndex = parseInt(ref.toString(), 10);
    data = await rel[0].getData((filters || '').toString().length === 0 ? '1=1' : Base64.atob(decodeURI(where)));
    // Next.js serialization guard: convert Date objects to ISO strings
    if (Array.isArray(data)) {
      data = data.map((item) => {
        const converted = { ...item };
        Object.keys(converted).forEach((key) => {
          if (converted[key] instanceof Date) {
            converted[key] = (converted[key] as Date).toISOString();
          }
        });
        return converted;
      });
    }
    if (data?.length === 0) {
      data = null;
    }
  } else {
    message = 'Esse relatório não está mais disponível.';
  }

  return { props: { relIndex, data, message } }
}
