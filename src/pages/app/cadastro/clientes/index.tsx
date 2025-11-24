import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useToasts } from 'react-toast-notifications';

import { Box } from '@mui/material';
import PageHeader from '../../../../components/Layout/PageHeader';

import CustomTable, { getColumn, getRow } from '../../../../components/Table';
import CustomDialog from '../../../../components/CustomDialog';
import { GetServerSideProps, NextPage } from 'next';
import api from '../../../../util/Api';
import { GetDataFromJwtToken } from '../../../../util/functions';

type Props = {
  pessoaId: string,
  colunas: []
}

const PeopleList: NextPage<Props> = (props) => {
  const router = useRouter();
  const { addToast } = useToasts();
  const { pessoaId, colunas } = props;

  const [isLoading, setLoading] = useState<boolean>(false);
  const [deletingPerson, setDeletingPerson] = useState(null);
  const [linhas, setLinhas] = useState<Array<any>>([]);

  const handleNewPerson = () => {
    router.push(`${router.pathname}/novo`);
  };

  const handleEditPerson = (person) => {
    router.push(`${router.pathname}/${person.id}`);
  };

  // const handleDeletePerson = (person) => {
  //   setDeletingPerson(person);
  // };

  const handleCloseDialog = () => {
    setDeletingPerson(null);
  };
/*
  const confirmDeletePerson = async () => {
    try {
      const response = null; // await useApi.delete(`/pessoas/${deletingPerson.id}`);

      const { sucesso, dados, erros } = response.data;

      addToast(sucesso ? dados : erros, {
        appearance: sucesso ? 'success' : 'error',
      });

      if (sucesso) {
        const rows = [];

        tableRows.forEach((row) => {
          if (row.id !== deletingPerson.id) {
            rows.push(row);
          }
        });

        setTableRows(rows);
      }

      handleCloseDialog();
    } catch (err) {
      addToast(err.message, { appearance: 'error' });
    }
  };
*/

  useEffect(() => {

    const getData = async () => {
      const pessoas = [];
      setLoading(true);


      try {

        const response = await api.get('/pessoas');

        if (!response?.data?.error) {
          response.data.forEach((pes) => {
            pessoas.push(
              getRow(
                [
                  pes.id,
                  pes.codigo,
                  pes.cpf_cnpj,
                  pes.nome,
                  pes.fantasia,
                  `${pes.logradouro || ''}, ${pes.numero || ''}`,
                  pes.ativo ? 'Ativo' : 'Inativo',
                ],
                colunas,
              ),
            );
          });
        } else {
          throw new Error(response.data.error)
        }
      } catch (err) {
        addToast(err.message, { appearance: 'error' });
      }

      setLinhas(pessoas);
      setLoading(false);
    }

    getData();
  }, [])

  
  useEffect(() => {
    if (pessoaId) {
      router.push('/app/home');
    }
  }, [pessoaId])

  return (
      <Box>
        <PageHeader title="Clientes " btnLabel="Novo" btnFunc={handleNewPerson} />
        <CustomTable
          isLoading={isLoading}
          columns={colunas}
          rows={linhas}
          editFunction={handleEditPerson}
          // deleteFunction={handleDeletePerson}
        />
        {deletingPerson && (
          <CustomDialog
            title="Excluir cliente"
            text={`Confirma a exclusão do cliente ${deletingPerson.nome}?`}
            isOpen={Boolean(deletingPerson)}
            onClose={handleCloseDialog}
            onConfirm={()=>{}}// {confirmDeletePerson}
          />
        )}
      </Box>
  );
}

export default PeopleList;

export const getServerSideProps : GetServerSideProps = async ({ req }) => {
  const jwt = GetDataFromJwtToken(req.cookies.token);

  const colunas = [];
  colunas.push(getColumn('id', 'Id', 0, 'center', null, true));
  colunas.push(getColumn('codigo', 'Código', 30, 'center', "padleft4"));
  colunas.push(getColumn('cpfCnpj', 'CPF/CNPJ', 50, 'left'));
  colunas.push(getColumn('nome', 'Nome/Razão', 100, 'left'));
  colunas.push(getColumn('fantasia', 'Apelido/Fantasia', 100, 'left'));
  colunas.push(getColumn('endereco', 'Endereço', 100, 'left'));
  colunas.push(getColumn('ativo', 'Status', 30, 'center'));

  return {
    props: {
      pessoaId: jwt?.pessoaId || null,
      colunas
    }
  }
}
