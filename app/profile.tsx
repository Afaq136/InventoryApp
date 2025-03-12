import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { useTheme } from './context/DarkModeContext';

export default function UserProfile() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();
  const { darkMode } = useTheme(); 

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is irreversible. All data will be permanently lost.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => console.log("Account deleted") }
      ]
    );
  };

  return (
    <SafeAreaView style={[tw`flex-1 p-5`, darkMode ? tw`bg-black` : tw`bg-white`]}>
      <TouchableOpacity onPress={() => router.back()} style={tw`p-2`}>
        <Ionicons name="arrow-back" size={28} color={darkMode ? '#00bcd4' : '#00bcd4'} />
      </TouchableOpacity>

      <Text style={[tw`text-2xl text-center mb-6`, darkMode ? tw`text-white` : tw`text-blue-500`]}>
        User Profile
      </Text>

      <View style={[tw`border rounded-lg p-3 mb-5`, darkMode && { borderColor: '#4b5563' }]}>
        <TextInput
          placeholder="First Name..."
          value={firstName}
          onChangeText={setFirstName}
          style={[tw`border rounded-lg p-3 mb-3`, darkMode && { borderColor: '#9ca3af', backgroundColor: '#374151' }, darkMode && tw`text-white`]}
        />
        <TextInput
          placeholder="Last Name..."
          value={lastName}
          onChangeText={setLastName}
          style={[tw`border rounded-lg p-3 mb-3`, darkMode && { borderColor: '#9ca3af', backgroundColor: '#374151' }, darkMode && tw`text-white`]}
        />
        <TextInput
          placeholder="Email..."
          value={email}
          onChangeText={setEmail}
          style={[tw`border rounded-lg p-3 mb-3`, darkMode && { borderColor: '#9ca3af', backgroundColor: '#374151' }, darkMode && tw`text-white`]}
        />
        <TextInput
          placeholder="Change Password..."
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={[tw`border rounded-lg p-3 mb-3`, darkMode && { borderColor: '#9ca3af', backgroundColor: '#374151' }, darkMode && tw`text-white`]}
        />
      </View>

      <TouchableOpacity onPress={() => router.push("/dashboard")} style={[tw`py-3 rounded-lg mb-5`, darkMode ? tw`bg-blue-600` : tw`bg-blue-500`]}>
        <Text style={tw`text-white text-center`}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDeleteAccount} style={[tw`py-3 rounded-lg`, darkMode ? tw`bg-red-600` : tw`bg-red-500`]}>
        <Text style={tw`text-white text-center`}>Delete Account</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
