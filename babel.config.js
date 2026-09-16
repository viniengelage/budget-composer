module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "@modules": "./modules",
          },
          extensions: [
            ".ios.ts",
            ".android.ts",
            ".macos.ts",
            ".windows.ts",
            ".ts",
            ".ios.tsx",
            ".android.tsx",
            ".macos.tsx",
            ".windows.tsx",
            ".tsx",
            ".js",
            ".jsx",
            ".json",
          ],
        },
      ],
    ],
  };
};
