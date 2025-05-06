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
import { FIREBASE_AUTH } from "@firebaseConfig";
import { signInWithCustomToken } from "firebase/auth";
import { useState, useEffect } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@darkModeContext";
import { useSSO, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import "firebase/compat/auth";
import { useSignIn } from "@clerk/clerk-expo";

export default function Login() {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { darkMode } = useTheme();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const { getToken, isSignedIn } = useAuth();

  const { signIn, setActive, isLoaded } = useSignIn();

  const auth = FIREBASE_AUTH;

  useEffect(() => {
    // If user is already signed in, redirect to dashboard
    if (isSignedIn) {
      router.replace("/(tabs)/dashboard");
    }
  }, [isSignedIn, router]);

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (setActive && createdSessionId) {
        await setActive({ session: createdSessionId });

        await signIntoFirebaseWithClerk();
      }
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      alert("Google Sign-In failed.");
    }
  };

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(emailAddress)) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });

        await signIntoFirebaseWithClerk();
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const signIntoFirebaseWithClerk = async () => {
    //Get a firebase compatible custom token from Clerk
    const token = await getToken({ template: "integration_firebase" });

    if (!token) throw new Error("Failed to retrieve Firebase token from Clerk");

    const userCredentials = await signInWithCustomToken(auth, token || "");
    console.log("User:", userCredentials.user);
  };

  return (
    //Close the keyboard
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={[
          tw`flex-1 items-center justify-center`,
          { backgroundColor: darkMode ? "#1F2937" : "#ffffff" },
        ]}
      >
        <Image
          source={require("@/assets/Logo3.png")}
          style={tw`w-40 h-20 mb-4`}
          resizeMode="contain"
        />

        <Text
          style={[
            tw`font-bold text-xl mb-2 text-blue-500`,
            darkMode && { color: "#60a5fa" },
          ]}
        >
          Welcome Back!
        </Text>
        <Text
          style={[
            tw`font-bold text-sm mb-4 text-blue-500`,
            darkMode && { color: "#60a5fa" },
          ]}
        >
          Login to your account
        </Text>

        <View style={tw`w-full px-12 mb-4`}>
          <TextInput
            value={emailAddress}
            placeholder="Enter email"
            autoCapitalize="none"
            onChangeText={(text) => setEmailAddress(text.replace(/\s/g, ""))}
            style={[
              tw`border border-gray-300 rounded-lg p-2 mb-4`,
              darkMode && {
                backgroundColor: "#374151",
                borderColor: "#9ca3af",
                color: "#e5e7eb",
              },
            ]}
          />
          <View style={tw`relative mb-2`}>
            <TextInput
              value={password}
              onChangeText={(text) => setPassword(text.replace(/\s/g, ""))}
              autoCapitalize="none"
              placeholder="Enter password"
              secureTextEntry={!passwordVisible}
              style={[
                tw`border border-gray-300 rounded-lg p-2 pr-10`,
                darkMode && {
                  backgroundColor: "#374151",
                  borderColor: "#9ca3af",
                  color: "#e5e7eb",
                },
              ]}
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

        <Link href="/resetPassword">
          <Text
            style={[
              tw`font-bold text-sm mb-4 text-green-500`,
              darkMode && { color: "#34d399" },
            ]}
          >
            Forgot Password?
          </Text>
        </Link>

        <TouchableOpacity
          style={[
            tw`bg-blue-500 text-white py-2 px-6 rounded-lg mb-4`,
            darkMode && { backgroundColor: "#3b82f6" },
          ]}
          onPress={onSignInPress}
          disabled={loading}
        >
          <Text
            style={[
              tw`text-white text-sm text-center`,
              darkMode && { color: "#f3f4f6" },
            ]}
          >
            {loading ? "Logging In..." : "Continue"}
          </Text>
        </TouchableOpacity>

        <View style={tw`flex-row items-center my-4`}>
          <View style={tw`flex-1 h-px bg-gray-300`} />
          <Text
            style={[tw`mx-4 text-gray-500`, darkMode && { color: "#d1d5db" }]}
          >
            Or
          </Text>
          <View style={tw`flex-1 h-px bg-gray-300`} />
        </View>
        <TouchableOpacity
          style={[
            tw`bg-red-500 text-white py-2 px-4 rounded-lg`,
            darkMode && { backgroundColor: "#ef4444" },
          ]}
          onPress={handleGoogleSignIn}
        >
          <Text style={tw`text-white text-center`}>Sign in with Google</Text>
        </TouchableOpacity>

        <Text style={[tw`text-sm mt-4`, darkMode && { color: "#d1d5db" }]}>
          Don't have an account?{" "}
        </Text>
        <Link href="/signUp">
          <Text
            style={[
              tw`font-bold text-green-500`,
              darkMode && { color: "#34d399" },
            ]}
          >
            Sign Up
          </Text>
        </Link>

        <StatusBar style={darkMode ? "light" : "auto"} />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
