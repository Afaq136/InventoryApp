import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useTheme } from './../context/DarkModeContext'; 

export default function TabLayout() {
  const { darkMode } = useTheme(); 

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#00bcd4", 
        tabBarInactiveTintColor: darkMode ? "#888" : "#666", 
        tabBarStyle: {
          backgroundColor: darkMode ? "#121212" : "#fff", 
          borderTopColor: darkMode ? "#333" : "#ddd", 
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="th-list" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          title: "Items",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="file" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Locate",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="search" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="navicon" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
