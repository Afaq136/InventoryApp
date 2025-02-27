import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Text, StatusBar } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

type ItemProps = { title: string };

//Component to render a single item
const Item = ({ title }: ItemProps) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
);

//Main Tab Component
const Tab = () => {
  const [items, setItems] = useState<any[]>([]);

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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={items}
          renderItem={({ item }) => <Item title={item.title} />}
          keyExtractor={(item) => item.id.toString()} // Ensure id is a string
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
  item: {
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
