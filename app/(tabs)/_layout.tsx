import { Ionicons } from "@expo/vector-icons";
import { Tabs, Link, useSegments } from "expo-router";
import { useEffect } from "react";
import { Image, Pressable, StyleSheet } from "react-native";

import { useProfileStore } from "@/features/profile/stores/profileStore";

function formatTitle(segment?: string) {
  if (!segment) return "";

  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getGreeting(name?: string) {
  const hour = new Date().getHours();

  let greeting = "Good evening";

  if (hour >= 5 && hour < 12) {
    greeting = "Good morning";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
  }

  return name ? `${greeting}, ${name}` : greeting;
}

export default function TabsLayout() {
  const segments = useSegments();
  const pictureUri = useProfileStore(
    (state) => state.data?.profile.picture_uri ?? null
  );
  const loadProfile = useProfileStore((state) => state.loadProfile);

  const preferredName = useProfileStore((state) => state.data?.profile.preferred_name ?? "User");

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const route = segments[segments.length - 1] ?? "(tabs)";

  let headerTitle = formatTitle(route);

  if (route === "(tabs)") {
    // Replace "John" with your actual user's name
    headerTitle = getGreeting(preferredName);
  } else if (route === "create") {
    headerTitle = "Create";
  }

  return (
    <Tabs
      screenOptions={{
        headerTitle,
        headerTitleAlign: "left",

        headerRight: () => (
          <Link href="/profile" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              style={{
                marginRight: 16,
              }}
            >
              {pictureUri ? (
                <Image
                  source={{ uri: pictureUri }}
                  style={styles.profilePicture}
                />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={30}
                  color="black"
                />
              )}
            </Pressable>
          </Link>
        ),

        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "gray",

        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="bar-chart-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="add-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="list-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="settings-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  profilePicture: {
    width: 34,
    height: 34,
    borderRadius: 20,
  },
});
