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
import api from "../../../util/Api";
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
  responsaveis: { value: string; text: string }[];
  areas: { value: string; text: string }[];
  subareas: { value: string; text: string }[];
  fabricantes: { value: string; text: string }[];
  modelos: { value: string; text: string }[];
};

const ListaInstrumentos: NextPage<Props> = (props: Props) => {
  const classes = useStyles();
  const { addToast } = useToasts();
  const {
    usuarioId,
    pessoaId,
    responsaveis,
    areas,
    subareas,
    fabricantes,
    modelos,
  } = props;

  const [isExport, setExport] = useState<boolean>(false);

  const [uuidPessoa, setUuidPessoa] = useState<string>(pessoaId);
  const [codPessoa, setCodPessoa] = useState<number>(null);
  const [cpfCnpjPessoa, setCpfCnpjPessoa] = useState<string>("");
  const [nomePessoa, setNomePessoa] = useState<string>("");
  const [consultandoPessoa, setConsultandoPessoa] = useState<boolean>(false);

  const [tag, setTag] = useState<string>("");
  const [descricao, setDescricao] = useState<string>("");

  const [listaResponsaveis] = useState(responsaveis);
  const [responsavel, setResponsavel] = useState<string>(" ");
  const [listaAreas] = useState(areas);
  const [area, setArea] = useState<string>(" ");
  const [listaSubareas] = useState(subareas);
  const [subarea, setSubarea] = useState<string>(" ");
  const [listaFabricantes] = useState(fabricantes);
  const [fabricante, setFabricante] = useState<string>(" ");
  const [listaModelos] = useState(modelos);
  const [modelo, setModelo] = useState<string>(" ");
  const [status, setStatus] = useState<number>(-1);

  const [dataCalibracaoInicial, setDataCalibracaoInicial] =
    useState<Date>(null);
  const [dataCalibracaoFinal, setDataCalibracaoFinal] = useState<Date>(null);

  const [dataVencimentoInicial, setDataVencimentoInicial] =
    useState<Date>(null);
  const [dataVencimentoFinal, setDataVencimentoFinal] = useState<Date>(null);

  const getWhere = (csv: boolean = false) => {
    let where = "1=1";

    const getWhereListBoxes = (column: string, value: string) => {
      if ((value || "").toUpperCase() === "NÃO INFORMADO") {
        where += ` and nullif(trim(${column}), '') is null`;
      } else if ((value || "").length > 0 && value != " ") {
        where += ` and coalesce(upper(nullif(trim(${column}), '')), 'Não informado') = '${value
          .trim()
          .toUpperCase()}'`;
      }
    };

    if (uuidPessoa)
      where += ` and ${csv ? "instrumentos" : "i"}.pessoa_id = '${uuidPessoa}'`;
    if (tag)
      where += ` and upper(trim(${csv ? "instrumentos" : "i"}.tag)) like '%${tag
        .trim()
        .toUpperCase()}%'`;
    if (descricao)
      where += ` and upper(trim(${
        csv ? "instrumentos" : "i"
      }.descricao)) like '%${descricao.trim().toUpperCase()}%'`;
    if (status === 0 || status === 1)
      where += ` and ${csv ? "instrumentos" : "i"}.ativo = ${status}`;

    getWhereListBoxes(`${csv ? "instrumentos" : "i"}.responsavel`, responsavel);
    getWhereListBoxes(`${csv ? "instrumentos" : "i"}.area`, area);
    getWhereListBoxes(`${csv ? "instrumentos" : "i"}.subarea`, subarea);
    getWhereListBoxes(`${csv ? "instrumentos" : "i"}.fabricante`, fabricante);
    getWhereListBoxes(`${csv ? "instrumentos" : "i"}.modelo`, modelo);

    if (dataCalibracaoInicial)
      where += ` and ${
        csv ? "instrumentos" : "v"
      }.ultima_calibracao >= '${format(dataCalibracaoInicial, "yyyy-MM-dd")}'`;
    if (dataCalibracaoFinal)
      where += ` and ${
        csv ? "instrumentos" : "v"
      }.ultima_calibracao <= '${format(dataCalibracaoFinal, "yyyy-MM-dd")}'`;

    if (dataVencimentoInicial)
      where += ` and ${
        csv ? "instrumentos" : "v"
      }.vencimento_calibracao >= '${format(
        dataCalibracaoInicial,
        "yyyy-MM-dd"
      )}'`;
    if (dataVencimentoFinal)
      where += ` and ${
        csv ? "instrumentos" : "v"
      }.vencimento_calibracao <= '${format(
        dataCalibracaoFinal,
        "yyyy-MM-dd"
      )}'`;

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
          <Grid item xs={6} md={4}>
            <TextField label="Tag parcial" value={tag} setValue={setTag} />
          </Grid>
          <Grid item xs={12} sm={12} md={8}>
            <TextField
              label="Descrição parcial"
              value={descricao}
              setValue={setDescricao}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Select
              label="Responsável"
              value={responsavel}
              setValue={setResponsavel}
              items={listaResponsaveis}
              itemZero
              textItemZero="Todos"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Select
              label="Área"
              value={area}
              setValue={setArea}
              items={listaAreas}
              itemZero
              textItemZero="Todas"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Select
              label="Subárea"
              value={subarea}
              setValue={setSubarea}
              items={listaSubareas}
              itemZero
              textItemZero="Todas"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Select
              label="Fabricante"
              value={fabricante}
              setValue={setFabricante}
              items={listaFabricantes}
              itemZero
              textItemZero="Todos"
            />
          </Grid>
          {/* <Grid item xs={12} sm={6} md={4}>
            <Select
              label="Modelo"
              value={modelo}
              setValue={setModelo}
              items={listaModelos}
              itemZero
              textItemZero="Todos"
            />
          </Grid> */}
          <Grid item xs={12} sm={6} md={4}>
            <Select
              label="Status"
              value={status}
              setValue={setStatus}
              itemZero={false}
              items={[
                { value: -1, text: "Ambos" },
                { value: 1, text: "Somente Ativos" },
                { value: 0, text: "Somente Inativos" },
              ]}
            />
          </Grid>
          <Hidden xsDown>
            <Grid item xs={12} sm={6} md={4}></Grid>
          </Hidden>
          <Grid item xs={6} sm={5} md={3} lg={3}>
            <DatePicker
              label="Calibração de"
              value={dataCalibracaoInicial}
              maxValue={new Date()}
              setValue={setDataCalibracaoInicial}
            />
          </Grid>
          <Grid item xs={6} sm={5} md={3} lg={3}>
            <DatePicker
              label="Calibração até"
              value={dataCalibracaoFinal}
              minValue={dataCalibracaoInicial && dataCalibracaoInicial}
              maxValue={new Date()}
              setValue={setDataCalibracaoFinal}
            />
          </Grid>
          <Hidden mdUp xsDown>
            <Grid item xs={6} sm={2} md={3} lg={3} />
          </Hidden>
          <Grid item xs={6} sm={5} md={3} lg={3}>
            <DatePicker
              label="Vencimento de"
              value={dataVencimentoInicial}
              setValue={setDataVencimentoInicial}
            />
          </Grid>
          <Grid item xs={6} sm={5} md={3} lg={3}>
            <DatePicker
              label="Vencimento até"
              value={dataVencimentoFinal}
              minValue={dataVencimentoInicial && dataVencimentoInicial}
              setValue={setDataVencimentoFinal}
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
                AbrirRelatorio(NomeRelatorio.listaInstrumentos, getWhere())
              }
            />
          </Box>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box>
      <PageHeader title="Relatório de Instrumentos" />
      {usuarioId && getCamposBuscaCliente()}
      {getCamposFiltros()}
      {getButtons()}
      {isExport && (
        <ExportarXLSX
          relatorio={NomeRelatorio.listaInstrumentos}
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
    </Box>
  );
};

export default ListaInstrumentos;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const jwt = GetDataFromJwtToken(req.cookies.token);

  const getData = async (column: string) => {
    const json: any[] = await prisma.$queryRawUnsafe(`
    SELECT
	    value,
	    text
    FROM (
      select distinct
	   	case when nullif(trim(${column}), '') is null then 0 else 1 end as ordem,
      coalesce(upper(nullif(trim(${column}), '')), 'Não informado') as value,
      coalesce(upper(nullif(trim(${column}), '')), 'Não informado') as text
    from
        instrumentos
    where
      ${jwt?.pessoaId ? `pessoa_id = '${jwt.pessoaId}'` : "1=1"}
    ) as t
    order by
	    t.ordem, t.text
    `);
    return json;
  };

  const responsaveis = await getData("responsavel");
  const areas = await getData("area");
  const subareas = await getData("subarea");
  const fabricantes = await getData("fabricante");
  const modelos = await getData("modelo");

  return {
    props: {
      usuarioId: jwt?.usuarioId || null,
      pessoaId: jwt?.pessoaId || null,
      responsaveis,
      areas,
      subareas,
      fabricantes,
      modelos,
    },
  };
};
