#include "pch.h"
#include <NativeModules.h>

#include "ReactPackageProvider.h"
#if __has_include("ReactPackageProvider.g.cpp")
#include "ReactPackageProvider.g.cpp"
#endif

#include "RnwSqlite.h"

using namespace winrt::Microsoft::ReactNative;

namespace winrt::RnwSqlite::implementation {

void ReactPackageProvider::CreatePackage(
    IReactPackageBuilder const& packageBuilder) noexcept {
  // `true` = registra tambem como turbo module na nova arquitetura, para o
  // TurboModuleRegistry do lado JS conseguir encontrar.
  AddAttributedModules(packageBuilder, true);
}

}  // namespace winrt::RnwSqlite::implementation
