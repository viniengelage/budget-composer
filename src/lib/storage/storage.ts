import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Wrapper sobre o AsyncStorage.
 *
 * Nenhuma feature importa `@react-native-async-storage/async-storage`
 * diretamente. Trocar a persistência (SQLite, arquivo em disco, etc.)
 * deve custar a reescrita deste arquivo e de mais nada.
 */
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      // Dado corrompido não pode derrubar o app na inicialização.
      if (__DEV__) console.warn(`[storage] JSON inválido na chave "${key}"`);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};
