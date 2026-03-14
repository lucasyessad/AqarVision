import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../lib/auth-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0F1B2D" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "bold" },
          contentStyle: { backgroundColor: "#0F1B2D" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/login"
          options={{ title: "Connexion", presentation: "modal" }}
        />
        <Stack.Screen
          name="auth/signup"
          options={{ title: "Inscription", presentation: "modal" }}
        />
        <Stack.Screen
          name="listing/[id]"
          options={{ title: "Annonce" }}
        />
      </Stack>
    </AuthProvider>
  );
}
