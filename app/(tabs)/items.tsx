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
      // Fetch Food collection
      const foodSnapshot = await getDocs(collection(db, "Food"));
      const foodDocuments = foodSnapshot.docs.map((doc) => ({
        id: doc.id, // Change id to item to match SectionList
        quantity: doc.data().Quantity,
      }));

      // Fetch Qurans collection
      const quransSnapshot = await getDocs(collection(db, "Qurans"));
      const quransDocuments = quransSnapshot.docs.map((doc) => ({
        id: doc.id, // Change id to item to match SectionList
        quantity: doc.data().Quantity,
      }));

      // Fetch Literature collection
      const literatureSnapshot = await getDocs(collection(db, "Literature"));
      const literatureDocuments = literatureSnapshot.docs.map((doc) => ({
        id: doc.id,
        quantity: doc.data().Quantity,
      }));

      // Set formatted data for SectionList
      setData([
        {
          title: "Food",
          data: foodDocuments,
        },
        {
          title: "Literature",
          data: literatureDocuments,
        },
        {
          title: "Qurans",
          data: quransDocuments,
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
