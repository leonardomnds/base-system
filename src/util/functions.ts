import cookie from "js-cookie";
import { Base64 } from "js-base64";
import jwt from "jsonwebtoken";
import { NextApiRequest } from "next";
import { NomeRelatorio } from "../reports/nomesRelatorios";
import { format } from "date-fns";
import xlsx from "xlsx";

export const SomenteNumeros = (str: string) => {
  let onlyNumbers = "";
  const value = str || "";
  for (let i = 0; i < value.length; i += 1) {
    const char = value.substring(i, i + 1);
    if ("0123456789".includes(char)) {
      onlyNumbers += char;
    }
  }
  return onlyNumbers;
};

export const FormatarCpfCnpj = (str: string) => {
  const doc = SomenteNumeros(str);

  let parte1 = "";
  let parte2 = "";
  let parte3 = "";
  let parte4 = "";
  let parte5 = "";

  if (doc.length <= 11) {
    // CPF
    parte1 = doc.substring(0, 3);
    parte2 = doc.substring(3, 6);
    parte3 = doc.substring(6, 9);
    parte4 = doc.substring(9, 11);

    if (parte2.length > 0) {
      parte2 = `.${parte2}`;
    }
    if (parte3.length > 0) {
      parte3 = `.${parte3}`;
    }
    if (parte4.length > 0) {
      parte4 = `-${parte4}`;
    }
  } else {
    // CNPJ
    parte1 = doc.substring(0, 2);
    parte2 = doc.substring(2, 5);
    parte3 = doc.substring(5, 8);
    parte4 = doc.substring(8, 12);
    parte5 = doc.substring(12, 14);

    if (parte2.length > 0) {
      parte2 = `.${parte2}`;
    }
    if (parte3.length > 0) {
      parte3 = `.${parte3}`;
    }
    if (parte4.length > 0) {
      parte4 = `/${parte4}`;
    }
    if (parte5.length > 0) {
      parte5 = `-${parte5}`;
    }
  }

  return parte1 + parte2 + parte3 + parte4 + parte5 || "";
};

export const FormatarCnpj = (str: string) => {
  const cnpj = SomenteNumeros(str);
  const parte1 = cnpj.substring(0, 2);
  let parte2 = cnpj.substring(2, 5);
  let parte3 = cnpj.substring(5, 8);
  let parte4 = cnpj.substring(8, 12);
  let parte5 = cnpj.substring(12, 14);

  if (parte2.length > 0) {
    parte2 = `.${parte2}`;
  }
  if (parte3.length > 0) {
    parte3 = `.${parte3}`;
  }
  if (parte4.length > 0) {
    parte4 = `/${parte4}`;
  }
  if (parte5.length > 0) {
    parte5 = `-${parte5}`;
  }

  return parte1 + parte2 + parte3 + parte4 + parte5;
};

export const FormatarCep = (str: string) => {
  const cnpj = SomenteNumeros(str);
  const parte1 = cnpj.substring(0, 5);
  let parte2 = cnpj.substring(5, 8);

  if (parte2.length > 0) {
    parte2 = `-${parte2}`;
  }

  return parte1 + parte2;
};

export const FormatarTelefone = (str: string) => {
  const fone = SomenteNumeros(str);
  let parte1 = fone.substring(0, 2);
  let parte2 = "";
  let parte3 = "";

  if (fone.length <= 10) {
    parte2 = fone.substring(2, 6);
    parte3 = fone.substring(6, 10);
  } else {
    parte2 = fone.substring(2, 7);
    parte3 = fone.substring(7, 11);
  }

  if (parte1.length > 0) {
    parte1 = `(${parte1}`;
  }
  if (parte2.length > 0) {
    parte2 = `) ${parte2}`;
  }
  if (parte3.length > 0) {
    parte3 = `-${parte3}`;
  }

  return parte1 + parte2 + parte3;
};

export const FormatarStringToMoney = (str: string) => {
  const valor = SomenteNumeros(str);
  const { length } = valor;

  if (length === 0) {
    return "0,00";
  }
  if (length === 1) {
    return `0,0${valor}`;
  }
  if (length === 2) {
    return `0,${valor}`;
  }

  const inteiro = valor.substring(0, valor.length - 2);
  const decimal = valor.substring(valor.length - 2, valor.length);

  return `${parseInt(inteiro, 10)},${decimal}`;
};

export const StringToDouble = (str: string) => {
  return parseFloat(str.replace(",", "."));
};

export const StringToCurrency = (str: string) => {
  return `R$ ${str.replace(".", ",")}`;
};

