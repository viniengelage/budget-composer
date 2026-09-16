# AGENTS.md — Orçamentos Grameira

Instruções para agentes de IA trabalhando neste repositório. Leia antes de editar.

## Contexto que decide tudo

O app será usado por **uma pessoa com familiaridade básica com computador**.
Toda decisão de interface se subordina a isso:

- Corpo de texto 17px (um degrau acima do padrão web), mínimo absoluto 13px
- Alvo clicável ≥ 44px; ações primárias com 56px
- Rótulo sempre visível — placeholder nunca substitui rótulo
- Nenhum botão só com ícone; ícone é reforço do texto
- Mensagem de erro sempre oferece saída ("Pode preencher à mão")
- Português claro, sem jargão ("Situação", não "Status")

Se uma mudança deixa a tela mais densa ou mais "profissional" às custas da
clareza, ela está errada para este produto.

## Comandos

```bash
bun install
bun run check        # typecheck + lint + testes — rode antes de entregar
bun run typecheck    # tsgo (TypeScript 7)
bun run lint
bun test
bun run build:macos  # exige macOS + Xcode
```

Use **bun**, nunca npm/yarn/pnpm.

## Regras de código

### Fronteiras de arquitetura
Aplicadas por ESLint (`import/no-restricted-paths`), não por convenção:

- `components/`, `hooks/`, `lib/`, `utils/`, `types/`, `config/`, `styles/`, `stores/`
  → **não podem** importar de `features/` nem de `app/`
- `features/X` → **não pode** importar de `app/` nem de `features/Y`
- `app/` → pode importar de tudo

Se precisar cruzar uma fronteira, o código está na camada errada. Mova-o.

### Imports
Sempre `@/` absoluto. `../` para fora da pasta é erro de lint.

### Dinheiro
Sempre `Cents` (inteiro). Nunca float, nunca `parseFloat` em valor monetário.
Arredonde item a item (`calculateItemTotal`), não só no total — o cliente
confere linha por linha no PDF impresso.

### Datas
Formato `YYYY-MM-DD`, manipulado por string. **Nunca** `new Date(isoString)`
para formatar: parseia como UTC e devolve o dia anterior em UTC-3.

### Estilo
Nenhum literal de cor, espaçamento, raio ou tamanho de fonte em componente.
Tudo vem de `@/styles/tokens`. Falta um valor? Adicione um token, não um literal.
Os tokens espelham o Penpot (`orcamentos-core`, `orcamentos-semantic`) — mudou
um, mude o outro.

### Bibliotecas externas
Não importe lib de terceiro direto numa feature. Envolva em `src/lib/`.
`@react-native-async-storage/async-storage` só aparece em `src/lib/storage/`.

### Testes
`bun test`, arquivos `*.test.ts` ao lado do código. Cubra **lógica de domínio**
(dinheiro, datas, cálculo de orçamento) — é onde bug custa caro. Teste de
componente ainda não está configurado (precisaria de jest + RNTL).

## Plataforma

Alvos: `react-native-windows` e `react-native-macos` (plataformas out-of-tree).
Antes de adicionar qualquer dependência com código nativo, **verifique suporte
nas duas** — a maioria dos pacotes RN suporta só iOS/Android. Verificação real:
instale, rode `bun run prebuild` e confirme que o pod aparece em
`macos/Podfile.lock`.

Não use `expo-router` nem `react-navigation`: a navegação é uma máquina de
estados tipada em `src/config/routes.ts` + `src/stores/navigation-store.ts`,
justamente para não depender de módulos nativos sem suporte desktop garantido.

## O que não fazer

- Não rode `pod install` direto em `macos/` e edite o Podfile: a pasta é
  regenerada pelo prebuild. Ajustes vão em `scripts/patch-macos-pods.ts`.
- Não versione `ios/`, `android/`, `macos/`, `windows/` — são gerados (CNG).
- Não suprima erro de lint com `eslint-disable` sem explicar o porquê no código.
