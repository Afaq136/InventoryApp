import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import tw from "twrnc";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './context/DarkModeContext'; 

export default function Locations() {
  const [locations, setLocations] = useState(['ICNA Nassau center']);
  const { darkMode } = useTheme(); 
  const router = useRouter();

  return (
    <SafeAreaView style={[tw`flex-1 p-5`, darkMode ? tw`bg-black` : tw`bg-white`]}>
      <View style={[styles.container, darkMode && { backgroundColor: '#333' }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={tw`p-2`}>
            <Ionicons name="arrow-back" size={28} color={darkMode ? '#00bcd4' : '#00bcd4'} />
          </TouchableOpacity>
          <Text style={[styles.headerText, darkMode && { color: 'white' }, tw`text-blue-500`]}>Locations</Text>
          <TouchableOpacity>
            <Text style={[styles.selectText, darkMode && { color: '#00bcd4' }]}>Select</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Search"
          placeholderTextColor={darkMode ? '#ccc' : '#888'}
          style={[styles.searchInput, darkMode && { backgroundColor: '#444', color: 'white' }]}
        />

        <TouchableOpacity
          style={styles.addLocation}
          onPress={() => router.push('/new-location')}
        >
          <Text style={[styles.addLocationText, darkMode && { color: '#00bcd4' }]}>Add Location...</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={locations}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.locationItem, darkMode && { backgroundColor: '#444' }]}
            onPress={() => router.push({ pathname: '/edit-location', params: { name: item } })}
          >
            <Text style={darkMode && { color: 'white' }}>{item}</Text>
          </TouchableOpacity>
        )}
      />
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
  backText: {
    color: '#00bcd4',
  },
  selectText: {
    color: '#00bcd4',
  },
  headerText: {
    fontWeight: 'bold',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  locationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  addLocation: {
    padding: 15,
  },
  addLocationText: {
    color: '#00bcd4',
  },
});
