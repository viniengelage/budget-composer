# Orçamentos Grameira

App desktop para criar, listar e imprimir orçamentos da **Grameira do Jonas**
(Foz do Iguaçu/PR). Substitui o formulário feito à mão em editor de texto.

Quem usa o programa tem familiaridade básica com computador. Isso não é um
detalhe de contexto: é o critério que decide cada escolha de interface. Texto
grande, rótulo sempre visível, botão com palavra escrita, erro que explica a
saída. As regras estão em [`AGENTS.md`](./AGENTS.md).

## Como rodar

Você precisa de [Bun](https://bun.sh) e do
[Hutch](https://framework.blackboard.sh/electrobun/guides/hutch/), que é o CLI
que compila e empacota o Electrobun.

```bash
curl -fsSL https://hutch.blackboard.sh/hutch/install.sh | sh   # macOS/Linux
```

No Windows (PowerShell):

```powershell
& ([scriptblock]::Create((irm https://hutch.blackboard.sh/hutch/install.ps1)))
```

Depois:

```bash
bun install
bun run dev        # abre a janela do app
bun run dev:hmr    # mesma coisa, com hot reload da interface
```

## Comandos

| Comando | O que faz |
| --- | --- |
| `bun run dev` | Compila a UI e abre a janela, recompilando a cada mudança |
| `bun run dev:hmr` | Vite dev server + janela, com hot reload da interface |
| `bun run check` | devkit + typecheck + lint + testes. Rode antes de entregar |
| `bun test` | Só os testes |
| `bun run build` | Instalador do sistema onde você está |
| `bun run build:windows` | Instalador `.exe` — **exige rodar no Windows** |
| `bun run preview:doc` | Renderiza o orçamento A4 para HTML, com a marca de onde a folha termina |
| `bun run icons` | Regera os ícones a partir de `assets/icon-source.png` (só macOS) |

O Hutch empacota para o sistema onde ele roda; não existe cross-compile. Para
sair com os dois instaladores de uma vez, use o workflow
`.github/workflows/build.yml`, que roda cada alvo no seu runner nativo e publica
o instalador como artefato.

Saída da build:

- macOS → `artifacts/macos-arm64-OrcamentosGrameira.dmg`
- Windows → `artifacts/win-x64-OrcamentosGrameira-Setup.zip` (contém o `.exe` de
  instalação e o payload que viaja ao lado dele)

## Como o app é organizado

O Electrobun roda dois processos, e a separação entre eles é a fronteira mais
importante do código:

```
src/main/       processo principal (Cottontail) — SQLite, rede, disco
src/renderer/   React na webview do sistema — nunca toca em banco nem em disco
src/shared/     tipos e regra de domínio pura, usada pelos dois lados
```

Os dois lados **não se importam**: conversam por RPC tipado. O contrato fica em
`src/shared/rpc-contract.ts`, os handlers em `src/main/rpc/handlers.ts`, e o
renderer chama tudo por `call()` de `@/lib/rpc/client`.

Dentro de `src/renderer` vale o
[Bulletproof React](https://github.com/alan2207/bulletproof-react): `app/` pode
importar de tudo, `features/` não conversam entre si, e a camada compartilhada
(`components/`, `lib/`, `utils/`, …) não conhece nenhuma feature. O ESLint
recusa o import que cruza a fronteira errada — não é convenção, é erro de build.

## Onde ficam os dados

Um arquivo SQLite em `orcamentos.db`, dentro da pasta de dados do usuário
(`Utils.paths.userData`). Nada sai da máquina, exceto a consulta de CNPJ na
[BrasilAPI](https://brasilapi.com.br), que é opcional e só preenche o formulário.

O esquema é versionado por `PRAGMA user_version` em `src/main/db/migrations.ts`.
Migração publicada nunca é editada; a próxima mudança entra como um array novo.

## Impressão do PDF

O orçamento impresso é o mesmo React do app, com uma folha de estilo de
impressão: `window.print()` abre o diálogo do sistema e a pessoa escolhe
"Salvar como PDF". Sem biblioteca de PDF, sem layout em coordenadas — o
documento usa os mesmos tokens que o resto do app.

**Isso funciona no Windows (WebView2) e não no macOS (WKWebView)**, porque o
Electrobun não implementa o delegate nativo de impressão do WebKit. O app
detecta a diferença pelo evento `beforeprint` e, quando a impressão não abre,
avisa em vez de fingir que deu certo. O alvo do produto é Windows; no Mac o
resto do app funciona normalmente.

Para conferir o layout da folha sem imprimir:

```bash
bun run preview:doc
open dist/preview-document.html
```

Ele usa dados fictícios e desenha uma linha vermelha onde a página A4 termina —
se o conteúdo cruzar a linha, o orçamento vai sair em duas folhas.

## Ícone do app

A arte fica em `assets/icon-source.png` (quadrada, 1287×1287). O
`bun run icons` gera de lá o `assets/icon.iconset` que o macOS usa e o
`assets/icon.png` de 1024px que o Hutch converte para `.ico` no Windows.

Os arquivos gerados são versionados de propósito. O script usa `sips`, que só
existe no macOS, e o instalador do Windows sai de um runner Windows — gerar no
build quebraria esse job. Só rode o comando ao trocar a arte.

## Design

O desenho das telas e do documento impresso vive num arquivo Penpot
(página `Orçamentos — App & Documento`). Os tokens de cor, espaçamento, raio e
tipografia estão espelhados em `src/renderer/styles/theme.css`, no bloco
`@theme` do Tailwind v4. Mudou num lugar, mude no outro.
