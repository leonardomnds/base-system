import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useToasts } from "react-toast-notifications";
import { addDays, addHours, format } from "date-fns";

import { Box, Paper, Grid, Hidden } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/SearchRounded";
import CloseIcon from "@mui/icons-material/CloseRounded";
import PdfIcon from "@mui/icons-material/FindInPageRounded";

import PageHeader from "../../../components/Layout/PageHeader";

import TextField, {
  getEndItemIconButton,
} from "../../../components/FormControl/TextField";

import DatePicker from "../../../components/FormControl/DatePicker";

import CustomTable, { getColumn, getRow } from "../../../components/Table";
import { GetServerSideProps, NextPage } from "next";
import api from "../../../util/Api";
import {
  ConvertBlobToFile,
  FormatarCpfCnpj,
  FormatUtcDate,
  GetDataFromJwtToken,
  ZerosLeft,
} from "../../../util/functions";
import ConsultaPessoas from "../../../components/CustomDialog/ConsultaPessoas";
import ConsultaInstrumentos from "../../../components/CustomDialog/ConsultaInstrumentos";
import CustomDialog from "../../../components/CustomDialog";

const useStyles = makeStyles((theme: Theme) => ({
  themeError: {
    color: theme.palette.background.paper,
  },
  paper: {
    padding: 20,
    marginBottom: 25,
  },
}));

type Props = {
  usuarioId: string;
  pessoaId: string;
  colunas: [];
};

