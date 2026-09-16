import { Platform } from "react-native";

import { type DatabaseDriver } from "@/lib/db/types";

export const driver: DatabaseDriver = {
  async open() {
    throw new Error(
      `Banco de dados não implementado para a plataforma "${Platform.OS}". ` +
        "Este app roda em macOS e Windows.",
    );
  },
};
