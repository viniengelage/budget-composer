import { TurboModuleRegistry, type TurboModule } from "react-native";

/**
 * Spec do TurboModule de SQLite para React Native Windows.
 *
 * Este arquivo é a FONTE DO CODEGEN: o build do RNW gera a partir dele os
 * headers C++ que a implementação nativa precisa satisfazer. Mudou aqui,
 * mudou o C++.
 *
 * DECISÕES DE CONTRATO
 *
 * 1. Handles numéricos em vez de objetos. O codegen do RNW só transporta
 *    tipos primitivos com segurança; devolver um objeto com métodos exigiria
 *    HostObject/JSI e muito mais C++ para manter.
 *
 * 2. Parâmetros e resultados como JSON em string. Feio, e custa uma
 *    serialização por chamada. Em troca, o C++ lida só com `std::string` e o
 *    contrato não muda quando aparece um tipo novo de coluna. No volume deste
 *    app (centenas de linhas) o custo é irrelevante; no Windows, cada linha de
 *    C++ a menos é uma linha a menos para depurar sem máquina.
 *
 * 3. Tudo assíncrono. SQLite em disco não pode bloquear a thread de JS.
 */
export interface Spec extends TurboModule {
  /**
   * Abre (ou cria) o banco na pasta de dados local do app.
   * @returns handle usado nas demais chamadas
   */
  open(name: string): Promise<number>;

  close(handle: number): Promise<void>;

  /**
   * INSERT / UPDATE / DELETE / DDL.
   * @param paramsJson array JSON de valores vinculados, ex.: `["abc", 900, null]`
   * @returns JSON `{ "rowsAffected": number, "insertId": number | null }`
   */
  execute(handle: number, sql: string, paramsJson: string): Promise<string>;

  /**
   * SELECT.
   * @returns JSON com array de objetos, ex.: `[{ "id": "p1", "name": "Grama" }]`
   */
  query(handle: number, sql: string, paramsJson: string): Promise<string>;
}

/**
 * `get` e não `getEnforcing`: em macOS este módulo não existe e a ausência
 * precisa ser silenciosa aqui — quem reclama é o driver, com mensagem útil.
 */
export default TurboModuleRegistry.get<Spec>("RnwSqlite");
