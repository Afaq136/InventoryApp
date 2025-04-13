import { Link } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import tw from "twrnc";
import { useTheme } from "@darkModeContext";
import { useOrganizationList, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

export default function JoinWorkspace() {
  const { darkMode } = useTheme();

  // https://clerk.com/docs/hooks/use-organization-list
  const { isLoaded, userInvitations } = useOrganizationList({
    userInvitations: {
      // Set pagination parameters
      infinite: true,
    },
  });

  //The current user
  const { user } = useUser();

  if (!user) {
    return <Text>You aren't signed in</Text>;
  }

  if (!isLoaded || userInvitations.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderUserInvite = ({ item }: any) => {
    return (
      <View style={styles.contributor}>
        <Text>{item.emailAddress}</Text>
        <Text>{item.publicOrganizationData.name}</Text>
        <Text>{item.role}</Text>
        <TouchableOpacity
          onPress={async () => {
            try {
              await item.accept();

              userInvitations.revalidate();

              Alert.alert(
                "Success",
                `Accepted ${item.publicOrganizationData.name}'s invite`
              );
            } catch (error: any) {
              Alert.alert("Error", error.message || "Something went wrong");
            }
          }}
        >
          <Ionicons name="checkbox-outline" size={20} color="green" />
        </TouchableOpacity>
      </View>
    );
  };

  const backgroundColor = darkMode ? "#1F2937" : "#ffffff";
  const textColor = darkMode ? "#ffffff" : "#000000";
  const infoTextColor = darkMode ? "#888" : "#888";
  const borderColor = darkMode ? "#444444" : "#ccc";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* User Invitation List */}
      {userInvitations.data && userInvitations.data.length > 0 ? (
        <>
          <Text style={[styles.title, darkMode && { color: "white" }]}>
            Invitations
          </Text>
          <FlatList
            data={userInvitations.data}
            keyExtractor={(item: any) => item.id}
            renderItem={renderUserInvite}
          />
        </>
      ) : (
        <Text style={[darkMode && { color: "white" }]}>
          You have no organization invites.
        </Text>
      )}
      <TouchableOpacity
        style={[styles.addButton, darkMode && { backgroundColor: "#0284c7" }]}
        onPress={userInvitations.revalidate}
        disabled={userInvitations.isFetching || userInvitations.isLoading}
      >
        <Text style={tw`text-white`}>Update Invitations</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cancelText: {
    color: "blue",
  },
  nextText: {
    color: "blue",
  },
  headerText: {
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoText: {
    color: "#888",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contributor: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 5,
  },
  addButton: {
    backgroundColor: "#00bcd4",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});
