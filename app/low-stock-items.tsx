import React, { useState, useEffect } from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import tw from "twrnc";

import { useTheme } from "@darkModeContext";
import { db } from "@firebaseConfig";

import { removeItem } from "@itemsService";

import { useItemStats } from "@itemStatsContext";
import FolderList from "@/components/folderList";
import { useOrganization } from "@clerk/clerk-expo";
import { getDynamicStyles } from "@styles";

export default function LowStockItems() {
  const { lowStockItemsByFolder } = useItemStats();

  // https://clerk.com/docs/hooks/use-organization
  const { isLoaded, organization } = useOrganization();

  // selectedFolder stores the name of the currently selected folder.
  const [selectedFolder, setSelectedFolder] = useState<string>("");

  const { darkMode } = useTheme();
  const router = useRouter();

  //These styles change dynamically based off of dark mode
  const dynamicStyles = getDynamicStyles(darkMode);

  if (!isLoaded) {
    return (
      <View style={dynamicStyles.center}>
        <ActivityIndicator size="large" />
        <Text style={dynamicStyles.textStyle}>Loading...</Text>
      </View>
    );
  }

  if (!organization) {
    return (
      <View style={dynamicStyles.containerStyle}>
        <Text style={dynamicStyles.textStyle}>
          You are not part of an organization.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[tw`flex-1 p-5`, darkMode ? tw`bg-black` : tw`bg-white`]}
    >
      <View
        style={[styles.container, darkMode && { backgroundColor: "#1F2937" }]}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={28}
              color={darkMode ? "#00bcd4" : "#00bcd4"}
            />
          </Pressable>
          <Text style={[styles.headerText, darkMode && { color: "white" }]}>
            Low Stock Items
          </Text>
        </View>

        {/* If there are low stock items, display them, otherwise show a no items message */}

        {Object.keys(lowStockItemsByFolder).length > 0 ? (
          <FlatList // Outer list of folders
            data={Object.keys(lowStockItemsByFolder)}
            keyExtractor={(folderName) => folderName} // Use folderName as the key
            renderItem={(
              { item: folderName } // Destructure the folderName from item
            ) => (
              <FolderList
                organizationID={organization.id}
                folderName={folderName}
                selectedFolder={selectedFolder}
                setSelectedFolder={setSelectedFolder}
                removeItem={removeItem}
                items={lowStockItemsByFolder[folderName]}
              />
            )}
            //End of outer list of folders
          />
        ) : (
          <View
            style={[
              styles.box,
              darkMode && { backgroundColor: "#374151", borderColor: "white" },
            ]}
          >
            <Text
              style={[
                tw`text-black-500 text-lg`,
                darkMode && { color: "white" },
              ]}
            >
              No low stock items
            </Text>
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
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: "100%",
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 10,
  },
  headerText: {
    fontSize: 24,
    color: "#06b6d4",
  },
  box: {
    borderWidth: 1,
    borderColor: "#4A90E2",
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 20,
    alignItems: "center",
  },
  itemContainer: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#f7f7f7",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00bcd4",
  },
  itemDetails: {
    fontSize: 14,
    color: "#333",
  },
});
