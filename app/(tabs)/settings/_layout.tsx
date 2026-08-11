import { Stack } from "expo-router";

import { Colors } from "../../../constants/colors";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTintColor: Colors.text,
        headerTitleAlign: "left",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="appearance"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="transactions"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="budget"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="accounts"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="categories"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="notifications"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="data-backup"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="about" options={{ headerShown: false }} />
    </Stack>
  );
}
