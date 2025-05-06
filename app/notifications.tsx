import React, { useState, useEffect } from "react";
import { Pressable, View, Text, StyleSheet, SafeAreaView, FlatList } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import tw from "twrnc";
import { useTheme } from "@darkModeContext";

import { useItemStats } from "@itemStatsContext"; 

export default function Notifications() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const { lowStockItemsByFolder } = useItemStats();

  type Notification = {
    id?: string;
    title?: string;
    description?: string;
    date?: string;
    folderName: string;
    itemName: string;
    quantity: number;
  };
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    const generatedNotifications: Notification[] = [];
    for (const folderName in lowStockItemsByFolder) {
      const items = lowStockItemsByFolder[folderName];
      items.forEach(item => {
        generatedNotifications.push({
          folderName,
          itemName: item.name,
          quantity: item.quantity,
        });
      });
    }
    setNotifications(generatedNotifications);
  }, [lowStockItemsByFolder]);

  return (
    <SafeAreaView
      style={[tw`flex-1`, darkMode && { backgroundColor: "#1F2937" }]}
    >
      <View style={[styles.container, darkMode && styles.containerDark]}>
        <View style={[styles.header, darkMode && styles.headerDark]}>
          <Pressable
            style={[styles.backButton, darkMode && styles.backButtonDark]}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color={darkMode ? "#00bcd4" : "#00bcd4"}
            />
          </Pressable>
          <Text
            style={[
              styles.headerText,
              darkMode && styles.headerTextDark,
            ]}
          >
            Notifications
          </Text>
        </View>

        {notifications.length > 0 ? (
          <FlatList
            data={notifications}
            keyExtractor={(item, index) => `${item.itemName}-${index}`}
            renderItem={({ item }) => (
              <View style={[
                styles.notificationBox,
                darkMode && styles.notificationBoxDark
              ]}>
                <Text style={[tw`text-base font-bold`, darkMode && { color: "white" }]}>
                  {item.itemName} is low on stock!
                </Text>
                <Text style={[tw`text-sm`, darkMode && { color: "#bbb" }]}>
                  Folder: {item.folderName}
                </Text>
                <Text style={[tw`text-sm`, darkMode && { color: "#bbb" }]}>
                  Quantity Remaining: {item.quantity}
                </Text>
              </View>
            )}
          />
        ) : (
          <View
            style={[
              styles.notificationBox,
              darkMode && styles.notificationBoxDark,
            ]}
          >
            <Text style={[tw`text-lg`, darkMode && { color: "#bbb" }]}>
              No new notifications
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
    backgroundColor: "#fff",
    padding: 20,
  },
  containerDark: {
    backgroundColor: "#1F2937",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: "100%",
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  headerDark: {
    backgroundColor: "#1F2937",
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 10,
  },
  backButtonDark: {
    padding: 10,
  },
  headerText: {
    fontSize: 24,
    color: "#2563eb",
  },
  headerTextDark: {
    color: "#ddd",
  },
  notificationBox: {
    borderWidth: 1,
    borderColor: "#4A90E2",
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  notificationBoxDark: {
    backgroundColor: "#374151",
    borderColor: "#888",
  },
});
