import { Box, Grid, Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material/styles";
import PrintIcon from "@mui/icons-material/PrintRounded";
import GridIcon from "@mui/icons-material/GridOnRounded";

import { useRouter } from "next/router";

import { useToasts } from "react-toast-notifications";
import React, { useState, useEffect } from "react";
import TextField from "../../../components/FormControl/TextField";
import Select from "../../../components/FormControl/Select";
import DatePicker from "../../../components/FormControl/DatePicker";
import PageHeader from "../../../components/Layout/PageHeader";
import { GetServerSideProps, NextPage } from "next";
import { AbrirRelatorio, GetDataFromJwtToken } from "../../../util/functions";
import api from "../../../util/Api";
import prisma from "../../../prisma/PrismaInstance";
import { format } from "date-fns";
import CustomButton from "../../../components/CustomButton";
import { NomeRelatorio } from "../../../reports/nomesRelatorios";
import { listarEstados } from "../../api/estados";
import ExportarXLSX from "../../../components/CustomDialog/ExportarXLSX";
import { Base64 } from "js-base64";

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
  pessoaId: string;
  estados: { value: string; text: string }[];
  grupos: { value: string; text: string }[];
  categorias: { value: string; text: string }[];
};

const ListaClientes: NextPage<Props> = (props: Props) => {
  const classes = useStyles();
  const router = useRouter();
  const { addToast } = useToasts();
  const { pessoaId, estados, grupos, categorias } = props;

  const [isExport, setExport] = useState<boolean>(false);

  const [nome, setNome] = useState<string>("");
  const [fantasia, setFantasia] = useState<string>("");
  const [status, setStatus] = useState<number>(-1);

  const [listaEstados] = useState(estados);
  const [estado, setEstado] = useState<string>(" ");
  const [listaCidades, setListaCidades] = useState([]);
  const [cidade, setCidade] = useState<string>(" ");
  const [listaBairros, setListaBairros] = useState([]);
  const [bairro, setBairro] = useState<string>(" ");
  const [listaGrupos] = useState(grupos);
  const [grupo, setGrupo] = useState<string>(" ");
  const [listaCategorias] = useState(categorias);
  const [categoria, setCategoria] = useState<string>(" ");

  const [dataCadastroInicial, setDataCadastroInicial] = useState<Date>(null);
  const [dataCadastroFinal, setDataCadastroFinal] = useState<Date>(null);

  const getWhere = (csv: boolean = false) => {
    let where = "1=1";

    if (nome)
      where += ` and upper(trim(${csv ? "clientes" : "p"}.nome)) like '%${nome
        .trim()
        .toUpperCase()}%'`;
    if (fantasia)
      where += ` and upper(trim(${
        csv ? "clientes" : "p"
      }.fantasia)) like '%${fantasia.trim().toUpperCase()}%'`;
    if (status === 0 || status === 1)
      where += ` and ${csv ? "clientes" : "p"}.ativo = ${status}`;

    if (dataCadastroInicial)
      where += ` and ${csv ? "clientes" : "p"}.data_cadastro >= '${format(
        dataCadastroInicial,
        "yyyy-MM-dd"
      )}'`;
    if (dataCadastroFinal)
      where += ` and ${csv ? "clientes" : "p"}.data_cadastro <= '${format(
        dataCadastroFinal,
        "yyyy-MM-dd"
      )}'`;

    if ((estado || "") === "-") {
      where += ` and nullif(trim(${csv ? "clientes" : "p"}.uf),'') is null`;
    } else if ((estado || "").length === 2) {
      where += ` and ${csv ? "clientes" : "p"}.uf = '${estado}'`;
    }

    if ((cidade || "") === "-") {
      where += ` and nullif(trim(${csv ? "clientes" : "p"}.cidade),'') is null`;
    } else if ((cidade || "").length > 1) {
      where += ` and upper(trim(${csv ? "clientes" : "p"}.cidade)) = '${cidade
        .trim()
        .toUpperCase()}'`;
    }

    if ((bairro || "") === "-") {
      where += ` and nullif(trim(${csv ? "clientes" : "p"}.bairro),'') is null`;
    } else if ((bairro || "").length > 1) {
      where += ` and upper(trim(${csv ? "clientes" : "p"}.bairro)) = '${bairro
        .trim()
        .toUpperCase()}'`;
    }

    if ((grupo || "") === "-") {
      where += ` and ${csv ? "clientes" : "p"}.grupo_id is null`;
    } else if ((grupo || "").length > 1) {
      where += ` and ${csv ? "clientes" : "p"}.grupo_id = '${grupo}'`;
    }

    if ((categoria || "") === "-") {
      where += ` and ${csv ? "clientes" : "p"}.categoria_id is null`;
    } else if ((categoria || "").length > 1) {
      where += ` and ${csv ? "clientes" : "p"}.categoria_id = '${categoria}'`;
    }

    return where;
  };

  const getCamposFiltros = () => {
    return (
      <Paper className={classes.paper}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={6}>
            <TextField
              label="Nome/Razão Social parcial"
              value={nome}
              setValue={setNome}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <TextField
              label="Apelido/Fantasia parcial"
              value={fantasia}
              setValue={setFantasia}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Select
              label="Estado"
              value={estado}
              setValue={setEstado}
              items={listaEstados}
              itemZero
              textItemZero="Todos"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Select
              label="Cidade"
              value={cidade}
              setValue={setCidade}
              items={listaCidades}
              itemZero
              textItemZero="Todas"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Select
              label="Bairro"
              value={bairro}
              setValue={setBairro}
              items={listaBairros}
              itemZero
              textItemZero="Todos"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Select
              label="Grupo"
              value={grupo}
              setValue={setGrupo}
              items={listaGrupos}
              itemZero
              textItemZero="Todos"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Select
              label="Categoria"
              value={categoria}
              setValue={setCategoria}
              items={listaCategorias}
              itemZero
              textItemZero="Todas"
            />
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
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
          <Grid item xs={6} sm={4} md={3}>
            <DatePicker
              label="Cadastro de"
              value={dataCadastroInicial}
              maxValue={new Date()}
              setValue={setDataCadastroInicial}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <DatePicker
              label="Cadastro até"
              value={dataCadastroFinal}
              minValue={dataCadastroInicial && dataCadastroInicial}
              maxValue={new Date()}
              setValue={setDataCadastroFinal}
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
                AbrirRelatorio(NomeRelatorio.listaClientes, getWhere())
              }
            />
          </Box>
        </Grid>
      </Grid>
    );
  };

  useEffect(() => {
    const getData = async () => {
      const jsonCidades = [];
      try {
        const response = await api.get(`/estados/${estado}/cidades`);

        if (!response?.data?.error) {
          response.data.map((c) => {
            if (c.cidade === "Não informado") {
              jsonCidades.push({ value: "-", text: c.cidade });
            } else {
              jsonCidades.push({ value: c.cidade, text: c.cidade });
            }
          });
        } else {
          throw new Error(response.data.error);
        }
      } catch (err) {
        addToast(err.message, { appearance: "error" });
      }
      setListaCidades(jsonCidades);
    };

    setCidade(" ");
    if (estado?.length === 2) {
      getData();
    } else {
      setListaCidades([]);
    }
  }, [estado]);

  useEffect(() => {
    const getData = async () => {
      const jsonBairros = [];
      try {
        const response = await api.get(
          `/estados/${estado}/cidades/${cidade.trim()}/bairros`
        );

        if (!response?.data?.error) {
          response.data.map((c) => {
            if (c.bairro === "Não informado") {
              jsonBairros.push({ value: "-", text: c.bairro });
            } else {
              jsonBairros.push({ value: c.bairro, text: c.bairro });
            }
          });
        } else {
          throw new Error(response.data.error);
        }
      } catch (err) {
        addToast(err.message, { appearance: "error" });
      }
      setListaBairros(jsonBairros);
    };

    setBairro(" ");
    if (cidade?.length > 1) {
      getData();
    } else {
      setListaBairros([]);
    }
  }, [cidade]);

  useEffect(() => {
    if (pessoaId) {
      router.push("/app/home");
    }
  }, [pessoaId]);

  return (
    <Box>
      <PageHeader title="Relatório de Clientes" />
      {getCamposFiltros()}
      {getButtons()}
      {isExport && (
        <ExportarXLSX
          relatorio={NomeRelatorio.listaClientes}
          isOpen={isExport}
          onClose={() => setExport(false)}
          filter={encodeURI(Base64.btoa(getWhere(true)))}
        />
      )}
    </Box>
  );
};

