# AGENTS.md — Orçamentos Grameira

Instruções para agentes de IA trabalhando neste repositório. Leia antes de editar.

## Contexto que decide tudo

O app será usado por **uma pessoa com familiaridade básica com computador**.
Toda decisão de interface se subordina a isso:

- Corpo de texto 17px (`text-base`), mínimo absoluto 13px (`text-xs`)
- Alvo clicável ≥ 44px (`h-11`); ações primárias com 56px (`h-14`)
- Rótulo sempre visível — placeholder nunca substitui rótulo
- Nenhum botão só com ícone; ícone é reforço do texto
- Mensagem de erro sempre oferece saída ("Pode preencher à mão")
- Português claro, sem jargão ("Situação", não "Status")

Se uma mudança deixa a tela mais densa ou mais "profissional" às custas da
clareza, ela está errada para este produto.

## Stack

App desktop em **Electrobun 2** (webview do sistema + processo principal em
TypeScript), construído pelo **Hutch**. Interface em React 19 + Tailwind v4,
empacotada pelo Vite. Banco local em `bun:sqlite`.

Electrobun **não é Electron**: não existe `ipcMain`, `BrowserWindow` do Electron,
`contextBridge` nem `app.whenReady()`. A API é outra
(`electrobun/main`, `electrobun/view`).

## Comandos

```bash
bun install
bun run devkit       # hutch electrobun prepare — gera .hutch/devkit (tipos do SDK)
bun run check        # devkit + typecheck + lint + testes — rode antes de entregar
bun run dev          # build do Vite + abre a janela, com watch
bun run dev:hmr      # Vite dev server + janela, com hot reload da UI
bun run typecheck    # tsgo (TypeScript 7)
bun test
bun run build        # instalador do sistema atual
bun run build:windows # exige rodar no Windows
```

Use **bun**, nunca npm/yarn/pnpm. O `hutch.config.ts` declara
`packageManager: "bun"`, então `hutch install` também delega para o bun.

`bun run devkit` precisa rodar ao menos uma vez depois de clonar: o `tsconfig.json`
aponta os tipos de `electrobun` para `.hutch/devkit`, que é gerado e não versionado.

## Regras de código

### Fronteira entre processos
Aplicada por ESLint (`import/no-restricted-paths`), não por convenção:

```
src/main/      processo principal — SQLite, rede, sistema de arquivos
src/renderer/  React na webview — nunca toca em banco nem em disco
src/shared/    tipos e regra de domínio pura, importável pelos dois
```

- `main` e `renderer` **não podem** se importar. Conversam só por RPC.
- `shared` **não pode** importar nenhum dos dois.

Se um dado precisa atravessar, ele entra no contrato em
`src/shared/rpc-contract.ts` e ganha um handler em `src/main/rpc/handlers.ts`.

### Fronteiras dentro de `src/renderer` (Bulletproof React)

- `components/`, `hooks/`, `lib/`, `utils/`, `config/`, `styles/`, `stores/`
  → **não podem** importar de `features/` nem de `app/`
- `features/X` → **não pode** importar de `app/` nem de `features/Y`
- `app/` → pode importar de tudo

Se precisar cruzar uma fronteira, o código está na camada errada. Mova-o.

### Imports
Sempre alias absoluto: `@/` (renderer), `@main/`, `@shared/`.
`../` para fora da pasta é erro de lint.

### RPC
Todo handler devolve `Result<T>` (`@shared/result`), nunca lança exceção para o
outro lado — exceção atravessando o RPC vira timeout genérico e a pessoa perde a
frase em português. Use `attempt` / `attemptAsync`.

No renderer, use `call()` de `@/lib/rpc/client`: ele desembrulha o `Result` e
lança `AppError` com a mensagem pronta para a tela.

### Dinheiro
Sempre `Cents` (inteiro). Nunca float, nunca `parseFloat` em valor monetário.
Arredonde item a item (`calculateItemTotal`), não só no total — o cliente
confere linha por linha no PDF impresso.

### Datas
Formato `YYYY-MM-DD`, manipulado por string. **Nunca** `new Date(isoString)`
para formatar: parseia como UTC e devolve o dia anterior em UTC-3.

### Estilo
Nenhum literal de cor, espaçamento, raio ou tamanho de fonte em componente.
Tudo vem do `@theme` em `src/renderer/styles/theme.css`. Falta um valor?
Adicione um token lá, não um literal na classe. O `@theme` espelha o Penpot
(`orcamentos-core`, `orcamentos-semantic`) — mudou um, mude o outro.

### Rede
Nunca chame `fetch` direto. Use `fetchJson` de `@main/services/http/fetch-json`.

O `fetch` do Cottontail **não descomprime a resposta**: servidor que responde
`Content-Encoding: br` ou `gzip` faz a chamada estourar com
"Decompression error", e de dentro de um `catch` isso parece internet fora.
`fetchJson` pede `identity` e resolve. Foi assim que a busca de CNPJ ficou
quebrada por um tempo, com uma mensagem que culpava a rede.

Para testar algo do processo principal no runtime de verdade (o bun **não** tem
esse bug, então `bun test` não pega):

```bash
build/<alvo>/*.app/Contents/MacOS/cottontail seu-script.ts
```

### Bibliotecas externas
Não importe lib de terceiro direto numa feature. Envolva em `src/renderer/lib/`
(ou `src/main/services/`). O SDK do Electrobun só aparece em
`src/renderer/lib/rpc/` e em `src/main/`.

### Banco
Acesso a SQLite só via a interface `Db` de `@main/db/database`. Repositórios
ficam em `src/main/modules/<dominio>/`. Migração nova = mais um array em
`MIGRATIONS`; nunca edite uma migração já publicada.

### Testes
`bun test`, arquivos `*.test.ts` ao lado do código. Cubra **lógica de domínio**
(dinheiro, datas, cálculo de orçamento) e **repositórios** (rodam contra
`:memory:` de verdade, com o mesmo SQL de produção). Teste de componente ainda
não está configurado.

## Plataforma

Alvos: **Windows 11 x64** (WebView2) e **macOS ARM64** (WKWebView).

O Hutch compila **só para o sistema onde ele roda** — não existe cross-compile.
Instalador de Windows sai de um runner Windows; de macOS, de um Mac. É o que o
`.github/workflows/build.yml` faz.

Os dois usam o webview do sistema, que são motores diferentes. Qualquer coisa
sensível a engine (layout, `<input type="date">`, impressão, fonte) precisa ser
conferida nos dois antes de considerar pronta.

**Impressão é assimétrica.** `window.print()` abre o diálogo no WebView2
(Windows), mas no WKWebView (macOS) não faz nada: o Electrobun não implementa o
delegate nativo de impressão. O código detecta isso pelo evento `beforeprint`
(quem imprime dispara) em vez de checar `process.platform`, e avisa a pessoa.
Não “conserte” trocando por detecção de sistema operacional.

Para conferir o documento A4 sem imprimir, rode `bun run preview:doc`: ele
renderiza o PDF para HTML estático com dados fictícios e marca em vermelho onde
a folha termina.

## O que não fazer

- Não versione `.hutch/`, `dist/`, `build/` nem `artifacts/` — são gerados.
- Não use API de Electron: não existe aqui.
- Não coloque acesso a banco, `node:fs` ou `fetch` de API externa no renderer —
  vai para `src/main` e atravessa por RPC.
- Não suprima erro de lint com `eslint-disable` sem explicar o porquê no código.
- Não mexa no pin de versão em `hutch.config.ts` sem rodar `bun run check` e uma
  build completa: o Hutch, o Cottontail e o Electrobun andam em trio.
