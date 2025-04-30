import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { useTheme } from "@darkModeContext";

export default function UserProfile() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const { darkMode } = useTheme();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    return passwordRegex.test(password);
  };

  const isValidName = (name: string) => {
    const nameRegex = /^[A-Za-z]+$/;
    return nameRegex.test(name);
  };

  const handleSaveChanges = () => {
    if (!isValidName(firstName)) {
      Alert.alert("Invalid Name", "First name should only contain letters.");
      return;
    }

    if (!isValidName(lastName)) {
      Alert.alert("Invalid Name", "Last name should only contain letters.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!isValidPassword(password)) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character."
      );
      return;
    }

    Alert.alert(
      "Profile Updated",
      "Your changes have been saved successfully."
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is irreversible. All data will be permanently lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => console.log("Account deleted"),
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[
        tw`flex-1 p-5`,
        darkMode ? { backgroundColor: "#1F2937" } : tw`bg-white`,
      ]}
    >
      <TouchableOpacity onPress={() => router.back()} style={tw`p-2`}>
        <Ionicons
          name="arrow-back"
          size={28}
          color={darkMode ? "#00bcd4" : "#00bcd4"}
        />
      </TouchableOpacity>

      <Text
        style={[
          tw`text-2xl text-center mb-6`,
          darkMode ? tw`text-blue-500` : tw`text-blue-500`,
        ]}
      >
        User Profile
      </Text>

      <View style={[tw`p-3 mb-5`, darkMode && { backgroundColor: "#1F2937" }]}>
        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          style={[
            tw`border rounded-lg p-3 mb-3`,
            darkMode && { borderColor: "#9ca3af", backgroundColor: "#1F2937" },
            { borderColor: "#d1d5db" },
            darkMode && tw`text-white`,
          ]}
        />
        <TextInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          style={[
            tw`border rounded-lg p-3 mb-3`,
            darkMode && { borderColor: "#9ca3af", backgroundColor: "#1F2937" },
            { borderColor: "#d1d5db" },
            darkMode && tw`text-white`,
          ]}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={[
            tw`border rounded-lg p-3 mb-3`,
            darkMode && { borderColor: "#9ca3af", backgroundColor: "#1F2937" },
            { borderColor: "#d1d5db" },
            darkMode && tw`text-white`,
          ]}
        />
        <TextInput
          placeholder="Change Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={[
            tw`border rounded-lg p-3 mb-3`,
            darkMode && { borderColor: "#9ca3af", backgroundColor: "#1F2937" },
            { borderColor: "#d1d5db" },
            darkMode && tw`text-white`,
          ]}
        />
      </View>

      <TouchableOpacity
        onPress={handleSaveChanges}
        style={[
          tw`py-3 rounded-lg mb-5`,
          darkMode ? tw`bg-blue-600` : tw`bg-blue-500`,
        ]}
      >
        <Text style={tw`text-white text-center`}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleDeleteAccount}
        style={[
          tw`py-3 rounded-lg`,
          darkMode ? tw`bg-red-600` : tw`bg-red-500`,
        ]}
      >
        <Text style={tw`text-white text-center`}>Delete Account</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
