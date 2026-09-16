/**
 * O Hutch compila sempre para o sistema onde ele está rodando — não existe
 * cross-compile. Este script existe para (1) falhar cedo e com instrução clara
 * quando o alvo pedido não é a máquina atual e (2) dizer onde o instalável
 * ficou, em vez de deixar a pessoa caçar na pasta artifacts/.
 *
 * Uso:
 *   bun run scripts/build.ts                      # host, canal stable
 *   bun run scripts/build.ts --target windows     # exige rodar no Windows
 *   bun run scripts/build.ts --env canary
 */
import { readdir } from "node:fs/promises";
import { join } from "node:path";

type Target = "macos" | "windows" | "linux";
type Env = "stable" | "canary";

const TARGET_BY_PLATFORM: Record<string, Target> = {
  darwin: "macos",
  win32: "windows",
  linux: "linux",
};

const ARTIFACT_PREFIX: Record<Target, string> = {
  macos: "macos-arm64-",
  windows: "win-x64-",
  linux: "linux-x64-",
};

const HOW_TO_BUILD: Record<Target, string> = {
  macos: "um Mac com Xcode Command Line Tools",
  windows: "um Windows 11 com Visual Studio Build Tools (C++) e cmake",
  linux: "um Linux com build-essential, cmake, GTK 3 e WebKitGTK 4.1",
};

function argValue(flag: string): string | null {
  const index = Bun.argv.indexOf(flag);
  if (index === -1) return null;
  return Bun.argv[index + 1] ?? null;
}

function parseTarget(): Target {
  const requested = argValue("--target");
  if (requested === null) return hostTarget();

  if (requested !== "macos" && requested !== "windows" && requested !== "linux") {
    throw new Error(`Alvo desconhecido: ${requested}. Use macos, windows ou linux.`);
  }
  return requested;
}

function hostTarget(): Target {
  const target = TARGET_BY_PLATFORM[process.platform];
  if (!target) throw new Error(`Sistema não suportado: ${process.platform}`);
  return target;
}

function parseEnv(): Env {
  const requested = argValue("--env") ?? "stable";
  if (requested !== "stable" && requested !== "canary") {
    throw new Error(`Canal desconhecido: ${requested}. Use stable ou canary.`);
  }
  return requested;
}

async function run(command: string[]): Promise<void> {
  console.log(`\n> ${command.join(" ")}`);
  const proc = Bun.spawn(command, { stdout: "inherit", stderr: "inherit" });
  const code = await proc.exited;
  if (code !== 0) throw new Error(`Falhou (código ${code}): ${command.join(" ")}`);
}

async function listArtifacts(target: Target): Promise<string[]> {
  try {
    const files = await readdir(join(process.cwd(), "artifacts"));
    return files.filter((file) => file.includes(ARTIFACT_PREFIX[target]));
  } catch {
    return [];
  }
}

const target = parseTarget();
const env = parseEnv();
const host = hostTarget();

if (target !== host) {
  console.error(
    [
      `Não dá para gerar a build de ${target} a partir de ${host}.`,
      "",
      "O Electrobun empacota binários nativos do sistema onde o build roda;",
      "não existe cross-compile. Para esse alvo você precisa de",
      `${HOW_TO_BUILD[target]}.`,
      "",
      "Na prática: use o workflow .github/workflows/build.yml, que roda cada",
      "alvo no runner nativo e publica o instalador como artefato.",
    ].join("\n"),
  );
  process.exit(1);
}

await run(["hutch", "electrobun", "prepare"]);
await run(["bunx", "vite", "build"]);
await run(["hutch", "electrobun", "build", `--env=${env}`]);

const artifacts = await listArtifacts(target);

console.log(`\nBuild de ${target} (${env}) pronta.`);
if (artifacts.length === 0) {
  console.log("Nenhum artefato encontrado em artifacts/ — confira o log acima.");
} else {
  console.log("Instalador e metadados em artifacts/:");
  for (const file of artifacts) console.log(`  ${file}`);
}
