import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useToasts } from "react-toast-notifications";

import { Box } from "@mui/material";
import PageHeader from "../../../../components/Layout/PageHeader";

import CustomTable, { getColumn, getRow } from "../../../../components/Table";
import CustomDialog from "../../../../components/CustomDialog";
import { GetServerSideProps, NextPage } from "next";
import api from "../../../../util/Api";
import { Usuario } from ".prisma/client";

type Props = {
  colunas: [];
};

const PeopleList: NextPage<Props> = (props) => {
  const router = useRouter();
  const { addToast } = useToasts();
  const { colunas } = props;

  const [isLoading, setLoading] = useState<boolean>(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [linhas, setLinhas] = useState<Array<any>>([]);

  const handleNewUser = () => {
    router.push(`${router.pathname}/novo`);
  };

  const handleEditUser = (user) => {
    router.push(`${router.pathname}/${user.id}`);
  };

  const handleCloseDialog = () => {
    setDeletingUser(null);
  };

  const handleDeleteUser = (user: any) => {
    setDeletingUser(user);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await api.delete("/usuarios/" + deletingUser.id);

      if (!response?.data?.error) {
        addToast("Usuário eliminado com sucesso!", {
          appearance: "success",
        });

        setLinhas(() => linhas.filter((x) => x.id !== deletingUser.id));

        handleCloseDialog();

        return;
      }
      throw new Error(response.data.error);
    } catch (err) {
      handleCloseDialog();
      addToast(err.message, { appearance: "error" });
    }
  };

  useEffect(() => {
    const getData = async () => {
      const pessoas = [];
      setLoading(true);

      try {
        const response = await api.get("/usuarios");

        if (!response?.data?.error) {
          response.data.forEach((u: Usuario) => {
            const datePart = u.data_cadastro
              .toString()
              .substring(0, 10)
              .split("-");
            const dateCadastro =
              datePart[2] + "/" + datePart[1] + "/" + datePart[0];

            pessoas.push(
              getRow(
                [
                  u.id,
                  u.nome,
                  u.usuario,
                  u.administrador ? "Sim" : "Não",
                  dateCadastro,
                  u.ativo ? "Ativo" : "Inativo",
                ],
                colunas
              )
            );
          });
        } else {
          throw new Error(response.data.error);
        }
      } catch (err) {
        addToast(err.message, { appearance: "error" });
      }

      setLinhas(pessoas);
      setLoading(false);
    };

    getData();
  }, []);

  return (
    <Box>
      <PageHeader title="Usuários " btnLabel="Novo" btnFunc={handleNewUser} />
      <CustomTable
        isLoading={isLoading}
        columns={colunas}
        rows={linhas}
        editFunction={handleEditUser}
        deleteFunction={handleDeleteUser}
      />
      {deletingUser && (
        <CustomDialog
          title="Excluir usuário"
          text={`Confirma a exclusão do usuário ${deletingUser.nome}?`}
          isOpen={Boolean(deletingUser)}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmDelete}
        />
      )}
    </Box>
  );
};

export default PeopleList;

export const getServerSideProps: GetServerSideProps = async () => {
  const colunas = [];
  colunas.push(getColumn("id", "Id", 0, "center", null, true));
  colunas.push(getColumn("nome", "Nome/Razão", 100, "left"));
  colunas.push(getColumn("usuario", "Usuário", 50, "left"));
  colunas.push(getColumn("adm", "Administrador", 50, "center"));
  colunas.push(getColumn("dataCadastro", "Cadastro", 50, "center"));
  colunas.push(getColumn("ativo", "Status", 30, "center"));

  return {
    props: {
      colunas,
    },
  };
};
