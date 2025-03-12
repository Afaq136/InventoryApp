import { Link } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import tw from "twrnc";
import { useTheme } from './../context/DarkModeContext'; 

export default function JoinWorkspace() {
  const { darkMode } = useTheme(); 

  const backgroundColor = darkMode ? '#121212' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#000000';
  const infoTextColor = darkMode ? '#888' : '#888';
  const borderColor = darkMode ? '#444444' : '#ccc';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: textColor }]}>Join Organization</Text>
        <TouchableOpacity>
          <Link
            href="/(tabs)/dashboard"
            style={tw`bg-blue-500 text-white py-2 px-6 rounded-lg mb-4`}
          >
            <Text style={tw`text-white text-sm text-center`}>Next</Text>
          </Link>
        </TouchableOpacity>
      </View>
      <Text style={[styles.title, { color: textColor }]}>Enter Invite Code</Text>
      <View style={styles.codeContainer}>
      </View>
      <Text style={[styles.infoText, { color: infoTextColor }]}>
        In case you have no code or it's expired, please request a new code from the workspace owner.
      </Text>
    </View>
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
  cancelText: {
    color: 'blue',
  },
  nextText: {
    color: 'blue',
  },
  headerText: {
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoText: {
    color: '#888',
  },
});
