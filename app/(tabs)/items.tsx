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
  Switch,
} from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { addCategory, importItems, removeItem } from "@itemsService";
import { useRouter } from "expo-router";
import { useTheme } from "@darkModeContext";
import { getDynamicStyles } from "@styles";
import { ItemsByFolder } from "@/types/types";
import FolderList from "@/components/folderList";
import { useOrganization, useUser } from "@clerk/clerk-expo";
import { Keyboard } from "react-native";
import { useItemStats } from "@itemStatsContext";

const FILTER_OPTIONS = ["Category", "Name", "Location", "Tags", "Low Stock"];

export default function Items() {
  const { darkMode } = useTheme();

  //These styles change dynamically based off of dark mode
  const dynamicStyles = getDynamicStyles(darkMode);

  // https://clerk.com/docs/hooks/use-organization
  const { isLoaded, organization, membership } = useOrganization();

  const isAdmin = membership?.role === "org:admin";

  //The current user
  const { user } = useUser();

  const router = useRouter();

  const { itemsByFolder } = useItemStats();

  const [newCategory, setNewCategory] = useState<string>("");

  // selectedFolder stores the name of the currently selected folder.
  const [selectedFolder, setSelectedFolder] = useState<string>("");

  // modalVisible controls the visibility of the modal for adding new folders or items.
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  //Add or remove filters from the selected filters array
  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((item) => item !== filter)
        : [...prev, filter]
    );
  };

  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [filteredItems, setFilteredItems] = useState<ItemsByFolder>({});

  //Filter the items based on the search query
  useEffect(() => {
    const newFilteredItems: ItemsByFolder = {};

    if (!searchQuery.trim()) {
      // Handle "Low Stock" filter when no search query
      if (selectedFilters.includes("Low Stock")) {
        Object.keys(itemsByFolder).forEach((folderName) => {
          const filtered = itemsByFolder[folderName].filter(
            (item) => item.quantity < item.minLevel
          );

          if (filtered.length > 0) {
            newFilteredItems[folderName] = filtered;
          }
        });
      } else {
        setFilteredItems(itemsByFolder); // Reset if no search query and "Low Stock" not selected
        return;
      }
    } else {
      const query = searchQuery.toLowerCase();

      Object.keys(itemsByFolder).forEach((folderName) => {
        const filtered = itemsByFolder[folderName].filter((item) => {
          const isLowStock = item.quantity < item.minLevel;
          if (selectedFilters.includes("Low Stock") && !isLowStock) {
            return false;
          }

          let categoryMatch = false;
          let nameMatch = false;
          let locationMatch = false;
          let tagMatch = false;

          if (selectedFilters.includes("Category")) {
            categoryMatch = item.category.toLowerCase().includes(query);
          }

          if (selectedFilters.includes("Name")) {
            nameMatch = item.name.toLowerCase().includes(query);
          }

          if (selectedFilters.includes("Location")) {
            locationMatch = item.location.toLowerCase().includes(query);
          }

          if (selectedFilters.includes("Tags")) {
            tagMatch = item.tags.some((tag) =>
              tag.toLowerCase().includes(query)
            );
          }

          const attributeMatch =
            categoryMatch || nameMatch || locationMatch || tagMatch;

          return attributeMatch;
        });

        if (filtered.length > 0) {
          newFilteredItems[folderName] = filtered;
        }
      });
    }

    setFilteredItems(newFilteredItems);
  }, [itemsByFolder, searchQuery, selectedFilters]);

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

  const noSearchResults = Object.keys(filteredItems).length === 0;
  const emptyInventory = Object.keys(itemsByFolder).length === 0;

  const totalItems = Object.values(itemsByFolder).reduce(
    (sum, items) => sum + items.length,
    0
  );

  const totalFilteredItems = Object.values(filteredItems).reduce(
    (sum, items) => sum + items.length,
    0
  );

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

        {!emptyInventory ? (
          <>
            {/* Search Bar */}
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

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Ionicons
                  name={showFilters ? "filter" : "filter-outline"}
                  size={24}
                  color="#00bcd4"
                />
              </TouchableOpacity>
            </View>

            {/* Filters */}
            {showFilters && (
              <View style={dynamicStyles.greyContainer}>
                <Text
                  style={[
                    tw`text-lg font-semibold mb-3 text-center`,
                    dynamicStyles.textStyle,
                  ]}
                >
                  Filter by attributes:
                </Text>
                {FILTER_OPTIONS.map((option) => (
                  <View key={option} style={styles.switchContainer}>
                    <Switch
                      value={selectedFilters.includes(option)}
                      onValueChange={() => toggleFilter(option)}
                    />
                    <Text style={[tw`mx-2`, dynamicStyles.textStyle]}>
                      {option}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <View style={dynamicStyles.row}>
              {/* Selected Filters */}
              <Text style={dynamicStyles.textStyle}>
                Selected: {selectedFilters.join(", ")}
              </Text>

              {/* Total items display */}
              <Text style={dynamicStyles.textStyle}>
                {totalFilteredItems} / {totalItems} items displayed
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            {/* Empty inventory message */}
            <Ionicons name="document-text-outline" size={64} color="#00bcd4" />
            <Text style={[tw`text-lg mt-4`, darkMode && tw`text-white`]}>
              Your Inventory is Currently Empty
            </Text>

            {/* Import from file Button */}
            {isAdmin && (
              <TouchableOpacity
                style={styles.importButton}
                onPress={() => importItems(organization.id, user)}
              >
                <Text style={tw`text-blue-500`}>Import from File</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* No search results found message */}
        {noSearchResults && !emptyInventory && (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={64} color="#00bcd4" />
            <Text style={[tw`text-lg mt-4`, darkMode && tw`text-white`]}>
              No items found
            </Text>
          </View>
        )}

        {/* Folders list */}
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
            {isAddingCategory && isAdmin ? (
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
            {isAdmin && (
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
            )}
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
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
});
