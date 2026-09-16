# rnw-sqlite

Módulo nativo de SQLite para **React Native Windows** (nova arquitetura).

> ⚠️ **Nunca foi compilado.** Escrito sem acesso a máquina Windows. O primeiro
> build no runner `windows-latest` do CI é o primeiro compilador a ver este
> código. Trate os erros iniciais como esperados, não como surpresa.

## Por que este módulo existe

`expo-sqlite` suporta macOS (verificado: podspec com `:osx => '11.0'`, pod
integrado ao projeto gerado) mas **não suporta Windows** — nenhum módulo Expo
suporta. `expo-module.config.json` só aceita `android`, `apple`, `web` e
`devtools`.

Também não existe módulo SQLite mantido para RNW: `react-native-sqlite-storage`
tem projeto Windows, mas parou em 2021 na arquitetura antiga do RN.

## Decisões de projeto

| Decisão | Motivo |
|---|---|
| **Módulo atribuído** (`REACT_MODULE`), não TurboModule com codegen | Elimina o passo de codegen. Uma variável a menos para estar errada sem compilador |
| **`JSValue`**, não JSON em string | O RNW serializa sozinho. Evita escrever um parser JSON em C++ às cegas |
| **`winsqlite3.lib` do sistema**, não amalgamation | Sem blob de 9 MB no repositório e sem passo de download. Windows 10 1803+ embarca `winsqlite3.dll`, e o SDK traz o header |
| **Handles numéricos**, não objetos | Devolver objeto com métodos exigiria HostObject/JSI e muito mais C++ |
| **Transação no lado JS** (`BEGIN`/`COMMIT`/`ROLLBACK`) | 4 métodos nativos em vez de 7 |

Estrutura espelhada de `node_modules/expo-desktop-modules-core/windows/ExpoModulesCore`,
que comprovadamente compila contra RNW 0.81 neste mesmo app.

## Superfície

```ts
open(name: string): Promise<number>          // handle
close(handle: number): Promise<void>
execute(handle, sql, params): Promise<{ rowsAffected, insertId }>
query(handle, sql, params): Promise<Record<string, unknown>[]>
```

O banco fica em `%LOCALAPPDATA%\OrcamentosGrameira\`. Usa a variável de
ambiente e não `ApplicationData::Current()` porque esta lança exceção quando o
app roda sem empacotamento MSIX — que é o modo de desenvolvimento.

## O que validar no primeiro build verde

Compilar não é funcionar. Em ordem:

1. **Registro** — `NativeRnwSqlite` não é `null` em runtime. Se for, o
   fallback `NativeModules` no lado JS cobre o caso de o módulo atribuído não
   aparecer no `TurboModuleRegistry`
2. **`open`** cria o arquivo em `%LOCALAPPDATA%\OrcamentosGrameira\`
3. **Migrações** rodam — o mesmo SQL já passa em `bun test` contra `bun:sqlite`
4. **Acentuação** — gravar e ler "Espaço das Américas" sem corromper (UTF-8)
5. **Parâmetros** — nome com apóstrofo (`D'Ávila`) não quebra
6. **Transação** — `ROLLBACK` desfaz de verdade
7. **Concorrência** — duas queries simultâneas não travam (há `busy_timeout`
   de 5 s e `SQLITE_OPEN_FULLMUTEX`)

## Suspeitas conhecidas

Onde eu apostaria que o primeiro build falha:

- `AddAttributedModules(packageBuilder, true)` pode não registrar no
  `TurboModuleRegistry` nesta versão — daí o fallback no JS
- `winsqlite3.lib` pode exigir `WindowsTargetPlatformMinVersion` mais alto
- `React::JSValueType::Int64` pode não existir com esse nome; números de JS
  chegam como `Double` na prática
- `ReactPromise<void>` pode precisar de outra assinatura para `close`
