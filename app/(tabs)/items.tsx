import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { fetchItemsByFolder, removeItem, ItemsByFolder } from "@itemsService";
import { useRouter } from "expo-router";
import { useTheme } from "../context/DarkModeContext";

export default function Items() {
  const { darkMode } = useTheme();
  const router = useRouter();

  const containerStyle = darkMode
    ? styles.containerDark
    : styles.containerLight;
  const textStyle = darkMode ? tw`text-white` : tw`text-gray-700`;

  // folders is an array of strings where each string represents a folder name.
  const [folders, setFolders] = useState<string[]>([]);

  // items is an object that stores items in each folder.
  // the initial value is an empty object, representing folders and no objects
  const [itemsByFolder, setItemsByFolder] = useState<ItemsByFolder>({});

  // newItemName is a string that represents the name of the new item the user wants to add.
  const [newItemName, setNewItemName] = useState<string>("");

  // newFolder is a string that represents the name of the new folder the user wants to create.
  const [newFolder, setNewFolder] = useState<string>("");

  // selectedFolder stores the name of the currently selected folder.
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>(
    undefined
  ); //The selected folder can be either a string, or undefined, representing no folder selected

  // modalVisible controls the visibility of the modal for adding new folders or items.
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [isAddingFolder, setIsAddingFolder] = useState<boolean>(false);

  const addFolder = () => {
    if (newFolder.trim()) {
      setFolders([...folders, newFolder]);

      // Create a new entry in the items object for the new folder with an empty array.
      setItemsByFolder({ ...itemsByFolder, [newFolder]: [] });

      // Clear the newFolder input field.
      setNewFolder("");
      setModalVisible(false);
    }
  };
  const loadItems = async () => {
    const { folders, itemsByFolder } = await fetchItemsByFolder();
    setFolders(folders);
    setItemsByFolder(itemsByFolder);
  };

  //Load items when component is initially rendered
  useEffect(() => {
    loadItems();
  }, []);

  return (
    <View style={containerStyle}>
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text style={[tw`text-xl font-bold mb-4`, textStyle]}>Items</Text>
        <TouchableOpacity style={styles.iconButton} onPress={loadItems}>
          <Ionicons name="refresh-outline" size={24} color="#00bcd4" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <TextInput placeholder="Search" style={styles.searchInput} />
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="qr-code-outline" size={24} color="#00bcd4" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="filter-outline" size={24} color="#00bcd4" />
        </TouchableOpacity>
      </View>

      {folders.length === 0 && (
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
        data={folders}
        keyExtractor={(folderName) => folderName} // Use folderName as the key
        renderItem={(
          { item: folderName } // Destructure the folderName from item
        ) => (
          <View // View for each folder
            style={[
              styles.folder,
              selectedFolder === folderName && styles.selectedFolder, // Apply different style when folder is selected
              darkMode && styles.folderDark,
              selectedFolder === folderName && styles.selectedFolder, // Apply different style when folder is selected
            ]}
          >
            <TouchableOpacity onPress={() => setSelectedFolder(folderName)}>
              <Text // Text for folder names
                style={[
                  tw`text-lg font-bold`,
                  selectedFolder === folderName && tw`text-cyan-500`, // Change text color when selected
                  darkMode && tw`text-white`,
                ]}
              >
                {folderName}
              </Text>
            </TouchableOpacity>
            {selectedFolder === folderName && (
              <FlatList // Inner list containing items for the selected folder
                data={itemsByFolder[folderName]} // Use folderName to get items from items object
                keyExtractor={(item) => item.id} // Use document id as key
                renderItem={({ item }) => (
                  <View style={[styles.item, darkMode && styles.itemDark]}>
                    <Text>
                      <Text style={[tw`font-bold`, textStyle]}>
                        {item.name}
                      </Text>
                      {"\n"}
                      <Text style={[tw`font-bold`, textStyle]}>
                        Stock:
                      </Text>{" "}
                      {item.quantity}/ {item.minLevel}
                      {"\n"}
                      <Text style={[tw`font-bold`, textStyle]}>
                        Price:
                      </Text>{" "}
                      {item.price}
                      {"\n"}
                      <Text style={[tw`font-bold`, textStyle]}>
                        Total Value:
                      </Text>
                      {item.totalValue}
                    </Text>

                    <TouchableOpacity
                      onPress={async () => {
                        const removed = await removeItem(item.id); //remove the item based on the item id
                        //only reload the page if items are actually removed
                        if (removed) {
                          loadItems();
                        }
                      }}
                    >
                      <Text style={tw`text-red-500`}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View> //End of view for each folder
        )}
        //End of outer list of folders
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setIsAddingFolder(false);
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
        <View style={styles.modalContainer}>
          {isAddingFolder ? (
            <>
              <TextInput
                placeholder="Enter folder name"
                value={newFolder}
                onChangeText={setNewFolder}
                style={tw`border border-gray-300 rounded-lg p-2 mb-4`}
              />
              <TouchableOpacity style={styles.addButton} onPress={addFolder}>
                <Text style={tw`text-white`}>Add Folder</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  router.push("../addItems");
                }}
              >
                <Text style={tw`text-white`}>Add Item</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsAddingFolder(!isAddingFolder)}
          >
            <Text style={tw`text-blue-500`}>
              {isAddingFolder ? "Switch to Add Item" : "Switch to Add Folder"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
    backgroundColor: "#121212",
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
  modalContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
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
