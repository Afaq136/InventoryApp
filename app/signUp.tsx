import { StatusBar } from "expo-status-bar";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import tw from "twrnc";
import { useState } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function SignUp() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    // Proceed with sign up
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Image
          source={require("../assets/invo_bg.png")}
          style={tw`w-50 h-50 mb-5`}
        />
        <Text style={tw`font-bold text-xl mb-2`}>Welcome!</Text>
        <Text style={tw`font-bold text-sm mb-4`}>Create your account</Text>
        <View style={tw`w-full px-12 mb-4`}>
          <TextInput
            placeholder="Full name"
            style={tw`border border-gray-300 rounded-lg p-2 mb-4`}
          />
          <TextInput
            placeholder="Email"
            style={tw`border border-gray-300 rounded-lg p-2 mb-2`}
          />
          <View style={tw`relative mb-2`}>
            <TextInput
              placeholder="Password"
              secureTextEntry={!passwordVisible}
              style={tw`border border-gray-300 rounded-lg p-2 pr-10`}
              value={password}
              onChangeText={setPassword}
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
              style={tw`border border-gray-300 rounded-lg p-2 pr-10`}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              style={tw`absolute right-2 top-2`}
              onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              <Icon
                name={confirmPasswordVisible ? "visibility" : "visibility-off"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={tw`bg-blue-500 text-white py-2 px-6 rounded-lg mb-4`}
            onPress={handleSignUp}
          >
            <Text style={tw`text-white text-sm text-center`}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        {/* Divider */}
        <View style={tw`flex-row items-center my-4`}>
          <View style={tw`flex-1 h-px bg-gray-300`} />
          <Text style={tw`mx-4 text-gray-500`}>Or</Text>
          <View style={tw`flex-1 h-px bg-gray-300`} />
        </View>

        {/* Sign in with Apple and Google */}
        <TouchableOpacity
          style={tw`bg-black text-white py-2 px-4 rounded-lg mb-4`}
        >
          <Text style={tw`text-white text-center`}>Sign in with Apple</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`bg-red-500 text-white py-2 px-4 rounded-lg`}
        >
          <Text style={tw`text-white text-center`}>Sign in with Google</Text>
        </TouchableOpacity>

        {/* Log in Link */}
        <Text style={tw`text-sm mt-4`}>
          Already have an account?{" "}
          <Link href="/login" style={tw`font-bold text-blue-500`}>
            Log in
          </Link>
        </Text>

        <StatusBar style="auto" />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
