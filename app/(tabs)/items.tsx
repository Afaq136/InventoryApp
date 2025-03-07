import { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  StatusBar,
  SectionList,
  TextInput,
  Button,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "../../FirebaseConfig";
import tw from "twrnc";

export default function Tab() {
  //React hook for data from the database
  const [data, setData] = useState<any[]>([]);

  //Collection to add new Item to
  const [category, setCategory] = useState("");

  //String to add to database
  const [newItem, setNewItem] = useState("");

  //Quantity of item
  const [quantity, setQuantity] = useState("");

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
  async function addItem() {
    if (!category || !newItem || !quantity) {
      console.error("All fields must be filled out.");
      return;
    }

    try {
      const collectionRef = collection(db, category);
      const docRef = doc(collectionRef, newItem); // Set the document ID as the item name

      await setDoc(docRef, { Quantity: Number(quantity) });

      console.log("Item added successfully!");

      //Reset the fields
      setCategory("");
      setNewItem("");
      setQuantity("");

      fetchData(); // Refresh the data
    } catch (error) {
      console.error("Error adding item:", error);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <TextInput
          value={category}
          placeholder="Enter category name"
          autoCapitalize="none"
          onChangeText={setCategory}
          style={tw`border border-gray-300 rounded-lg p-2 mb-4`}
        />
        <TextInput
          value={newItem}
          placeholder="Enter name of new item"
          autoCapitalize="none"
          onChangeText={setNewItem}
          style={tw`border border-gray-300 rounded-lg p-2 mb-4`}
        />
        <TextInput
          value={quantity}
          placeholder="0"
          autoCapitalize="none"
          onChangeText={setQuantity}
          style={tw`border border-gray-300 rounded-lg p-2 mb-4`}
        />
        <Button
          onPress={addItem}
          title="Add item"
          color="green"
          accessibilityLabel="Learn more about this button"
        />
        <SectionList
          sections={data}
          renderItem={({ item }) => (
            <View
              style={tw`border border-blue-400 rounded-lg p-4 bg-white mb-4`}
            >
              <Text>
                {item.id}: {item.quantity}
              </Text>
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.header}>
              <Text style={tw`text-blue-500 text-lg font-semibold mb-3`}>
                {title}
              </Text>
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
