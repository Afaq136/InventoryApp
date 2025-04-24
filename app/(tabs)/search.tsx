import React, { useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, View, TextInput, Button, Alert, FlatList, Text } from 'react-native';
import { useTheme } from "@darkModeContext"; // Import the theme context

export default function MyLocations() {
  const { darkMode } = useTheme();  // Access the darkMode state from the theme context
  const [address, setAddress] = useState('');
  const [locations, setLocations] = useState([

    { id: '1', name: 'ICNA Nassau Community Center', latitude: 40.734189, longitude: -73.678818 },
    { id: '2', name: 'Islamic Circle of North America (ICNA)', latitude: 40.708176, longitude: -73.794304 },
    { id: '3', name: 'ICNA Relief USA', latitude: 40.685662, longitude: -73.716254 },
    { id: '4', name: 'Masjid Hamza Islamic Center', latitude: 40.704509, longitude: -73.811595 },
    { id: '5', name: 'Islamic Center of Long Island', latitude: 40.765930, longitude: -73.570808 },
    { id: '6', name: 'Shelter Rock Islamic Center (SRIC)', latitude: 40.766521, longitude: -73.669968 },

  ]);

  const addLocation = async () => {
    try {
      const coordinates = await geocodeAddress(address);
      setLocations([...locations, { id: Date.now().toString(), name: address, ...coordinates }]);
      setAddress('');
    } catch (error) {
      Alert.alert('Error', 'Unable to find location');
    }
  };

  const geocodeAddress = async (address: string) => {
    // Mock function for geocoding
    // Replace with actual API call to a geocoding service

    return { latitude: 40.730762, longitude: -73.452666 }; // Example coordinates

  };

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#1F2937' : 'white' }]}>  
      <TextInput
        style={styles.addressInput}
        placeholder="Enter Address"
        value={address}
        onChangeText={setAddress}
      />
      <Button title="Add Location" onPress={addLocation} />
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 40.734189,
          longitude: -73.678818,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title={location.name}
          />
        ))}
      </MapView>
      <FlatList
      
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.locationItem}>
             <Text style={{ color: darkMode ? 'white' : 'black' }}>{item.name}</Text>  
            
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addressInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    margin: 10,
  },
  map: {
    width: '100%',
    height: '50%',
  },
  locationItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
