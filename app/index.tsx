import React, { useEffect, useRef } from "react";
import { View, Text, Image, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { useRouter } from "expo-router";
import { useTheme } from "./context/DarkModeContext";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";

export default function HomeScreen() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const { user } = useUser();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current; // Starts invisible
  const translateY = useRef(new Animated.Value(100)).current; // Starts below screen

  useEffect(() => {
    // Animate logo and text upwards with fade-in
    Animated.timing(translateY, {
      toValue: 0, // Move into position
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.timing(fadeAnim, {
      toValue: 1, // Fully visible
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView
      style={[
        tw`flex-1 items-center justify-center`,
        darkMode && { backgroundColor: "#1F2937" },
      ]}
    >
      <Animated.View
        style={[
          tw`items-center`,
          { opacity: fadeAnim, transform: [{ translateY }] },
        ]}
      >
        {/* Logo */}
        <Image
          source={require("../assets/Logo3.png")}
          style={tw`w-60 h-30 mb-5`}
        />
        <SignedIn>
          <Text
            style={[
              tw`font-bold text-3xl mb-4 text-blue-500 text-center`,
              darkMode && { color: "#60a5fa" },
            ]}
          >
            Hello {user?.emailAddresses[0].emailAddress}
          </Text>
          {/* Continue Button */}
          <TouchableOpacity
            onPress={() => router.push("/dashboard")}
            style={tw`mb-4`}
          >
            <Text
              style={[
                tw`text-green-500 text-lg font-bold text-center`,
                darkMode && { color: "#34d399" },
              ]}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </SignedIn>
        <SignedOut>
          {/* Text */}
          <Text
            style={[
              tw`font-bold text-3xl mb-4 text-blue-500 text-center`,
              darkMode && { color: "#60a5fa" },
            ]}
          >
            Get Started!
          </Text>
          <Text
            style={[
              tw`font-bold text-xl mb-8 text-blue-500 text-center`,
              darkMode && { color: "#60a5fa" },
            ]}
          >
            Start with Sign up or Login
          </Text>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={() => router.push("/signUp")}
            style={tw`mb-4`}
          >
            <Text
              style={[
                tw`text-green-500 text-lg font-bold text-center`,
                darkMode && { color: "#34d399" },
              ]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text
              style={[
                tw`text-green-500 text-lg font-bold text-center`,
                darkMode && { color: "#34d399" },
              ]}
            >
              Login
            </Text>
          </TouchableOpacity>
        </SignedOut>
      </Animated.View>
    </SafeAreaView>
  );
}
