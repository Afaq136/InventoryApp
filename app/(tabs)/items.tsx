import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { addCategory, removeItem, subscribeToItems } from "@itemsService";
import { useRouter } from "expo-router";
import { useTheme } from "@darkModeContext";
import { getDynamicStyles } from "@styles";
import { ItemsByFolder } from "@/types/types";
import FolderList from "@/components/folderList";
import { useOrganization, useUser } from "@clerk/clerk-expo";
import { Keyboard } from "react-native";

export default function Items() {
  const { darkMode } = useTheme();

  //These styles change dynamically based off of dark mode
  const dynamicStyles = getDynamicStyles(darkMode);

  // https://clerk.com/docs/hooks/use-organization
  const { isLoaded, organization } = useOrganization();

  //The current user
  const { user } = useUser();

  const router = useRouter();

  // items is an object that stores items in each folder.
  // the initial value is an empty object, representing folders and no objects
  const [itemsByFolder, setItemsByFolder] = useState<ItemsByFolder>({});

  useEffect(() => {
    if (!organization?.id) {
      return;
    }

    //use setItemsByFolder as a callback to update itemsByFolder when the database is updated
    const unsubscribe = subscribeToItems(organization.id, setItemsByFolder);
    return () => unsubscribe(); // Clean up listener
  }, [organization?.id]);

  const [newCategory, setNewCategory] = useState<string>("");

  // selectedFolder stores the name of the currently selected folder.
  const [selectedFolder, setSelectedFolder] = useState<string>("");

  // modalVisible controls the visibility of the modal for adding new folders or items.
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [filteredItems, setFilteredItems] = useState<ItemsByFolder>({});

  //Filter the items based on the search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(itemsByFolder); // Reset if no search query
      return;
    }

    const newFilteredItems: ItemsByFolder = {};

    Object.keys(itemsByFolder).forEach((folderName) => {
      const filtered = itemsByFolder[folderName].filter((item) => {
        const query = searchQuery.toLowerCase();
        const nameMatch = item.name.toLowerCase().includes(query);
        const locationMatch = item.location?.toLowerCase().includes(query);
        return nameMatch || locationMatch;
      });

      if (filtered.length > 0) {
        newFilteredItems[folderName] = filtered;
      }
    });

    setFilteredItems(newFilteredItems);
  }, [itemsByFolder, searchQuery]);

  if (!isLoaded) {
    return (
      <View style={dynamicStyles.center}>
        <ActivityIndicator size="large" />
        <Text style={dynamicStyles.textStyle}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={dynamicStyles.containerStyle}>
        <Text style={dynamicStyles.textStyle}>You are not signed-in.</Text>
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

  const handleAddCategory = async () => {
    const formattedCategory = newCategory.trim();

    if (!formattedCategory) {
      Alert.alert("Please enter a category name");
      return;
    }

    try {
      const success = await addCategory(organization.id, formattedCategory);
      if (success) {
        Alert.alert("Success", `${formattedCategory} added successfully!`);
        setNewCategory("");
        setModalVisible(false);
      } else {
        Alert.alert(`${formattedCategory} already exists`);
      }
    } catch (error) {
      // Extract meaningful error message
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[dynamicStyles.containerStyle]}>
        <View style={dynamicStyles.header}>
          <Text style={[tw`text-xl font-bold`, dynamicStyles.textStyle]}>
            {organization.name}
          </Text>
          <Text style={[dynamicStyles.textStyle, tw`text-xs`]}>
            {organization.id}
          </Text>
        </View>
        <View
          style={[
            styles.searchContainer,
            darkMode && { backgroundColor: "#374151" },
          ]}
        >
          <TextInput
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, darkMode && { color: "#fff" }]} // Ensure text color is visible in dark mode
          />
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="qr-code-outline" size={24} color="#00bcd4" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="filter-outline" size={24} color="#00bcd4" />
          </TouchableOpacity>
        </View>

        {/*If there are no items show a message*/}
        {Object.keys(filteredItems).length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#00bcd4" />
            <Text style={[tw`text-lg mt-4`, darkMode && tw`text-white`]}>
              Your Inventory is Currently Empty
            </Text>
            <Text style={[darkMode && tw`text-white`]}>Add new items or</Text>
            <TouchableOpacity style={styles.importButton}>
              <Text style={tw`text-blue-500`}>Import from File</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList // Outer list of folders
          data={Object.keys(filteredItems)}
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
              items={filteredItems[folderName]}
            />
          )}
          //End of outer list of folders
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            setIsAddingCategory(false);
            setModalVisible(!modalVisible);
          }}
        >
          <Ionicons
            name={modalVisible ? "close" : "add"}
            size={24}
            color="white"
          />
        </TouchableOpacity>

        {modalVisible && (
          <View style={dynamicStyles.verticalButtonModalContainer}>
            {isAddingCategory ? (
              <>
                <TextInput
                  placeholder="Enter category name"
                  value={newCategory}
                  onChangeText={setNewCategory}
                  style={[dynamicStyles.textInputStyle, tw`mb-2`]}
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddCategory}
                >
                  <Text style={tw`text-white`}>Add Category</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    router.push({
                      pathname: "../addItems",
                      params: { selectedFolder: selectedFolder },
                    });

                    //Hide the modal navigating to add item screen
                    setModalVisible(false);
                  }}
                >
                  <Text style={tw`text-white`}>Add Item</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsAddingCategory(!isAddingCategory)}
            >
              <Text style={tw`text-blue-500`}>
                {isAddingCategory
                  ? "Switch to Add Item"
                  : "Switch to Add Category"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  containerLight: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  containerDark: {
    flex: 1,
    backgroundColor: "#1F2937",
    padding: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
  },
  iconButton: {
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  importButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#e0f7fa",
  },
  folder: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  folderDark: {
    backgroundColor: "#333",
  },
  selectedFolder: {
    backgroundColor: "#00695c",
  },
  item: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    marginLeft: 20,
  },
  itemDark: {
    backgroundColor: "#444",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#00bcd4",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#00bcd4",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  switchButton: {
    marginTop: 10,
    alignItems: "center",
  },
});