export const DoubleToCurrency = (value: number, digits: number = 2) => {
  return `R$ ${value.toLocaleString("pt-br", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
};

export const ZerosLeft = (value: string | number, digits: number = 0) => {
  const str = value ? value.toString() : "";
  const pad = Array(digits + 1).join("0");
  return pad.substring(0, pad.length - str.length) + str;
};

export const ToBase64 = (value: any) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(value);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export const GetTokenFromCookie = () => {
  const token = cookie.get("token");
  return token;
};

export const GetAxiosConfig = () => {
  const token = GetTokenFromCookie();
  return {
    headers: {
      Authotization: "Bearer " + token,
    },
  };
};

export const GetDataFromJwtToken = (token: string) => {
  if (token) {
    const bearerLength = "Bearer ".length;

    if (token && !token.toLowerCase().startsWith("bearer ")) {
      return jwt.decode(token, process.env.JWT_KEY);
    } else if (token && token.length > bearerLength) {
      return jwt.decode(token.slice(bearerLength), process.env.JWT_KEY);
    }
  }
  return null;
};

export const ValidateAuth = (
  req: NextApiRequest,
  type: "user" | "person" | "adm"
) => {
  let idAuth: string = null;
  const jwtData = GetDataFromJwtToken(req?.headers?.authorization);
  if (jwtData) {
    if (type === "user" || (type === "adm" && jwtData["usuarioAdm"])) {
      idAuth = jwtData["usuarioId"];
    } else if (type === "person") {
      idAuth = jwtData["pessoaId"];
    }
  }
  return idAuth;
};

export const AbrirRelatorio = (relatorio: NomeRelatorio, filters?: string) => {
  let url = `/app/pdf?ref=${relatorio.toString()}`;
  if (filters?.length > 0) url += "&filters=" + encodeURI(Base64.btoa(filters));
  const win = window.open(url, "_blank");
  if (win) win.focus();
};

export const PascalCase = (str: string = "", qtdeNotCapitalize: number = 0) => {
  let word = "";
  const words = ` ${str} `.split(" ");

  words.forEach((w) => {
    if (w.trim().length > qtdeNotCapitalize) {
      word += w.charAt(0).toUpperCase() + w.substr(1).toLowerCase() + " ";
    } else {
      word += w.toLowerCase() + " ";
    }
  });

  return word;
};

const FormatToExport = (key, value) => {
  try {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "string") {
      // Validando se é uma data
      if (
        (value.length === 10 || value.length === 25 || value.length === 29) &&
        value.indexOf("-") === 4 &&
        value.lastIndexOf("-") === 7
      ) {
        return format(new Date(value.substring(0, 10)), "dd/MM/yyyy");
      }

      // Removendo caracteres que possam quebrar o arquivo CSV gerado
      return value
        .split(";")
        .join(" ")
        .split("\r\n")
        .join(" ")
        .split("\n")
        .join(" ")
        .split("\t")
        .join(" ")
        .trim();
    } else if (key.includes(".ativo") && typeof value === "number") {
      return value === 1 ? "Sim" : "Não";
    }
  } catch (err) {
    return value;
  }
  return value;
};

export const JsonToCSV = async (json: Object[]) => {
  // Caractere que separa cada campo
  const separator = ";";

  // Nomes das colunas
  const header = Object.keys(json[0]);

  const csv = [
    header.join(separator),
    ...json.map((row) => {
      return header
        .map((collName) => {
          return FormatToExport(collName, row[collName]);
        })
        .join(separator);
    }),
  ].join("\r\n");

  return csv;
};

export const JsonToXLSX = async (
  json: Object[],
  filePath: string,
  sheetName?: string
) => {
  // Nomes das colunas
  const header = Object.keys(json[0]);

  let oneRow = [];
  const allRows = [];

  // Transforma Objeto em Array, e adiciona tudo dentro de outro Array
  json.forEach((item) => {
    oneRow = [];

    header.forEach((coluna) => {
      oneRow.push(FormatToExport(coluna, item[coluna]));
    });

    allRows.push(oneRow);
  });

  try {
    // Criando planilha Excel
    const workBook = xlsx.utils.book_new();
    const workSheet = xlsx.utils.aoa_to_sheet([header, ...allRows]);

    // Criando arquivo na pasta passada por parâmetro
    xlsx.utils.book_append_sheet(workBook, workSheet, sheetName || "Dados");
    xlsx.writeFile(workBook, filePath);
  } catch (err) {
    throw new Error(err.message);
  }
};

export const ConvertBlobToFile = (blob: Blob, fileName: string) => {
  let b: any = blob;

  b.lastModifiedDate = new Date();
  b.name = fileName;

  // Cast to a File() type
  return <File>blob;
};

export const ConvertFileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
});

export const ConvertBase64ToFile = (base64: string, fileName: string) => {
  const arr = base64.split(",");
  const mimeMatch = arr[0]?.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "";
  const bstr = atob(arr[arr.length - 1] || "");
  const n = bstr.length;
  const u8arr = new Uint8Array(n);

  for (let i = 0; i < n; i += 1) {
    u8arr[i] = bstr.charCodeAt(i);
  }

  return new File([u8arr], fileName, { type: mime });
};

export const FormatUtcDate = (date: Date | string) => {
  if (typeof date === "string") {
    date = new Date(date);
  }

  date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

  return format(date, "dd/MM/yyy");
};
