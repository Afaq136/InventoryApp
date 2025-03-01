import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Text, StatusBar } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

//A list item contains the string item and the number quantity
type ListItemProps = { _id: any; item: string; quantity: number };

//Component to render a single listItem, which displays the item string and the quantity number
const ListItem = ({ item, quantity }: ListItemProps) => (
  <View style={styles.listItem}>
    <Text style={styles.title}>
      {item}, {quantity}
    </Text>
  </View>
);

//Main Tab Component
const Tab = () => {
  const [items, setItems] = useState<ListItemProps[]>([]);

  //Fetch the items when the component mounts
  useEffect(() => {
    fetchItems();
  }, []);

  //fetch items from API
  async function fetchItems() {
    try {
      const response = await fetch("./api/post");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }

  //component is a flatList, containing data from items,
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={items}
          renderItem={({ item }) => (
            <ListItem
              _id={item._id}
              item={item.item}
              quantity={item.quantity}
            />
          )}
          keyExtractor={(item) => item._id.toString()} // Ensure id is a string
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  listItem: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
});

export default Tab;
