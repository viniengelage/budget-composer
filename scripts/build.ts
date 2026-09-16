#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

import { patchMacosPods } from "./patch-macos-pods";

const ROOT = join(import.meta.dir, "..");
// Invocado por caminho, sob bun, e nunca via `bunx`.
//
// No macOS o `bunx` roda o CLI sob bun; no Windows o shim .cmd honra o
// shebang `#!/usr/bin/env node` e roda sob node — cujo loader ESM não
// enxerga os named exports de @expo/config-plugins, que é CJS. Chamar o
// arquivo direto com bun deixa o runtime igual nas duas plataformas.
//
// `--platform` também importa: sem ele o prebuild processa os mods da
// Apple, e o parser de pbxproj quebra sob bun.
const EXPO_DESKTOP_CLI = "node_modules/expo-desktop/build/cli.js";
const MACOS_WORKSPACE = "macos/BudgetComposer.xcworkspace";
const MACOS_SCHEME = "BudgetComposer-macOS";
const WINDOWS_SOLUTION = "windows/MyApp.sln";

type Platform = "macos" | "windows";

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function step(message: string): void {
  console.log(`\n▸ ${message}`);
}

async function run(command: string[], label: string): Promise<void> {
  step(label);
  console.log(`  $ ${command.join(" ")}`);

  const proc = Bun.spawn(command, { cwd: ROOT, stdout: "inherit", stderr: "inherit" });
  const exitCode = await proc.exited;

  if (exitCode !== 0) fail(`"${label}" falhou com código ${exitCode}.`);
}

async function ensureNativeProject(platform: Platform): Promise<void> {
  const marker = platform === "macos" ? MACOS_WORKSPACE : WINDOWS_SOLUTION;
  if (existsSync(join(ROOT, marker))) return;

  await run(
    [
      "bun",
      EXPO_DESKTOP_CLI,
      "prebuild",
      "--platform",
      platform,
      "--template",
      "expo-desktop-template-bare-minimum@beta",
    ],
    `Gerando projeto nativo (${marker} não existe)`,
  );

  if (!existsSync(join(ROOT, marker))) {
    fail(`O prebuild rodou mas ${marker} continua ausente.`);
  }
}

async function buildMacos(): Promise<void> {
  if (process.platform !== "darwin") {
    fail("Build de macOS exige macOS com Xcode. Rode em um runner macos-latest.");
  }

  await ensureNativeProject("macos");

  step("Alinhando deployment target dos pods");
  const patch = await patchMacosPods();
  console.log(`  Podfile: ${patch}`);
  if (patch === "patched") {
    await run(["pod", "install", "--project-directory=macos"], "Reinstalando pods");
  }

  await run(
    [
      "xcodebuild",
      "-workspace",
      MACOS_WORKSPACE,
      "-scheme",
      MACOS_SCHEME,
      "-configuration",
      "Release",
      "-derivedDataPath",
      "build/macos",
      "CODE_SIGNING_ALLOWED=NO",
      "build",
    ],
    "Compilando o app macOS (Release)",
  );

  console.log("\n✓ macOS pronto: build/macos/Build/Products/Release/BudgetComposer.app");
  console.log("  Binário universal (arm64 + x86_64), sem assinatura.");
  console.log(
    "  Para distribuir fora da sua máquina, assine com Developer ID e envie para notarização.",
  );
}

async function buildWindows(): Promise<void> {
  if (process.platform !== "win32") {
    fail(
      "Build de Windows exige Windows com Visual Studio (workload Desktop C++).\n" +
        "  Rode em um runner windows-latest — veja .github/workflows/build.yml.",
    );
  }

  await ensureNativeProject("windows");

  // Não existe comando `build-windows`. O RNW registra run-windows,
  // autolink-windows, codegen-windows, init-windows, config e health-check.
  // `--no-launch --no-deploy --no-packager` transforma o run em build puro,
  // que é o que um runner de CI precisa.
  // O RNW 0.81 pede o SDK 10.0.22621.0 por padrão, mas o runner só traz o
  // 10.0.26100.0 (medido no passo de diagnóstico do workflow). Sem este
  // override, MSB8036 derruba expo-desktop-modules-core, expo-desktop-stubs
  // e o nosso rnw-sqlite — nenhum deles compila no ambiente padrão.
  const sdkVersion = process.env.WINDOWS_SDK_VERSION ?? "10.0.26100.0";

  // O projeto Windows do @react-native-async-storage falha a verificacao de
  // dependencias transitivas do Windows App SDK 1.8. A propria mensagem de
  // erro aponta este flag como saida. E limitacao do modulo, nao nossa.
  const msbuildProps = [
    `WindowsTargetPlatformVersion=${sdkVersion}`,
    "WindowsAppSDKVerifyTransitiveDependencies=false",
    // O CLI faz `msbuildprops.split(",")` — ponto e vírgula não separa e
    // faz o valor inteiro virar uma única propriedade inválida.
  ].join(",");

  await run(
    [
      "bunx",
      "react-native",
      "run-windows",
      "--release",
      "--arch",
      "x64",
      "--no-launch",
      "--no-deploy",
      "--no-packager",
      "--logging",
      "--msbuildprops",
      msbuildProps,
    ],
    `Compilando o app Windows (Release x64, SDK ${sdkVersion})`,
  );

  console.log("\n✓ Windows pronto: windows/x64/Release/");
  console.log("  O pacote MSIX fica em windows/MyApp.Package/AppPackages/.");
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: { platform: { type: "string" } },
    allowPositionals: false,
  });

  const requested = values.platform as Platform | undefined;

  if (requested !== undefined && requested !== "macos" && requested !== "windows") {
    fail(`Plataforma inválida: "${requested}". Use "macos" ou "windows".`);
  }

  const platform: Platform =
    requested ?? (process.platform === "win32" ? "windows" : "macos");

  console.log(`\n🏗  Build de release — ${platform}`);

  if (platform === "macos") await buildMacos();
  else await buildWindows();
}

await main();
