import { collection, getDoc, getDocs, addDoc, deleteDoc, updateDoc, doc, onSnapshot, Timestamp, setDoc } from "firebase/firestore";
import { db } from "@firebaseConfig";
import { Alert } from "react-native";
import { Item, ItemsByFolder, ItemHistoryEntry } from "@/types/types";
import { getChangedFields, generateChangeDescription } from "@/services/itemChanges"

// Function to fetch items from Firestore and organize them by category
export const subscribeToItems = (callback: (itemsByFolder: ItemsByFolder) => void) => {
  const unsubscribe = onSnapshot(collection(db, "items"), (snapshot) => {
    const itemsByFolder: ItemsByFolder = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      const category = data.category || "Uncategorized"; // Default category if missing

      //If the category is empty, set its items to an empty array
      if (!itemsByFolder[category]) {
        itemsByFolder[category] = [];
      }

      const newItem = {
        id: doc.id,
        ...data
      } as Item

      itemsByFolder[category].push(newItem);
    });

    callback(itemsByFolder); // Pass the structured data to the callback
  });

  return unsubscribe; // Return the unsubscribe function for cleanup
};

export const getItem = async (itemID: string): Promise<Item | null> => {
  try {
    const docRef = doc(db, "items", itemID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      const item = {
        id: itemID,
        ...data
      } as Item

      return item
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    return null;

  }
}

// Fetch items from Firestore and organize them by folder
export const fetchItemsByFolder = async (): Promise<{ folders: string[]; itemsByFolder: ItemsByFolder }> => {
  try {
    const snapshot = await getDocs(collection(db, "items"));

    // Map documents into an array of objects
    const fetchedItems: Item[] = snapshot.docs.map((doc) => {
      const data = doc.data();

      const currentItem = {
        id: doc.id, // Use id of the document as the id of the item
        ...data,
      } as Item;

      return currentItem;
    });

    // Extract folder names from items (default to "Uncategorized" if category is missing)
    const folders = Array.from(
      new Set(fetchedItems.map((item) => item.category?.trim() || "Uncategorized"))
    );

    // Group items by category
    const itemsByFolder = fetchedItems.reduce<ItemsByFolder>((acc, item) => {
      const category = item.category?.trim() || "Uncategorized";

      if (!acc[category]) {
        acc[category] = [];
      }

      acc[category].push(item);
      return acc;
    }, {});

    return { folders, itemsByFolder };
  } catch (error) {
    console.error("Error fetching data from database", error);
    return { folders: [], itemsByFolder: {} };
  }
};

export const editItem = async (oldItem: Item, newItem: Item): Promise<boolean> => {
  if (oldItem.id !== newItem.id) {
    Alert.alert("Invalid Input", "Item IDs must match.");
    return false;
  }
  const docID = newItem.id;
  const changes = getChangedFields(oldItem, newItem);

  if (Object.keys(changes).length === 0) {
    Alert.alert("No Changes", "Nothing to update.");
    return false;
  }

  try {
    // Get the reference to the document using its ID
    const itemRef = doc(db, "items", docID);

    // Remove the id from the newItem object
    const { id, ...itemFields } = newItem;

    await updateDoc(itemRef, itemFields);

    // Create a timestamp for the snapshot
    const timestamp = Timestamp.now();

    // Create the snapshot document in the subcollection
    const snapshotRef = doc(
      collection(db, `items/${docID}/snapshots`),
      timestamp.toMillis().toString()
    );

    const changeDescription = generateChangeDescription(oldItem, newItem);

    const historyEntry: ItemHistoryEntry = {
      itemId: docID,
      timestamp,
      changes,
      description: changeDescription,
    };

    await setDoc(snapshotRef, historyEntry);

    return true;
  } catch (error) {
    // Handle any errors that occur during the update
    Alert.alert("Error", "Failed to update item. Please try again.");
    console.error("Error updating item:", error);
    return false;
  }
};

// Add a new item to Firestore
export const addItem = async (item: Omit<Item, "id">): Promise<boolean> => {
  try {
    await addDoc(collection(db, "items"), item);
    return true;
  } catch (error) {
    console.error("Error adding item:", error);
    return false;
  }
};

// Remove an item from Firestore
export const removeItem = async (itemID: string): Promise<boolean> => {
  try {
    const docRef = doc(db, "items", itemID);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error removing item:", error);
    return false;
  }
};
