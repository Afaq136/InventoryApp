import { Link, useNavigation } from "expo-router";
import React, { FormEventHandler, useLayoutEffect, useState } from "react";
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
  Alert,
} from "react-native";
import tw from "twrnc";
import { useTheme } from "@darkModeContext";
import {
  useUser,
  useOrganizationList,
  SignedIn,
  SignedOut,
  useAuth,
  isClerkAPIResponseError,
} from "@clerk/clerk-expo";
import { useOrganization } from "@clerk/clerk-expo";
import { getDynamicStyles } from "@styles";
import { Ionicons } from "@expo/vector-icons";

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

  const navigation = useNavigation();

  //Put a refresh button on the right side of the header
  //useLayoutEffect ensures the navigation bar updates before the UI is drawn
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        //Refresh Button
        <TouchableOpacity style={tw`p-2`} onPress={userMemberships.revalidate}>
          {/* Save Icon */}
          <Ionicons name="refresh" size={24} color="#00bcd4" style={tw`mx-2`} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  //The user's current active organization
  const { orgId } = useAuth();

  //The current user
  const { user } = useUser();

  if (!user) {
    return <Text>You aren't signed in</Text>;
  }

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
      Alert.alert("Success", `Created organization ${organizationName}`);

      console.log(res);

      // https://clerk.com/docs/hooks/use-organization-list#paginated-resources
      //Update the user memberships list
      userMemberships.revalidate();

      //Reset the organization name field
      setOrganizationName("");
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        Alert.alert("Unable to create organization", err.message);
      }
    }
  };

  const renderItem = ({ item }: any) => {
    //Check if the item's organization id matches the current active organization
    const isActive = orgId === item.organization.id;
    const isAdmin = item.role === "org:admin";
    return (
      <View
        style={isActive ? dynamicStyles.selectedFolder : dynamicStyles.folder}
      >
        <View style={dynamicStyles.row}>
          {isActive ? (
            <Text style={styles.activeText}>Active</Text>
          ) : (
            <Text style={dynamicStyles.textStyle}>Inactive</Text>
          )}
          {isAdmin && (
            <TouchableOpacity
              onPress={async () => {
                try {
                  await item.organization.removeMember(user.id);

                  if (userMemberships) {
                    userMemberships.revalidate();
                  }

                  Alert.alert(
                    "Success",
                    `Successfully removed ${item.publicUserData.identifier} from organization.`
                  );
                } catch (error: any) {
                  Alert.alert("Error", error.message || "Something went wrong");
                }
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="red" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => {
            if (isActive) {
              setActive({ organization: null });
            } else {
              setActive({ organization: item.organization.id });
            }
          }}
        >
          <Text style={[tw`text-lg font-semibold`, dynamicStyles.textStyle]}>
            {item.organization.name}
          </Text>
        </TouchableOpacity>

        <Text style={[dynamicStyles.textStyle, tw`font-bold`]}>Joined:</Text>
        <Text style={dynamicStyles.textStyle}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>

        <Text style={[dynamicStyles.textStyle, tw`font-bold`]}>Role:</Text>
        <Text style={dynamicStyles.textStyle}>{item.role}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[tw`flex-1`]}>
      <View style={dynamicStyles.containerStyle}>
        <Text style={[dynamicStyles.textStyle]}>
          You are signed in as {String(user.primaryEmailAddress)}
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
            <Text style={tw`text-white text-sm text-center`}>Create</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          placeholder="Organization Name"
          placeholderTextColor={placeholderTextColor}
          value={organizationName}
          onChangeText={setOrganizationName}
          style={[
            styles.input,
            { borderColor: inputBorderColor, color: inputTextColor },
          ]}
          maxLength={40}
        />

        <Text style={[tw`mt-4`, styles.title, dynamicStyles.textStyle]}>
          Joined Organizations
        </Text>
        {userMemberships?.data?.length > 0 ? (
          userMemberships.isFetching ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" />
              <Text>Loading...</Text>
            </View>
          ) : (
            <FlatList
              data={userMemberships.data}
              keyExtractor={(item: any) => item.id}
              renderItem={renderItem}
            />
          )
        ) : (
          <View style={styles.center}>
            <Text>No organizations found</Text>
          </View>
        )}
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
  addButton: {
    backgroundColor: "#00bcd4",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});
