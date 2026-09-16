/**
 * Gera os ícones do app a partir de `assets/icon-source.png`.
 *
 *   bun run icons
 *
 * O resultado é versionado de propósito. Dava para gerar no build, mas isso
 * usaria `sips`, que só existe no macOS — e o instalador do Windows sai de um
 * runner Windows. Gerar aqui, uma vez, mantém os dois builds independentes de
 * ferramenta do sistema.
 */
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const SOURCE = "assets/icon-source.png";
const ICONSET = "assets/icon.iconset";
const WINDOWS_PNG = "assets/icon.png";

/**
 * 256 é o teto do formato ICO. Mandar 1024 faz o Hutch recusar com
 * `PngTooLarge` só no runner Windows — o build do macOS passa numa boa e a
 * quebra aparece longe daqui.
 */
const WINDOWS_SIZE = 256;

/** Nome do arquivo → lado em pixels, no formato que o `iconutil` espera. */
const ICONSET_SIZES: readonly [string, number][] = [
  ["icon_16x16.png", 16],
  ["icon_16x16@2x.png", 32],
  ["icon_32x32.png", 32],
  ["icon_32x32@2x.png", 64],
  ["icon_128x128.png", 128],
  ["icon_128x128@2x.png", 256],
  ["icon_256x256.png", 256],
  ["icon_256x256@2x.png", 512],
  ["icon_512x512.png", 512],
  ["icon_512x512@2x.png", 1024],
];

async function resize(source: string, target: string, size: number): Promise<void> {
  const proc = Bun.spawn(
    ["sips", "-z", String(size), String(size), source, "--out", target],
    { stdout: "ignore", stderr: "pipe" },
  );

  if ((await proc.exited) !== 0) {
    const reason = await new Response(proc.stderr).text();
    throw new Error(`sips falhou em ${target}: ${reason.trim()}`);
  }
}

if (process.platform !== "darwin") {
  console.error(
    "Este script usa `sips`, que só existe no macOS.\n" +
      "Os ícones já gerados estão versionados — só rode isto ao trocar a arte.",
  );
  process.exit(1);
}

if (!(await Bun.file(SOURCE).exists())) {
  throw new Error(`Não achei ${SOURCE}. Coloque a arte quadrada do ícone lá.`);
}

await rm(ICONSET, { recursive: true, force: true });
await mkdir(ICONSET, { recursive: true });

for (const [name, size] of ICONSET_SIZES) {
  await resize(SOURCE, join(ICONSET, name), size);
}

await resize(SOURCE, WINDOWS_PNG, WINDOWS_SIZE);

console.log(`${ICONSET_SIZES.length} tamanhos em ${ICONSET}`);
console.log(
  `${WINDOWS_PNG} em ${WINDOWS_SIZE}px para Windows e Linux (o Hutch converte para .ico)`,
);
