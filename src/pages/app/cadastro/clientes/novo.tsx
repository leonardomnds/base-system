import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useToasts } from "react-toast-notifications";

import {
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
  Hidden,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material/styles";

import CachedIcon from "@mui/icons-material/CachedRounded";

import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import PageHeader from "../../../../components/Layout/PageHeader";
import TextField, {
  getEndItemIconButton,
} from "../../../../components/FormControl/TextField";
import Select, {
  getSelectItem,
} from "../../../../components/FormControl/Select";

import EntityDialog, {
  Entity,
} from "../../../../components/CustomDialog/Entity";
import CustomDialog from "../../../../components/CustomDialog";

import api from "../../../../util/Api";

import {
  SomenteNumeros,
  FormatarCpfCnpj,
  FormatarCep,
  FormatarTelefone,
  ZerosLeft,
  GetDataFromJwtToken,
} from "../../../../util/functions";
import { GetServerSideProps, NextPage } from "next";
import { CategoriaPessoa, GrupoPessoa, Pessoa } from ".prisma/client";

const useStyles = makeStyles((theme: Theme) => ({
  themeError: {
    color: theme.palette.background.paper,
  },
  paper: {
    padding: 20,
    marginBottom: 25,
  },
  tabs: {
    marginTop: 25,
  },
  tab: {
    paddingTop: 25,
  },
  btnContact: {
    width: "100%",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  btn: {
    marginRight: 10,
  },
}));

type Props = {
  clienteLogado: string;
  pessoaId: string;
};

const NewPeople: NextPage<Props> = (props) => {
  const classes = useStyles();
  const router = useRouter();
  const { clienteLogado, pessoaId } = props;

  const { addToast } = useToasts();

  // Geral
  const [isSaving, setSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [newEntity, setNewEntity] = useState<Entity>(null);

  const [showConfirmCnpj, setShowConfirmCnpj] = useState(false);
  const [cnpjConsultado, setCnpjConsultado] = useState("");

  // Principal
  const [codigo, setCodigo] = useState<number>(null);
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [nomeRazao, setNomeRazao] = useState("");
  const [fantasia, setFantasia] = useState("");
  const [isAtivo, setAtivo] = useState(true);

  // Dados gerais
  const [listaGrupos, setListaGrupos] = useState([]);
  const [listaCategorias, setListaCategorias] = useState([]);

  const [rgIe, setRgIE] = useState("");
  const [inscMun, setInscMun] = useState("");
  const [grupo, setGrupo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [telefone, setTelefone] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");

  // Endereço
  const [listaEstados, setListaEstados] = useState([]);

  const [showConfirmCep, setShowConfirmCep] = useState(false);
  const [cep, setCep] = useState("");
  const [cepConsultado, setCepConsultado] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numLogradouro, setNumLogradouro] = useState("");
  const [bairro, setBairro] = useState("");
  const [uf, setUF] = useState("");
  const [cidade, setCidade] = useState("");
  const [complemento, setComplemento] = useState("");

  // Dados de Acesso
  const [senhaAcesso, setSenhaAcesso] = useState<string>("");
  const [senhaAcesso2, setSenhaAcesso2] = useState<string>("");

  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleSave = async () => {
    setSaving(true);

    if (!cpfCnpj || !nomeRazao) {
      addToast(
        `Preencha CPF/CNPJ e ${
          cpfCnpj.length > 14 ? "Razão Social" : "Nome"
        } para continuar!`,
        {
          appearance: "warning",
        }
      );
    } else if (cpfCnpj && cpfCnpj.length !== 18 && cpfCnpj.length !== 14) {
      addToast("O CPF/CNPJ está incompleto!", {
        appearance: "warning",
      });
    } else if (cep && cep.length !== 9) {
      addToast("O CEP está incompleto!", {
        appearance: "warning",
      });
      setCurrentTab(1);
    } else if (uf && !cidade) {
      addToast("Selecione a cidade!", {
        appearance: "warning",
      });
      setCurrentTab(1);
    } else if (!pessoaId && senhaAcesso === "****") {
      addToast("Senha informada não é permitida!", {
        appearance: "warning",
      });
      setCurrentTab(2);
    } else if (senhaAcesso != senhaAcesso2) {
      addToast("As senhas informadas não são iguais!", {
        appearance: "warning",
      });
      setCurrentTab(2);
    } else {
      try {
        const person: Pessoa = {
          id: pessoaId || null,
          codigo: codigo || null,
          cpf_cnpj: cpfCnpj || null,
          nome: nomeRazao || null,
          fantasia: fantasia || null,
          rg_insc_estadual: rgIe || null,
          insc_municipal: inscMun || null,
          telefone: telefone || null,
          celular: celular || null,
          email: email || null,
          cep: cep || null,
          logradouro: logradouro || null,
          numero: numLogradouro || null,
          bairro: bairro || null,
          complemento: complemento || null,
          cidade: cidade || null,
          uf: uf || null,
          senha_acesso: senhaAcesso || null,
          grupo_id: grupo || null,
          categoria_id: categoria || null,
          ativo: isAtivo,
          data_cadastro: null,
          expiracao_url_senha: null,
          email_recuperacao: null,
          url_senha: null,
        };

        let response;
        if (person.id) {
          response = await api.put("/pessoas/" + person.id, person);
        } else {
          response = await api.post("/pessoas", person);
        }

        if (!response?.data?.error) {
          addToast(
            `Cliente ${pessoaId ? "alterado" : "cadastrado"} com sucesso!`,
            {
              appearance: "success",
            }
          );
          router.push("/app/cadastro/clientes");
          return;
        }
        throw new Error(response.data.error);
      } catch (err) {
        addToast(err.message, { appearance: "error" });
      }
    }

    setSaving(false);
  };

  const findCnpjData = async () => {
    try {
      const response = await api.get("/cnpj/" + SomenteNumeros(cpfCnpj));

      if (!response?.data?.error) {
        const dados = response.data;
        if (dados) {
          // Dados Gerais
          setNomeRazao(dados.razao_social);
          setFantasia(dados.fantasia);

          if (dados.endereco) {
            // Endereço
            setCep(dados.endereco.cep);
            setBairro(dados.endereco.bairro);
            setComplemento(dados.endereco.complemento);
            setUF(dados.endereco.uf);
            setCidade(dados.endereco.cidade);

            if (dados.endereco.logradouro.includes("|")) {
              setLogradouro(
                dados.endereco.logradouro.slice(
                  dados.endereco.logradouro.indexOf("|") + 1
                )
              );
              setNumLogradouro(
                dados.endereco.logradouro.substring(
                  0,
                  dados.endereco.logradouro.indexOf("|")
                )
              );
            } else {
              setLogradouro(dados.endereco.logradouro);
              setNumLogradouro("");
            }
          }
        }
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      addToast(err.message, { appearance: "error" });
    }
    setCnpjConsultado(cpfCnpj);
  };

  const handleCnpjData = async () => {
    if (SomenteNumeros(cpfCnpj).length !== 14) {
      addToast("Preencha o CNPJ para continuar!", { appearance: "warning" });
    } else if (cpfCnpj === cnpjConsultado) {
      setShowConfirmCnpj(true);
    } else {
      findCnpjData();
    }
  };

  const findCepData = async () => {
    try {
      const response = await api.get("/cep/" + cep);

      if (!response?.data?.error) {
        const dados = response.data;
        if (dados) {
          setCep(dados.cep);
          setLogradouro(dados.logradouro);
          setBairro(dados.bairro);
          setComplemento(dados.complemento);
          setUF(dados.uf);
          setCidade(dados.cidade);
        }
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      addToast(err.message, { appearance: "error" });
    }
    setCepConsultado(cep);
  };

  const handleCepData = async () => {
    if (SomenteNumeros(cep).length !== 8) {
      addToast("Preencha o CEP para continuar!", { appearance: "warning" });
    } else if (cep === cepConsultado) {
      setShowConfirmCep(true);
    } else {
      findCepData();
    }
  };

  const getEndItemCnpj = () =>
    getEndItemIconButton(<CachedIcon />, handleCnpjData);

  const getEndItemCep = () =>
    getEndItemIconButton(<CachedIcon />, handleCepData);

  const maskCpfCnpj = (str) => {
    setCpfCnpj(FormatarCpfCnpj(str));
  };

  const maskCep = (str) => {
    setCep(FormatarCep(str));
  };

  const maskTelefone = (str) => {
    setTelefone(FormatarTelefone(str));
  };

  const maskCelular = (str) => {
    setCelular(FormatarTelefone(str));
  };

  const getGrupos = async () => {
    try {
      const response = await api.get("/pessoas/grupos");

      if (!response?.data?.error) {
        const dados: GrupoPessoa[] = response.data;
        if (dados) {
          const items = [];
          dados.forEach((item) => {
            items.push(getSelectItem(item.id, item.descricao));
          });
          setListaGrupos(items);
        }
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      addToast(err.message, { appearance: "error" });
    }
  };

  const getCategorias = async () => {
    try {
      const response = await api.get("/pessoas/categorias");

      if (!response?.data?.error) {
        const dados: CategoriaPessoa[] = response.data;
        if (dados) {
          const items = [];
          dados.forEach((item) => {
            items.push(getSelectItem(item.id, item.descricao));
          });
          setListaCategorias(items);
        }
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      addToast(err.message, { appearance: "error" });
    }
  };

  // Lista de Estados
  useEffect(() => {
    async function getData() {
      try {
        const response = await api.get("/estados");

        if (!response?.data?.error) {
          const dados = response.data;
          if (dados) {
            const estados = [];
            dados.forEach((estado) => {
              estados.push(
                getSelectItem(estado.uf, `${estado.uf} - ${estado.descricao}`)
              );
            });
            setListaEstados(estados);
          }
        } else {
          throw new Error(response.data.error);
        }
      } catch (err) {
        addToast(err.message, { appearance: "error" });
      }
    }

    getData();
  }, []);

  useEffect(() => {
    async function getData() {
      try {
        const response = await api.get("/pessoas/" + pessoaId);

        if (!response?.data?.error) {
          const dados = response.data;
          if (dados) {
            // Dados Gerais
            setCodigo(dados.codigo);
            setCpfCnpj(dados.cpf_cnpj);
            setAtivo(dados.ativo);
            setNomeRazao(dados.nome);
            setFantasia(dados.fantasia);
            setRgIE(dados.rg_insc_estadual);
            setInscMun(dados.insc_municipal);
            setTelefone(dados.telefone);
            setCelular(dados.celular);
            setEmail(dados.email);
            setGrupo(dados.grupo?.id || "");
            setCategoria(dados.categoria?.id || "");

            // Endereço
            setCep(dados.cep);
            setCepConsultado(dados.cep);
            setLogradouro(dados.logradouro);
            setNumLogradouro(dados.numero);
            setBairro(dados.bairro);
            setComplemento(dados.complemento);
            setCidade(dados.cidade);
            setUF(dados.uf);

            //Acesso
            setSenhaAcesso("****");
            setSenhaAcesso2("****");
          } else {
            router.push("/app/cadastro/clientes");
          }
        } else {
          throw new Error(response.data.error);
        }
      } catch (err) {
        addToast(err.message, { appearance: "error" });
      }
    }

    if (pessoaId) {
      getData();
    }

    getGrupos();
    getCategorias();
  }, []);

  useEffect(() => {
    if (clienteLogado) {
      router.push("/app/home");
    }
  }, [clienteLogado]);

  const TablePanel = () => {
    switch (currentTab) {
      case 1: // Endereço
        return (
          <Grid container spacing={2}>
            <Grid item xs={8} sm={6} md={3}>
              <TextField
                label="CEP"
                value={cep}
                setValue={maskCep}
                endItem={cep?.length === 9 ? getEndItemCep() : null}
              />
            </Grid>
            <Grid item xs={4} sm={6} md={9} />
            <Grid item xs={12} sm={8} md={9}>
              <TextField
                label="Logradouro"
                value={logradouro}
                setValue={setLogradouro}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                label="Número"
                value={numLogradouro}
                setValue={setNumLogradouro}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <TextField label="Bairro" value={bairro} setValue={setBairro} />
            </Grid>
            <Grid item xs={12} sm={9} md={5}>
              <TextField label="Cidade" value={cidade} setValue={setCidade} />
            </Grid>
            <Grid item xs={12} sm={3} md={3}>
              <Select
                label="UF"
                value={uf}
                setValue={setUF}
                items={listaEstados}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Complemento"
                value={complemento}
                setValue={setComplemento}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                label="Senha"
                value={senhaAcesso}
                setValue={setSenhaAcesso}
                type="password"
              />
            </Grid>
            <Grid item xs={6} sm={8} md={10} />
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                label="Confirmar senha"
                value={senhaAcesso2}
                setValue={setSenhaAcesso2}
                type="password"
              />
            </Grid>
          </Grid>
        );
      default:
        // Dados gerais
        return (
          <Grid container spacing={2}>
            <Grid item xs={6} sm={6} md={3}>
              <TextField
                label={cpfCnpj.length > 14 ? "Inscrição Estadual" : "RG"}
                value={rgIe}
                setValue={setRgIE}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              {cpfCnpj.length > 14 && (
                <TextField
                  label="Inscrição Municipal"
                  value={inscMun}
                  setValue={setInscMun}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Select
                label="Grupo"
                value={grupo}
                setValue={setGrupo}
                items={listaGrupos}
                btnAction={() => {
                  setNewEntity(Entity.grupoPessoa);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Select
                label="Categoria"
                value={categoria}
                setValue={setCategoria}
                items={listaCategorias}
                btnAction={() => {
                  setNewEntity(Entity.categoriaPessoa);
                }}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <TextField
                label="Telefone"
                value={telefone}
                setValue={maskTelefone}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <TextField
                label="Celular"
                value={celular}
                setValue={maskCelular}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <TextField label="E-mail" value={email} setValue={setEmail} />
            </Grid>
          </Grid>
        );
    }
  };

  return (
    <Box>
      <PageHeader
        title={`${pessoaId ? "Editar" : "Novo"} cliente`}
        btnLabel="Salvar"
        btnIcon={<SaveRoundedIcon />}
        btnFunc={handleSave}
        btnLoading={isSaving}
        btnBack
      />
      <Paper className={classes.paper}>
        <Grid container spacing={2}>
          <Grid item xs={2} sm={2} md={2}>
            <TextField label="Código" value={ZerosLeft(codigo, 4)} disabled />
          </Grid>
          <Grid item xs={7} sm={6} md={4}>
            <TextField
              label="CPF / CNPJ"
              value={cpfCnpj}
              setValue={maskCpfCnpj}
              endItem={cpfCnpj?.length === 18 ? getEndItemCnpj() : null}
            />
          </Grid>
          <Hidden xsDown>
            <Grid item xs={1} sm={1} md={4} />
          </Hidden>
          <Grid item xs={3} sm={3} md={2}>
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
          <Grid item xs={12} sm={12} md={6} lg={6}>
            <TextField
              label={cpfCnpj.length > 14 ? "Razão Social" : "Nome"}
              value={nomeRazao}
              setValue={setNomeRazao}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={6}>
            <TextField
              label={cpfCnpj.length > 14 ? "Nome Fantasia" : "Apelido"}
              value={fantasia}
              setValue={setFantasia}
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
          <Tab label="Endereço" />
          <Tab label="Acesso" />
        </Tabs>
        <Box className={classes.tab}>{TablePanel()}</Box>
      </Paper>
      {showConfirmCnpj && (
        <CustomDialog
          title="Consultar CNPJ"
          text="O CNPJ não foi alterado desde a última consulta. Continuar mesmo assim?"
          isOpen={showConfirmCnpj}
          onClose={() => {
            setShowConfirmCnpj(false);
          }}
          onConfirm={() => {
            setShowConfirmCnpj(false);
            findCnpjData();
          }}
        />
      )}
      {showConfirmCep && (
        <CustomDialog
          title="Consultar CEP"
          text="O CEP não foi alterado desde a última consulta. Continuar mesmo assim?"
          isOpen={showConfirmCep}
          onClose={() => {
            setShowConfirmCep(false);
          }}
          onConfirm={() => {
            setShowConfirmCep(false);
            findCepData();
          }}
        />
      )}
      {newEntity && (
        <EntityDialog
          entity={newEntity}
          isOpen={Boolean(newEntity)}
          onClose={() => {
            switch (newEntity) {
              case Entity.grupoPessoa:
                getGrupos();
                break;
              case Entity.categoriaPessoa:
                getCategorias();
                break;
              default:
                break;
            }
            setNewEntity(null);
          }}
        />
      )}
    </Box>
  );
};

export default NewPeople;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const jwt = GetDataFromJwtToken(req.cookies.token);
  return {
    props: {
      clienteLogado: jwt?.pessoaId || null,
      pessoaId: params?.id || null,
    },
  };
};
