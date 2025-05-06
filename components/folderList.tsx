import { Item } from "@/types/types";

import { useTheme } from "@darkModeContext";
import { getDynamicStyles } from "@styles";
import tw from "twrnc";

import { View, TouchableOpacity, Text, FlatList, Alert } from "react-native";
import ItemCard from "@/components/itemCard";
import { removeCategory } from "@itemsService";

interface FolderItemProps {
  organizationID: string;
  folderName: string;
  selectedFolder: string;
  setSelectedFolder: (folderName: string) => void;
  removeItem: (organizationID: string, itemID: string) => Promise<boolean>;
  items: Item[];
}

const FolderList: React.FC<FolderItemProps> = ({
  organizationID,
  folderName,
  selectedFolder,
  setSelectedFolder,
  removeItem,
  items,
}) => {
  const { darkMode } = useTheme();

  //These styles change dynamically based off of dark mode
  const dynamicStyles = getDynamicStyles(darkMode);

  const isSelected = folderName === selectedFolder;

  return (
    <View
      style={isSelected ? dynamicStyles.selectedFolder : dynamicStyles.folder}
    >
      {isSelected && (
        <View style={dynamicStyles.row}>
          {/* Display remove button  */}
          {items.length === 0 && (
            <TouchableOpacity
              style={dynamicStyles.redButtonStyle}
              onPress={async () => {
                const result = await removeCategory(organizationID, folderName);

                if (result.success) {
                  Alert.alert("Success", "Category removed successfully.");
                } else {
                  Alert.alert(
                    "Failed to Remove Category",
                    result.errorMessage || "Unknown error"
                  );
                }
              }}
            >
              <Text style={[tw`text-xs`, dynamicStyles.redTextStyle]}>
                Delete Category
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <TouchableOpacity
        style={dynamicStyles.header}
        onPress={() => {
          //Toggle selected folder
          if (!isSelected) setSelectedFolder(folderName);
          else setSelectedFolder("");
        }}
      >
        <Text style={[tw`text-lg font-semibold`, dynamicStyles.textStyle]}>
          {folderName}
        </Text>
        <Text style={[tw`text-lg font-semibold`, dynamicStyles.textStyle]}>
          {items.length} item{items.length !== 1 ? "s" : ""}
        </Text>
      </TouchableOpacity>
      {isSelected && (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ItemCard
              organizationID={organizationID}
              item={item}
              removeItem={removeItem}
            />
          )}
        />
      )}
    </View>
  );
};

export default FolderList;
