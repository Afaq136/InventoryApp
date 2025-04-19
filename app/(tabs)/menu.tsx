import React, { useState } from "react";
import { View, Text, Switch, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@darkModeContext";
import { Link, router } from "expo-router";
import SignOutButton from "@/components/SignOutButton";
import { getDynamicStyles } from "@styles";
import { useOrganization, useOrganizationList } from "@clerk/clerk-expo";

export default function Menu() {
  const { organization } = useOrganization();

  // https://clerk.com/docs/hooks/use-organization-list
  const { userInvitations } = useOrganizationList();

  const { darkMode, toggleDarkMode } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const theme = darkMode ? "dark" : "light";

  const styles = getStyles(theme);

  //These styles change dynamically based off of dark mode
  const dynamicStyles = getDynamicStyles(darkMode);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.push("/profile")}
        style={styles.profileCard}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>FL</Text>
        </View>
        <Text style={styles.cardText}>User Profile</Text>
      </TouchableOpacity>

      <Text style={styles.text}>MY WORKSPACES</Text>
      <TouchableOpacity
        style={dynamicStyles.card}
        onPress={() => router.push("workspace/ManageWorkspace")}
        disabled={!organization}
      >
        <Text style={styles.cardText}>Organization</Text>
        <Text style={styles.cardText}>
          {organization
            ? `${organization.membersCount} Contributor${
                organization.membersCount === 1 ? "" : "s"
              }`
            : "You have no active organization"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("workspace/join-workspace")}
        style={dynamicStyles.card}
      >
        <Text style={styles.cardText}>Join Organization</Text>
        <Text style={styles.cardText}>
          {organization
            ? `${userInvitations.count} Invitation${
                userInvitations.count === 1 ? "" : "s"
              }`
            : "You have no active organization"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("workspace/new-workspace")}
        style={dynamicStyles.card}
      >
        <Text style={styles.cardText}>Add New Organization</Text>
      </TouchableOpacity>

      <TouchableOpacity style={dynamicStyles.card}>
        <Text style={styles.cardText}>Archived Items</Text>
      </TouchableOpacity>

      <View style={dynamicStyles.card}>
        <Text style={styles.flexText}>Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: "#ccc", true: "#00bcd4" }}
          thumbColor={notificationsEnabled ? "#ccc" : "#f4f3f4"}
        />
      </View>
      <View style={dynamicStyles.card}>
        <Text style={styles.flexText}>Display</Text>
        <View style={styles.row}>
          <Text style={styles.text}>
            {darkMode ? "Dark Mode" : "Light Mode"}
          </Text>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: "#ccc", true: "#00bcd4" }}
            thumbColor={darkMode ? "#ccc" : "#f4f3f4"}
            style={{ marginLeft: 10 }} // Add spacing between the text and the Switch
          />
        </View>
      </View>
      <SignOutButton />
    </View>
  );
}

const getStyles = (theme: string) => {
  const isDarkMode = theme === "dark";

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#1F2937" : "#f5f5f5", // Updated dark mode background
      padding: 20,
    },
    headerText: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 4,
      color: isDarkMode ? "white" : "black",
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#00bcd4",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    avatarText: {
      color: "white",
    },
    profileCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDarkMode ? "#374151" : "#ffffff", // Slightly lighter dark gray for contrast
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
    },
    link: {
      color: "#00bcd4",
      fontWeight: "bold",
    },
    card: {
      backgroundColor: isDarkMode ? "#374151" : "#ffffff", // Match profile card in dark mode
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    cardText: {
      color: isDarkMode ? "white" : "black",
    },
    flexText: {
      flex: 1,
      color: isDarkMode ? "white" : "black",
    },
    text: {
      color: isDarkMode ? "white" : "black",
      marginTop: 4,
      marginBottom: 2,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    signOutButton: {
      backgroundColor: "#ff4d4d",
      paddingVertical: 10,
      borderRadius: 10,
      marginTop: 20,
    },
    signOutButtonText: {
      textAlign: "center",
      color: "white",
    },
  });
};
