import React from "react";
import { Pressable, View, Text, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import tw from "twrnc";
import { useTheme } from "@darkModeContext";

export default function Transactions() {
  const router = useRouter();
  const { darkMode } = useTheme();

  return (
    <SafeAreaView
      style={[tw`flex-1 p-5`, darkMode ? tw`bg-black` : tw`bg-white`]}
    >
      <View
        style={[styles.container, darkMode && { backgroundColor: "#1F2937" }]}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={28}
              color={darkMode ? "#00bcd4" : "#00bcd4"}
            />
          </Pressable>
          <Text
            style={[
              styles.headerText,
              darkMode && { color: "white" },
              { color: "#06b6d4" },
            ]}
          >
            Transactions
          </Text>
        </View>

        <View
          style={[
            styles.box,
            darkMode && { backgroundColor: "#374151", borderColor: "white" },
          ]}
        >
          <Text
            style={[tw`text-black-500 text-lg`, darkMode && { color: "white" }]}
          >
            No recent transactions
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: "#00bcd4",
  },
  box: {
    borderWidth: 1,
    borderColor: "#06b6d4",
    borderRadius: 10,
    padding: 20,
    backgroundColor: "#fff",
  },
});
