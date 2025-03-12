import { StatusBar } from "expo-status-bar";
import {
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Link } from "expo-router";
import tw from "twrnc";
import { FIREBASE_AUTH } from "../FirebaseConfig"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState, useEffect } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from './context/DarkModeContext'; 
import { useSSO } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import 'firebase/compat/auth';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const auth = FIREBASE_AUTH;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { darkMode } = useTheme(); 
  const {startSSOFlow} = useSSO()
    const router = useRouter()
    const handleGoogleSignIn = async () => {
        try{
            const{createdSessionId,setActive} = await startSSOFlow({strategy: 'oauth_google'})
            if(setActive && createdSessionId){
                setActive({session: createdSessionId})
                router.replace("/(tabs)/dashboard")
            }

        }catch(error){
        
            console.log('error', error)
        }
    }

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
      alert("Login Successful");
    } catch (error) {
      console.error(error);
      alert("Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[tw`flex-1 items-center justify-center`, darkMode && { backgroundColor: '#1F2937' }]}>
        <Image
          source={require("../assets/Logo3.png")}
          style={tw`w-40 h-20 mb-4`}
          resizeMode="contain"
        />

        <Text style={[tw`font-bold text-xl mb-2 text-blue-500`, darkMode && { color: "#60a5fa" }]}>
          Welcome Back!
        </Text>
        <Text style={[tw`font-bold text-sm mb-4 text-blue-500`, darkMode && { color: "#60a5fa" }]}>
          Login to your account
        </Text>
        <View style={tw`w-full px-12 mb-4`}>
          <TextInput
            value={email}
            placeholder="Email"
            autoCapitalize="none"
            onChangeText={setEmail}
            style={[tw`border rounded-lg p-2 mb-4`, darkMode && { backgroundColor: "#374151", borderColor: "#9ca3af", color: "#e5e7eb" }]}
          />
          <View style={tw`relative mb-2`}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              placeholder="Password"
              secureTextEntry={!passwordVisible}
              style={[tw`border rounded-lg p-2 pr-10`, darkMode && { backgroundColor: "#374151", borderColor: "#9ca3af", color: "#e5e7eb" }]}
            />
            <TouchableOpacity
              style={tw`absolute right-2 top-2`}
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Icon
                name={passwordVisible ? "visibility" : "visibility-off"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>
        </View>
        <Link
          href="/resetPassword"
          style={[tw`font-bold text-sm mb-4 text-green-500`, darkMode && { color: "#34d399" }]}
        >
          Forgot Password?
        </Link>

        <TouchableOpacity onPress={signIn}>
          <Link
            onPress={signIn}
            href="/(work-tabs)/new-workspace"
            style={[tw`bg-blue-500 text-white py-2 px-6 rounded-lg mb-4`, darkMode && { backgroundColor: "#3b82f6" }]}
          >
            <Text style={[tw`text-white text-sm text-center`, darkMode && { color: "#f3f4f6" }]}>Login</Text>
          </Link>
        </TouchableOpacity>

        <View style={tw`flex-row items-center my-4`}>
          <View style={tw`flex-1 h-px bg-gray-300`} />
          <Text style={[tw`mx-4 text-gray-500`, darkMode && { color: "#d1d5db" }]}>Or</Text>
          <View style={tw`flex-1 h-px bg-gray-300`} />
        </View>

        <TouchableOpacity
          style={[tw`bg-black text-white py-2 px-4 rounded-lg mb-4`, darkMode && { backgroundColor: "#111827" }]}
        >
          <Text style={tw`text-white text-center`}>Sign in with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[tw`bg-red-500 text-white py-2 px-4 rounded-lg`, darkMode && { backgroundColor: "#ef4444" }]}
          onPress={handleGoogleSignIn}
        >
          <Text style={tw`text-white text-center`}>Sign in with Google</Text>
        </TouchableOpacity>

        <Text style={[tw`text-sm mt-4`, darkMode && { color: "#d1d5db" }]}>
          Don't have an account?{" "}
          <Link href="/signUp" style={[tw`font-bold text-green-500`, darkMode && { color: "#34d399" }]}>
            Sign Up
          </Link>
        </Text>

        <StatusBar style={darkMode ? "light" : "auto"} />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
