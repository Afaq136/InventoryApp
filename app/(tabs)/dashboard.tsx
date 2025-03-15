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
import { getFirestore, collection, getDocs } from "firebase/firestore";
import * as DocumentPicker from "expo-document-picker"; // Use expo-document-picker
import { orderBy, limit, query } from "firebase/firestore";
import { useTheme } from "@darkModeContext";
import { getDynamicStyles } from "@styles";

interface Item {
  id: string;
  name: string;
  quantity: number;
  isLow: boolean;
  category: string;
  totalValue: number;
  price: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { organizationName = "Organization" } = useLocalSearchParams();
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [totalDocuments, setTotalDocuments] = useState<number>(0);
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [totalValue, setTotalValue] = useState<number>(0); // State to store the total value of items
  const [recentItems, setRecentItems] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const { darkMode } = useTheme();

  //These styles change dynamically based off of dark mode
  const dynamicStyles = getDynamicStyles(darkMode);

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        const itemsCollection = collection(db, "items");
        const snapshot = await getDocs(itemsCollection);

        let quantity = 0;
        let value = 0;
        const categorySet = new Set<string>(); // Create a Set to store unique categories

        snapshot.forEach((doc) => {
          const itemData = doc.data() as Item;
          quantity += itemData.quantity || 0;

          //The value is the quantity of an item multiplied by the price
          if (itemData.quantity && itemData.price) {
            value += itemData.quantity * itemData.price;
          }

          if (itemData.category) {
            categorySet.add(itemData.category);
          }
        });

