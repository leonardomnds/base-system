import React, { useState, useEffect } from 'react';
import { useToasts } from 'react-toast-notifications';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Grid,
  Paper,
  DialogActions,
  Button,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

import CustomTable, { getColumn, getRow } from '../Table';
import api from '../../util/Api';
import CustomDialog from '.';
import TextField from '../FormControl/TextField';

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

export enum Entity {
  marcaProduto,
  categoriaProduto,
  unidadeMedida,
  grupoPessoa,
  categoriaPessoa,
  categoriaServico,
}

type Props = {
  entity: Entity,
  isOpen: boolean,
  onClose: () => void,
}

function EntityDialog(props: Props) {
  const classes = useStyles();
  const { addToast } = useToasts();

  const { entity, isOpen, onClose } = props;

  const getTitle = () => {
    switch (entity) {
      case Entity.marcaProduto:
        return 'Marcas';
      case Entity.categoriaPessoa:
      case Entity.categoriaProduto:
      case Entity.categoriaServico:
        return 'Categorias';
      case Entity.unidadeMedida:
        return 'Unidades de Medida';
      case Entity.grupoPessoa:
        return 'Grupos';
      default:
        return 'Entidades';
    }
  };

  const getEndpoint = () => {
    switch (entity) {
      case Entity.marcaProduto:
        return '/produtos/marcas';
      case Entity.categoriaProduto:
        return '/produtos/categorias';
      case Entity.unidadeMedida:
        return '/produtos/unidades';
      case Entity.categoriaPessoa:
        return '/pessoas/categorias';
      case Entity.grupoPessoa:
        return '/pessoas/grupos';
      case Entity.categoriaServico:
        return '/servicos/categorias';
      default:
        ''
    }
  };

  const getNumberFields = () => {
    if (entity === Entity.unidadeMedida) {
      return 2;
    }
    return 1;
  };

  const getTableColumns = () => {
    const columns = [];
    columns.push(getColumn('id', 'Id', 0, 'center', null, true));
    if (entity === Entity.unidadeMedida) {
      columns.push(getColumn('simbolo', 'Símbolo', 50, 'center', 'upper'));
    }
    columns.push(getColumn('descricao', 'Descrição', 200, 'left'));
    return columns;
  };

  const [tableColumns] = useState(getTableColumns());
  const [tableRows, setTableRows] = useState([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [findAgain, setFindAgain] = useState<boolean>(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [deletingEntity, setDeletingEntity] = useState(null);

  const [campo1, setCampo1] = useState('');
  const [campo2, setCampo2] = useState('');

  const clearFields = () => {
    setEditingEntity(null);
    setDeletingEntity(null);
    setCampo1('');
    setCampo2('');
  };

  const handleSaveEntity = async () => {
    try {
      
      const jsonBody = { simbolo: campo1, descricao: campo2 };

      let response;

      if (entity !== Entity.unidadeMedida) {
        delete jsonBody.simbolo;
      }

      if (editingEntity) {
        response = await api.put(getEndpoint()+'/'+editingEntity.id, jsonBody)
      } else {
        response = await api.post(getEndpoint(), jsonBody);
      }

      if (!response?.data?.error) {
        clearFields();
        setFindAgain(!findAgain);
        addToast(
          `${
            editingEntity ? 'Alteração realizada' : 'Cadastrado'
          } com sucesso!`,
          {
            appearance: 'success',
          },
        );
        return;
      }
      throw new Error(response.data.error);
    } catch (err) {
      addToast(err.message, { appearance: 'error' });
    }
  };

  const handleEditEntity = (ent) => {
    if (ent.simbolo) {
      setCampo1(ent.simbolo);
    }
    setCampo2(ent.descricao);
    setEditingEntity(ent);
  };

  const handleDeleteEntity = (ent) => {
    setDeletingEntity(ent);
  };

  const handleCloseDialog = () => {
    setDeletingEntity(null);
  };

  const confirmDelete = async () => {
    try {
      const response = await api.delete(getEndpoint()+'/'+deletingEntity.id);

      addToast(
        !response?.data?.error ? 'Registro eliminado com sucesso!' : response.data.error,
        {
          appearance: !response?.data?.error ? 'success' : 'error',
        },
      );

      if (!response?.data?.error) {
        const rows = [];

        tableRows.forEach((row) => {
          if (row.id !== deletingEntity.id) {
            rows.push(row);
          }
        });

        setTableRows(rows);
      }

      clearFields();

      handleCloseDialog();
    } catch (err) {
      addToast(err.message, { appearance: 'error' });
    }
  };

  useEffect(() => {
    setLoading(true);    

    const getData = async () => {
      const rows = [];
      try {
        const response = await api.get(getEndpoint());
  
        if (!response?.data?.error) {
          response.data.forEach((item) => {
            if (entity === Entity.unidadeMedida) {
              rows.push(
                getRow([item.id, item.simbolo, item.descricao], tableColumns),
              );
            } else {
              rows.push(getRow([item.id, item.descricao], tableColumns));
            }
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
  }, [findAgain]);

  return (
    <Box>
      <Dialog open={isOpen} onClose={onClose}>
        <DialogTitle>Cadastro de {getTitle()}</DialogTitle>
        <DialogContent>
          <Box>
            <CustomTable
              isLoading={isLoading}
              columns={tableColumns}
              rows={tableRows}
              editFunction={handleEditEntity}
              deleteFunction={handleDeleteEntity}
              linhasPorPagina={5}
            />
            <Paper className={classes.paper}>
              <Grid container spacing={2}>
                {getNumberFields() > 1 && (
                  <Grid item xs={3}>
                    <TextField
                      label="Símbolo"
                      value={campo1}
                      setValue={setCampo1}
                    />
                  </Grid>
                )}
                <Grid item xs={getNumberFields() > 1 ? 9 : 12}>
                  <TextField
                    label="Descrição"
                    value={campo2}
                    setValue={setCampo2}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSaveEntity}
            color="primary"
            variant="contained"
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
      {deletingEntity && (
        <CustomDialog
          title={`Excluir ${getTitle()}`}
          text="Confirma a exclusão? Caso possua vínculos no sistema, será feita a inativação."
          isOpen={Boolean(deletingEntity)}
          onClose={handleCloseDialog}
          onConfirm={confirmDelete}
        />
      )}
    </Box>
  );
}

export default EntityDialog;
