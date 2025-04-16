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
import { useState } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH } from "@firebaseConfig";
import { useTheme } from "@darkModeContext";
import { useSignUp } from "@clerk/clerk-expo";

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

      /*
      const response = await createUserWithEmailAndPassword(
        auth,
        emailAddress,
        password
      );

      console.log(response);
      Alert.alert("Check your email!");
      router.push("/(tabs)/dashboard");
      */
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
        console.log("sign up success!");
        router.replace("/");
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

  //Pending verification screen
  if (pendingVerification) {
    return (
      <View>
        <Text>Verify your email</Text>
        <TextInput
          value={code}
          placeholder="Enter your verification code"
          onChangeText={(code) => setCode(code)}
        />
        <TouchableOpacity onPress={onVerifyPress}>
          <Text>Verify</Text>
        </TouchableOpacity>
      </View>
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
            darkMode && { backgroundColor: "#1F2937" },
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
            style={[
              tw`bg-black text-white py-2 px-4 rounded-lg mb-4`,
              darkMode && { backgroundColor: "#111827" },
            ]}
          >
            <Text style={tw`text-white text-center`}>Sign up with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
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
