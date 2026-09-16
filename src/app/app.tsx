import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";

import { AppProvider } from "@/app/provider";
import { Router } from "@/app/router";
import { color } from "@/styles/tokens";

export function App() {
  return (
    <AppProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <Router />
      </SafeAreaView>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg.canvas },
});
