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
import { useOrganization } from "@clerk/clerk-expo";
import { Alert } from "react-native";

export default function ManageWorkspace() {
  const { darkMode } = useTheme();

  const router = useRouter();

  const [workspaceName, setWorkspaceName] = useState("");
  const [contributors, setContributors] = useState(["User1", "User2"]);
  const [newContributor, setNewContributor] = useState("");

  const { isLoaded, organization } = useOrganization();

  if (!isLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  useEffect(() => {
    if (isLoaded && organization?.name) {
      setWorkspaceName(organization.name);
    }
  }, [isLoaded, organization]);

  const addContributor = () => {
    if (newContributor.trim()) {
      setContributors([...contributors, newContributor]);
      setNewContributor("");
    }
  };

  const removeContributor = (name: string) => {
    setContributors(contributors.filter((contributor) => contributor !== name));
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
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && { color: "white" }]}>
            Contributors
          </Text>
          <FlatList
            data={contributors}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.contributor,
                  darkMode && { backgroundColor: "#374151" },
                ]}
              >
                <Text style={darkMode ? { color: "white" } : {}}>{item}</Text>
                <TouchableOpacity onPress={() => removeContributor(item)}>
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />
          <TextInput
            placeholder="Invite Contributor"
            placeholderTextColor={darkMode ? "#9CA3AF" : "#666"}
            value={newContributor}
            onChangeText={setNewContributor}
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
            onPress={addContributor}
          >
            <Text style={tw`text-white`}>Add Contributor</Text>
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
