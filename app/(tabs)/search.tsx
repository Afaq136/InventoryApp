import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@darkModeContext";

export default function LocatePage() {
  const { darkMode } = useTheme();
  const locations = [
    {
      id: "1",
      name: "Location 1",
      address: "1234 Main Street, Dallas, TX 75201",
    },
    {
      id: "2",
      name: "Location 2",
      address: "5678 Industrial Parkway, Chicago, IL 60601",
    },
    {
      id: "3",
      name: "Location 3",
      address: "9101 Logistics Boulevard, Atlanta, GA 30301",
    },
  ];

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <TextInput
        placeholder="Search"
        placeholderTextColor={darkMode ? "#bbb" : "#888"}
        style={[styles.searchInput, darkMode && styles.searchInputDark]}
      />

      <View
        style={[styles.mapPlaceholder, darkMode && styles.mapPlaceholderDark]}
      >
        <Text style={[styles.mapText, darkMode && styles.mapTextDark]}>
          Map Placeholder
        </Text>
      </View>

      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[styles.locationItem, darkMode && styles.locationItemDark]}
          >
            <Text
              style={[styles.locationName, darkMode && styles.locationNameDark]}
            >
              {item.name}
            </Text>
            <Text style={darkMode && styles.textDark}>{item.address}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchInputDark: {
    borderColor: "white",
    backgroundColor: "#374151",
    color: "#fff",
  },
  containerDark: {
    backgroundColor: "#1F2937",
  },
  header: {
    backgroundColor: "#007b83",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerDark: {
    backgroundColor: "#007b83",
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerTextDark: {
    color: "#ddd",
  },
  addButton: {
    backgroundColor: "#00bcd4",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButtonDark: {
    backgroundColor: "#00bcd4",
  },
  addButtonText: {
    color: "white",
  },
  addButtonTextDark: {
    color: "white",
  },
  searchInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    margin: 10,
  },
  mapPlaceholder: {
    height: 200,
    margin: 10,
    borderRadius: 10,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholderDark: {
    backgroundColor: "#e0e0e0",
  },
  mapText: {
    color: "#888",
  },
  mapTextDark: {
    color: "#888",
  },
  locationItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 5,
    elevation: 2,
  },
  locationItemDark: {
    backgroundColor: "#374151",
  },
  locationName: {
    fontWeight: "bold",
  },
  locationNameDark: {
    color: "#fff",
  },
  textDark: {
    color: "#ddd",
  },
});
