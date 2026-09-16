/**
 * Autolinking do React Native Windows.
 *
 * Declara o projeto nativo para o `react-native autolink-windows` gerar as
 * referências em windows/MyApp/AutolinkedNativeModules.g.*. Sem isto o módulo
 * compila mas nunca é registrado no runtime.
 *
 * `windows` só: em macOS este pacote não tem nada a oferecer, e declarar
 * plataformas que não existem confunde o CLI.
 */
module.exports = {
  dependency: {
    platforms: {
      windows: {
        sourceDir: "windows",
        solutionFile: "RnwSqlite.sln",
        projects: [
          {
            projectFile: "RnwSqlite/RnwSqlite.vcxproj",
            directDependency: true,
            projectName: "RnwSqlite",
          },
        ],
      },
      ios: null,
      macos: null,
      android: null,
    },
  },
};
