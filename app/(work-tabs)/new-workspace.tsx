import { Link } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import tw from "twrnc";
import { useTheme } from './../context/DarkModeContext'; 

export default function NewWorkspace() {
  const [organizationName, setOrganizationName] = useState('');
  const { darkMode } = useTheme(); 

  const backgroundColor = darkMode ? '#121212' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#000000';
  const inputBorderColor = darkMode ? '#444444' : '#ccc';

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: textColor }]}>New Organization</Text>
          <TouchableOpacity>
            <Link
              href={{
                pathname: '/(tabs)/dashboard',
                params: { organizationName },
              }}
              style={tw`bg-blue-500 text-white py-2 px-6 rounded-lg mb-4`}
            >
              <Text style={tw`text-white text-sm text-center`}>Next</Text>
            </Link>
          </TouchableOpacity>
        </View>
        <TextInput
          placeholder="Business Name"
          value={organizationName}
          onChangeText={setOrganizationName}
          style={[styles.input, { borderColor: inputBorderColor, color: textColor }]}
          maxLength={40}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
});
