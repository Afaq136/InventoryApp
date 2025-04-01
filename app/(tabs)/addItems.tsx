import { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  SafeAreaView,
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
import { setItem } from "expo-secure-store";

export default function AddItem() {
  const { darkMode } = useTheme();

  //These styles change dynamically based off of dark mode
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
    });
  };

  const handleSave = async () => {
    if (itemFields && itemFields.name.trim())
      try {
        await addItem(itemFields);
        clearFields();
        router.push("/items");
      } catch (error) {
        console.error("Error", "Failed to save item");
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
  }, [navigation, itemFields]);

  const handleChange = (
    field: keyof Omit<Item, "id">,
    value: string | number | string[]
  ) => {
    if (!field) return;

    setItemFields((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  return (
    <SafeAreaView style={[dynamicStyles.containerStyle]}>
      <View style={tw`gap-2`}>
        {/*Photo Container*/}
        <View style={[dynamicStyles.photoContainer]}>
          <Ionicons name="camera-outline" size={64} color="#00bcd4" />
          <Text style={dynamicStyles.textStyle}>Add photos</Text>
        </View>
        {/*Row 1 of text inputs*/}
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
        {/*Row 2 of text inputs*/}
        <View style={dynamicStyles.row}>
          <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
            <Text style={[dynamicStyles.textStyle]}>Quantity</Text>
            <TextInput
              placeholder="-"
              value={String(itemFields.quantity)}
              onChangeText={(text) => handleChange("quantity", text)}
              style={[dynamicStyles.textInputStyle]}
              keyboardType="numeric"
            />
          </View>
          <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
            <Text style={[dynamicStyles.textStyle]}>Min Level</Text>
            <TextInput
              placeholder="-"
              value={String(itemFields.minLevel)}
              onChangeText={(text) => handleChange("minLevel", text)}
              style={[dynamicStyles.textInputStyle]}
              keyboardType="numeric"
            />
          </View>
        </View>
        {/*Row 3 of text inputs*/}
        <View style={dynamicStyles.row}>
          <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
            <Text style={[dynamicStyles.textStyle]}>Price</Text>
            <TextInput
              placeholder="-"
              value={String(itemFields.minLevel)}
              onChangeText={(text) => handleChange("price", text)}
              style={[dynamicStyles.textInputStyle]}
              keyboardType="numeric"
            />
          </View>
          <View style={[dynamicStyles.inputContainer, tw`flex-1`]}>
            <Text style={[dynamicStyles.textStyle]}>Total Value</Text>
            <TextInput
              placeholder="-"
              value={String(itemFields.totalValue)}
              onChangeText={(text) => handleChange("totalValue", text)}
              style={[dynamicStyles.textInputStyle]}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* https://github.com/peterp/react-native-tags#readme */}
        <Tags
          key={itemFields.tags.toString()} //The tag list updates when the itemTags update
          initialText=""
          textInputProps={{
            placeholder: "Enter tag",
          }}
          initialTags={itemFields.tags}
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
          renderTag={({ tag, index, onPress, deleteTagOnPress, readonly }) => (
            <TouchableOpacity
              style={tw`bg-red-500`}
              key={`${tag}-${index}`}
              onPress={onPress}
            >
              <Text>{tag}</Text>
            </TouchableOpacity>
          )}
        />

        {/*Customization Buttons*/}
        <TouchableOpacity style={dynamicStyles.blueButtonStyle}>
          <Text style={dynamicStyles.blueTextStyle}>Create Custom Label</Text>
        </TouchableOpacity>
        <TouchableOpacity style={dynamicStyles.blueButtonStyle}>
          <Text style={dynamicStyles.blueTextStyle}>Link QR / Barcode</Text>
        </TouchableOpacity>

        {/*Row for switches*/}
        <View style={dynamicStyles.row}>
          <Text style={darkMode ? { color: "white" } : {}}>
            This item has variants
          </Text>
          <Switch value={hasVariants} onValueChange={setHasVariants} />
        </View>
      </View>
    </SafeAreaView>
  );
}