        setTotalQuantity(quantity);
        setTotalDocuments(snapshot.size);
        setTotalCategories(categorySet.size);
        setTotalValue(value);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    const fetchRecentItems = async () => {
      try {
        const itemsCollection = collection(db, "items");

        // Query to get the last 3 items ordered by createdAt field
        const q = query(
          itemsCollection,
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const snapshot = await getDocs(q);

        const recentItemsList: string[] = [];

        snapshot.forEach((doc) => {
          const itemData = doc.data() as Item;
          recentItemsList.push(
            `${itemData.name} was added to ${itemData.category}`
          );
        });

        setRecentItems(recentItemsList); // Set the recent items to the state
      } catch (error) {
        console.error("Error fetching recent items:", error);
      }
    };

    fetchItemData();
    fetchRecentItems();
  }, []);

  const handleImport = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "text/csv", // Allow CSV files
      });

      if (res.canceled) {
        console.log("User canceled the picker");
        return;
      }

      const file = res.assets[0]; // Access selected file
      console.log("Selected file:", file);

      // Here you can process the CSV file
    } catch (err) {
      console.error("Error picking file:", err);
    }
  };

  return (
    <ScrollView style={dynamicStyles.containerStyle}>
      <View style={dynamicStyles.header}>
        <Text style={[tw`text-xl font-bold mb-4`, dynamicStyles.textStyle]}>
          Dashboard
        </Text>
        <TouchableOpacity onPress={() => router.push("/notifications")}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={darkMode ? "white" : "black"}
          />
        </TouchableOpacity>
      </View>

      <View style={dynamicStyles.organizationHeader}>
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
          style={dynamicStyles.actionButton}
        >
          <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>Add Item</Text>
        </TouchableOpacity>
        <TouchableOpacity style={dynamicStyles.actionButton}>
          <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>Search via QR</Text>
        </TouchableOpacity>
      </View>
      {/**Inventory Summary**/}
      <TouchableOpacity
        style={dynamicStyles.summaryCardStyle}
        onPress={() => router.push("/inventory-summary")}
      >
        <Text style={[tw`text-lg font-semibold mb-3 text-center`, dynamicStyles.blueTextStyle]}>
          Inventory Summary
        </Text>
        <View style={tw`flex-row justify-between`}>
          <View style={tw`items-center`}>
            <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>
              Items
            </Text>
            <Text style={[tw`text-lg`, dynamicStyles.textStyle]}>
              {totalDocuments}
            </Text>
          </View>
          <View style={tw`items-center`}>
            <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>
              Categories
            </Text>
            <Text style={[tw`text-lg`, dynamicStyles.textStyle]}>
              {totalCategories}
            </Text>
          </View>
          <View style={tw`items-center`}>
            <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>
              Total Quantity
            </Text>
            <Text style={[tw`text-lg`, dynamicStyles.textStyle]}>
              {totalQuantity} Units
            </Text>
          </View>
          <View style={tw`items-center`}>
            <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>
              Total Value
            </Text>
            <Text style={[tw`text-lg`, dynamicStyles.textStyle]}>
              ${totalValue.toFixed(2)}
            </Text>{" "}
            {/* Displaying the total value with 2 decimal places */}
          </View>
        </View>
      </TouchableOpacity>
      {/**End of inventory summary**/}

      <View style={dynamicStyles.row}>
        <TouchableOpacity
          style={dynamicStyles.borderCardStyle}
          onPress={() => router.push("/low-stock-items")}
        >
          <Text style={[tw`font-bold mb-2`, dynamicStyles.blueTextStyle]}>Low Stock Items</Text>
          <Text style={dynamicStyles.textStyle}>
            View all items low in stock
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={dynamicStyles.borderCardStyle}
          onPress={() => router.push("/locations")}
        >
          <Text style={[tw`font-bold mb-2`, dynamicStyles.blueTextStyle]}>Locations</Text>
          <Text style={dynamicStyles.textStyle}>
            View and add items to Locations
          </Text>
        </TouchableOpacity>
      </View>

      <View style={dynamicStyles.row}>
        <TouchableOpacity
          style={dynamicStyles.borderCardStyle}
          onPress={() => router.push("/transactions")}
        >
          <Text style={[tw`font-bold mb-2`, dynamicStyles.blueTextStyle]}>Transactions</Text>
          <Text style={dynamicStyles.textStyle}>
            View item movements and quantity updates
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={dynamicStyles.borderCardStyle}
          onPress={() => router.push("/item-analytics")}
        >
          <Text style={[tw`font-bold mb-2`, dynamicStyles.blueTextStyle]}>Item Analytics</Text>
          <Text style={dynamicStyles.textStyle}>
            View trends in inventory and cost
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={dynamicStyles.largeBlueButtonStyle}
        onPress={() => router.push("/qr-code")}
      >
        <Text style={[tw`font-semibold`, dynamicStyles.blueTextStyle]}>Scan QR code</Text>
      </TouchableOpacity>

      <View style={tw`flex-row justify-center mb-2`}>
        {/* Import Button */}
        <TouchableOpacity
          style={dynamicStyles.blueButtonStyle}
          onPress={handleImport}
        >
          <Text style={[tw`font-semibold`, dynamicStyles.blueTextStyle]}>Import</Text>
        </TouchableOpacity>
        {/* Export Button */}
        <TouchableOpacity
          style={dynamicStyles.blueButtonStyle}
          onPress={() => handleImport}
        >
          <Text style={[tw`font-semibold`, dynamicStyles.blueTextStyle]}>Export</Text>
        </TouchableOpacity>
      </View>

      <View
        style={dynamicStyles.recentItems}
      >
        <Text style={[tw`text-lg font-semibold mb-2`, dynamicStyles.textStyle]}>
          Recent Items
        </Text>
        {recentItems.length > 0 ? (
          recentItems.map((item, index) => (
            <Text key={index} style={dynamicStyles.textStyle}>
              {item}
            </Text>
          ))
        ) : (
          <Text style={dynamicStyles.textStyle}>No recent items yet.</Text>
        )}
      </View>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={dynamicStyles.modalContainer}>
          <View style={dynamicStyles.modalContent}>
            <Text style={tw`text-lg font-bold mb-4`}>Manage Organization</Text>
            <TouchableOpacity
              style={dynamicStyles.modalButton}
              onPress={() => {
                setModalVisible(false); // Hide the modal
                router.push("/ManageWorkspace"); // Navigate to the other page
              }}
            >
              <Text style={tw`text-gray-700`}>{organizationName}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={dynamicStyles.modalButton}>
              <Text style={tw`text-gray-700`}>Join New Organization</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dynamicStyles.modalButton}>
              <Text style={tw`text-gray-700`}>Add New Organization</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={tw`text-gray-700`}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}