import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { migrateDatabase } from "../src/database/migrations";
import { Colors } from "../src/theme/colors";

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
      <Stack.Screen
        name="profile"
        options={{
          headerShown: true,
          headerTitle: "Profile",
          headerTitleAlign: "left",
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
