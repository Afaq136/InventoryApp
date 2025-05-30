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
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@darkModeContext"; // Import the theme context
import { useItemStats } from "@itemStatsContext";
import { addItemLocation, removeItemLocation } from "@itemLocationService";
import { useOrganization } from "@clerk/clerk-expo";
import { GeoPoint } from "firebase/firestore";
import { Item, ItemLocation } from "@/types/types";
import { getDynamicStyles } from "@styles";
import { Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MyLocations() {
  // https://clerk.com/docs/hooks/use-organization
  const { isLoaded, organization, membership } = useOrganization();

  const isAdmin = membership?.role === "org:admin";

  const { darkMode } = useTheme(); // Access the darkMode state from the theme context

  //These styles change dynamically based off of dark mode
  const dynamicStyles = getDynamicStyles(darkMode);

  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");

  type Coordinates = {
    latitude: number;
    longitude: number;
  };

  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates>({
    latitude: 40.734189,
    longitude: -73.678818,
  });

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
      if (!address.trim()) {
        Alert.alert("Please enter an address");
        return;
      }

      const { lat, lng } = await geocodeAddress(address);

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
        coordinates: new GeoPoint(lat, lng), // GeoPoint constructor
      };

      // Call the function to add the location to Firestore
      const success = await addItemLocation(organization.id, newItemLocation);

      if (success) {
        Alert.alert("Success", "Location added successfully!");

        setSelectedCoordinates({ latitude: lat, longitude: lng });
        setLocationName("");
        setAddress("");
      }
    } catch (error) {
      // Extract meaningful error message
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", errorMessage);
    }
  };

  const geocodeAddress = async (address: string) => {
    const apiKey = process.env.EXPO_PUBLIC_GEOCODING_API_KEY;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      return { lat, lng };
    } else {
      throw new Error("No results found");
    }
  };

  const addLocationReady = address && locationName;

  return (
    <View style={dynamicStyles.containerStyle}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <>
          {/* Add location fields and button */}
          {isAdmin && (
            <View>
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
              {addLocationReady && (
                <TouchableOpacity
                  style={dynamicStyles.largeBlueButtonStyle}
                  onPress={handleAddLocation}
                >
                  <Text style={dynamicStyles.whiteTextStyle}>Add Location</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {/* Map */}
          <MapView
            style={styles.map}
            region={{
              latitude: selectedCoordinates.latitude,
              longitude: selectedCoordinates.longitude,
              latitudeDelta: 1,
              longitudeDelta: 1,
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
        </>
      </TouchableWithoutFeedback>

      {/* Locations List*/}
      {itemLocations.length > 0 ? (
        <FlatList
          data={itemLocations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={dynamicStyles.card}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCoordinates({
                    latitude: item.coordinates.latitude,
                    longitude: item.coordinates.longitude,
                  });
                }}
              >
                <Text style={dynamicStyles.textStyle}>{item.name}</Text>
              </TouchableOpacity>

              {isAdmin && (
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      const result = await removeItemLocation(
                        organization.id,
                        item.name
                      );
                      if (result.success) {
                        Alert.alert(
                          "Success",
                          `Successfully removed ${item.name}`
                        );
                      } else {
                        Alert.alert("Failure", result.errorMessage);
                      }
                    } catch (error: any) {
                      Alert.alert(
                        "Error",
                        error.message || "Something went wrong"
                      );
                    }
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      ) : (
        <View>
          <Text>There are no locations</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
