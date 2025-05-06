import { StatusBar } from "expo-status-bar";
import {
  Image,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import tw from "twrnc";
import { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import { FIREBASE_AUTH } from "@firebaseConfig";
import { useTheme } from "@darkModeContext";
import { useAuth, useSignUp, useSSO } from "@clerk/clerk-expo";
import { signInWithCustomToken } from "firebase/auth";

export default function SignUp() {
  const { darkMode } = useTheme();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [fullName, setFullName] = useState("");
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const { startSSOFlow } = useSSO();

  const { getToken, isSignedIn } = useAuth(); // Use isSignedIn from Clerk

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

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    const emailRegex = /^[^@]+@[\w.-]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    const fullNameRegex = /^[A-Za-z]+ [A-Za-z]+$/;

    if (!isLoaded) return;

    if (!fullNameRegex.test(fullName)) {
      Alert.alert(
        "Invalid Name",
        "Please enter your first and last name using only letters."
      );
      return;
    }

    if (!emailRegex.test(emailAddress)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, and one special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (error) {
      console.error(JSON.stringify(error, null, 2));
      Alert.alert("Error", "Sign Up Failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      //Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });

        await signIntoFirebaseWithClerk();
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const signIntoFirebaseWithClerk = async () => {
    //Get a firebase compatible custom token from Clerk
    const token = await getToken({ template: "integration_firebase" });

    if (!token) throw new Error("Failed to retrieve Firebase token from Clerk");

    const userCredentials = await signInWithCustomToken(auth, token || "");
    console.log("User:", userCredentials.user);
  };

  //Pending verification screen
  if (pendingVerification) {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            tw`flex-1 items-center justify-center px-10`,
            { backgroundColor: darkMode ? "#1F2937" : "#ffffff" },
          ]}
        >
          <Image
            source={require("@/assets/Logo3.png")}
            style={tw`w-40 h-20 mb-6`}
          />
          <Text
            style={[
              tw`text-xl font-bold mb-2 text-blue-500`,
              darkMode && { color: "#60a5fa" },
            ]}
          >
            Verify your email
          </Text>
          <Text
            style={[
              tw`text-sm text-center mb-6 text-gray-600`,
              darkMode && { color: "#d1d5db" },
            ]}
          >
            We've sent a verification code to your email. Please enter it below.
          </Text>

          <TextInput
            value={code}
            placeholder="Verification code"
            placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
            onChangeText={(text) => setCode(text.replace(/\s/g, ""))}
            keyboardType="numeric"
            style={[
              tw`border border-gray-300 rounded-lg p-3 w-full mb-4`,
              darkMode && {
                backgroundColor: "#374151",
                borderColor: "#9ca3af",
                color: "#e5e7eb",
              },
            ]}
          />

          <TouchableOpacity onPress={onVerifyPress}>
            <View
              style={[
                tw`bg-blue-500 py-2 px-6 rounded-lg mb-4`,
                darkMode && { backgroundColor: "#3b82f6" },
              ]}
            >
              <Text
                style={[
                  tw`text-white text-sm text-center`,
                  darkMode && { color: "#f3f4f6" },
                ]}
              >
                Verify
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={[tw`text-sm`, darkMode && { color: "#d1d5db" }]}>
            Didn't receive the code?
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (!signUp) {
                Alert.alert("Error", "Sign-up.tsx: Sign-up is undefined.");
                return;
              }

              signUp.prepareEmailAddressVerification({
                strategy: "email_code",
              });
            }}
          >
            <Text
              style={[
                tw`text-green-500 font-bold`,
                darkMode && { color: "#34d399" },
              ]}
            >
              Resend Code
            </Text>
          </TouchableOpacity>

          <StatusBar style={darkMode ? "light" : "auto"} />
        </View>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      style={tw`flex-1`}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            tw`flex-1 items-center justify-center`,
            { backgroundColor: darkMode ? "#1F2937" : "#ffffff" },
          ]}
        >
          <Image
            source={require("@/assets/Logo3.png")}
            style={tw`w-40 h-20 mb-4`}
          />

          <Text
            style={[
              tw`font-bold text-xl mb-2 text-blue-500`,
              darkMode && { color: "#60a5fa" },
            ]}
          >
            Welcome!
          </Text>
          <Text
            style={[
              tw`font-bold text-sm mb-4 text-blue-500`,
              darkMode && { color: "#60a5fa" },
            ]}
          >
            Create your account
          </Text>

          <View style={tw`w-full px-12 mb-4`}>
            <TextInput
              placeholder="Full name"
              value={fullName}
              onChangeText={setFullName}
              style={[
                tw`border border-gray-300 rounded-lg p-2 mb-2`,
                darkMode && {
                  backgroundColor: "#374151",
                  borderColor: "#9ca3af",
                  color: "#e5e7eb",
                },
              ]}
            />
            <TextInput
              placeholder="Email"
              value={emailAddress}
              onChangeText={(text) => setEmailAddress(text.replace(/\s/g, ""))}
              autoCapitalize="none"
              style={[
                tw`border border-gray-300 rounded-lg p-2 mb-2`,
                darkMode && {
                  backgroundColor: "#374151",
                  borderColor: "#9ca3af",
                  color: "#e5e7eb",
                },
              ]}
            />
            <View style={tw`relative mb-2`}>
              <TextInput
                placeholder="Password"
                secureTextEntry={!passwordVisible}
                style={[
                  tw`border border-gray-300 rounded-lg p-2 pr-10`,
                  darkMode && {
                    backgroundColor: "#374151",
                    borderColor: "#9ca3af",
                    color: "#e5e7eb",
                  },
                ]}
                value={password}
                autoCapitalize="none"
                onChangeText={(text) => setPassword(text.replace(/\s/g, ""))}
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
            <View style={tw`relative mb-2`}>
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry={!confirmPasswordVisible}
                style={[
                  tw`border border-gray-300 rounded-lg p-2 pr-10`,
                  darkMode && {
                    backgroundColor: "#374151",
                    borderColor: "#9ca3af",
                    color: "#e5e7eb",
                  },
                ]}
                value={confirmPassword}
                autoCapitalize="none"
                onChangeText={(text) =>
                  setConfirmPassword(text.replace(/\s/g, ""))
                }
              />
              <TouchableOpacity
                style={tw`absolute right-2 top-2`}
                onPress={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                }
              >
                <Icon
                  name={
                    confirmPasswordVisible ? "visibility" : "visibility-off"
                  }
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={onSignUpPress} disabled={loading}>
            <View
              style={[
                tw`bg-blue-500 text-white py-2 px-6 rounded-lg mb-4`,
                darkMode && { backgroundColor: "#3b82f6" },
              ]}
            >
              <Text
                style={[
                  tw`text-white text-sm text-center`,
                  darkMode && { color: "#f3f4f6" },
                ]}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </Text>
            </View>
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
            onPress={handleGoogleSignIn}
            style={[
              tw`bg-red-500 text-white py-2 px-4 rounded-lg`,
              darkMode && { backgroundColor: "#ef4444" },
            ]}
          >
            <Text style={tw`text-white text-center`}>Sign up with Google</Text>
          </TouchableOpacity>

          <Text style={[tw`text-sm mt-4`, darkMode && { color: "#d1d5db" }]}>
            Already have an account?{" "}
          </Text>
          <Link href="/login">
            <Text
              style={[
                tw`font-bold text-green-500`,
                darkMode && { color: "#34d399" },
              ]}
            >
              Log in
            </Text>
          </Link>

          <StatusBar style={darkMode ? "light" : "auto"} />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
