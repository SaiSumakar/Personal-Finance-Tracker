import { useEffect } from "react";
import { Stack } from "expo-router";
import { migrateDatabase } from "../db/migrations";

export default function RootLayout() {

  useEffect(() => {
    migrateDatabase()
      .then(() => console.log("Database ready"))
      .catch(console.error);
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}