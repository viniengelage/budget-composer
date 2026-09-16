#!/usr/bin/env bun
/**
 * Alinha o MACOSX_DEPLOYMENT_TARGET de todos os pods ao do app.
 *
 * POR QUE ISTO EXISTE
 * Vários pods (RNSVG, AsyncStorage, EXConstants…) declaram deployment target
 * 10.14–11.0 nos seus podspecs. O Xcode 26+ aceita no mínimo 12.0 e falha o
 * build com:
 *
 *   error: The macOS deployment target 'MACOSX_DEPLOYMENT_TARGET' is set to
 *   11.0, but the range of supported deployment target versions is 12.0 to 27.0
 *
 * Atinge principalmente os *resource bundle targets* que o CocoaPods cria para
 * os privacy manifests — eles não herdam a configuração do app.
 *
 * POR QUE COMO SCRIPT, E NÃO EDITANDO O PODFILE
 * `macos/` é gerado pelo prebuild (CNG) e está no .gitignore. Qualquer edição
 * manual ali evapora no próximo prebuild. Este patch é idempotente e roda
 * automaticamente dentro de `bun run build`.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const PODFILE = join(ROOT, "macos", "Podfile");
const MARKER = "# [orcamentos] deployment target alignment";
const DEPLOYMENT_TARGET = "14.0";

const PATCH = `
    ${MARKER}
    installer.pods_project.targets.each do |t|
      t.build_configurations.each do |c|
        current = c.build_settings['MACOSX_DEPLOYMENT_TARGET']
        if current.nil? || current.to_f < ${DEPLOYMENT_TARGET}
          c.build_settings['MACOSX_DEPLOYMENT_TARGET'] = '${DEPLOYMENT_TARGET}'
        end
      end
    end
    installer.pods_project.build_configurations.each do |c|
      c.build_settings['MACOSX_DEPLOYMENT_TARGET'] = '${DEPLOYMENT_TARGET}'
    end
`;

export async function patchMacosPods(): Promise<
  "patched" | "already-patched" | "skipped"
> {
  if (!existsSync(PODFILE)) return "skipped";

  const podfile = Bun.file(PODFILE);
  const original = await podfile.text();

  if (original.includes(MARKER)) return "already-patched";

  const anchor = "react_native_post_install(installer)";
  if (!original.includes(anchor)) {
    throw new Error(
      `Não encontrei "${anchor}" no Podfile do macOS. ` +
        "O template do expo-desktop mudou — revise scripts/patch-macos-pods.ts.",
    );
  }

  await Bun.write(PODFILE, original.replace(anchor, anchor + "\n" + PATCH));
  return "patched";
}

if (import.meta.main) {
  const result = await patchMacosPods();
  console.log(`Podfile do macOS: ${result}`);
}
