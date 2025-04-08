import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "@authContext";
import { ThemeProvider } from "@darkModeContext";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { tokenCache } from "@/cache";
import SplashScreenComponent from "./SplashScreen"; // Import animated splash screen
import { ItemStatsProvider } from "@/app/context/ItemStatsContext";

// Retrieve the publishable key for Clerk from environmental variables
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
if (!publishableKey) {
  throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
}

// Top-level providers
export default function Layout() {
  const [isSplashVisible, setSplashVisible] = useState(true);

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <AuthProvider>
          <ThemeProvider>
            <ItemStatsProvider>
              {isSplashVisible ? (
                <SplashScreenComponent
                  onAnimationFinish={() => setSplashVisible(false)}
                />
              ) : (
                <AuthGate />
              )}
            </ItemStatsProvider>
          </ThemeProvider>
        </AuthProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="signUp" />
          <Stack.Screen name="login" />
        </>
      )}
    </Stack>
  );
}
