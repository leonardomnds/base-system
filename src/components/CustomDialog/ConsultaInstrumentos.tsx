import React, { useState, useEffect } from 'react';
import { useToasts } from 'react-toast-notifications';
import { addHours, format } from 'date-fns';

import {
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

import CustomTable, { getColumn, getRow } from '../Table';
import api from '../../util/Api';
import { Pessoa } from '.prisma/client';

const useStyles = makeStyles((theme: Theme) => ({
  themeError: {
    color: theme.palette.background.paper,
  },
  paper: {
    padding: 20,
    marginTop: 25,
    marginBottom: 25,
  },
}));

type Props = {
  isOpen: boolean,
  onClose: () => void,
  setSelectedId: (id: string) => void,
  pessoaId: string,
}

function ConsultaPessoas(props: Props) {
  const classes = useStyles();
  const { addToast } = useToasts();

  const { isOpen, onClose, setSelectedId, pessoaId } = props;

  const getTableColumns = () => {
    const columns = [];
    columns.push(getColumn('id', 'Id', 0, 'center', null, true));
    columns.push(getColumn('tag', 'TAG', 50, 'left'));
    columns.push(getColumn('descricao', 'Descrição', 100, 'left'));
    columns.push(getColumn('dtCalibracao', 'Última Calibração', 50, 'center'));
    return columns;
  };

  const [tableColumns] = useState(getTableColumns());
  const [tableRows, setTableRows] = useState([]);
  const [isLoading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const rows = [];

      try {
        const response = await api.get('/pessoas/'+pessoaId+'/instrumentos');

        if (!response?.data?.error) {
          response.data.forEach((i) => {
            
            rows.push(
              getRow(
                [
                  i.id,
                  i.tag,
                  i.descricao,
                  i.ultima_calibracao ? format(addHours(new Date(i.ultima_calibracao), 3), 'dd/MM/yyyy') : '',
                ],
                tableColumns,
              ),
            );
          });
        } else {
          throw new Error(response.data.error)
        }
      } catch (err) {
        addToast(err.message, { appearance: 'error' });
      }

      setTableRows(rows); 
      setLoading(false);
    }

    getData();
    
  }, []);

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Consulta de Instrumentos</DialogTitle>
      <DialogContent>
        <CustomTable
          isLoading={isLoading}
          columns={tableColumns}
          rows={tableRows}
          selectFunction={(p: Pessoa) => {
            setSelectedId(p.id);
            onClose();
          }}
          clickFunction={(p: Pessoa) => {
            setSelectedId(p.id);
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export default ConsultaPessoas;
