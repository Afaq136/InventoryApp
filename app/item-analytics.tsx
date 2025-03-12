import React from "react";
import { Pressable, View, Text, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import tw from "twrnc";
import { useTheme } from './context/DarkModeContext'; 

export default function ItemAnalytics() {
  const router = useRouter();
  const { darkMode } = useTheme(); 

  return (
    <SafeAreaView style={[tw`flex-1 p-5`, darkMode ? tw`bg-black` : tw`bg-white`]}>
      <View style={[styles.container, darkMode && { backgroundColor: '#333' }]}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={darkMode ? '#00bcd4' : '#000000'} />
          </Pressable>
          <Text style={[styles.headerText, darkMode && { color: 'white' }]}>Item Analytics</Text>
        </View>

        <View style={[styles.box, darkMode && { backgroundColor: '#444', borderColor: 'white' }]}>
          <Text style={[tw`text-gray-500 text-lg`, darkMode && { color: 'white' }]}>No analytics data available</Text>
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
    borderColor: "#4A90E2", 
    borderRadius: 10,
    padding: 20,
    backgroundColor: "#fff", 
  },
});
