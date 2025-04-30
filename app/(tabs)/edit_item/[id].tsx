import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@darkModeContext";
import { getDynamicStyles } from "@styles";
import { getItem } from "@itemsService";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons"; // Assuming you're using Expo for icons
import { editItem } from "@itemsService";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import ItemAnalytics from "@/app/item-analytics";
import { Item } from "@/types/types";
import Tags from "react-native-tags";
import { useOrganization } from "@clerk/clerk-expo";
import { useItemStats } from "@itemStatsContext";
import DropDownPicker from "react-native-dropdown-picker";

export default function EditItem() {
  const { darkMode } = useTheme();

  // These styles change dynamically based on dark mode
  const dynamicStyles = getDynamicStyles(darkMode);

  // The fields of the item after changes
  const [item, setItem] = useState<Item | null>();

  const { categories, locationNames } = useItemStats();

  const [categoryItems, setCategoryItems] = useState(
    categories.map((opt) => ({ label: opt, value: opt }))
  );

  const [locationItems, setLocationItems] = useState(
    locationNames.map((opt) => ({ label: opt, value: opt }))
  );

  useEffect(() => {
    setCategoryItems(categories.map((opt) => ({ label: opt, value: opt })));
  }, [categories]);

  useEffect(() => {
    setLocationItems(locationNames.map((opt) => ({ label: opt, value: opt })));
  }, [locationNames]);

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  // Doesn't trigger a re-render when value changes
  const originalItemRef = useRef<Item | null>(null);

  const [loading, setLoading] = useState(true);

  const { id } = useLocalSearchParams();

  // https://clerk.com/docs/hooks/use-organization
  const { organization } = useOrganization();

  // Ensure `id` is a valid string
  const itemId = Array.isArray(id) ? id[0] : id;

  const navigation = useNavigation();

  const wasSavedRef = useRef(false); // tracks if save occurred

  //Each time itemId changes, update the current item from firebase
  useEffect(() => {
    const fetchItem = async () => {
      if (itemId && organization?.id) {
        try {
          setLoading(true);
          const fetchedItem = await getItem(organization.id, itemId);
          //Update the fields based on the new item
          setItem(fetchedItem);

          //Update the original item
          originalItemRef.current = fetchedItem;
        } catch (error) {
          console.error("Error fetching item:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchItem();
  }, [organization?.id, itemId]);

  useFocusEffect(
    useCallback(() => {
      // Screen is focused

      return () => {
        // Screen is unfocused (navigating away)
        if (!wasSavedRef.current && originalItemRef.current) {
          //Reset the item to its original state when navigating away from the edit screen
          setItem(originalItemRef.current);
        }
        wasSavedRef.current = false; // reset for next visit
      };
    }, [loading])
  );

  const handleSave = async (organizationId: string) => {
    if (!item || !originalItemRef.current) {
      Alert.alert("Error", "Item or Original item does not exist.");
      return;
    }

    if (!item.name.trim()) {
      Alert.alert("Error", "Item name is required.");
      return;
    }

    // Check if quantity, minLevel, price are not numbers
    if (isNaN(item.quantity) || isNaN(item.minLevel) || isNaN(item.price)) {
      Alert.alert("Error", "Please enter a valid number.");
      return;
    }

    const nameRegex = /^[A-Za-z\s-]+$/;
    const categoryRegex = /^[A-Za-z\s-]+$/;

    if (!nameRegex.test(item.name ?? "")) {
      Alert.alert(
        "Invalid Item Name",
        "Item name should contain only letters and spaces."
      );
      return;
    }

    if (!categoryRegex.test(item.category ?? "")) {
      Alert.alert(
        "Invalid Category",
        "Category should contain only letters and spaces."
      );
      return;
    }

    const noChanges =
      (item.name ?? "") === (originalItemRef.current.name ?? "") &&
      (item.category ?? "") === (originalItemRef.current.category ?? "") &&
      (item.quantity ?? 0) === (originalItemRef.current.quantity ?? 0) &&
      (item.minLevel ?? 0) === (originalItemRef.current.minLevel ?? 0) &&
      (item.price ?? 0) === (originalItemRef.current.price ?? 0) &&
      (item.tags ?? []).join(",") ===
        (originalItemRef.current.tags ?? []).join(",") &&
      (item.location ?? "") === (originalItemRef.current.location ?? "");

    if (noChanges) {
      Alert.alert("No Changes", "No changes were made to the item.");
      return;
    }

    try {
      wasSavedRef.current = true;
      setLoading(true);
      await editItem(organizationId, originalItemRef.current, item); // Update item in the database
      originalItemRef.current = item;
      setLoading(false);
      router.push("/items");
    } catch (error) {
      Alert.alert("Error", "Failed to save item");
    }
  };

  //Put a save button on the right side of the header
  //useLayoutEffect ensures the navigation bar updates before the UI is drawn
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        //Save Button
        organization?.id ? (
          <TouchableOpacity
            style={tw`p-2`}
            onPress={() => handleSave(organization.id)}
          >
            {/* Save Icon */}
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

  if (loading) {
    return (
      <View style={dynamicStyles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.containerStyle}>
      {/* Photo Container */}
      <TouchableOpacity style={[dynamicStyles.photoContainer]}>
        <Ionicons name="camera-outline" size={64} color="#00bcd4" />
        <Text style={dynamicStyles.textStyle}>Add photos</Text>
      </TouchableOpacity>
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
                onChangeText={(text) => handleChange("quantity", Number(text))}
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
                onChangeText={(text) => handleChange("minLevel", Number(text))}
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
                onChangeText={(text) => handleChange("price", Number(text))}
                style={[dynamicStyles.textInputStyle]}
                keyboardType="decimal-pad"
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
