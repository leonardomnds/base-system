import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { addMinutes, format } from "date-fns";

import prisma from "../../../prisma/PrismaInstance";
import cors from "../../../util/Cors";
import { FormatarCpfCnpj } from "../../../util/functions";
import { Base64 } from "js-base64";
import ejs from "ejs";

export default async function RedefinirSenha(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await cors(req, res);

    const loginPessoa = Boolean(req.query?.pessoa === "true");

    if (req.method === "POST") {
      const { usuario } = req.body;

      let user;
      let email;

      if (`${usuario}`.toUpperCase() !== "ADMIN") {
        if (loginPessoa) {
          user = await prisma.pessoa.findFirst({
            select: {
              id: true,
              ativo: true,
              nome: true,
              email: true,
            },
            where: {
              cpf_cnpj: FormatarCpfCnpj(usuario),
            },
          });

          if (user) email = user.email;
        } else {
          user = await prisma.usuario.findFirst({
            select: {
              id: true,
              ativo: true,
              nome: true,
              email: true,
            },
            where: {
              OR: [
                {
                  usuario: usuario.trim().toUpperCase(),
                },
                {
                  email: usuario.trim().toLowerCase(),
                },
              ],
            },
          });

          if (user) email = user.email;
        }
      }

      if (!user) {
        res.status(404).json({
          error: `Não localizamos nenhum cadastro com esse ${
            loginPessoa ? "CPF/CNPJ" : "Usuário/E-mail"
          }!`,
        });
        return;
      } else if (!user.ativo) {
        res.status(401).json({
          error: "Esse cadastro foi inativado! Entre em contato com a empresa.",
        });
        return;
      } else if (!email) {
        res.status(401).json({
          error:
            "Cadastro sem e-mail de recuperação informado! Entre em contato com a empresa.",
        });
        return;
      } else {
        const hash = uuidv4();
        const updateData = {
          data: {
            url_senha: hash,
            expiracao_url_senha: addMinutes(new Date(), 30),
          },
          where: { id: user.id },
        };

        if (loginPessoa) {
          await prisma.pessoa.update(updateData);
        } else {
          await prisma.usuario.update(updateData);
        }

        const dados = {
          nome: user.nome.toUpperCase().trim(),
          url:
            process.env.NEXT_PUBLIC_BASE_URL + `/login/redefinir?hash=${hash}`,
          data_expiracao: format(
            updateData.data.expiracao_url_senha,
            "dd/MM/yyyy"
          ),
          hora_expiracao: format(updateData.data.expiracao_url_senha, "HH:mm"),
        };

        await enviarEmailRecuperacao(email, dados);

        res.status(200).json({
          message:
            "Você receberá um e-mail com instruções para redefinir sua senha!",
        });
        return;
      }
    } else {
      res.status(405).json({ error: "Método não suportado!" });
      return;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

type DadosRecuperacao = {
  nome: string;
  url: string;
  data_expiracao: string;
  hora_expiracao: string;
};

const enviarEmailRecuperacao = async (
  email: string,
  data: DadosRecuperacao
) => {
  try {
    const configEmail = await prisma.configuracao.findFirst({
      select: {
        email_usuario: true,
      },
    });

    const transporter = await getNodeMailerTransporter();

    ejs.renderFile(
      "./public/assets/templates/email-redefinir-senha.ejs",
      data,
      {},
      async (err, html) => {
        if (err) throw new Error(err.message);

        const info = await transporter.sendMail({
          from: `E-mail automático <${configEmail.email_usuario}>`,
          to: email,
          subject: "Recuperação de Senha",
          html,
          attachments: [
            {
              filename: "logo.webp",
              path: "./public/assets/images/Logo_MensureLabs.webp",
              cid: "logo",
            },
            {
              filename: "senha.png",
              path: "./public/assets/images/redefinir-senha.png",
              cid: "senha",
            },
          ],
        });

        return info;
      }
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getNodeMailerTransporter = async () => {
  const config = await prisma.configuracao.findFirst({
    select: {
      email_smtp: true,
      email_porta: true,
      email_usuario: true,
      email_senha: true,
      email_ssl: true,
      email_tls: true,
    },
  });

  const transporter = nodemailer.createTransport({
    host: config.email_smtp,
    port: config.email_porta,
    secure: config.email_ssl,
    requireTLS: config.email_tls,
    auth: {
      user: config.email_usuario,
      pass: Base64.decode(config.email_senha),
    },
  });

  return transporter;
};