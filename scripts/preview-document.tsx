/**
 * Renderiza o documento A4 para HTML estático, para conferir o layout sem
 * precisar abrir o app e mandar imprimir.
 *
 *   bun run scripts/preview-document.tsx
 *
 * Depois abra o arquivo no navegador, ou rasterize com o WebKit do sistema:
 *   qlmanage -t -s 1600 -o . dist/preview-document.html
 *
 * Os dados são fictícios de propósito: nada de cliente real entra no repo.
 */
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { renderToStaticMarkup } from "react-dom/server";

import { QuoteDocument } from "@/features/quotes/components/quote-document";
import type { Company, Quote } from "@shared/types";

const company: Company = {
  name: "Grameira Exemplo",
  document: "12345678000190",
  phone: "4599998888",
  email: "contato@exemplo.com.br",
  address: "Rua das Palmeiras, nº 120",
  district: "Centro",
  city: "Foz do Iguaçu",
  state: "PR",
  zipCode: "85850000",
  pixKey: "(45) 9 9999-8888",
  pixHolder: "Nome do Titular",
  logoUri: null,
  defaultValidityDays: 30,
};

const quote: Quote = {
  id: "preview",
  number: 253,
  status: "pending",
  customer: {
    id: "c1",
    name: "Espaço das Américas",
    document: "98765432000110",
    phone: "4530251180",
    email: "",
    address: "Av. das Cataratas, 1.500",
    district: "Três Fronteiras",
    city: "Foz do Iguaçu",
    state: "PR",
    zipCode: "85853000",
    stateRegistration: "",
    createdAt: "",
    updatedAt: "",
  },
  items: [
    {
      id: "i1",
      productId: null,
      description: "Grama esmeralda entregue e espalhada",
      unit: "m2",
      quantity: 250,
      unitPrice: 900,
    },
    {
      id: "i2",
      productId: null,
      description: "Preparo do solo e nivelamento do terreno",
      unit: "m2",
      quantity: 250,
      unitPrice: 180,
    },
    {
      id: "i3",
      productId: null,
      description: "Frete e descarga — Foz do Iguaçu",
      unit: "servico",
      quantity: 1,
      unitPrice: 15000,
    },
  ],
  discount: 15000,
  surcharge: 0,
  notes:
    "O valor inclui entrega e espalhamento da grama. O prazo de execução é de até 5 dias úteis após a confirmação. Garantia de pega de 30 dias com irrigação adequada pelo cliente.",
  issuedAt: "2026-08-01",
  validUntil: "2026-09-01",
  createdAt: "",
  updatedAt: "",
};

async function readBuiltCss(): Promise<string> {
  const assetsDir = join(process.cwd(), "dist", "assets");

  try {
    const files = await readdir(assetsDir);
    const css = files.filter((file) => file.endsWith(".css")).sort();
    const newest = css.at(-1);
    if (!newest) throw new Error("sem css");
    return await Bun.file(join(assetsDir, newest)).text();
  } catch {
    throw new Error(
      "Não achei o CSS em dist/assets. Rode `bunx vite build` antes deste script.",
    );
  }
}

const css = await readBuiltCss();
const markup = renderToStaticMarkup(<QuoteDocument quote={quote} company={company} />);

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Prévia do orçamento</title>
    <style>${css}</style>
    <style>
      /* Só da prévia: reduz a folha para caber na imagem e marca, em vermelho,
         onde a página A4 termina. Conteúdo cruzando a linha = segunda folha. */
      body { margin: 0; padding: 24px; background: #e9ecea; }
      .quote-document {
        position: relative;
        margin: 0 auto;
        zoom: 0.62;
        box-shadow: 0 2px 12px rgb(0 0 0 / 0.18);
      }
      .quote-document::after {
        content: "limite da folha A4";
        position: absolute;
        left: 0;
        right: 0;
        top: 297mm;
        border-top: 2px dashed #d00;
        color: #d00;
        font: 700 10px sans-serif;
        text-align: right;
      }
    </style>
  </head>
  <body>${markup}</body>
</html>
`;

const outputDir = join(process.cwd(), "dist");
await mkdir(outputDir, { recursive: true });

const outputPath = join(outputDir, "preview-document.html");
await writeFile(outputPath, html, "utf8");

console.log(`Prévia escrita em ${outputPath}`);
