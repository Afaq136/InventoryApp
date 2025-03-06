import { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  StatusBar,
  SectionList,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../FirebaseConfig";

export default function Tab() {
  const [data, setData] = useState<any[]>([]);

  //Fetch data when the component initially mounts
  useEffect(() => {
    fetchData();
  }, []);

  //Fetch data from API
  async function fetchData() {
    try {
      const querySnapshot = await getDocs(collection(db, "Qurans"));

      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Store document ID
        quantity: doc.data().Quantity,
      }));

      setData([
        {
          title: "Quarans",
          data: documents,
        },
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <SectionList
          sections={data}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text>
                {item.id}: {item.quantity}
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
}

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
