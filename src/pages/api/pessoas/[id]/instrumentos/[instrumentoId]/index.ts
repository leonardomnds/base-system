import { Instrumento, Pessoa } from '.prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getInstrumentoJsonReturn, salvarInstrumento } from '../';

import prisma from '../../../../../../prisma/PrismaInstance';
import cors from '../../../../../../util/Cors';
import { ValidateAuth } from '../../../../../../util/functions';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

export default async function Instrumentos(req: NextApiRequest, res: NextApiResponse) {
  try {

    await cors(req, res);

    const usuarioId = ValidateAuth(req, 'user');
    const pessoaIdAuth = ValidateAuth(req, 'person');
    const pessoaId = req.query.id.toString();
    const instrumentoId = req.query.instrumentoId.toString();

    if (!usuarioId && pessoaIdAuth !== pessoaId) {
      res.status(401).json({error: 'Acesso não autorizado!'});
      return;
    }
    
    switch (req.method) {
      case 'GET':
        const getIns = await getInstrumento(instrumentoId);
        res.status(200).json(getIns);
        return;

      case 'PUT':
        const instrumentoSalvar : Instrumento = req.body;
        instrumentoSalvar.id = instrumentoId;

        const retPost = await salvarInstrumento(instrumentoSalvar, pessoaId);

        res.status(200).json(retPost.instrumento);
        return;

      case 'DELETE':
        const json = await deletarInstrumento(instrumentoId);
        res.status(202).json(json);
        return;

      default:
        res.status(405).json({error: 'Método não suportado!'});
    }

  } catch (err) {
    res.status(500).json({error: err.message});
  }
}

const deletarInstrumento = async (id: string) => {
  const elimina = await prisma.instrumento.delete({
    where: {
      id
    }
  })
  return Boolean(elimina);
}

const getInstrumento = async (id: string) => {
  const instrumento = await prisma.instrumento.findUnique({
    where: {
      id
    },
    select: getInstrumentoJsonReturn()
  })

  return instrumento;
}