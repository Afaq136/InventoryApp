import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Alert } from "react-native";

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    //redirect to homepage if signed in
    Alert.alert("You are signed in!.");
    return <Redirect href={"/(tabs)/dashboard"} />;
  }

  return <Stack />;
}
