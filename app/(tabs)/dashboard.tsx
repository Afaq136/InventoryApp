import React, { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import tw from "twrnc";
import { db } from "@firebaseConfig";
import { getFirestore, collection, getDocs, doc } from "firebase/firestore";
import * as DocumentPicker from "expo-document-picker"; // Use expo-document-picker
import * as Papa from "papaparse";
import { orderBy, limit, query } from "firebase/firestore";
import { useTheme } from "@darkModeContext";
import { getDynamicStyles } from "@styles";
import { useOrganization, useUser } from "@clerk/clerk-expo";
import { Item, ItemsByFolder } from "@/types/types"; // Import the Item type
import { subscribeToItems } from "@itemsService";
import { useItemStats } from "@itemStatsContext";
import { addItem } from "@itemsService"; // Assuming addItem is your method to add a new item to the database
//import { Item } from "@/types/types";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function Dashboard() {
  const {
    totalCategories,
    totalItems,
    totalQuantity,
    totalValue,
    recentlyEditedItems,
  } = useItemStats();

  const router = useRouter();

  // https://clerk.com/docs/hooks/use-organization
  const { isLoaded, organization } = useOrganization();

  //Don't display anything until Clerk completes initialization
  if (!isLoaded) {
    return;
  }

  const [organizationName, setOrganizationName] = useState<string>("");

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  //Update the displayed organization name based on the current active organization
  useEffect(() => {
    if (organization) {
      setOrganizationName(organization.name);
    }
  }, [organization?.name]);

  const { darkMode } = useTheme();

  //The current user
  const { user } = useUser();

  //These styles change dynamically based off of dark mode
  const dynamicStyles = getDynamicStyles(darkMode);

  const readFile = async (uri: string) => {
    try {
      const content = await FileSystem.readAsStringAsync(uri);
      return content;
    } catch (error) {
      console.error("Error reading file:", error);
      return "";
    }
  };

  const handleExport = async (organizationId: string) => {
    try {
      const orgRef = doc(db, "organizations", organizationId);
      const itemsCollection = collection(orgRef, "items");

      const snapshot = await getDocs(itemsCollection);

      const itemsData = snapshot.docs.map((doc) => {
        const item = doc.data() as Item;

        return {
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          price: item.price,
          tags: item.tags.join(","), // Join tags as comma-separated
          minLevel: item.minLevel,
          location: item.location,
          createdAt: item.createdAt?.toDate?.().toISOString?.() || "",
        };
      });

      if (itemsData.length === 0) {
        alert("No items to export.");
        return;
      }

      const csv = Papa.unparse(itemsData);
      const fileUri = `${FileSystem.documentDirectory}inventory_export.csv`;

      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log(`File saved at: ${fileUri}`);

      if (!(await Sharing.isAvailableAsync())) {
        alert("Sharing is not available on this device");
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: "Export Inventory Data",
      });
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  const handleImport = async (organizationId: string) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "text/csv", // Allow CSV files
      });

      if (res.canceled) {
        console.log("User canceled the picker");
        return;
      }

      const file = res.assets[0]; // Access the selected file
      console.log("Selected file:", file);

      // Fetch the file content
      const fileUri = file.uri;
      const fileContent = await readFile(fileUri); // We need a method to read the file

      // Parse the CSV content
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const items = result.data; // This will be an array of objects

          // Now, loop through each item and add it to the Firestore database
          items.forEach(async (item: any) => {
            const newItem = {
              name: item.name,
              category: item.category,
              quantity: parseInt(item.quantity), // Assuming quantity is an integer
              price: parseFloat(item.price), // Convert price to a float
              tags: item.tags.split(","), // Assuming tags are comma-separated
              minLevel: parseInt(item.minLevel), // Minimum level should be an integer
              location: item.location,
            };

            // Assuming addItem function inserts an item into the Firestore
            await addItem(organizationId, newItem); // This is where you insert it into Firestore
          });

          console.log("Items have been successfully imported!");
        },
        error: (error: { message: any }) => {
          console.error("Error parsing CSV:", error.message);
        },
      });
    } catch (err) {
      console.error("Error picking file:", err);
    }
  };

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

  return (
    <ScrollView style={dynamicStyles.containerStyle}>
      <View style={dynamicStyles.header}>
        {/* Display the organization name*/}
        <Text style={[tw`text-xl font-bold`, dynamicStyles.textStyle]}>
          {organizationName}
        </Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={[tw`text-lg`, dynamicStyles.textStyle]}>▼</Text>
        </TouchableOpacity>
      </View>

      <View style={dynamicStyles.actionContainer}>
        <TouchableOpacity
          onPress={() => router.push("/addItems")}
          style={[
            dynamicStyles.actionButton,
            { backgroundColor: darkMode ? "#374151" : "white" },
          ]}
        >
          <Text
            style={[
              tw`font-semibold`,
              dynamicStyles.textStyle,
              { color: "#06b6d4" },
            ]}
          >
            Add Item
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            dynamicStyles.actionButton,
            { backgroundColor: darkMode ? "#374151" : "white" },
          ]}
        >
          <Text
            style={[
              tw`font-semibold`,
              dynamicStyles.textStyle,
              { color: "#06b6d4" },
            ]}
          >
            Search via QR
          </Text>
        </TouchableOpacity>
      </View>

      {/**Inventory Summary**/}
      <TouchableOpacity
        style={[
          dynamicStyles.borderCardStyle,
          {
            borderColor: "#06b6d4",
            borderWidth: 1,
            backgroundColor: darkMode ? "#374151" : "#ffffff",
          },
        ]}
        onPress={() => router.push("/inventory-summary")}
      >
        <Text
          style={[
            tw`text-lg font-semibold mb-3 text-center`,
            dynamicStyles.blueTextStyle,
          ]}
        >
          Inventory Summary
        </Text>

        <View style={tw`flex-row justify-center mb-2`}>
          <View style={tw`items-center mr-8`}>
            <Text style={[tw`font-bold`, dynamicStyles.textStyle]}>Items</Text>
            <Text style={[tw`text-lg`, dynamicStyles.textStyle]}>
              {totalItems}
            </Text>
          </View>
          <View style={tw`items-center ml-8`}>
            <Text style={[tw`font-bold`, dynamicStyles.textStyle]}>
              Categories
            </Text>
            <Text style={[tw`text-lg`, dynamicStyles.textStyle]}>
              {totalCategories}
            </Text>
          </View>
        </View>

        <View style={tw`flex-row justify-center mb-2`}>
          <View style={tw`items-center mr-8`}>
            <Text style={[tw`font-bold`, dynamicStyles.textStyle]}>
              Total Quantity
            </Text>
            <Text style={[tw`text-lg`, dynamicStyles.textStyle]}>
              {totalQuantity} Units
            </Text>
          </View>
          <View style={tw`items-center ml-8`}>
            <Text style={[tw`font-bold`, dynamicStyles.textStyle]}>
              Total Value
            </Text>
            <Text style={[tw`text-lg`, dynamicStyles.textStyle]}>
              ${totalValue.toFixed(2)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/**End of inventory summary**/}

      <View style={dynamicStyles.row}>
        <TouchableOpacity
          style={[
            dynamicStyles.borderCardStyle,
            {
              borderColor: "#06b6d4",
              borderWidth: 1,
              backgroundColor: darkMode ? "#374151" : "#ffffff",
            },
          ]}
          onPress={() => router.push("/low-stock-items")}
        >
          <Text style={[tw`font-bold mb-2`, dynamicStyles.blueTextStyle]}>
            Low Stock Items
          </Text>
          <Text style={dynamicStyles.textStyle}>
            View all items low in stock
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            dynamicStyles.borderCardStyle,
            {
              borderColor: "#06b6d4",
              borderWidth: 1,
              backgroundColor: darkMode ? "#374151" : "#ffffff",
            },
          ]}
          onPress={() => router.push("/search")}
        >
          <Text style={[tw`font-bold mb-2`, dynamicStyles.blueTextStyle]}>
            Locations
          </Text>
          <Text style={dynamicStyles.textStyle}>
            View and add items to Locations
          </Text>
        </TouchableOpacity>
      </View>

      <View style={dynamicStyles.row}>
        <TouchableOpacity
          style={[
            dynamicStyles.borderCardStyle,
            {
              borderColor: "#06b6d4",
              borderWidth: 1,
              backgroundColor: darkMode ? "#374151" : "#ffffff",
            },
          ]}
          onPress={() => router.push("/transactions")}
        >
          <Text style={[tw`font-bold mb-2`, dynamicStyles.blueTextStyle]}>
            Transactions
          </Text>
          <Text style={dynamicStyles.textStyle}>
            View item movements and quantity updates
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            dynamicStyles.borderCardStyle,
            {
              borderColor: "#06b6d4",
              borderWidth: 1,
              backgroundColor: darkMode ? "#374151" : "#ffffff",
            },
          ]}
          onPress={() => router.push("/item-analytics")}
        >
          <Text style={[tw`font-bold mb-2`, dynamicStyles.blueTextStyle]}>
            Item Analytics
          </Text>
          <Text style={dynamicStyles.textStyle}>
            View trends in inventory and cost
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          dynamicStyles.largeBlueButtonStyle,
          {
            backgroundColor: darkMode ? "#374151" : "#fff",
            borderWidth: 0,
          },
        ]}
        onPress={() => router.push("/qr-code")}
      >
        <Text style={[tw`font-semibold`, { color: "#06b6d4" }]}>
          Scan QR code
        </Text>
      </TouchableOpacity>

      <View style={tw`flex-row justify-center mb-2`}>
        <TouchableOpacity
          style={[
            dynamicStyles.blueButtonStyle,
            {
              backgroundColor: darkMode ? "#374151" : "#fff",
              borderWidth: 0,
            },
          ]}
          onPress={() => handleImport(organization.id)}
        >
          <Text style={[tw`font-semibold`, { color: "#06b6d4" }]}>Import</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            dynamicStyles.blueButtonStyle,
            {
              backgroundColor: darkMode ? "#374151" : "#fff",
              borderWidth: 0,
            },
          ]}
          onPress={() => handleExport(organization.id)}
        >
          <Text style={[tw`font-semibold`, { color: "#06b6d4" }]}>Export</Text>
        </TouchableOpacity>
      </View>

      <View style={dynamicStyles.recentItems}>
        <Text style={[tw`text-lg font-semibold mb-2`, { color: "#06b6d4" }]}>
          Recent Activity
        </Text>

        {recentlyEditedItems.length > 0 ? (
          recentlyEditedItems.map((item, index) => (
            <Text key={index} style={dynamicStyles.textStyle}>
              {item.name}
            </Text>
          ))
        ) : (
          <Text style={dynamicStyles.textStyle}>No recent activity yet.</Text>
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            dynamicStyles.modalContainer,
            {
              backgroundColor: darkMode
                ? "rgba(8, 6, 6, 0.8)"
                : "rgba(0, 0, 0, 0.5)",
            },
          ]}
        >
          <View
            style={[
              dynamicStyles.modalContent,
              { backgroundColor: darkMode ? "#374151" : "#ffffff" },
            ]}
          >
            <Text
              style={[
                tw`text-lg font-bold mb-4`,
                { color: darkMode ? "#ffffff" : "#000000" },
              ]}
            >
              Manage Organization
            </Text>

            <TouchableOpacity
              style={[
                dynamicStyles.modalButton,
                { backgroundColor: darkMode ? "#1F2937" : "#f1f5f9" },
              ]}
              onPress={() => {
                setModalVisible(false); // Hide the modal
                router.push("/workspace/ManageWorkspace"); // Navigate to the other page
              }}
            >
              <Text
                style={[
                  tw`text-gray-700`,
                  { color: darkMode ? "#d1d5db" : "#000000" },
                ]}
              >
                {organizationName}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                dynamicStyles.modalButton,
                { backgroundColor: darkMode ? "#1F2937" : "#f1f5f9" },
              ]}
              onPress={() => {
                setModalVisible(false); // Hide the modal
                router.push("/workspace/join-workspace"); // Navigate to the other page
              }}
            >
              <Text
                style={[
                  tw`text-gray-700`,
                  { color: darkMode ? "#d1d5db" : "#000000" },
                ]}
              >
                Join New Organization
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                dynamicStyles.modalButton,
                { backgroundColor: darkMode ? "#1F2937" : "#f1f5f9" },
              ]}
              onPress={() => {
                setModalVisible(false); // Hide the modal
                router.push("/workspace/new-workspace"); // Navigate to the other page
              }}
            >
              <Text
                style={[
                  tw`text-gray-700`,
                  { color: darkMode ? "#d1d5db" : "#000000" },
                ]}
              >
                Add New Organization
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                dynamicStyles.modalButton,
                { backgroundColor: darkMode ? "#1F2937" : "#f1f5f9" },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Text
                style={[
                  tw`text-gray-700`,
                  { color: darkMode ? "#d1d5db" : "#000000" },
                ]}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
