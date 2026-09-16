import { ApplicationMenu } from "electrobun/main";

import { APP_NAME } from "@shared/app-info";

/**
 * No macOS, Cmd+C / Cmd+V / Cmd+Z só funcionam se existir um item de menu
 * ligado à ação nativa correspondente: o sistema traduz a tecla consultando o
 * menu, não o campo de texto. Sem menu, colar no app simplesmente não faz nada.
 *
 * No Windows isso não é necessário — o WebView2 trata os atalhos de edição
 * internamente — e um menu ali apareceria dentro da janela, criando uma barra
 * que não existe no desenho. Por isso a checagem de plataforma: é a única forma
 * de expressar essa diferença, ela não cabe na configuração de build.
 */
export function installApplicationMenu(): void {
  if (process.platform !== "darwin") return;

  ApplicationMenu.setApplicationMenu([
    {
      label: APP_NAME,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "showAll" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Editar",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteAndMatchStyle" },
        { role: "delete" },
        { type: "separator" },
        { role: "selectAll" },
      ],
    },
    {
      label: "Janela",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        { role: "toggleFullScreen" },
        { type: "separator" },
        { role: "close" },
      ],
    },
  ]);
}
