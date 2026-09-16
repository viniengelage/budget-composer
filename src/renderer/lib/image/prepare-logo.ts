const MAX_FILE_BYTES = 8 * 1024 * 1024;
const CANVAS_SIZE = 400;
const ACCEPTED = ["image/png", "image/jpeg"];

export type PrepareLogoResult =
  | { ok: true; dataUrl: string }
  | { ok: false; message: string };

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("decode-failed"));
    image.src = dataUrl;
  });
}

/**
 * Encaixa a imagem num quadrado de 400×400 sem esticar: imagem larga fica com
 * sobra nas laterais, exatamente como o PDF vai mostrar. Grava PNG para
 * preservar fundo transparente.
 *
 * Reduzir aqui, e não na hora de imprimir, mantém o banco pequeno — a logo
 * viaja junto com o registro da empresa em cada consulta.
 */
export async function prepareLogo(file: File): Promise<PrepareLogoResult> {
  if (!ACCEPTED.includes(file.type)) {
    return {
      ok: false,
      message: "Escolha uma imagem PNG ou JPG. Outros formatos não funcionam aqui.",
    };
  }

  if (file.size > MAX_FILE_BYTES) {
    return {
      ok: false,
      message: "Esta imagem é grande demais. Tente uma com menos de 8 MB.",
    };
  }

  try {
    const original = await readAsDataUrl(file);
    const image = await loadImage(original);

    if (image.width === 0 || image.height === 0) {
      return { ok: false, message: "Não consegui abrir esta imagem. Tente outra." };
    }

    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    const context = canvas.getContext("2d");
    if (!context) {
      return {
        ok: false,
        message: "Não consegui preparar a imagem neste computador. Tente outra.",
      };
    }

    const scale = Math.min(CANVAS_SIZE / image.width, CANVAS_SIZE / image.height);
    const width = image.width * scale;
    const height = image.height * scale;

    context.drawImage(
      image,
      (CANVAS_SIZE - width) / 2,
      (CANVAS_SIZE - height) / 2,
      width,
      height,
    );

    return { ok: true, dataUrl: canvas.toDataURL("image/png") };
  } catch {
    return {
      ok: false,
      message: "Não consegui abrir esta imagem. Tente outra, em PNG ou JPG.",
    };
  }
}
