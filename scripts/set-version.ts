/**
 * Grava a versão em `electrobun.config.ts`. Usado pelo workflow para que a
 * versão que a pessoa vê no programa, o nome da Release e a tag do git sejam
 * sempre o mesmo número.
 *
 *   bun run scripts/set-version.ts 1.0.42
 */
const CONFIG_PATH = "electrobun.config.ts";

const VERSION_PATTERN = /(\n\s*version:\s*)"(\d+\.\d+\.\d+[^"]*)"/;

export function setConfigVersion(source: string, version: string): string {
  if (!/^\d+\.\d+\.\d+([-.][0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`Versão inválida: ${version}`);
  }

  const match = source.match(VERSION_PATTERN);
  if (!match) {
    throw new Error(
      `Não achei o campo version em ${CONFIG_PATH}. Se o formato mudou, ajuste este script.`,
    );
  }

  return source.replace(VERSION_PATTERN, `$1"${version}"`);
}

if (import.meta.main) {
  const version = Bun.argv[2];
  if (!version) throw new Error("Uso: bun run scripts/set-version.ts <versão>");

  const source = await Bun.file(CONFIG_PATH).text();
  await Bun.write(CONFIG_PATH, setConfigVersion(source, version));

  console.log(`${CONFIG_PATH}: versão ${version}`);
}
