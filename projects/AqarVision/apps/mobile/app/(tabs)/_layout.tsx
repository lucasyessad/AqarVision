import { Tabs } from "expo-router";
import { Text } from "react-native";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Search: "\uD83D\uDD0D",
    Favorites: focused ? "\u2764\uFE0F" : "\u2661",
    Profile: "\uD83D\uDC64",
    Settings: "\u2699\uFE0F",
  };
  return (
    <Text style={{ fontSize: 22 }}>{icons[label] ?? "\u25CF"}</Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#0F1B2D",
          borderTopColor: "#1A2B45",
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: "#D4AF37",
        tabBarInactiveTintColor: "#8899AA",
        headerStyle: { backgroundColor: "#0F1B2D" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "AqarSearch",
          tabBarLabel: "Recherche",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Search" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favoris",
          tabBarLabel: "Favoris",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Favorites" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarLabel: "Profil",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Profile" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Parametres",
          tabBarLabel: "Parametres",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Settings" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
