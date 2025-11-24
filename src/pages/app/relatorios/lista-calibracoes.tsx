import { Box, Grid, Paper, Hidden } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/SearchRounded";
import CloseIcon from "@mui/icons-material/CloseRounded";
import PrintIcon from "@mui/icons-material/PrintRounded";
import GridIcon from "@mui/icons-material/GridOnRounded";

import { useToasts } from "react-toast-notifications";
import React, { useState } from "react";
import TextField, {
  getEndItemIconButton,
} from "../../../components/FormControl/TextField";
import Select from "../../../components/FormControl/Select";
import DatePicker from "../../../components/FormControl/DatePicker";
import PageHeader from "../../../components/Layout/PageHeader";
import { GetServerSideProps, NextPage } from "next";
import {
  AbrirRelatorio,
  FormatarCpfCnpj,
  GetDataFromJwtToken,
  ZerosLeft,
} from "../../../util/functions";
import ConsultaPessoas from "../../../components/CustomDialog/ConsultaPessoas";
import ConsultaInstrumentos from "../../../components/CustomDialog/ConsultaInstrumentos";
import api from "../../../util/Api";
import { addDays } from "date-fns";
import prisma from "../../../prisma/PrismaInstance";
import { format } from "date-fns";
import CustomButton from "../../../components/CustomButton";
import { NomeRelatorio } from "../../../reports/nomesRelatorios";
import { Base64 } from "js-base64";
import ExportarXLSX from "../../../components/CustomDialog/ExportarXLSX";

const useStyles = makeStyles((theme: Theme) => ({
  themeError: {
    color: theme.palette.background.paper,
  },
  paper: {
    padding: 20,
    marginBottom: 25,
  },
  btnBox: {
    display: "flex",
    alignItems: "center",
    marginBottom: 20,
  },
  btnMargin: {
    marginRight: 10,
  },
}));
type Props = {
  usuarioId: string;
  pessoaId: string;
  laboratorios: { value: string; text: string }[];
};

const ListaCalibracoes: NextPage<Props> = (props: Props) => {
  const classes = useStyles();
  const { addToast } = useToasts();
  const { usuarioId, pessoaId, laboratorios } = props;

  const [isExport, setExport] = useState<boolean>(false);

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

  const [dataCalibracaoInicial, setDataCalibracaoInicial] = useState<Date>(
    addDays(new Date(), -(new Date().getDate() - 1))
  );
  const [dataCalibracaoFinal, setDataCalibracaoFinal] = useState<Date>(
    new Date()
  );

  const [listaLaboratorios] = useState(laboratorios);
  const [laboratorio, setLaboratorio] = useState<string>(" ");

  const getWhere = (csv: boolean = false) => {
    let where = "1=1";

    if (uuidPessoa)
      where += ` and ${csv ? "instrumentos" : "i"}.pessoa_id = '${uuidPessoa}'`;
    if (uuidInstrumento)
      where += ` and ${csv ? "instrumentos" : "i"}.id = '${uuidInstrumento}'`;
    if (dataCalibracaoInicial)
      where += ` and ${csv ? "calibracoes" : "c"}.data_calibracao >= '${format(
        dataCalibracaoInicial,
        "yyyy-MM-dd"
      )}'`;
    if (dataCalibracaoFinal)
      where += ` and ${csv ? "calibracoes" : "c"}.data_calibracao <= '${format(
        dataCalibracaoFinal,
        "yyyy-MM-dd"
      )}'`;
    if ((laboratorio || "").toUpperCase() === "NÃO INFORMADO") {
      where += ` and nullif(trim(${
        csv ? "calibracoes" : "c"
      }.laboratorio), '') is null`;
    } else if ((laboratorio || "").length > 0 && laboratorio != " ") {
      where += ` and coalesce(upper(nullif(trim(${
        csv ? "calibracoes" : "c"
      }.laboratorio), '')), 'Não informado') = '${laboratorio
        .trim()
        .toUpperCase()}'`;
    }

    return where;
  };

  const setStateCpfCnpjPessoa = (str) => {
    setCpfCnpjPessoa(FormatarCpfCnpj(str));
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

        setCodPessoa(codigo);
        setCpfCnpjPessoa(cpf_cnpj);
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

  const getCamposBuscaInstrumento = () => {
    return (
      <Paper className={classes.paper}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={5} md={4}>
            <TextField
              label="Tag do Instrumento"
              value={tagInstrumento}
              setValue={setTagInstrumento}
              disabled
              endItem={getEndItemBuscarInstrumento()}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={7} lg={8}>
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

  const getCamposFiltros = () => {
    return (
      <Paper className={classes.paper}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <DatePicker
              label="Calibração de"
              value={dataCalibracaoInicial}
              maxValue={new Date()}
              setValue={setDataCalibracaoInicial}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <DatePicker
              label="Calibração até"
              value={dataCalibracaoFinal}
              minValue={dataCalibracaoInicial}
              maxValue={new Date()}
              setValue={setDataCalibracaoFinal}
            />
          </Grid>
          <Grid item xs={12} sm={8} md={6} lg={4}>
            <Select
              label="Laboratório"
              value={laboratorio}
              setValue={setLaboratorio}
              items={listaLaboratorios}
              itemZero
              textItemZero="Todos"
            />
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const getButtons = () => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={8} md={6} lg={3}>
          <Box className={classes.btnBox}>
            <CustomButton
              className={classes.btnMargin}
              label="Exportar"
              icon={<GridIcon />}
              func={() => setExport(true)}
            />
            <CustomButton
              label="Gerar PDF"
              icon={<PrintIcon />}
              func={() =>
                AbrirRelatorio(NomeRelatorio.listaCalibracoes, getWhere())
              }
            />
          </Box>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box>
      <PageHeader title="Relatório de Calibrações" />
      {usuarioId && getCamposBuscaCliente()}
      {getCamposBuscaInstrumento()}
      {getCamposFiltros()}
      {getButtons()}
      {isExport && (
        <ExportarXLSX
          relatorio={NomeRelatorio.listaCalibracoes}
          isOpen={isExport}
          onClose={() => setExport(false)}
          filter={encodeURI(Base64.btoa(getWhere(true)))}
        />
      )}
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
    </Box>
  );
};

export default ListaCalibracoes;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const jwt = GetDataFromJwtToken(req.cookies.token);

  const laboratorios: any[] = await prisma.$queryRawUnsafe(`
  SELECT
    value,
    text
  FROM (
    select distinct
      case when nullif(trim(c.laboratorio), '') is null then 0 else 1 end as ordem,
      coalesce(upper(nullif(trim(c.laboratorio), '')), 'Não informado') as value,
      coalesce(upper(nullif(trim(c.laboratorio), '')), 'Não informado') as text
  from
    instrumentos_calibracoes as c
    inner join instrumentos i on (i.id = c.instrumento_id)
  where
    ${jwt?.pessoaId ? `i.pessoa_id = '${jwt.pessoaId}'` : "1=1"}
  ) as t
  order by
    t.ordem, t.text
  `);

  return {
    props: {
      usuarioId: jwt?.usuarioId || null,
      pessoaId: jwt?.pessoaId || null,
      laboratorios,
    },
  };
};
