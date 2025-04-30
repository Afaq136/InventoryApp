import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
} from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { addItem } from "@itemsService";
import { useTheme } from "@darkModeContext";
import { getDynamicStyles } from "@styles";
import { useNavigation } from "expo-router";
import Tags from "react-native-tags";
import { Item } from "@/types/types";
import QRCodeGenerator from "../../components/qrCodeGenerator"; // Correct path to the QRCodeGenerator component
import * as ImagePicker from "expo-image-picker"; // New import for camera and image picker
import { Image } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { Picker } from "@react-native-picker/picker";
import DropDownPicker from "react-native-dropdown-picker";
import { useItemStats } from "@itemStatsContext";
import { useLocalSearchParams } from "expo-router";

export default function AddItem() {
  const { darkMode } = useTheme();

  // These styles change dynamically based on dark mode
  const dynamicStyles = getDynamicStyles(darkMode);

  //The user's current active organization
  const { orgId } = useAuth();

  const [item, setItem] = useState<Omit<Item, "id">>({
    name: "",
    category: "",
    tags: [],
    minLevel: 0,
    quantity: 0,
    price: 0,
    qrValue: "", // Initialize qrValue
    location: "",
  });
  const { selectedFolder } = useLocalSearchParams();

  // When params load, update the item
  useEffect(() => {
    if (selectedFolder) {
      setItem((prevItem) => ({
        ...prevItem,
        category: selectedFolder as string, // Make sure it's a string
      }));
    }
  }, [selectedFolder]);

  const [photoUri, setPhotoUri] = useState<string | null>(null); //camera state
  const navigation = useNavigation();

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const { categories, locationNames } = useItemStats();

  const [categoryItems, setCategoryItems] = useState(
    categories.map((opt) => ({ label: opt, value: opt }))
  );

  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  const [locationItems, setLocationItems] = useState(
    locationNames.map((opt) => ({ label: opt, value: opt }))
  );

  useEffect(() => {
    // Camera Access
    const requestCameraPermission = async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Camera permission is required.");
      }
    };

    requestCameraPermission();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Screen is focused

      return () => {
        // Screen is unfocused (navigating away)
        clearFields();
      };
    }, [])
  );

  const clearFields = async () => {
    setItem({
      name: "",
      category: "",
      tags: [],
      minLevel: 0,
      quantity: 0,
      price: 0,
      qrValue: "", // Reset qrValue
      location: "",
    });
    setPhotoUri(null); // Clear the photo URI when clearing fields
  };

  const handleSave = async (orgId: string) => {
    const { name, category, quantity, minLevel, price, location } = item;

    if (!name.trim()) {
      Alert.alert("Error", "Item name is required.");
      return;
    }

    // Check if quantity, minLevel, price are not numbers
    if (isNaN(quantity) || isNaN(minLevel) || isNaN(price)) {
      Alert.alert("Error", "Please enter a valid number.");
      return;
    }

    // TODO: generate the QR value based on all the fields, or alternativly just on the item ID
    const qrValue = `item:${name}|category:${category}`; // Generate QR code value

    try {
      const addSuccess = await addItem(orgId, {
        name,
        category,
        quantity,
        minLevel,
        price,
        tags: item.tags, // Correctly include tags
        qrValue, // Add QR code value to the item object
        location,
      });

      if (addSuccess) {
        clearFields();
        Alert.alert("Success", "Item added successfully!");
        router.push("/items");
      } else {
        Alert.alert("Error", "Failed to add item.");
      }
    } catch (error) {
      console.error("Error", error);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  // Put a save button on the right side of the header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        orgId ? (
          <TouchableOpacity style={tw`p-2`} onPress={() => handleSave(orgId)}>
            <Ionicons name="save" size={24} color="#00bcd4" style={tw`mx-2`} />
          </TouchableOpacity>
        ) : (
          <Text>You have no active organization</Text>
        ),
    });
  }, [navigation, item]);

  const handleChange = (
    field: keyof Omit<Item, "id">,
    value: string | number | string[]
  ) => {
    if (!field) return;

    const fieldType = typeof (item as Item)?.[field];

    let cleanedValue: typeof value = value;

    if (fieldType === "number") {
      const num = typeof value === "string" ? Number(value.trim()) : value;
      if (isNaN(Number(num))) return; // Ignore if not a valid number
      cleanedValue = Number(num);
    } else if (typeof value === "string") {
      //cleanedValue = value.trim();
    } else if (Array.isArray(value)) {
      cleanedValue = value.map((v) =>
        typeof v === "string" ? v.trim() : v
      ) as typeof value;
    }

    setItem((prev) => ({
      ...prev!,
      [field]: cleanedValue,
    }));
  };

  const handleAddPhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = (result as ImagePicker.ImagePickerSuccessResult).assets[0];
      setPhotoUri(asset.uri); // Save the photo URI
    }
  };

  return (
    <SafeAreaView style={[dynamicStyles.containerStyle]}>
      <View style={tw`gap-2`}>
        {/* Photo Container */}
        <TouchableOpacity
          onPress={handleAddPhoto}
          style={[dynamicStyles.photoContainer]}
        >
          <Ionicons name="camera-outline" size={64} color="#00bcd4" />
          <Text style={dynamicStyles.textStyle}>Add photos</Text>
        </TouchableOpacity>

        {/* Display selected photo if it exists */}
        {photoUri && (
          <View style={tw`mt-4`}>
            <Text style={dynamicStyles.textStyle}>Selected Photo:</Text>
            <Image
              source={{ uri: photoUri }}
              style={{ width: 200, height: 200, borderRadius: 10 }}
            />
          </View>
        )}

        {/* Row 1 of text inputs */}
        <View style={dynamicStyles.row}>
          <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
            <Text style={[tw`font-bold`, dynamicStyles.textStyle]}>
              Item Name
            </Text>
            <TextInput
              placeholder="Enter item name"
              value={item.name}
              onChangeText={(text) => handleChange("name", text)}
              style={[dynamicStyles.textInputStyle]}
            />
          </View>
          <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
            <Text style={[dynamicStyles.textStyle]}>Category</Text>
            <DropDownPicker
              open={categoryDropdownOpen}
              value={item.category}
              items={categoryItems}
              setOpen={setCategoryDropdownOpen}
              setValue={(callback: (arg0: string) => any) => {
                const selected = callback(item.category);
                handleChange("category", selected);
              }}
              setItems={setCategoryItems}
              placeholder="Select category"
              style={{
                backgroundColor: darkMode ? "#1f2937" : "#f0f0f0",
                borderColor: "#00bcd4",
                minHeight: 40,
              }}
              dropDownContainerStyle={{
                backgroundColor: darkMode ? "#374151" : "#fff",
                borderColor: "#00bcd4",
                zIndex: 1000,
              }}
              textStyle={dynamicStyles.textStyle}
              listItemLabelStyle={dynamicStyles.textStyle}
              placeholderStyle={{
                color: "#999",
              }}
            />
          </View>
        </View>

        {/* Row 2 of text inputs */}
        <View style={dynamicStyles.row}>
          <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
            <Text style={[dynamicStyles.textStyle]}>Quantity</Text>
            <TextInput
              placeholder="-"
              value={String(item.quantity)}
              onChangeText={(text) => handleChange("quantity", Number(text))}
              style={[dynamicStyles.textInputStyle]}
              keyboardType="numeric"
            />
          </View>
          <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
            <Text style={[dynamicStyles.textStyle]}>Min Level</Text>
            <TextInput
              placeholder="-"
              value={String(item.minLevel)}
              onChangeText={(text) => handleChange("minLevel", Number(text))}
              style={[dynamicStyles.textInputStyle]}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Row 3 of text inputs */}
        <View style={dynamicStyles.row}>
          {/* Price Field */}
          <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
            <Text style={[dynamicStyles.textStyle]}>Price</Text>
            <TextInput
              placeholder="-"
              value={item.price.toString()}
              onChangeText={(text) => {
                // Allow digits and only one decimal point
                const formatted = text.replace(/[^0-9.]/g, "");
                const decimalCount = (formatted.match(/\./g) || []).length;
                if (decimalCount > 1) return;

                if (/^\d*\.?\d{0,2}$/.test(formatted) || formatted === "") {
                  handleChange("price", formatted === "" ? 0 : formatted);
                }
              }}
              keyboardType="numeric"
              style={[dynamicStyles.textInputStyle]}
              placeholderTextColor={darkMode ? "#aaa" : "#666"}
            />
          </View>
        </View>
        {/* Location */}
        <View style={dynamicStyles.row}>
          <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
            <Text style={[dynamicStyles.textStyle]}>Location</Text>

            <DropDownPicker
              open={locationDropdownOpen}
              value={item.location}
              items={locationItems}
              setOpen={setLocationDropdownOpen}
              setValue={(callback: (arg0: string) => any) => {
                const selected = callback(item.location);
                handleChange("location", selected);
              }}
              setItems={setLocationItems}
              placeholder="Select location"
              style={{
                backgroundColor: darkMode ? "#1f2937" : "#f0f0f0",
                borderColor: "#00bcd4",
                minHeight: 40,
              }}
              dropDownContainerStyle={{
                backgroundColor: darkMode ? "#374151" : "#fff",
                borderColor: "#00bcd4",
                zIndex: 1000,
              }}
              textStyle={dynamicStyles.textStyle}
              listItemLabelStyle={dynamicStyles.textStyle}
              placeholderStyle={{
                color: "#999",
              }}
            />
          </View>
        </View>

        {/* Tags */}
        <Tags
          key={item.tags.toString()}
          initialText=""
          textInputProps={{
            placeholder: "Enter tag",
          }}
          initialTags={item.tags}
          onChangeTags={(tags) => handleChange("tags", tags)}
          containerStyle={tw`justify-center gap-1`}
          inputStyle={{ backgroundColor: "#00bcd4", color: "white" }}
          renderTag={({ tag, index, onPress }) => (
            <TouchableOpacity
              style={tw`bg-red-500`}
              key={`${tag}-${index}`}
              onPress={onPress}
            >
              <Text>{tag}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* QR Code Display */}
      {item.name && (
        <QRCodeGenerator
          value={`item:${item.name}|category:${item.category}`}
        />
      )}
    </SafeAreaView>
  );
}