export default ListaClientes;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const jwt = GetDataFromJwtToken(req.cookies.token);

  const jsonEstados: any[] = await prisma.$queryRawUnsafe(`
  select
	  uf
  from (
    select distinct
      case when uf is null then 0 else 1 end as ordem,
      case when uf is null then '-' else uf end as uf
    from
      pessoas
  ) as t
  order by
	  t.ordem,
    t.uf
  `);

  const estados = [];
  jsonEstados.map((e) => {
    if (e.uf === "-") {
      estados.push({ value: e.uf, text: "Não informado" });
    } else {
      estados.push({
        value: e.uf,
        text: `${e.uf} - ${
          listarEstados().filter((est) => est.uf === e.uf)[0].descricao
        }`,
      });
    }
  });

  const grupos: any[] = await prisma.$queryRawUnsafe(`
  SELECT
	  value,
	  text
  FROM (
    select distinct
	    case when g.id is null then 0 else 1 end as ordem,
      case when g.id is null then '-' else g.id end as value,
      case when g.id is null then 'Não informado' else upper(g.descricao) end as text
    from
      pessoas p
      left join grupos_pessoa g on (p.grupo_id = g.id)
  ) as t
  order by
	  t.ordem, t.text
  `);

  const categorias: any[] = await prisma.$queryRawUnsafe(`
  SELECT
	  value,
	  text
  FROM (
    select distinct
	    case when c.id is null then 0 else 1 end as ordem,
     case when c.id is null then '-' else c.id end as value,
  case when c.id is null then 'Não informado' else upper(c.descricao) end as text
    from
      pessoas p
      left join categorias_pessoa c on (p.categoria_id = c.id)
  ) as t
  order by
	  t.ordem, t.text
  `);

  return {
    props: {
      pessoaId: jwt?.pessoaId || null,
      estados,
      grupos,
      categorias,
    },
  };
};
