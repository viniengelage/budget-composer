#!/usr/bin/env bun
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
