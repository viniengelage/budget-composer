import { Platform } from "react-native";

import { type DatabaseDriver } from "@/lib/db/types";

/**
 * Fallback de plataforma.
 *
 * O Metro resolve `driver.macos.ts` no macOS e `driver.windows.ts` no Windows
 * (extensões de plataforma). Este arquivo só é escolhido em iOS, Android ou
 * web — alvos que este app não suporta.
 *
 * Falhar alto e claro aqui é melhor do que cair num driver errado em silêncio.
 */
export const driver: DatabaseDriver = {
  async open() {
    throw new Error(
      `Banco de dados não implementado para a plataforma "${Platform.OS}". ` +
        "Este app roda em macOS e Windows.",
    );
  },
};
