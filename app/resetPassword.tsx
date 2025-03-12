import { StatusBar } from "expo-status-bar";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { useTheme } from './context/DarkModeContext'; 

export default function ResetPassword() {
  const router = useRouter();
  const { darkMode } = useTheme(); 

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#1F2937" }]}>
      <View style={tw`absolute top-12 left-5`}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={darkMode ? "#22c55e" : "#22c55e"} />
        </Pressable>
      </View>

      <Text style={[tw`text-3xl font-bold mb-6 text-blue-500`, darkMode && { color: "#60a5fa" }]}>Reset Password</Text>

      <TextInput
        placeholder="Your Email"
        style={[tw`border rounded-lg p-2 mb-4 w-80`, darkMode && { borderColor: '#9ca3af', backgroundColor: '#374151', color: '#e5e7eb' }]}
      />

      <Text style={[tw`font-bold text-center mb-4 text-blue-500`, darkMode && { color: '#60a5fa' }]}>
        An email will be sent with a reset password link. Please check your
        spam/junk folder.
      </Text>

      <TouchableOpacity
        style={[tw`bg-blue-500 py-2 px-6 rounded-lg mb-4 w-80`, darkMode && { backgroundColor: '#3b82f6' }]}
      >
        <Text style={[tw`text-white text-sm text-center`, darkMode && { color: '#f3f4f6' }]}>Send Email</Text>
      </TouchableOpacity>

      <StatusBar style={darkMode ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
