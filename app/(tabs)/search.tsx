import React, { useState } from "react";
import MapView, { Marker } from "react-native-maps";
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  Alert,
  FlatList,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme } from "@darkModeContext"; // Import the theme context
import { useItemStats } from "@itemStatsContext";
import { addItemLocation } from "@itemsService";
import { useOrganization } from "@clerk/clerk-expo";
import { GeoPoint } from "firebase/firestore";
import { ItemLocation } from "@/types/types";
import { getDynamicStyles } from "@styles";
import { Keyboard } from "react-native";

export default function MyLocations() {
  // https://clerk.com/docs/hooks/use-organization
  const { isLoaded, organization } = useOrganization();

  const { darkMode } = useTheme(); // Access the darkMode state from the theme context

  //These styles change dynamically based off of dark mode
  const dynamicStyles = getDynamicStyles(darkMode);

  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");
  const [locations, setLocations] = useState([
    {
      id: "1",
      name: "ICNA Nassau Community Center",
      latitude: 40.734189,
      longitude: -73.678818,
    },
    {
      id: "2",
      name: "Islamic Circle of North America (ICNA)",
      latitude: 40.708176,
      longitude: -73.794304,
    },
    {
      id: "3",
      name: "ICNA Relief USA",
      latitude: 40.685662,
      longitude: -73.716254,
    },
    {
      id: "4",
      name: "Masjid Hamza Islamic Center",
      latitude: 40.704509,
      longitude: -73.811595,
    },
    {
      id: "5",
      name: "Islamic Center of Long Island",
      latitude: 40.76593,
      longitude: -73.570808,
    },
    {
      id: "6",
      name: "Shelter Rock Islamic Center (SRIC)",
      latitude: 40.766521,
      longitude: -73.669968,
    },
  ]);
  const { itemLocations } = useItemStats();

  if (!organization) {
    return (
      <View style={dynamicStyles.containerStyle}>
        <Text style={dynamicStyles.textStyle}>
          You are not part of an organization.
        </Text>
      </View>
    );
  }

  const handleAddLocation = async () => {
    try {
      // Convert latitude and longitude to numbers
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lon)) {
        Alert.alert("Invalid latitude or longitude");
        return;
      }

      if (!locationName.trim()) {
        Alert.alert("Please enter a location name");
        return;
      }

      if (!organization.id) {
        Alert.alert("Error", "Organization ID is missing");
        return;
      }

      // Create the ItemLocation object
      const newItemLocation: Omit<ItemLocation, "id"> = {
        name: locationName,
        coordinates: new GeoPoint(lat, lon), // GeoPoint constructor
      };

      // Call the function to add the location to Firestore
      const success = await addItemLocation(organization.id, newItemLocation);

      if (success) {
        Alert.alert("Success", "Location added successfully!");
      }
    } catch (error) {
      // Extract meaningful error message
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", errorMessage);
    }
  };

  const geocodeAddress = async (address: string) => {
    // Mock function for geocoding
    // Replace with actual API call to a geocoding service

    return { latitude: 40.730762, longitude: -73.452666 }; // Example coordinates
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={dynamicStyles.containerStyle}>
        <TextInput
          style={styles.addressInput}
          placeholder="Enter Address"
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.addressInput}
          placeholder="Enter Location Name"
          value={locationName}
          onChangeText={setLocationName}
        />
        <TextInput
          style={styles.addressInput}
          placeholder="Enter Latitude"
          value={latitude}
          onChangeText={setLatitude}
        />
        <TextInput
          style={styles.addressInput}
          placeholder="Enter Longitude"
          value={longitude}
          onChangeText={setLongitude}
        />
        <Button title="Add Location" onPress={handleAddLocation} />
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 40.734189,
            longitude: -73.678818,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {itemLocations.map((itemLocation) => (
            <Marker
              key={itemLocation.id}
              coordinate={{
                latitude: itemLocation.coordinates.latitude,
                longitude: itemLocation.coordinates.longitude,
              }}
              title={itemLocation.name}
            />
          ))}
        </MapView>
        <FlatList
          data={itemLocations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.locationItem}>
              <Text style={{ color: darkMode ? "white" : "black" }}>
                {item.name}
              </Text>
            </View>
          )}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addressInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    margin: 5,
  },
  map: {
    width: "100%",
    height: "50%",
  },
  locationItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
