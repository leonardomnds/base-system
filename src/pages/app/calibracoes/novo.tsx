import React, { useState } from "react";
import { useToasts } from "react-toast-notifications";

import { makeStyles, Box, Paper, Grid, Hidden } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/SearchRounded";
import CloseIcon from "@material-ui/icons/CloseRounded";
import UploadIcon from "@material-ui/icons/AttachFileRounded";

import PageHeader from "../../../components/Layout/PageHeader";

import TextField, {
  getEndItemIconButton,
} from "../../../components/FormControl/TextField";
import DatePicker from "../../../components/FormControl/DatePicker";

import { GetServerSideProps, NextPage } from "next";
import api from "../../../util/Api";
import {
  FormatarCpfCnpj,
  GetDataFromJwtToken,
  ZerosLeft,
} from "../../../util/functions";
import ConsultaPessoas from "../../../components/CustomDialog/ConsultaPessoas";
import ConsultaInstrumentos from "../../../components/CustomDialog/ConsultaInstrumentos";
import { Calibracao } from ".prisma/client";
import SaveRoundedIcon from "@material-ui/icons/SaveRounded";
import CustomButton from "../../../components/CustomButton";
import { format } from "date-fns";

const useStyles = makeStyles((theme) => ({
  themeError: {
    color: theme.palette.background.paper,
  },
  paper: {
    padding: 20,
    marginBottom: 25,
  },
  btnCertificado: {
    minWidth: 140,
    marginLeft: 15,
  },
  input: {
    display: "none",
  },
}));

type Props = {
  usuarioId: string;
  pessoaId: string;
};

const List: NextPage<Props> = (props: Props) => {
  const classes = useStyles();
  const { addToast } = useToasts();
  const { usuarioId, pessoaId } = props;

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

  const [dataCalibracao, setDataCalibracao] = React.useState<Date>(new Date());
  const [laboratorio, setLaboratorio] = useState<string>("");
  const [numeroCertificado, setNumeroCertificado] = useState<string>("");
  const [arquivoCertificado, setArquivoCertificado] =
    useState<{ file: any; preview: any }>(null);

  const setSelectCertificado = (evt) => {
    if (evt?.target?.files[0]?.name.toString().endsWith(".pdf")) {
      setArquivoCertificado({
        file: evt?.target?.files[0],
        preview: URL.createObjectURL(evt?.target?.files[0]),
      });
    } else {
      addToast("O anexo deve ser um PDF", { appearance: "warning" });
    }
  };

  const [isSaving, setSaving] = useState<boolean>(false);

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
    setDataCalibracao(new Date());
    setLaboratorio("");
    setNumeroCertificado("");
    setArquivoCertificado(null);
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

  const salvarCalibracao = async () => {
    setSaving(true);
    const editing = false;

    if (!uuidPessoa || !uuidInstrumento) {
      addToast("Selecione o cliente e o instrumento!", {
        appearance: "warning",
      });
    } else if (!dataCalibracao) {
      addToast("Informe a data da calibração!", { appearance: "warning" });
    } else if (!numeroCertificado) {
      addToast("Informe o número do certificado!", { appearance: "warning" });
    } else {
      try {
        let response;
        const formData = new FormData();
        if (uuidInstrumento) formData.append("instrumento_id", uuidInstrumento);
        if (dataCalibracao)
          formData.append(
            "data_calibracao",
            format(dataCalibracao, "yyyy-MM-dd")
          );
        if (numeroCertificado)
          formData.append("numero_certificado", numeroCertificado);
        if (laboratorio) formData.append("laboratorio", laboratorio);
        if (arquivoCertificado?.file)
          formData.append("pdfCertificado", arquivoCertificado?.file);

        if (editing) {
          response = await api.put(
            `/pessoas/${uuidPessoa}/instrumentos/${uuidInstrumento}/calibracoes/${editing}`,
            formData
          );
        } else {
          response = await api.post(
            `/pessoas/${uuidPessoa}/instrumentos/${uuidInstrumento}/calibracoes`,
            formData
          );
        }

        if (!response?.data?.error) {
          addToast(
            `Calibração ${false ? "alterada" : "cadastrada"} com sucesso!`,
            {
              appearance: "success",
            }
          );
          limparCamposInstrumento();
        } else {
          throw new Error(response.data.error);
        }
      } catch (err) {
        addToast(err.message, { appearance: "error" });
      }
    }
    setSaving(false);
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

  const getButtonAnexo = () => {
    if (arquivoCertificado?.file?.name) {
      return (
        <>
          <CustomButton
            label="Visualizar"
            className={classes.btnCertificado}
            color="inherit"
            variant="outlined"
            componentSpan
            func={() => {
              const win = window.open(arquivoCertificado?.preview, "_blank");
              if (win) win.focus();
            }}
          />
          <CustomButton
            label="Remover"
            className={classes.btnCertificado}
            icon={<UploadIcon />}
            color="secondary"
            componentSpan
            func={() => setArquivoCertificado(null)}
          />
        </>
      );
    } else {
      return (
        <>
          <input
            accept="application/pdf"
            className={classes.input}
            onChange={(evt) => setSelectCertificado(evt)}
            id="inputCertificado"
            type="file"
          />
          <label htmlFor="inputCertificado">
            <CustomButton
              label="Anexar"
              className={classes.btnCertificado}
              icon={<UploadIcon />}
              color="secondary"
              componentSpan
            />
          </label>
        </>
      );
    }
  };

  const getCamposLancamentoCalibracao = () => {
    return (
      <Paper className={classes.paper}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={5} md={4} lg={3}>
            <DatePicker
              label="Data da calibração"
              value={dataCalibracao}
              maxValue={new Date()}
              setValue={setDataCalibracao}
            />
          </Grid>
          <Grid item xs={12} sm={7} md={8} lg={9}>
            <TextField
              label="Laboratório"
              value={laboratorio}
              setValue={setLaboratorio}
            />
          </Grid>
          <Grid item xs={12} sm={5} md={4} lg={3}>
            <TextField
              label="Número do certificado"
              value={numeroCertificado}
              setValue={setNumeroCertificado}
            />
          </Grid>
          <Grid item xs={12} sm={7} md={8} lg={9}>
            <TextField
              label="Certificado"
              value={arquivoCertificado?.file?.name}
              disabled
            />
          </Grid>
          <Grid
            item
            xs={12}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            {getButtonAnexo()}
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Box>
      <PageHeader
        title="Nova Calibração"
        btnLabel={uuidInstrumento ? "Salvar" : ""}
        btnIcon={<SaveRoundedIcon />}
        btnFunc={salvarCalibracao}
        btnLoading={isSaving}
      />
      {usuarioId && getCamposBuscaCliente()}
      {getCamposBuscaInstrumento()}
      {uuidInstrumento && getCamposLancamentoCalibracao()}
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

export default List;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const { pessoaId } = query;
  const jwt = GetDataFromJwtToken(req.cookies.token);

  return {
    props: {
      usuarioId: jwt?.usuarioId || null,
      pessoaId: jwt?.pessoaId ? jwt.pessoaId : pessoaId || null,
    },
  };
};
