import React, { useState, useEffect } from 'react';
import { useToasts } from 'react-toast-notifications';

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
}

function ConsultaPessoas(props: Props) {
  const classes = useStyles();
  const { addToast } = useToasts();

  const { isOpen, onClose, setSelectedId } = props;

  const getTableColumns = () => {
    const columns = [];
    columns.push(getColumn('id', 'Id', 0, 'center', null, true));
    columns.push(getColumn('codigo', 'Código', 30, 'center', 'padleft4'));
    columns.push(getColumn('cpfCnpj', 'CPF/CNPJ', 50, 'left'));
    columns.push(getColumn('nome', 'Nome/Razão', 100, 'left'));
    columns.push(getColumn('fantasia', 'Apelido/Fantasia', 100, 'left'));
    return columns;
  };

  const [tableColumns] = useState(getTableColumns());
  const [tableRows, setTableRows] = useState([]);
  const [isLoading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);

    const getData = async () => {
      const rows = [];

      try {
        const response = await api.get('/pessoas');

        if (!response?.data?.error) {
          const pessoas : Pessoa[] = response.data;
          pessoas.forEach((pes) => {
            rows.push(
              getRow(
                [pes.id, pes.codigo, pes.cpf_cnpj, pes.nome, pes.fantasia],
                tableColumns,
                    ),
            );
          });
        } else {
          throw new Error(response.data.error);
        }
      } catch (err) {
        addToast(err.message, { appearance: 'error' });
      }

      setTableRows(rows); 
    }

    getData();

    setLoading(false);
  }, []);

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Consulta de Pessoas</DialogTitle>
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
