import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "scanner.access-token";

const ensureNativeSecureStore = () => {
  if (Platform.OS === "web")
    throw new Error(
      "Scanner authentication requires secure device storage on iOS or Android.",
    );
};

export async function readScannerToken(): Promise<string | null> {
  if (Platform.OS === "web") return null;
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveScannerToken(token: string): Promise<void> {
  ensureNativeSecureStore();
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearScannerToken(): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function clearScannerCredentials(): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
