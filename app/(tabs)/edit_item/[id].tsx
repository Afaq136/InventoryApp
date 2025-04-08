import { useLocalSearchParams, useNavigation } from "expo-router";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { useTheme } from "@darkModeContext";
import { getDynamicStyles } from "@styles";
import { getItem } from "@itemsService";
import { useEffect, useLayoutEffect, useState } from "react";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons"; // Assuming you're using Expo for icons
import { editItem } from "@itemsService";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import ItemAnalytics from "@/app/item-analytics";
import { Item } from "@/types/types";
import Tags from "react-native-tags";
//import { Alert } from "react-native";

export default function EditItem() {
  const { darkMode } = useTheme();

  // These styles change dynamically based on dark mode
  const dynamicStyles = getDynamicStyles(darkMode);

  // The fields of the item after changes
  const [item, setItem] = useState<Item | null>();

  // The fields of the item before any saved changes
  const [originalItem, setOriginalItem] = useState<Item | null>();

  const [loading, setLoading] = useState(true);

  const { id } = useLocalSearchParams();

  // Ensure `id` is a valid string
  const itemId = Array.isArray(id) ? id[0] : id;

  const navigation = useNavigation();

  //Each time itemId changes, update the current item from firebase
  useEffect(() => {
    const fetchItem = async () => {
      if (itemId) {
        try {
          const fetchedItem = await getItem(itemId);
          //Update the fields based on the new item
          setItem(fetchedItem);
          setOriginalItem(fetchedItem);
        } catch (error) {
          console.error("Error fetching item:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchItem();
  }, [id]);

  const handleSave = async () => {
    if (!item || !originalItem) {
      Alert.alert("Error", "Item or Original item does not exist.");
      return;
    }

    if (!item.name.trim()) {
      Alert.alert("Error", "Item name is required.");
      return;
    }

    // Check if quantity, minLevel, price, or totalValue are not numbers
    if (
      isNaN(item.quantity) ||
      isNaN(item.minLevel) ||
      isNaN(item.price) ||
      isNaN(item.totalValue)
    ) {
      Alert.alert("Error", "Please enter a valid number.");
      return;
    }

    const nameRegex = /^[A-Za-z ]+$/;
    const categoryRegex = /^[A-Za-z ]+$/;
    
    if (!nameRegex.test(item.name ?? "")) {
      Alert.alert("Invalid Item Name", "Item name should contain only letters and spaces.");
      return;
    }
    
    if (!categoryRegex.test(item.category ?? "")) {
      Alert.alert("Invalid Category", "Category should contain only letters and spaces.");
      return;
    }

    const noChanges =
      (item.name ?? "") === (originalItem.name ?? "") &&
      (item.category ?? "") === (originalItem.category ?? "") &&
      (item.quantity ?? 0) === (originalItem.quantity ?? 0) &&
      (item.minLevel ?? 0) === (originalItem.minLevel ?? 0) &&
      (item.price ?? 0) === (originalItem.price ?? 0) &&
      (item.tags ?? []).join(",") === (originalItem.tags ?? []).join(",") &&
      (item.location ?? "") === (originalItem.location ?? "");

    if (noChanges) {
      Alert.alert("No Changes", "No changes were made to the item.");
      return;
    }

    try {
      await editItem(originalItem, item); // Update item in the database
      router.push("/items");
    } catch (error) {
      Alert.alert("Error", "Failed to save item");
    }
  };

  //Put a save button on the right side of the header
  //useLayoutEffect ensures the navigation bar updates before the UI is drawn
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        //Save Button
        <TouchableOpacity style={tw`p-2`} onPress={handleSave}>
          {/* Save Icon */}
          <Ionicons name="save" size={28} color="#00bcd4" style={tw`mx-2`} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, item]);

  const handleChange = (
    field: keyof Omit<Item, "id">,
    value: string | number | string[]
  ) => {
    if (!field) return;

    setItem((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  return (
    <SafeAreaView style={dynamicStyles.containerStyle}>
      {/* Label for item being edited */}
      <View style={dynamicStyles.header}>
        <Text style={[dynamicStyles.textStyle, dynamicStyles.headerTextStyle]}>
          {item && !loading
            ? `Item Name: ${item.name}`
            : `No item found for ID: ${itemId}`}
        </Text>
      </View>
      {/* Display text inputs only if currentItem exists */}
      {item && !loading && (
        <View style={tw`gap-3`}>
          {/*Row 1 of text inputs*/}
          <View style={dynamicStyles.row}>
            {/* Item Name */}
            <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
              <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>
                Item Name
              </Text>
              <TextInput
                placeholder="Enter item name"
                value={item.name}
                onChangeText={(text) => handleChange("name", text)}
                style={[dynamicStyles.textInputStyle]}
              />
            </View>
            {/* TODO, make into Dropdown list */}
            {/* Category */}
            <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
              <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>
                Category
              </Text>
              <TextInput
                placeholder="-"
                value={item.category}
                onChangeText={(text) => handleChange("category", text)}
                style={[dynamicStyles.textInputStyle]}
              />
            </View>
          </View>
          {/*Row 2 of text inputs*/}
          <View style={dynamicStyles.row}>
            {/* Quantity */}
            <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
              <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>
                Quantity
              </Text>
              <TextInput
                placeholder="-"
                value={String(item.quantity)}
                onChangeText={(text) => handleChange("quantity", text)}
                style={[dynamicStyles.textInputStyle]}
                keyboardType="numeric"
              />
            </View>
            {/* Min Level */}
            <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
              <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>
                Min Level
              </Text>
              <TextInput
                placeholder="-"
                value={String(item.minLevel)}
                onChangeText={(text) => handleChange("minLevel", text)}
                style={[dynamicStyles.textInputStyle]}
                keyboardType="numeric"
              />
            </View>
          </View>
          {/*Row 3 of text inputs*/}
          <View style={dynamicStyles.row}>
            {/* Price */}
            <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
              <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>
                Price
              </Text>
              <TextInput
                placeholder="-"
                value={String(item.price)}
                onChangeText={(text) => handleChange("price", text)}
                style={[dynamicStyles.textInputStyle]}
                keyboardType="numeric"
              />
            </View>
            <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
              {/* Total Value */}
              <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>
                Total Value
              </Text>
              <TextInput
                placeholder="-"
                value={String(item.totalValue)}
                onChangeText={(text) => handleChange("totalValue", text)}
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
                value={item.location}
                onChangeText={(text) => handleChange("location", text)}
                style={[dynamicStyles.textInputStyle]}
              />
            </View>
          </View>
          {/* https://github.com/peterp/react-native-tags#readme */}
          <Tags
            key={item.id} //update when item.id is changed
            initialText=""
            textInputProps={{
              placeholder: "Enter tag",
            }}
            initialTags={item.tags}
            onChangeTags={(tags) => handleChange("tags", tags)}
            onTagPress={(index, tagLabel, event, deleted) =>
              console.log(
                index,
                tagLabel,
                event,
                deleted ? "deleted" : "not deleted"
              )
            }
            containerStyle={tw`justify-center gap-1`}
            inputStyle={{ backgroundColor: "white" }}
            renderTag={({
              tag,
              index,
              onPress,
              deleteTagOnPress,
              readonly,
            }) => (
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
      )}
    </SafeAreaView>
  );
}
