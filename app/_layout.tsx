import React from "react";
import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../app/context/auth";
import { View, ActivityIndicator } from "react-native";
import { ThemeProvider } from "./context/DarkModeContext";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { tokenCache } from "@/cache";

//Top-level providers
export default function Layout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <AuthProvider>
          <ThemeProvider>
            <AuthGate />
          </ThemeProvider>
        </AuthProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

//Retrieve the publishable key for Clerk from enviornmental variables
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
}

function AuthGate() {
  const { user, loading } = useAuth();

  //Display a loading spinner while user authentiction is being resolved
  if (loading) {
    console.log("Loading user data...");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }
  if (user) {
    console.log("User is signed in:", user);
  } else {
    console.log("User is not signed in");
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        //If authenticated render the main app with tabs
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        //Otherwise, show authentication screens
        <>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="signUp" />
          <Stack.Screen name="login" />
        </>
      )}
    </Stack>
  );
}
