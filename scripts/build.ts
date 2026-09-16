#!/usr/bin/env bun
/**
 * Build de release para desktop.
 *
 *   bun run build              -> detecta o SO e builda o alvo possível
 *   bun run build:macos        -> força macOS  (exige macOS + Xcode)
 *   bun run build:windows      -> força Windows (exige Windows + Visual Studio)
 *
 * LIMITAÇÃO REAL, não contornável: react-native-macos compila só em macOS
 * (Xcode) e react-native-windows só em Windows (MSBuild/VS). Não existe
 * cross-compile. Para gerar os dois a partir de uma máquina só, use o
 * workflow em .github/workflows/build.yml, que roda cada alvo no runner
 * correspondente.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

import { patchMacosPods } from "./patch-macos-pods";

const ROOT = join(import.meta.dir, "..");
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

/**
 * As pastas nativas são geradas (CNG) e ficam fora do git, então uma
 * máquina limpa ou um runner de CI sempre precisa do prebuild antes.
 */
async function ensureNativeProject(platform: Platform): Promise<void> {
  const marker = platform === "macos" ? MACOS_WORKSPACE : WINDOWS_SOLUTION;
  if (existsSync(join(ROOT, marker))) return;

  await run(
    [
      "bunx",
      "expo-desktop@beta",
      "prebuild",
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

  // Ver scripts/patch-macos-pods.ts para o porquê.
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
  await run(
    ["bunx", "react-native", "build-windows", "--release", "--arch", "x64", "--logging"],
    "Compilando o app Windows (Release x64)",
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
