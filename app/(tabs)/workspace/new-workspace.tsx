import { Link } from "expo-router";
import React, { FormEventHandler, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Button,
  FlatList,
} from "react-native";
import tw from "twrnc";
import { useTheme } from "@darkModeContext";
import {
  useUser,
  useOrganizationList,
  SignedIn,
  SignedOut,
  useAuth,
} from "@clerk/clerk-expo";
import { useOrganization } from "@clerk/clerk-expo";
import { getDynamicStyles } from "@styles";

export default function NewWorkspace() {
  const { darkMode } = useTheme();

  //These styles change dynamically based off of dark mode
  const dynamicStyles = getDynamicStyles(darkMode);

  const backgroundColor = darkMode ? "#1F2937" : "#ffffff";
  const textColor = darkMode ? "#ffffff" : "#000000";
  const inputBorderColor = darkMode ? "#444444" : "#ccc";
  const inputTextColor = darkMode ? "#ffffff" : "#000000";
  const placeholderTextColor = darkMode ? "#bbbbbb" : "#666666";

  const [organizationName, setOrganizationName] = useState("");

  // https://clerk.com/docs/hooks/use-organization
  const { organization } = useOrganization();

  // https://clerk.com/docs/hooks/use-organization-list
  const { isLoaded, setActive, createOrganization, userMemberships } =
    useOrganizationList({
      userMemberships: {
        // Set pagination parameters
        infinite: true,
      },
    });

  const { orgId } = useAuth();

  const { user } = useUser();

  if (!isLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }
  const handleSubmit = async () => {
    try {
      const res = await createOrganization({
        name: organizationName,
      });

      console.log(res);
      setOrganizationName("");
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const renderItem = ({ item }: any) => {
    const isActive = orgId === item.organization.id;

    return (
      <View style={styles.card}>
        <Text style={styles.label}>Identifier:</Text>
        <Text>{item.publicUserData.identifier}</Text>

        <Text style={styles.label}>Organization:</Text>
        <Text>{item.organization.name}</Text>

        <Text style={styles.label}>Joined:</Text>
        <Text>{new Date(item.createdAt).toLocaleDateString()}</Text>

        <Text style={styles.label}>Role:</Text>
        <Text>{item.role}</Text>

        <View style={styles.buttonContainer}>
          {isActive ? (
            <Text style={styles.activeText}>Currently active</Text>
          ) : (
            <Button
              title="Set as active"
              onPress={() => setActive({ organization: item.organization.id })}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor }]}>
      <View style={styles.container}>
        <SignedIn>
          <Text>
            You are signed in as {user?.emailAddresses[0].emailAddress}
          </Text>
          {/* Display the organization name, otherwise display a message*/}
          {organization ? (
            <Text style={[tw`text-xl font-bold`, dynamicStyles.textStyle]}>
              {organization?.name}
            </Text>
          ) : (
            <Text style={dynamicStyles.textStyle}>
              No active organization is set
            </Text>
          )}
          <View style={styles.header}>
            <Text style={[styles.headerText, { color: textColor }]}>
              New Organization
            </Text>
            <TouchableOpacity
              onPress={handleSubmit}
              style={tw`bg-blue-500 text-white py-2 px-6 rounded-lg mb-4`}
            >
              <Text style={tw`text-white text-sm text-center`}>Next</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            placeholder="Business Name"
            placeholderTextColor={placeholderTextColor}
            value={organizationName}
            onChangeText={setOrganizationName}
            style={[
              styles.input,
              { borderColor: inputBorderColor, color: inputTextColor },
            ]}
            maxLength={40}
          />
          <Text style={styles.title}>Joined Organizations</Text>
          {userMemberships?.data?.length > 0 ? (
            <FlatList
              data={userMemberships.data}
              keyExtractor={(item: any) => item.id}
              renderItem={renderItem}
            />
          ) : (
            <View style={styles.center}>
              <Text>No organizations found</Text>
            </View>
          )}
        </SignedIn>
        <SignedOut>
          <Text>You are signed out</Text>
        </SignedOut>
      </View>
    </SafeAreaView>
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
  headerText: {
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#f1f1f1",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  label: {
    fontWeight: "bold",
  },
  buttonContainer: {
    marginTop: 10,
  },
  activeText: {
    color: "green",
    fontWeight: "500",
  },
});
