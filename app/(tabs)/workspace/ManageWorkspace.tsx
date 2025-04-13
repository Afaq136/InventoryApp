import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { useRouter } from "expo-router";
import { useTheme } from "@darkModeContext";
import { useAuth, useUser, useOrganization } from "@clerk/clerk-expo";
import { Alert } from "react-native";
import { getDynamicStyles } from "@styles";

export default function ManageWorkspace() {
  const { darkMode } = useTheme();

  const dynamicStyles = getDynamicStyles(darkMode);

  const router = useRouter();

  const [workspaceName, setWorkspaceName] = useState("");

  const [newContributor, setNewContributor] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const { isLoaded, organization, invitations, memberships } = useOrganization({
    invitations: {
      // Set pagination parameters
      infinite: true,
    },
    memberships: {
      // Set pagination parameters
      infinite: true,
    },
  });

  //The user's current active organization
  const { orgId } = useAuth();

  //The current user
  const { user } = useUser();

  useEffect(() => {
    if (isLoaded && organization?.name) {
      setWorkspaceName(organization.name);
    }
  }, [organization]);

  if (!isLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }
  if (!user) {
    return <Text>You aren't signed in</Text>;
  }

  if (!organization) {
    return (
      <Text style={dynamicStyles.textStyle}>No active organization is set</Text>
    );
  }

  const handleInvite = async () => {
    if (newContributor.trim()) {
      try {
        setSubmitting(true);
        await organization.inviteMember({
          emailAddress: newContributor,
          role: "org:member",
        });
        if (invitations?.revalidate) {
          await invitations.revalidate();
        }
        setNewContributor("");
        Alert.alert(
          "Success",
          `Successfully sent an invitation to ${newContributor}!`
        );
      } catch (error: any) {
        Alert.alert("Error", error.message || "Something went wrong");
      } finally {
        setSubmitting(false);
      }
    } else {
      Alert.alert(`Please enter a valid email address`);
    }
  };

  const renderInvite = ({ item }: any) => {
    return (
      <View style={styles.contributor}>
        <Text>{item.emailAddress}</Text>
        <Text>{item.role}</Text>
        <TouchableOpacity
          onPress={async () => {
            try {
              await item.revoke();
              if (invitations?.revalidate) {
                await invitations.revalidate();
              }
              Alert.alert(
                "Success",
                `Successfully canceled ${item.emailAddress}'s invite`
              );
            } catch (error: any) {
              Alert.alert("Error", error.message || "Something went wrong");
            }
          }}
        >
          <Ionicons name="trash-outline" size={20} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[tw`flex-1 p-5`, darkMode ? tw`bg-black` : tw`bg-white`]}
    >
      <View
        style={[styles.container, darkMode && { backgroundColor: "#1F2937" }]}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && { color: "white" }]}>
            Organization Logo
          </Text>
          <TouchableOpacity style={styles.logoButton}>
            <Image
              source={{ uri: "https://via.placeholder.com/100" }}
              style={styles.logo}
            />
            <Text style={[tw`text-blue-500`, darkMode && { color: "#38bdf8" }]}>
              Change Logo
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && { color: "white" }]}>
            Workspace Name
          </Text>
          <TextInput
            value={workspaceName}
            onChangeText={setWorkspaceName}
            style={[
              styles.input,
              darkMode && {
                backgroundColor: "#374151",
                color: "white",
                borderColor: "white",
              },
            ]}
          />
          {workspaceName !== organization?.name && (
            <TouchableOpacity
              style={[
                styles.addButton,
                darkMode && { backgroundColor: "#0284c7" },
              ]}
              onPress={async () => {
                try {
                  await organization.update({ name: workspaceName });
                  Alert.alert(
                    "Success",
                    "Workspace name updated successfully!"
                  );
                } catch (error) {
                  Alert.alert("Error", "Failed to update workspace name.");
                  console.error(error);
                }
              }}
            >
              <Text style={tw`text-white`}>Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Membership List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && { color: "white" }]}>
            Members
          </Text>
          <FlatList
            data={memberships?.data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.contributor,
                  darkMode && { backgroundColor: "#374151" },
                ]}
              >
                <Text style={darkMode ? { color: "white" } : {}}>
                  {item.publicUserData.identifier}
                </Text>
                <Text>{item.role}</Text>
                <TouchableOpacity
                  onPress={() => {
                    try {
                      item.destroy();
                      Alert.alert(
                        "Success",
                        `Successfully removed ${item.publicUserData.identifier} from organization.`
                      );
                    } catch (error: any) {
                      Alert.alert(
                        "Error",
                        error.message || "Something went wrong"
                      );
                    }
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />
          {/* Invitation List */}
          {invitations?.data && invitations.data.length > 0 && (
            <>
              <Text
                style={[styles.sectionTitle, darkMode && { color: "white" }]}
              >
                Invitations
              </Text>
              <FlatList
                data={invitations.data}
                keyExtractor={(item: any) => item.id}
                renderItem={renderInvite}
              />
            </>
          )}
          <TextInput
            placeholder="Invite Contributor"
            placeholderTextColor={darkMode ? "#9CA3AF" : "#666"}
            value={newContributor}
            onChangeText={setNewContributor}
            editable={!isSubmitting}
            style={[
              styles.input,
              darkMode && {
                backgroundColor: "#374151",
                color: "white",
                borderColor: "white",
              },
            ]}
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              darkMode && { backgroundColor: "#0284c7" },
            ]}
            onPress={handleInvite}
            disabled={isSubmitting}
          >
            <Text style={tw`text-white`}>Send Invite</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#00bcd4",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  logoButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: "black",
    backgroundColor: "#fff",
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
