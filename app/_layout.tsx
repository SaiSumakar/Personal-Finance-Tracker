import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { migrateDatabase } from "../src/database/migrations";

export default function RootLayout() {
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);

  useEffect(() => {
    migrateDatabase()
      .then(() => console.log("Database ready"))
      .catch(console.error)
      .finally(() => setIsDatabaseReady(true));
  }, []);

  if (!isDatabaseReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
