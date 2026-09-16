// @hutch cli=0.27.0-canary.8 cottontail=0.7.0-canary.10
export default {
  packageManager: "bun",
  electrobun: {
    version: "2.0.2-beta.27",
  },
  scripts: {
    install: "bun install",
    ui: "bunx vite build",
    start: "hutch electrobun prepare && bunx vite build && hutch electrobun dev",
    dev: "hutch electrobun prepare && bunx vite build && hutch electrobun dev --watch",
    hmr: "hutch electrobun prepare && bunx vite --port 5173",
    "dev:hmr":
      'bunx concurrently -k -n vite,app -c cyan,green "hutch run hmr" "hutch run start"',
    build: "hutch electrobun prepare && bunx vite build && hutch electrobun build --env=stable",
    "build:canary":
      "hutch electrobun prepare && bunx vite build && hutch electrobun build --env=canary",
  },
};
