import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Item } from "@/types/types"; // Import the Item type
import tw from "twrnc"; // Assuming Tailwind styling
import { useRouter } from "expo-router";
import { useTheme } from "@darkModeContext";
import { getDynamicStyles } from "@styles";
import Ionicons from "@expo/vector-icons/Ionicons";

interface ItemCardProps {
  item: Item;
  removeItem: (id: string) => Promise<boolean>;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, removeItem }) => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const { darkMode } = useTheme();

  //These styles change dynamically based off of dark mode
  const dynamicStyles = getDynamicStyles(darkMode);

  const router = useRouter();

  return (
    <View style={dynamicStyles.itemStyle}>
      {/* Top Row with ID and Menu Button */}
      <View style={dynamicStyles.row}>
        <Text style={[tw`text-xs font-normal`, dynamicStyles.greyTextStyle]}>
          {item.id}
        </Text>
        {/* Toggle the visibility of the menu when pressed */}
        <TouchableOpacity
          onPress={() => {
            setMenuVisible(!menuVisible);
          }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#00bcd4" />
        </TouchableOpacity>
      </View>
      {/* Name and Quantity */}
      <View style={dynamicStyles.row}>
        <Text style={[tw`font-bold text-base`, dynamicStyles.blueTextStyle]}>
          {item.name}
        </Text>
        <Text style={[tw`font-bold text-sm`, dynamicStyles.blueTextStyle]}>
          {item.quantity} / {item.minLevel} Units
        </Text>
      </View>
      {/* Price & Total Value */}
      <Text>
        <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>Price:</Text>{" "}
        <Text style={dynamicStyles.textStyle}>{item.price}</Text>
        {"\n"}
        <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>
          Total Value:
        </Text>{" "}
        <Text style={dynamicStyles.textStyle}>{item.totalValue}</Text>
      </Text>
      {/* Remove and Edit Items*/}
      {menuVisible && (
        <View style={dynamicStyles.row}>
          <TouchableOpacity
            style={dynamicStyles.redButtonStyle}
            onPress={async () => {
              const removed = await removeItem(item.id); //remove the item based on the item id
              //only reload the page if items are actually removed
              if (removed) {
                //success!
              }
            }}
          >
            <Text style={dynamicStyles.redTextStyle}>Remove</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={dynamicStyles.blueButtonStyle}
            onPress={() => {
              router.push(`/edit_item/${item.id}`);
            }}
          >
            <Text style={dynamicStyles.blueTextStyle}>Edit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ItemCard;
