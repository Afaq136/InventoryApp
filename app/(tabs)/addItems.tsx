import { useEffect, useLayoutEffect, useState } from "react";
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
import { router } from "expo-router";
import { addItem } from "@itemsService";
import { useTheme } from "@darkModeContext";
import { getDynamicStyles } from "@styles";
import { useNavigation } from "expo-router";
import Tags from "react-native-tags";
import { Item } from "@/types/types";
import QRCodeGenerator from "../../components/qrCodeGenerator"; // Correct path to the QRCodeGenerator component
import * as ImagePicker from "expo-image-picker"; // New import for camera and image picker
import { Image } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DropDownPicker from "react-native-dropdown-picker";


export default function AddItem() {
  const { darkMode } = useTheme();

  // These styles change dynamically based on dark mode
  const dynamicStyles = getDynamicStyles(darkMode);

  const [hasVariants, setHasVariants] = useState<boolean>(false);

  const [itemFields, setItemFields] = useState<Omit<Item, "id">>({
    name: "",
    category: "",
    tags: [],
    minLevel: 0,
    quantity: 0,
    price: 0,
    totalValue: 0,
    qrValue: "", // Initialize qrValue
    location: "",
  });

  const [photoUri, setPhotoUri] = useState<string | null>(null); //camera state
  const navigation = useNavigation();
  const categoryOptions = ["Clothes", "Food", "Books", "Other"];
  const [selectedCategory, setSelectedCategory] = useState<string>(""); // For Picker
  const [isOtherCategory, setIsOtherCategory] = useState<boolean>(false); // To toggle text input
  const [isEditingCategory, setIsEditingCategory] = useState<boolean>(true);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState(
    categoryOptions.map((opt) => ({ label: opt, value: opt }))
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

  const clearFields = async () => {
    setItemFields({
      name: "",
      category: "",
      tags: [],
      minLevel: 0,
      quantity: 0,
      price: 0,
      totalValue: 0,
      qrValue: "", // Reset qrValue
      location: "",
    });
    setPhotoUri(null); // Clear the photo URI when clearing fields
  };

  const handleSave = async () => {
    const { name, category, quantity, minLevel, price, totalValue, location } =
      itemFields;

    if (!name.trim()) {
      Alert.alert("Error", "Item name is required.");
      return;
    }

    const nameRegex = /^[A-Za-z\s-]+$/;
    const categoryRegex = /^[A-Za-z\s-]+$/;

    if (!nameRegex.test(name ?? "")) {
      Alert.alert(
        "Invalid Item Name",
        "Item name should contain only letters and spaces."
      );
      return;
    }

    if (!categoryRegex.test(category ?? "")) {
      Alert.alert(
        "Invalid Category",
        "Category should contain only letters and spaces."
      );
      return;
    }

    // Check if quantity, minLevel, price, or totalValue are not numbers
    if (
      isNaN(quantity) ||
      isNaN(minLevel) ||
      isNaN(price) ||
      isNaN(totalValue)
    ) {
      Alert.alert("Error", "Please enter a valid number.");
      return;
    }

    // TODO: generate the QR value based on all the fields, or alternativly just on the item ID
    const qrValue = `item:${name}|category:${category}`; // Generate QR code value

    try {
      const addSuccess = await addItem({
        name,
        category,
        quantity,
        minLevel,
        price,
        totalValue,
        tags: itemFields.tags, // Correctly include tags
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
      headerRight: () => (
        <TouchableOpacity style={tw`p-2`} onPress={handleSave}>
          <Ionicons name="save" size={24} color="#00bcd4" style={tw`mx-2`} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, itemFields]);

  const handleChange = (
    field: keyof Omit<Item, "id">,
    value: string | number | string[]
  ) => {
    setItemFields((prev) => ({
      ...prev,
      [field]: value,
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
    <SafeAreaView
    style={[
      dynamicStyles.containerStyle,
      !darkMode && { backgroundColor: "#ffffff" }
    ]}
  >
  
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
              value={itemFields.name}
              onChangeText={(text) => handleChange("name", text)}
              style={[dynamicStyles.textInputStyle]}
            />
          </View>
          {/* TODO, Category into Dropdown list */}
          <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
  <Text style={[dynamicStyles.textStyle]}>Category</Text>

  {isEditingCategory ? (
    <DropDownPicker
      open={categoryDropdownOpen}
      value={itemFields.category}
      items={categoryItems}
      setOpen={setCategoryDropdownOpen}
      setValue={(callback) => {
        const selected = callback(itemFields.category);
        if (selected === "Other") {
          setIsOtherCategory(true);
          // Keep 'Other' temporarily but don't set category yet
        } else {
          handleChange("category", selected);
          setIsEditingCategory(false);
          setIsOtherCategory(false);
        }
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
      textStyle={{
        color: darkMode ? "white" : "black",
        fontSize: 14,
      }}
      listItemLabelStyle={{
        fontSize: 14,
      }}
      placeholderStyle={{
        color: "#999",
      }}
    />
  ) : (
    <View
      style={[
        tw`flex-row justify-between items-center`,
        dynamicStyles.textInputStyle,
      ]}
    >
      <Text style={[tw`text-base`, dynamicStyles.textStyle]}>
        {itemFields.category}
      </Text>
      <TouchableOpacity
        onPress={() => {
          setIsEditingCategory(true);
          if (itemFields.category === "Other") {
            setIsOtherCategory(true);
          }
        }}
      >
        <Text style={[tw`text-sm text-blue-500`]}>Change</Text>
      </TouchableOpacity>
    </View>
  )}

{isOtherCategory && (
  <TextInput
    placeholder="Enter custom category"
    value={itemFields.category}
    onChangeText={(text) => {
      handleChange("category", text);

      // Dynamically add the custom category to the dropdown list
      if (
        text.trim().length > 0 &&
        !categoryOptions.includes(text) &&
        !categoryItems.some((item) => item.value === text)
      ) {
        setCategoryItems((prev) => [
          ...prev.filter((item) => item.value !== "Other"), // remove Other
          { label: text, value: text },
          { label: "Other", value: "Other" }, // add Other back at the end
        ]);
      }
    }}
    style={[dynamicStyles.textInputStyle, tw`mt-2`]}
    placeholderTextColor={darkMode ? "#aaa" : "#666"}
  />
)}


</View>

        </View>

        {/* Row 2 of text inputs */}
        <View style={dynamicStyles.row}>
          <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
            <Text style={[dynamicStyles.textStyle]}>Quantity</Text>
            <TextInput
              placeholder="-"
              value={String(itemFields.quantity)}
              onChangeText={(text) => handleChange("quantity", Number(text))}
              style={[dynamicStyles.textInputStyle]}
              keyboardType="numeric"
            />
          </View>
          <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
            <Text style={[dynamicStyles.textStyle]}>Min Level</Text>
            <TextInput
              placeholder="-"
              value={String(itemFields.minLevel)}
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
      value={itemFields.price.toString()}
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

  {/* Total Value Field */}
  <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
    <Text style={[dynamicStyles.textStyle]}>Total Value</Text>
    <TextInput
      placeholder="-"
      value={itemFields.totalValue.toString()}
      onChangeText={(text) => {
        const formatted = text.replace(/[^0-9.]/g, "");
        const decimalCount = (formatted.match(/\./g) || []).length;
        if (decimalCount > 1) return;

        if (/^\d*\.?\d{0,2}$/.test(formatted) || formatted === "") {
          handleChange("totalValue", formatted === "" ? 0 : formatted);
        }
      }}
      keyboardType="numeric"
      style={[dynamicStyles.textInputStyle]}
      placeholderTextColor={darkMode ? "#aaa" : "#666"}
    />
  </View>
</View>


        {/* TODO, make into Dropdown list */}
        {/* Location */}
        <View style={dynamicStyles.row}>
          <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
            <Text style={[dynamicStyles.textStyle]}>Location</Text>
            <TextInput
              placeholder="-"
              value={itemFields.location}
              onChangeText={(text) => handleChange("location", text)}
              style={[dynamicStyles.textInputStyle]}
            />
          </View>
        </View>

        {/* Tags */}
        <Tags
          key={itemFields.tags.toString()}
          initialText=""
          textInputProps={{
            placeholder: "Enter tag",
          }}
          initialTags={itemFields.tags}
          onChangeTags={(tags) => handleChange("tags", tags)}
          containerStyle={tw`justify-center gap-1`}
          inputStyle={{ backgroundColor: '#00bcd4', color: 'white' }}
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
      {itemFields.name && (
        <QRCodeGenerator
          value={`item:${itemFields.name}|category:${itemFields.category}`}
        />
      )}
    </SafeAreaView>
  );
}
