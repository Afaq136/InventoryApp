import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  StatusBar,
  SectionList,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

//Main Tab Component
const Tab = () => {
  const [data, setData] = useState<any>([]);

  //Fetch the items when the component mounts
  useEffect(() => {
    fetchData();
  }, []);

  //fetch items from API
  async function fetchData() {
    try {
      const response = await fetch("./api/post");
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }

  //component is a flatList, containing data from items,
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <SectionList
          sections={data}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text>
                {item.item}: {item.quantity}
              </Text>
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.header}>
              <Text>{title}</Text>
            </View>
          )}
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
  header: {
    fontSize: 32,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
  },
});

export default Tab;
