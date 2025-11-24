import { Instrumento } from ".prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../../../../prisma/PrismaInstance";
import cors from "../../../../../util/Cors";
import { ValidateAuth } from "../../../../../util/functions";
import ConsultasComuns from "../../../../../util/ConsultasComuns";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb",
    },
  },
};

export default async function Instrumentos(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await cors(req, res);

    const usuarioId = ValidateAuth(req, "user");
    const pessoaIdAuth = ValidateAuth(req, "person");
    const pessoaId = req.query.id.toString();

    if (!usuarioId && pessoaIdAuth !== pessoaId) {
      res.status(401).json({ error: "Acesso não autorizado!" });
      return;
    }

    switch (req.method) {
      case "POST":
        const instrumentoSalvar: Instrumento = req.body;
        const retPost = await salvarInstrumento(instrumentoSalvar, pessoaId);

        res.status(201).json(retPost.instrumento);
        return;

      case "GET":
        const json = await listarInstrumentos(pessoaId);
        res.status(200).json(json);
        return;

      default:
        res.status(405).json({ error: "Método não suportado!" });
        return;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const listarInstrumentos = async (pessoaId: string) => {
  const instrumentos: any[] = await prisma.$queryRawUnsafe(
    `
      SELECT
        i.id,
        i.tag,
        i.descricao,
        i.ativo,
        c.ultima_calibracao,
        c.vencimento_calibracao
      FROM 
        instrumentos as i
        LEFT JOIN (${ConsultasComuns.vencimentosCalibracoes()}) as c ON (i.id = c.id)
      WHERE
        i.pessoa_id = '${pessoaId}'
      GROUP BY
        i.id,
        i.tag,
        i.descricao,
        i.ativo
    `
  );

  return instrumentos;
};

export const salvarInstrumento = async (
  instrumento: Instrumento,
  pessoaId: string
) => {
  const id = instrumento.id;
  delete instrumento.id;

  let json;
  if (id) {
    // Update
    delete instrumento.pessoa_id;
    delete instrumento.data_cadastro;

    json = await prisma.instrumento.update({
      data: instrumento,
      where: {
        id: id,
      },
      select: getInstrumentoJsonReturn(),
    });
  } else {
    instrumento.ativo = true;
    instrumento.pessoa_id = pessoaId;
    instrumento.data_cadastro = new Date();

    json = await prisma.instrumento.create({
      data: instrumento,
      select: getInstrumentoJsonReturn(),
    });
  }

  return { instrumento: json };
};

export const getInstrumentoJsonReturn = () => {
  return {
    id: true,
    pessoa: {
      select: {
        id: true,
        codigo: true,
        cpf_cnpj: true,
        nome: true,
        fantasia: true,
      },
    },
    tag: true,
    descricao: true,
    tempo_calibracao: true,
    responsavel: true,
    area: true,
    subarea: true,
    fabricante: true,
    modelo: true,
    faixa: true,
    resolucao: true,
    serie: true,
    observacoes: true,
    ativo: true,
    fotoBase64: true,
    data_cadastro: true,
  };
};