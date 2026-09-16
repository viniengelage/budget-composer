import { describe, expect, test } from "bun:test";

import { setConfigVersion } from "./set-version";

const CONFIG = `import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "Orcamentos Grameira",
    identifier: "br.com.grameira.orcamentos",
    version: "1.0.0",
  },
} satisfies ElectrobunConfig;
`;

describe("setConfigVersion", () => {
  test("troca a versão mantendo o resto do arquivo", () => {
    const result = setConfigVersion(CONFIG, "1.0.42");

    expect(result).toContain('version: "1.0.42"');
    expect(result).toContain('name: "Orcamentos Grameira"');
    expect(result).toContain('identifier: "br.com.grameira.orcamentos"');
  });

  test("não confunde version com identifier nem com name", () => {
    const result = setConfigVersion(CONFIG, "2.5.1");

    expect(result.match(/version: "/g)).toHaveLength(1);
    expect(result).toContain('version: "2.5.1"');
  });

  test("recusa versão que não é número.número.número", () => {
    expect(() => setConfigVersion(CONFIG, "latest")).toThrow(/inválida/);
    expect(() => setConfigVersion(CONFIG, "1.0")).toThrow(/inválida/);
  });

  test("avisa quando o campo sumiu do arquivo, em vez de gravar igual", () => {
    expect(() => setConfigVersion("export default {}", "1.0.1")).toThrow(
      /Não achei o campo version/,
    );
  });
});
