import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../app/context/auth";
import { View, ActivityIndicator } from "react-native";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { tokenCache } from "@/cache";



const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey) {
  throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file')
}

export default function Layout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
    <ClerkLoaded>
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
    </ClerkLoaded>
    </ClerkProvider>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();

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
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </>
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

