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
import { useTheme } from "@darkModeContext";
import { getDynamicStyles } from "@styles";
import { useOrganization, useUser } from "@clerk/clerk-expo";
import { useItemStats } from "@itemStatsContext";
import { importItems, exportItems } from "@itemsService";

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
          onPress={() => importItems(organization.id)}
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
          onPress={() => exportItems(organization.id)}
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
