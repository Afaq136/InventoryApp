import React from "react";
import { Pressable, View, Text, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import tw from "twrnc";
import { useTheme } from './context/DarkModeContext'; 

export default function Notifications() {
  const router = useRouter();
  const { darkMode } = useTheme();  

  return (
    <SafeAreaView style={[tw`flex-1`, darkMode && { backgroundColor: '#121212' }]}>
      <View style={[styles.container, darkMode && styles.containerDark]}>
        <View style={[styles.header, darkMode && styles.headerDark]}>
          <Pressable style={[styles.backButton, darkMode && styles.backButtonDark]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={darkMode ? '#00bcd4' : '#00bcd4'} />
          </Pressable>
          <Text style={[styles.headerText, darkMode && styles.headerTextDark]}>Notifications</Text>
        </View>

        <View style={[styles.notificationBox, darkMode && styles.notificationBoxDark]}>
          <Text style={[tw`text-lg`, darkMode && { color: '#bbb' }]}>No new notifications</Text>
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
  containerDark: {
    backgroundColor: "#121212",  
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
    backgroundColor: "#121212",  
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
    backgroundColor: "#fff", 
  },
  notificationBoxDark: {
    backgroundColor: "#333",  
    borderColor: "#888", 
  },
});
