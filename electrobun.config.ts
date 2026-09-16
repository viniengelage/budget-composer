import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "Orcamentos Grameira",
    identifier: "br.com.grameira.orcamentos",
    version: "1.0.0",
  },
  /*
   * Onde o app instalado procura atualização. São arquivos estáticos: o
   * workflow publica o conteúdo de `artifacts/` numa Release, e o updater monta
   * as URLs a partir daqui.
   *
   * ATENÇÃO: enquanto o repositório for privado, esta URL responde 404 sem
   * autenticação e a atualização automática não funciona — o app continua
   * normal, só nunca encontra versão nova. Ver README, seção "Atualização
   * automática".
   */
  release: {
    baseUrl: "https://github.com/viniengelage/budget-composer/releases/latest/download",
    generatePatch: true,
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
