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

## API verificada contra os headers do RNW

Sem compilador, mas os headers estão em `node_modules/react-native-windows`.
Conferido um a um:

| Uso no código | Verificação |
|---|---|
| `React::JSValueType::Int64` / `Double` | enum existe com esses valores |
| `JSValue::Type()` | `JSValue.h:269` |
| `ReactPromise<void>::Resolve()` | especialização existe |
| `ReactPromise<T>::Reject(char const*)` | sobrecarga existe |
| `JSValue(std::nullptr_t)` | existe — `row[col] = nullptr` compila |
| `JSValueObject` indexado por `std::string` | é `std::map<std::string, JSValue>` |
| `JSValueArray` em range-for | é `std::vector<JSValue>` |
| `AddAttributedModules(builder, bool)` | `ModuleRegistration.h:199` |
| `REACT_MODULE(struct, nome)` | macro aceita nome opcional |

A revisão também pegou três erros prováveis, já corrigidos: faltavam
`<cstring>` (`_strnicmp`) e `<stdexcept>` (`std::runtime_error`), e
`sqlite3_changes()` devolve `int` — que deixaria a escolha de sobrecarga do
`JSValue` ambígua entre `bool`, `int64_t` e `double`.

## O que ainda pode quebrar

O que não dá para verificar sem Windows:

- **`winsqlite3`** — se `<winsqlite/winsqlite3.h>` ou `winsqlite3.lib` não
  estiverem no SDK do runner, ou se `SQLITE_TRANSIENT` não for exportado por
  esse header. Plano B: vendorizar a amalgamation
- **Autolinking** — se o `react-native autolink-windows` segue a dependência
  `file:` até `modules/rnw-sqlite`
- **Registro em runtime** — `AddAttributedModules(.., true)` compila, mas se
  aparece no `TurboModuleRegistry` é comportamento, não compilação. Por isso
  o fallback para `NativeModules` no lado JS
