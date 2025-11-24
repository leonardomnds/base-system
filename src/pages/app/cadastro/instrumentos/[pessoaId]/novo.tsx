import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useToasts } from "react-toast-notifications";

import {
  Box,
  Paper,
  Button,
  Tabs,
  Tab,
  Grid,
  Hidden,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material/styles";

import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import UploadIcon from "@mui/icons-material/AttachFileRounded";
import PageHeader from "../../../../../components/Layout/PageHeader";
import TextField from "../../../../../components/FormControl/TextField";
import Observacoes from "../../../../../components/FormControl/Observacoes";
import Select from "../../../../../components/FormControl/Select";

import api from "../../../../../util/Api";

import { GetServerSideProps, NextPage } from "next";
import { Instrumento } from ".prisma/client";
import {ConvertBase64ToFile, ConvertFileToBase64, FormatUtcDate, SomenteNumeros} from "../../../../../util/functions";
import CustomTable, {
  getColumn,
  getRow,
} from "../../../../../components/Table";

const useStyles = makeStyles((theme: Theme) => ({
  themeError: {
    color: theme.palette.background.paper,
  },
  paper: {
    padding: 20,
    marginBottom: 25,
  },
  input: {
    display: "none",
  },
  fotoActions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
  fotoInfo: {
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  fotoPreviewWrapper: {
    marginTop: theme.spacing(2),
  },
  fotoPreview: {
    maxWidth: "100%",
    maxHeight: 360,
    borderRadius: 4,
  },
  tabs: {
    marginTop: 25,
  },
  tab: {
    paddingTop: 25,
  },
}));

type Props = {
  pessoaId: string;
  instrumentoId: string;
  colunas: Array<any>;
};

const NewInstrument: NextPage<Props> = (props: Props) => {
  const classes = useStyles();
  const router = useRouter();
  const { pessoaId, instrumentoId, colunas } = props;

  const { addToast } = useToasts();

  // Geral
  const [isSaving, setSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  // Principal
  const [tag, setTag] = useState<string>("");
  const [descricao, setDescricao] = useState<string>("");
  const [isAtivo, setAtivo] = useState<boolean>(true);

  // Dados Gerais
  const [serie, setSerie] = useState<string>("");
  const [responsavel, setResponsavel] = useState<string>("");
  const [area, setArea] = useState<string>("");
  const [subArea, setSubArea] = useState<string>("");

  const [modelo, setModelo] = useState<string>("");
  const [faixa, setFaixa] = useState<string>("");
  const [resolucao, setResolucao] = useState<string>("");
  const [fabricante, setFabricante] = useState<string>("");
  const [tempoCalibracao, setTempoCalibracao] = useState<number>(null);

  // Observações
  const [observacoes, setObservacoes] = useState<string>("");
  
  // Foto
  const [foto, setFoto] = useState<{ file: any; preview: any }>(null);

  // Histórico de Calibrações
  const [isFinded, setFinded] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [linhas, setLinhas] = useState<Array<any>>([]);

  const setFotoInstrumento = (evt) => {    
    const file = evt?.target?.files?.[0];
    if (file && /\.(png|jpe?g|gif|webp|bmp)$/i.test(file.name)) {
      setFoto({
        file,
        preview: URL.createObjectURL(file),
      });
    } else {
      addToast("Formato do arquivo inválido.", { appearance: "warning" });
    }

    if (evt?.target) {
      evt.target.value = "";
    }
  };

  const getFotoBase64 = (): Promise<string> | string => {
    if (!foto?.file) { return ''; }

    return ConvertFileToBase64(foto.file) as Promise<string>;
  };

  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const setValueTempoCalibracao = (value) => {
    setTempoCalibracao(parseInt(SomenteNumeros(value), 10));
  };

  const handleSave = async () => {
    setSaving(true);

    if (!tag) {
      addToast("A Tag é obrigatória!", { appearance: "warning" });
    } else if (!descricao) {
      addToast("A descrição é obrigatória!", { appearance: "warning" });
    } else {
      try {
        const instrument: Instrumento = {
          id: instrumentoId || null,
          pessoa_id: pessoaId || null,
          tag: tag || null,
          descricao: descricao || null,
          serie: serie || null,
          responsavel: responsavel || null,
          area: area || null,
          subarea: subArea || null,
          fabricante: fabricante || null,
          modelo: modelo || null,
          faixa: faixa || null,
          resolucao: resolucao || null,
          observacoes: observacoes || null,
          tempo_calibracao: tempoCalibracao || 0,
          ativo: isAtivo,
          data_cadastro: null!,
          fotoBase64: await getFotoBase64(),
        };

        let response;
        if (instrument.id) {
          response = await api.put(
            "/pessoas/" + pessoaId + "/instrumentos/" + instrument.id,
            instrument
          );
        } else {
          response = await api.post(
            "/pessoas/" + pessoaId + "/instrumentos",
            instrument
          );
        }

        if (!response?.data?.error) {
          addToast(
            `Instrumento ${
              instrumentoId ? "alterado" : "cadastrado"
            } com sucesso!`,
            {
              appearance: "success",
            }
          );
          router.push("/app/cadastro/instrumentos?pessoaId=" + pessoaId);
          return;
        }
        throw new Error(response.data.error);
      } catch (err) {
        addToast(err.message, { appearance: "error" });
      }
    }

    setSaving(false);
  };

  useEffect(() => {
    const getData = async () => {
      const calibracoes = [];
      setLoading(true);

      try {
        const response = await api.get(
          `/pessoas/${pessoaId}/instrumentos/${instrumentoId}/calibracoes`
        );

        if (!response?.data?.error) {
          response.data.forEach((c) => {
            calibracoes.push(
              getRow(
                [
                  c.id,
                  c.data_calibracao ? FormatUtcDate(c.data_calibracao) : "",
                  c.numero_certificado,
                  c.laboratorio,
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

      setFinded(true);
      setLinhas(calibracoes);
      setLoading(false);
    };

    if (instrumentoId && currentTab === 3 && !isFinded) {
      getData();
    }
  }, [currentTab]);

  useEffect(() => {
    async function getData() {
      try {
        const response = await api.get(
          "/pessoas/" + pessoaId + "/instrumentos/" + instrumentoId
        );

        if (!response?.data?.error) {
          const ins = response.data;
          if (ins) {
            // Dados Gerais
            setTag(ins.tag);
            setDescricao(ins.descricao);
            setAtivo(ins.ativo);
            setSerie(ins.serie);
            setResponsavel(ins.responsavel);
            setArea(ins.area);
            setSubArea(ins.subarea);
            setModelo(ins.modelo);
            setFaixa(ins.faixa);
            setResolucao(ins.resolucao);
            setFabricante(ins.fabricante);
            setObservacoes(ins.observacoes);
            setTempoCalibracao(ins.tempo_calibracao);
            
            if (ins.fotoBase64) {
              const file = ConvertBase64ToFile(ins.fotoBase64, 'foto');
              setFoto({
                file: file,
                preview: URL.createObjectURL(file),
              });
            } else {
              setFoto(null)
            }
          } else {
            router.push("/app/cadastro/instrumentos?pessoaId=" + pessoaId);
          }
        } else {
          throw new Error(response.data.error);
        }
      } catch (err) {
        addToast(err.message, { appearance: "error" });
      }
    }

    if (instrumentoId) {
      getData();
    }
  }, []);

  const TablePanel = () => {
    switch (currentTab) {
      case 1: // Observações
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Observacoes
                numLinhas={10}
                value={observacoes}
                setValue={setObservacoes}
              />
            </Grid>
          </Grid>
        );
      case 2: // Foto
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>              
              <input
                accept="image/*"
                className={classes.input}
                id="inputFotoInstrumento"
                type="file"
                onChange={(evt) => setFotoInstrumento(evt)}
              />
              <Box className={classes.fotoActions}>
                <label htmlFor="inputFotoInstrumento">
                  <Button
                    variant="contained"
                    color="primary"
                    component="span"
                    startIcon={<UploadIcon />}
                  >
                    Selecionar imagem
                  </Button>
                </label>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setFoto(null)}
                  disabled={!foto}
                >
                  Remover
                </Button>
              </Box>
              {!foto?.file?.name && (
                <Box className={classes.fotoInfo}>
                  Nenhuma imagem selecionada
                </Box>
              )}
              {foto?.preview && (
                <Box className={classes.fotoPreviewWrapper}>
                  <img
                    src={foto.preview}
                    alt="Foto do instrumento selecionada"
                    className={classes.fotoPreview}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        );
      case 3: // Calibrações
        return (
          <CustomTable isLoading={isLoading} columns={colunas} rows={linhas} />
        );
      default:
        // Dados gerais
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Periodicidade (Meses)"
                value={(tempoCalibracao || "").toString()}
                setValue={setValueTempoCalibracao}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Responsável"
                value={responsavel}
                setValue={setResponsavel}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Área" value={area} setValue={setArea} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Subárea"
                value={subArea}
                setValue={setSubArea}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              <TextField
                label="Fabricante"
                value={fabricante}
                setValue={setFabricante}
              />
            </Grid>
            {/* <Grid item xs={12} sm={6} md={3}>
              <TextField label="Modelo" value={modelo} setValue={setModelo} />
            </Grid> */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Número de série"
                value={serie}
                setValue={setSerie}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Faixa" value={faixa} setValue={setFaixa} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Resolução"
                value={resolucao}
                setValue={setResolucao}
              />
            </Grid>
          </Grid>
        );
    }
  };

  return (
    <Box>
      <PageHeader
        title={`${pessoaId ? "Editar" : "Novo"} instrumento`}
        btnLabel="Salvar"
        btnIcon={<SaveRoundedIcon />}
        btnFunc={handleSave}
        btnLoading={isSaving}
        btnBack
      />
      <Paper className={classes.paper}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={6} md={4} lg={3}>
            <TextField label="TAG" value={tag} setValue={setTag} />
          </Grid>
          <Hidden xsDown>
            <Grid item sm={2} md={5} lg={6} xl={7} />
          </Hidden>
          <Grid item xs={6} sm={4} md={3} lg={3} xl={2}>
            <Select
              label="Situação"
              value={isAtivo}
              setValue={setAtivo}
              itemZero={false}
              items={[
                { value: true, text: "Ativo" },
                { value: false, text: "Inativo" },
              ]}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={8} lg={6}>
            <TextField
              label="Descrição"
              value={descricao}
              setValue={setDescricao}
            />
          </Grid>
        </Grid>
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
          className={classes.tabs}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Dados gerais" />
          <Tab label="Observações" />
          <Tab label="Foto" />
          <Tab label="Histórico de Calibrações" />
        </Tabs>
        <Box className={classes.tab}>{TablePanel()}</Box>
      </Paper>
    </Box>
  );
};

export default NewInstrument;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const colunas = [];
  colunas.push(getColumn("id", "Id", 0, "center", null, true));
  colunas.push(getColumn("dtCalibracao", "Data", 50, "center"));
  colunas.push(getColumn("numCert", "Certificado", 50, "left"));
  colunas.push(getColumn("laboratorio", "Laboratório", 100, "left"));

  return {
    props: {
      pessoaId: params?.pessoaId || null,
      instrumentoId: params?.id || null,
      colunas,
    },
  };
};