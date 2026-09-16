export type PrintOutcome = "printed" | "unavailable";

function imageSettled(image: HTMLImageElement): Promise<void> {
  if (image.complete) return Promise.resolve();

  return new Promise((resolve) => {
    const done = () => resolve();
    image.addEventListener("load", done, { once: true });
    image.addEventListener("error", done, { once: true });
  });
}

function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/**
 * Manda o documento para a impressão só depois que ele está de fato desenhado.
 * `window.print()` fotografa a página no instante em que roda: se a logo ainda
 * não decodificou, ela simplesmente não sai no PDF — e a pessoa descobre isso
 * depois de entregar o papel ao cliente.
 *
 * O retorno diz se a impressão realmente abriu. Nem todo webview implementa
 * `window.print()`: no WebView2 (Windows) ele abre o diálogo do sistema, mas no
 * WKWebView (macOS) a chamada não faz nada, porque o Electrobun não implementa
 * o delegate nativo de impressão. Em vez de adivinhar o sistema operacional,
 * escutamos o evento `beforeprint` — quem imprime, dispara; quem não imprime,
 * não dispara. `window.print()` é bloqueante, então na volta já sabemos.
 */
export async function printWhenReady(container: HTMLElement): Promise<PrintOutcome> {
  const images = Array.from(container.querySelectorAll("img"));
  await Promise.all(images.map(imageSettled));

  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Fonte indisponível não impede a impressão: o fallback do sistema serve.
    }
  }

  await nextPaint();

  let started = false;
  const markStarted = () => {
    started = true;
  };

  window.addEventListener("beforeprint", markStarted);
  try {
    window.print();
  } finally {
    window.removeEventListener("beforeprint", markStarted);
  }

  return started ? "printed" : "unavailable";
}
