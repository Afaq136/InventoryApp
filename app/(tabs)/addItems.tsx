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

  const navigation = useNavigation();

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
  };

  const handleSave = async () => {
    const { name, category, quantity, minLevel, price, totalValue, location } =
      itemFields;

    if (!name.trim()) {
      Alert.alert("Error", "Item name is required.");
      return;
    }
    
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name.trim())) {
      Alert.alert("Error", "Item name can only contain letters and spaces.");
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
          <Ionicons name="save" size={28} color="#00bcd4" style={tw`mx-2`} />
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

  return (
    <SafeAreaView style={[dynamicStyles.containerStyle]}>
      <View style={tw`gap-2`}>
        {/* Photo Container */}
        <View style={[dynamicStyles.photoContainer]}>
          <Ionicons name="camera-outline" size={64} color="#00bcd4" />
          <Text style={dynamicStyles.textStyle}>Add photos</Text>
        </View>

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
            <TextInput
              placeholder="-"
              value={itemFields.category}
              onChangeText={(text) => handleChange("category", text)}
              style={[dynamicStyles.textInputStyle]}
            />
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
          <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
            <Text style={[dynamicStyles.textStyle]}>Price</Text>
            <TextInput
              placeholder="-"
              value={String(itemFields.price)}
              onChangeText={(text) => handleChange("price", Number(text))}
              style={[dynamicStyles.textInputStyle]}
              keyboardType="numeric"
            />
          </View>
          <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
            <Text style={[dynamicStyles.textStyle]}>Total Value</Text>
            <TextInput
              placeholder="-"
              value={String(itemFields.totalValue)}
              onChangeText={(text) => handleChange("totalValue", Number(text))}
              style={[dynamicStyles.textInputStyle]}
              keyboardType="numeric"
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
          inputStyle={{ backgroundColor: "white" }}
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