const List: NextPage<Props> = (props: Props) => {
  const classes = useStyles();
  const router = useRouter();
  const { addToast } = useToasts();
  const { usuarioId, pessoaId, colunas } = props;

  const [uuidPessoa, setUuidPessoa] = useState<string>(pessoaId);
  const [codPessoa, setCodPessoa] = useState<number>(null);
  const [cpfCnpjPessoa, setCpfCnpjPessoa] = useState<string>("");
  const [nomePessoa, setNomePessoa] = useState<string>("");
  const [consultandoPessoa, setConsultandoPessoa] = useState<boolean>(false);

  const [uuidInstrumento, setUuidInstrumento] = useState<string>("");
  const [tagInstrumento, setTagInstrumento] = useState<string>("");
  const [descricaoInstrumento, setDescricaoInstrumento] = useState<string>("");
  const [consultandoInstrumento, setConsultandoInstrumento] =
    useState<boolean>(false);

  const [dataInicial, setDataInicial] = useState<Date>(
    addDays(new Date(), -(new Date().getDate() - 1))
  );
  const [dataFinal, setDataFinal] = useState<Date>(new Date());

  const [deletingCalibracao, setDeletingCalibracao] = useState(null);

  const [isLoading, setLoading] = useState<boolean>(false);
  const [linhas, setLinhas] = useState<Array<any>>([]);

  const setStateCpfCnpjPessoa = (str) => {
    setCpfCnpjPessoa(FormatarCpfCnpj(str));
  };

  const novaCalibracao = () => {
    router.push("/app/calibracoes/novo");
  };

  const limparCamposPessoa = () => {
    setUuidPessoa("");
    setCodPessoa(null);
    setCpfCnpjPessoa("");
    setNomePessoa("");
    limparCamposInstrumento();
  };

  const limparCamposInstrumento = () => {
    setUuidInstrumento("");
    setTagInstrumento("");
    setDescricaoInstrumento("");
    setDataInicial(addDays(new Date(), -(new Date().getDate() - 1)));
    setDataFinal(new Date());
  };

  const getEndItemBuscarCliente = () => {
    return getEndItemIconButton(
      uuidPessoa ? <CloseIcon /> : <SearchIcon />,
      uuidPessoa
        ? limparCamposPessoa
        : () => {
            setConsultandoPessoa(true);
          },
      uuidPessoa ? "Remover seleção" : "Consultar"
    );
  };

  const getEndItemBuscarInstrumento = () => {
    return getEndItemIconButton(
      uuidInstrumento ? <CloseIcon /> : <SearchIcon />,
      uuidInstrumento
        ? limparCamposInstrumento
        : () => {
            if (uuidPessoa) {
              setConsultandoInstrumento(true);
            } else {
              addToast("É necessário selecionar o cliente!", {
                appearance: "warning",
              });
            }
          },
      uuidInstrumento ? "Remover seleção" : "Consultar"
    );
  };

  const getDataPessoa = async (pesId: string) => {
    try {
      const response = await api.get(`/pessoas/${pesId}`);

      if (!response?.data?.error) {
        const { codigo, cpf_cnpj, nome } = response.data;

        setCodPessoa(codigo), setCpfCnpjPessoa(cpf_cnpj);
        setNomePessoa(nome);
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      addToast(err.message, { appearance: "error" });
    }
  };

  const getDataInstrumento = async (insId: string) => {
    try {
      const response = await api.get(
        `/pessoas/${uuidPessoa}/instrumentos/${insId}`
      );

      if (!response?.data?.error) {
        const { tag, descricao } = response.data;

        setTagInstrumento(tag);
        setDescricaoInstrumento(descricao);
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      addToast(err.message, { appearance: "error" });
    }
  };

  useEffect(() => {
    const getData = async () => {
      const calibracoes = [];
      setLoading(true);

      const queryFilter =
        "?instrumento_id=" +
        uuidInstrumento +
        "&data_calibracao_inicial=" +
        format(dataInicial, "yyyy-MM-dd") +
        "&data_calibracao_final=" +
        format(dataFinal, "yyyy-MM-dd");

      try {
        const response = await api.get(
          "/pessoas/" + uuidPessoa + "/instrumentos/calibracoes" + queryFilter
        );

        if (!response?.data?.error) {
          response.data.forEach((c) => {
            calibracoes.push(
              getRow(
                [
                  c.id,
                  c.instrumento.id,
                  c.data_calibracao ? FormatUtcDate(c.data_calibracao) : "",
                  c.instrumento?.tag || "",
                  c.instrumento?.descricao || "",
                  c.numero_certificado,
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

      setLinhas(calibracoes);
      setLoading(false);
    };

    if (uuidPessoa) {
      if (usuarioId) {
        getDataPessoa(uuidPessoa);
      }
      getData();
    } else {
      setLinhas([]);
    }
  }, [uuidPessoa, uuidInstrumento, dataInicial, dataFinal]);

  const getCamposBuscaCliente = () => {
    return (
      <Paper className={classes.paper}>
        <Grid container spacing={2}>
          <Grid item xs={4} sm={3} md={2}>
            <TextField
              label="Cliente"
              value={codPessoa ? ZerosLeft(codPessoa.toString(), 4) : ""}
              setValue={setCodPessoa}
              disabled
              endItem={getEndItemBuscarCliente()}
            />
          </Grid>
          <Grid item xs={8} sm={5} md={3} lg={2}>
            <TextField
              label="CPF / CNPJ"
              value={cpfCnpjPessoa}
              setValue={setStateCpfCnpjPessoa}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={12} md={7} lg={8}>
            <TextField
              label={`${
                cpfCnpjPessoa.length > 14 ? "Razão Social" : "Nome"
              } do cliente`}
              value={nomePessoa}
              setValue={setNomePessoa}
              disabled
            />
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const getCamposFiltros = () => {
    return (
      <Paper className={classes.paper}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <DatePicker
              label="Data inicial"
              value={dataInicial}
              maxValue={new Date()}
              setValue={setDataInicial}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <DatePicker
              label="Data final"
              value={dataFinal}
              minValue={dataInicial}
              maxValue={new Date()}
              setValue={setDataFinal}
            />
          </Grid>
          <Hidden xsDown lgUp>
            <Grid item xs={6} sm={4} md={6} />
          </Hidden>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <TextField
              label="Instrumento"
              value={tagInstrumento}
              setValue={setTagInstrumento}
              disabled
              endItem={getEndItemBuscarInstrumento()}
            />
          </Grid>
          <Grid item xs={12} sm={8} md={9} lg={6}>
            <TextField
              label="Descrição do Instrumento"
              value={descricaoInstrumento}
              setValue={setDescricaoInstrumento}
              disabled
            />
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const openPdf = async (calibracao: any) => {
    try {
      const response = await api.get(
        "/pessoas/" +
          uuidPessoa +
          "/instrumentos/" +
          calibracao.instrumento_id +
          "/calibracoes/" +
          calibracao.id +
          "/certificado",
        { responseType: "blob" }
      );

      if (response?.status === 200) {
        const file = ConvertBlobToFile(
          response.data,
          `Certificado-${calibracao.id}.pdf`
        );
        const win = window.open(URL.createObjectURL(file), "_blank");
        if (win) win.focus();
      } else if (response?.status === 403) {
        addToast("Essa calibração não tem Certificado anexado!", {
          appearance: "info",
        });
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      addToast(err.message, { appearance: "error" });
    }
  };

  const editarCalibracao = (calibracao) => {
    if (uuidPessoa) {
      router.push(
        `/app/calibracoes/${calibracao.id}?pessoaId=${uuidPessoa}&instrumentoId=${calibracao.instrumento_id}`
      );
    } else {
      addToast("É necessário selecionar o cliente!", { appearance: "warning" });
    }
  };

  const deletarCalibracao = (calibracao) => {
    setDeletingCalibracao(calibracao);
  };

  const handleCloseDeleteDialog = () => {
    setDeletingCalibracao(null);
  };

  const handleConfirmDeleteCalibracao = async () => {
    try {
      const response = await api.delete(
        "/pessoas/" +
          uuidPessoa +
          "/instrumentos/" +
          deletingCalibracao.instrumento_id +
          "/calibracoes/" +
          deletingCalibracao.id
      );

      if (!response?.data?.error) {
        addToast("Calibração eliminada com sucesso!", {
          appearance: "success",
        });

        setLinhas(() => linhas.filter((x) => x.id !== deletingCalibracao.id));

        setDeletingCalibracao(null);

        return;
      }
      throw new Error(response.data.error);
    } catch (err) {
      setDeletingCalibracao(null);
      addToast(err.message, { appearance: "error" });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Histórico de calibrações"
        btnLabel="Nova"
        btnFunc={novaCalibracao}
      />
      {usuarioId && getCamposBuscaCliente()}
      {getCamposFiltros()}
      <CustomTable
        isLoading={isLoading}
        columns={colunas}
        rows={linhas}
        selectFunction={openPdf}
        selectIcon={PdfIcon}
        selectLabel="Visualizar Certificado"
        editFunction={editarCalibracao}
        deleteFunction={deletarCalibracao}
      />
      {consultandoPessoa && (
        <ConsultaPessoas
          isOpen={consultandoPessoa}
          onClose={() => setConsultandoPessoa(false)}
          setSelectedId={(pesId) => {
            setUuidPessoa(pesId);
            getDataPessoa(pesId);
          }}
        />
      )}
      {consultandoInstrumento && (
        <ConsultaInstrumentos
          pessoaId={uuidPessoa}
          isOpen={consultandoInstrumento}
          onClose={() => setConsultandoInstrumento(false)}
          setSelectedId={(insId) => {
            setUuidInstrumento(insId);
            getDataInstrumento(insId);
          }}
        />
      )}
      {deletingCalibracao && (
        <CustomDialog
          title="Excluir calibração"
          text={`Confirma a exclusão dessa calibração?`}
          isOpen={Boolean(deletingCalibracao)}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDeleteCalibracao}
        />
      )}
    </Box>
  );
};

export default List;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const colunas = [];
  colunas.push(getColumn("id", "Id", 0, "center", null, true));
  colunas.push(
    getColumn("instrumento_id", "instrumento_id", 0, "center", null, true)
  );
  colunas.push(getColumn("dtCalibracao", "Data", 50, "center"));
  colunas.push(getColumn("tagInst", "TAG Inst.", 50, "left"));
  colunas.push(getColumn("descInst", "Instrumento", 100, "left"));
  colunas.push(getColumn("numCert", "Certificado", 50, "left"));

  const { pessoaId } = query;
  const jwt = GetDataFromJwtToken(req.cookies.token);

  return {
    props: {
      usuarioId: jwt?.usuarioId || null,
      pessoaId: jwt?.pessoaId ? jwt.pessoaId : pessoaId || null,
      colunas,
    },
  };
};
