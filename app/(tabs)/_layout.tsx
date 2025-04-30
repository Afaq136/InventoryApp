import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, router } from "expo-router";
import { useTheme } from "@darkModeContext";
import { getDynamicStyles } from "@styles";
import { Alert, TouchableOpacity } from "react-native";
import tw from "twrnc";
import Ionicons from "@expo/vector-icons/Ionicons"; // Assuming you're using Expo for icons
import { Text } from "react-native";
import { useAuth, useOrganization } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { View } from "react-native";

export default function TabLayout() {
  const { darkMode } = useTheme();
  const { isSignedIn } = useAuth();

  const { organization } = useOrganization();

  useEffect(() => {
    if (!isSignedIn) {
      Alert.alert("You are no longer signed in.");
      router.replace("/login");
    }
  }, [isSignedIn]);

  //Skip rendering if not signed in
  if (!isSignedIn) {
    return null;
  }

  //These styles change dynamically based off of dark mode
  const dynamicStyles = getDynamicStyles(darkMode);

  const tabBarBackgroundColor = darkMode ? "#1F2937" : "#ffffff";
  const tabBarInactiveTintColor = darkMode ? "#888" : "#999";
  const tabBarActiveTintColor = "#00bcd4";

  return (
    <Tabs
      // https://reactnavigation.org/docs/headers/#sharing-common-options-across-screens
      screenOptions={{
        tabBarActiveTintColor,
        tabBarInactiveTintColor,
        tabBarStyle: {
          backgroundColor: tabBarBackgroundColor,
        },
        headerTitleStyle: [
          dynamicStyles.headerTextStyle,
          dynamicStyles.blueTextStyle,
        ],
        headerTitleAlign: "center",
        headerStyle: dynamicStyles.dynamicHeaderStyle,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          href: organization ? undefined : null, // disables routing if no org
          title: "Dashboard",
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push("/notifications")}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#00bcd4"
                style={tw`mx-2`}
              />
            </TouchableOpacity>
          ),

          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="th-list" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          href: organization ? undefined : null, // disables routing if no org
          title: "Items",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="file" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: organization ? undefined : null, // disables routing if no org
          title: "Locations",
          headerRight: () => (
            <TouchableOpacity>
              <Ionicons
                name="add-circle-outline"
                size={24}
                color="#00bcd4"
                style={tw`mx-2`}
              />
            </TouchableOpacity>
          ),

          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="search" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          href: organization ? undefined : null, // disables routing if no org
          title: "Menu",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="navicon" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="addItems"
        options={{
          href: null,
          headerTitle: "Add Item",
          headerLeft: () => (
            //Back Button
            <TouchableOpacity
              style={tw`p-2`}
              onPress={() => router.push("/items")}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color="#00bcd4"
                style={tw`mx-2`}
              />
            </TouchableOpacity>
          ),
          headerRight: () => <Text>Loading...</Text>,
        }}
      />
      <Tabs.Screen
        name="edit_item/[id]"
        options={{
          href: null, //Don't include as a tab
          headerTitle: "Edit Item",
          headerLeft: () => (
            //Back Button
            <TouchableOpacity
              style={tw`p-2`}
              onPress={() => router.push("/items")}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color="#00bcd4"
                style={tw`mx-2`}
              />
            </TouchableOpacity>
          ),

          headerRight: () => <Text>Loading...</Text>,
        }}
      />
      <Tabs.Screen
        name="view_item_history/[id]"
        options={{
          href: null, //Don't include as a tab
          headerTitle: "Item History",
          headerLeft: () => (
            //Back Button
            <TouchableOpacity
              style={tw`p-2`}
              onPress={() => router.push("/items")}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color="#00bcd4"
                style={tw`mx-2`}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="workspace/join-workspace"
        options={{
          href: !organization ? undefined : null,
          headerTitle: "Organization Invites",
          title: "Invites",
          headerLeft: organization
            ? () => (
                //Back Button
                <TouchableOpacity
                  style={tw`p-2`}
                  onPress={() => router.push("/menu")}
                >
                  <Ionicons
                    name="arrow-back"
                    size={24}
                    color="#00bcd4"
                    style={tw`mx-2`}
                  />
                </TouchableOpacity>
              )
            : undefined,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="envelope" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workspace/new-workspace"
        options={{
          href: !organization ? undefined : null,
          headerTitle: () => (
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={{ fontSize: 16, fontWeight: "bold", color: "#00bcd4" }}
              >
                Add New Organization
              </Text>
            </View>
          ),
          title: "Organizations",
          headerLeft: organization
            ? () => (
                //Back Button
                <TouchableOpacity
                  style={tw`p-2`}
                  onPress={() => router.push("/menu")}
                >
                  <Ionicons
                    name="arrow-back"
                    size={24}
                    color="#00bcd4"
                    style={tw`mx-2`}
                  />
                </TouchableOpacity>
              )
            : undefined,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="th-list" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workspace/ManageWorkspace"
        options={{
          href: null,
          headerTitle: "Manage Organization",
          headerLeft: () => (
            //Back Button
            <TouchableOpacity
              style={tw`p-2`}
              onPress={() => router.push("/menu")}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color="#00bcd4"
                style={tw`mx-2`}
              />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
