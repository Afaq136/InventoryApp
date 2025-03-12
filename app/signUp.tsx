import { StatusBar } from "expo-status-bar";
import { Image, Text, View, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Link, useRouter } from "expo-router";
import tw from "twrnc";
import { useState } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { useTheme } from './context/DarkModeContext'; 

export default function SignUp() {
  const { darkMode } = useTheme(); 
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;
  const router = useRouter();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      console.log(response);
      Alert.alert("Check your email!");
      router.push("/(tabs)/dashboard"); 
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "Sign Up Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      style={tw`flex-1`}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={tw`${darkMode ? "bg-black" : "bg-white"} flex-1 items-center justify-center`} 
        >
          <Image
            source={require("../assets/Logo3.png")}
            style={tw`w-40 h-20 mb-5`}
          />
          <Text style={tw`${darkMode ? "text-white" : "text-black"} font-bold text-xl mb-2`}>Welcome!</Text> 
          <Text style={tw`${darkMode ? "text-white" : "text-black"} font-bold text-sm mb-4`}>Create your account</Text> 
          <View style={tw`w-full px-12 mb-4`}>
            <TextInput
              placeholder="Full name"
              style={tw`${darkMode ? "bg-gray-700 text-white" : "border border-gray-300"} rounded-lg p-2 mb-2`} 
            />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              style={tw`${darkMode ? "bg-gray-700 text-white" : "border border-gray-300"} rounded-lg p-2 mb-2`} 
            />
            <View style={tw`relative mb-2`}>
              <TextInput
                placeholder="Password"
                secureTextEntry={!passwordVisible}
                style={tw`${darkMode ? "bg-gray-700 text-white" : "border border-gray-300"} rounded-lg p-2 pr-10`} 
                value={password}
                autoCapitalize="none"
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={tw`absolute right-2 top-2`}
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                <Icon
                  name={passwordVisible ? "visibility" : "visibility-off"}
                  size={24}
                  color={darkMode ? "white" : "gray"} 
                />
              </TouchableOpacity>
            </View>
            <View style={tw`relative mb-2`}>
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry={!confirmPasswordVisible}
                style={tw`${darkMode ? "bg-gray-700 text-white" : "border border-gray-300"} rounded-lg p-2 pr-10`} 
                value={confirmPassword}
                autoCapitalize="none"
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={tw`absolute right-2 top-2`}
                onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              >
                <Icon
                  name={confirmPasswordVisible ? "visibility" : "visibility-off"}
                  size={24}
                  color={darkMode ? "white" : "gray"} 
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={tw`${darkMode ? "bg-blue-700" : "bg-blue-500"} py-2 px-6 rounded-lg mb-4`} 
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={tw`text-white text-sm text-center`}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={tw`flex-row items-center my-4`}>
            <View style={tw`flex-1 h-px ${darkMode ? "bg-gray-600" : "bg-gray-300"}`} /> 
            <Text style={tw`${darkMode ? "text-white" : "text-gray-500"} mx-4`}>Or</Text> 
            <View style={tw`flex-1 h-px ${darkMode ? "bg-gray-600" : "bg-gray-300"}`} /> 
          </View>

          <TouchableOpacity
            style={tw`${darkMode ? "bg-black" : "bg-black"} text-white py-2 px-4 rounded-lg mb-4`}
          >
            <Text style={tw`text-white text-center`}>Sign in with Apple</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`${darkMode ? "bg-red-700" : "bg-red-500"} text-white py-2 px-4 rounded-lg`}
          >
            <Text style={tw`text-white text-center`}>Sign in with Google</Text>
          </TouchableOpacity>

          <Text style={tw`${darkMode ? "text-white" : "text-sm text-gray-500"} mt-4`}>
            Already have an account?{" "}
            <Link href="/login" style={tw`${darkMode ? "font-bold text-green-500" : "font-bold text-green-500"}`}>
              Log in
            </Link>
          </Text>

          <StatusBar style={darkMode ? "light" : "auto"} />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
