import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Item } from "@/types/types"; // Import the Item type
import tw from "twrnc"; // Assuming Tailwind styling
import { useRouter } from "expo-router";
import { useTheme } from "@darkModeContext";
import { getDynamicStyles } from "@styles";
import Ionicons from "@expo/vector-icons/Ionicons";

interface ItemCardProps {
  organizationID: string;
  item: Item;
  removeItem: (organizationID: string, itemID: string) => Promise<boolean>;
}

const ItemCard: React.FC<ItemCardProps> = ({
  organizationID,
  item,
  removeItem,
}) => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const { darkMode } = useTheme();

  //These styles change dynamically based off of dark mode
  const dynamicStyles = getDynamicStyles(darkMode);

  const router = useRouter();

  const isLow = item.quantity < item.minLevel;

  return (
    <View style={dynamicStyles.itemStyle}>
      {/* Remove, Edit, and History Buttons*/}
      {menuVisible && (
        <View style={dynamicStyles.row}>
          {/* Remove Button */}
          <TouchableOpacity
            style={dynamicStyles.redButtonStyle}
            onPress={async () => {
              const removed = await removeItem(organizationID, item.id); //remove the item based on the item id
              //only reload the page if items are actually removed
              if (removed) {
                //success!
              }
            }}
          >
            <Text style={[tw`text-xs`, dynamicStyles.redTextStyle]}>
              Remove
            </Text>
          </TouchableOpacity>
          {/* Edit Button */}
          <TouchableOpacity
            style={dynamicStyles.blueButtonStyle}
            onPress={() => {
              router.push(`/edit_item/${item.id}`);
            }}
          >
            <Text style={[tw`text-xs`, dynamicStyles.blueTextStyle]}>Edit</Text>
          </TouchableOpacity>
          {/* History Button */}
          <TouchableOpacity
            style={dynamicStyles.blueButtonStyle}
            onPress={() => {
              router.push(`/view_item_history/${item.id}`);
            }}
          >
            <Text style={[tw`text-xs`, dynamicStyles.blueTextStyle]}>
              History
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Top Row */}
      <View style={dynamicStyles.row}>
        {/* Item name */}
        <Text style={[tw`font-bold text-base`, dynamicStyles.blueTextStyle]}>
          {item.name}
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
      {/* Second Row */}
      <Text>
        {/* Display quantity and minLevel as red if low, otherwise display as blue*/}
        <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>
          Quantity:{" "}
        </Text>
        <Text
          style={[
            tw`font-bold text-sm`,
            isLow ? dynamicStyles.redTextStyle : dynamicStyles.blueTextStyle,
          ]}
        >
          {item.quantity} / {item.minLevel}
        </Text>
        {"\n"}
        <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>
          Price:
        </Text>{" "}
        <Text style={dynamicStyles.textStyle}>${item.price.toFixed(2)}</Text>
        {"\n"}
        <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>
          Total Value:
        </Text>{" "}
        <Text style={dynamicStyles.textStyle}>
          ${(item.price * item.quantity).toFixed(2)}
        </Text>
      </Text>
      {item.location && (
        <Text>
          <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>
            Location:
          </Text>{" "}
          <Text style={[dynamicStyles.textStyle]}>{item.location}</Text>
        </Text>
      )}
      {item.tags.length > 0 && (
        <Text>
          <Text style={[tw`font-semibold`, dynamicStyles.textStyle]}>
            Tags:
          </Text>{" "}
          <Text style={[tw`font-bold`, dynamicStyles.blueTextStyle]}>
            {item.tags.join(", ")}
          </Text>
        </Text>
      )}
    </View>
  );
};

export default ItemCard;
