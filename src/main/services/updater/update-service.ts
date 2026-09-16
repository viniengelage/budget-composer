import { Updater } from "electrobun/main";

import type { UpdateSnapshot, UpdateState } from "@shared/update";

/**
 * Espera antes da primeira checagem: abrir o programa precisa ser instantâneo,
 * e baixar atualização competindo com a primeira tela só faz a lista demorar.
 */
const FIRST_CHECK_DELAY_MS = 8000;

let state: UpdateState = "idle";
let availableVersion: string | null = null;
let running = false;

export function updateSnapshot(): UpdateSnapshot {
  return { state, version: availableVersion };
}

/**
 * Checa e já baixa. A pessoa só fica sabendo quando a atualização está pronta
 * para aplicar — avisar antes daria a ela a decisão de esperar um download,
 * que não é decisão dela para tomar.
 *
 * Falha em silêncio de propósito: internet fora, servidor fora do ar ou canal
 * `dev` não são problemas que a usuária possa resolver, e um alerta sobre isso
 * só assusta. O programa continua funcionando igual.
 */
export async function checkAndDownloadUpdate(): Promise<void> {
  if (running) return;
  running = true;

  try {
    state = "checking";

    const result = await Updater.checkForUpdate();
    if (!result.updateAvailable) {
      state = "idle";
      return;
    }

    availableVersion = result.version;
    state = "downloading";

    await Updater.downloadUpdate();

    state = Updater.updateInfo().updateReady ? "ready" : "idle";
  } catch {
    state = "idle";
    availableVersion = null;
  } finally {
    running = false;
  }
}

export function scheduleUpdateCheck(): void {
  setTimeout(() => void checkAndDownloadUpdate(), FIRST_CHECK_DELAY_MS);
}

/** Fecha o programa, troca os arquivos e abre a versão nova. */
export async function applyDownloadedUpdate(): Promise<void> {
  await Updater.applyUpdate();
}

export async function installedVersion(): Promise<string> {
  const info = await Updater.getLocalInfo();
  return info.version;
}
