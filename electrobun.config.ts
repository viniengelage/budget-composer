import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "Orcamentos Grameira",
    identifier: "br.com.grameira.orcamentos",
    version: "1.0.0",
  },
  build: {
    mainProcess: "cottontail",
    cottontail: {
      entrypoint: "src/main/index.ts",
    },
    copy: {
      "dist/index.html": "views/mainview/index.html",
      "dist/assets": "views/mainview/assets",
    },
    watchIgnore: ["dist/**"],
    mac: {
      bundleCEF: false,
      icons: "assets/icon.iconset",
    },
    win: {
      bundleCEF: false,
      // O Hutch converte o PNG para .ico e embute no executável e no instalador.
      icon: "assets/icon.png",
    },
    linux: {
      bundleCEF: false,
      icon: "assets/icon.png",
    },
  },
} satisfies ElectrobunConfig;
