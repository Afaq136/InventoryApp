import React from "react";
import { Pressable, View, Text, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import tw from "twrnc";

export default function LowStockItems() {
  const router = useRouter();

  return (
    <SafeAreaView style={tw`flex-1 bg-white p-5`}>
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#22c55e" />
        </Pressable>
        <Text style={styles.headerText}>Low Stock Items</Text>
      </View>

      <View style={styles.box}>
        <Text style={tw`text-gray-500 text-lg`}>No low stock items</Text>
      </View>
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
    color: "#2563eb",
  },
  box: {
    borderWidth: 1,
    borderColor: "#4A90E2",
    borderRadius: 10,
    padding: 20,
    backgroundColor: "#fff",
  },
});
