import { StatusBar } from "expo-status-bar";
import { Image, StyleSheet, Button, Text, View } from "react-native";
import { Link } from "expo-router";
import tw from "twrnc";

export default function App() {
  return (
    <View style={tw`flex-1 bg-white items-center justify-center`}>
      <Image
        source={require("../assets/invo_bg.png")}
        style={tw`absolute top-5 w-50 h-50`}
      ></Image>
      <Text style={tw`font-bold text-3xl absolute top-60`}>Get Started!</Text>
      <Text style={tw`font-bold text-xl absolute top-80`}>
        Start with Sign up or Login
      </Text>
      <Link
        href="/signUp"
        style={tw`bg-blue-500 text-white text-lg py-2 px-20 rounded-xl mt-60 mb-10`}
      >
        Sign Up
      </Link>
      <Link
        href="/login"
        style={tw`bg-blue-500 text-white text-lg py-2 px-22 rounded-xl mb-10`}
      >
        Login
      </Link>
      <StatusBar style="auto" />
    </View>
  );
}
