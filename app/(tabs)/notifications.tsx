import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import tw from "twrnc";

export default function Notifications() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="green" />
        </Pressable>
        <Text style={styles.headerText}>Notifications</Text>
      </View>

      <View style={styles.notificationBox}>
        <Text style={tw`text-gray-500 text-lg`}>No new notifications</Text>
      </View>
    </View>
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
  notificationBox: {
    borderWidth: 1,
    borderColor: "#4A90E2",
    borderRadius: 10,
    padding: 20,
    backgroundColor: "#fff",
  },
});
