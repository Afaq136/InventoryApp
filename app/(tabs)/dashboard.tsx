import React, { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router"; 
import tw from "twrnc";
import { db } from '@firebaseConfig'; 
import { getFirestore, collection, getDocs } from "firebase/firestore"; 
import * as DocumentPicker from 'expo-document-picker';  // Use expo-document-picker
import { orderBy, limit, query } from "firebase/firestore";

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
  const [totalValue, setTotalValue] = useState<number>(0);  // State to store the total value of items
  const [recentItems, setRecentItems] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        const itemsCollection = collection(db, "items"); 
        const snapshot = await getDocs(itemsCollection); 

        let quantity = 0;
        let value = 0;
        const categorySet = new Set<string>();  // Create a Set to store unique categories

        snapshot.forEach((doc) => {
          const itemData = doc.data() as Item; 
          quantity += itemData.quantity || 0;

          //does some math on totalvalue and item data. dont know y we named it totalValue but if changed on fs we need to change it here
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
        const q = query(itemsCollection, orderBy("createdAt", "desc"), limit(3));
        const snapshot = await getDocs(q);

        const recentItemsList: string[] = [];

        snapshot.forEach((doc) => {
          const itemData = doc.data() as Item;
          recentItemsList.push(`${itemData.name} was added to ${itemData.category}`);
        });

        setRecentItems(recentItemsList); // Set the recent items to the state

      } catch (error) {
        console.error("Error fetching recent items:", error);
      }

    };

    fetchItemData();
    fetchRecentItems();
  }, []); 

  // Function to handle file import using expo-document-picker
  const handleImport = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.ms-excel', // Allow CSV files
      });
      if (res.type === 'success') {
        console.log('Selected file:', res);
        // This is where im gonna put logic for what to do with a CSV
      } else {
        console.log('User canceled the picker');
      }
    } catch (err) {
      console.error('Error picking file:', err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={tw`text-xl font-bold mb-4 text-[#00bcd4]`}>Dashboard</Text>
        <TouchableOpacity onPress={() => router.push("/notifications")}>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.organizationHeader}>
        <Text style={tw`text-xl font-bold text-gray-700`}>{organizationName}</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={tw`text-lg text-gray-700`}>▼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity onPress={() => router.push("/addItems")} style={styles.actionButton}>
          <Text style={tw`text-gray-700`}>Add Item</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={tw`text-gray-700`}>Search via QR</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.summaryCard} onPress={() => router.push("/inventory-summary")}>
        <Text style={tw`text-[#00bcd4] text-lg font-semibold mb-3`}>Inventory Summary</Text>
        <View style={tw`flex-row justify-between`}>
          <View style={tw`items-center`}>
            <Text style={tw`font-semibold text-gray-700`}>Items</Text>
            <Text style={tw`text-gray-500 text-lg`}>{totalDocuments}</Text>
          </View>
          <View style={tw`items-center`}>
            <Text style={tw`font-semibold text-gray-700`}>Categories</Text>
            <Text style={tw`text-gray-500 text-lg`}>{totalCategories}</Text>
          </View>
          <View style={tw`items-center`}>
            <Text style={tw`font-semibold text-gray-700`}>Total Quantity</Text>
            <Text style={tw`text-gray-500 text-lg`}>{totalQuantity} Units</Text>
          </View>
          <View style={tw`items-center`}>
            <Text style={tw`font-semibold text-gray-700`}>Total Value</Text>
            <Text style={tw`text-gray-500 text-lg`}>${totalValue.toFixed(2)}</Text>  {/* Displaying the total value with 2 decimal places */}
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity style={styles.blueBorderCard} onPress={() => router.push("/low-stock-items")}>
          <Text style={tw`text-[#00bcd4] font-bold mb-2`}>Low Stock Items</Text>
          <Text style={tw`text-gray-500`}>View all items low in stock</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.blueBorderCard} onPress={() => router.push("/locations")}>
          <Text style={tw`text-[#00bcd4] font-bold mb-2`}>Locations</Text>
          <Text style={tw`text-gray-500`}>View and add items to Locations</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.blueBorderCard} onPress={() => router.push("/transactions")}>
          <Text style={tw`text-[#00bcd4] font-bold mb-2`}>Transactions</Text>
          <Text style={tw`text-gray-500`}>View item movements and quantity updates</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.blueBorderCard} onPress={() => router.push("/item-analytics")}>
          <Text style={tw`text-[#00bcd4] font-bold mb-2`}>Item Analytics</Text>
          <Text style={tw`text-gray-500`}>View trends in inventory and cost</Text>
        </TouchableOpacity>
      </View>

      <View style={tw`flex-row justify-center mt-2`}>
      {/* Import Button */}
      <TouchableOpacity style={tw`flex-1 mx-2 py-3 px-4 bg-white border border-[#00bcd4] rounded-md items-center`} onPress={handleImport}>
        <Text style={tw`text-[#00bcd4] font-bold`}>Import</Text>
      </TouchableOpacity>

      {/* Export Button */}
      <TouchableOpacity style={tw`flex-1 mx-2 py-3 px-4 bg-white border border-[#00bcd4] rounded-md items-center`} onPress={() => handleImport}>
        <Text style={tw`text-[#00bcd4] font-bold`}>Export</Text>
      </TouchableOpacity>
    </View>


    <View style={styles.recentItems}>
        <Text style={tw`text-lg font-bold text-gray-700 mb-2`}>Recent Items</Text>
        {recentItems.length > 0 ? (
          recentItems.map((item, index) => (
            <Text key={index} style={tw`text-gray-500`}>
              {item}
            </Text>
          ))
        ) : (
          <Text style={tw`text-gray-500`}>No recent items yet.</Text>
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          <Text style={tw`text-lg font-bold mb-4`}>Manage Organization</Text>
<TouchableOpacity 
    style={styles.modalButton} 
    onPress={() => {
        setModalVisible(false);       // Hide the modal
        router.push("/ManageWorkspace");  // Navigate to the other page
    }}
>
    <Text style={tw`text-gray-700`}>{organizationName}</Text>
</TouchableOpacity>

            <TouchableOpacity style={styles.modalButton}>
              <Text style={tw`text-gray-700`}>Join New Organization</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton}>
              <Text style={tw`text-gray-700`}>Add New Organization</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={tw`text-gray-700`}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  organizationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: "#00bcd4",
    borderRadius: 15,
    padding: 25,
    backgroundColor: "#ffffff",
    marginBottom: 15,
  },
  blueBorderCard: {
    borderWidth: 1,
    borderColor: "#383737",
    borderRadius: 15,
    padding: 25,
    width: "48%",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  qrCard: {
    borderWidth: 1,
    borderColor: "#00bcd4",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginBottom: 30,
  },
  recentItems: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    margin: 10,
    elevation: 5,
  },
  modalButton: {
    backgroundColor: '#f7f7f7',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
});