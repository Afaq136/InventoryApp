import { Item, ItemHistoryEntry } from "@/types/types";
import { collection, getDocs, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@firebaseConfig";

export const subscribeToItemHistory = (
  organizationId: string, 
  itemId: string,
  callback: (history: ItemHistoryEntry[]) => void
): () => void => {

  if (!organizationId){
    console.error("subscribeToItemHistory", "No organizationId provided");
    return () => {};
  }

  // Reference to the snapshots subcollection of the item
  const snapshotsRef = collection(db, `organizations/${organizationId}/items/${itemId}/snapshots`);

  // Query to order by timestamp (descending for latest first)
  const q = query(snapshotsRef, orderBy("timestamp", "desc"));

  // Subscribe to real-time updates using onSnapshot
  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const history: ItemHistoryEntry[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          itemId,
          timestamp: data.timestamp,
          changes: data.changes,
          description: data.description,
        } as ItemHistoryEntry;
      });

      // Pass the fetched history to the callback
      callback(history);
    },
    (error) => {
      console.error("Error subscribing to item history:", error);
    }
  );

  // Return the unsubscribe function to stop listening when needed
  return unsubscribe;
};

//Returns an object with only fields that have changed (excluding the id)
export function getChangedFields(
  oldItem: Item,
  newItem: Item
): Partial<Omit<Item, 'id'>> {

  //Store changes in a partial item object (excluding id)
  const changes: Partial<Omit<Item, 'id'>> = {};

  //Get the keys of the new item object
  const keys = Object.keys(newItem) as (keyof Item)[];

  //For each key of the item object
  for (const key of keys) {
    //omit id for the purposes of changes
    if (key === 'id') continue;

    const oldValue = oldItem[key];
    const newValue = newItem[key];

    //when values don't match, store in changes
    if (oldValue !== newValue) {
      changes[key as keyof Omit<Item, 'id'>] = newValue as any;
    }
  }
  return changes;
}

export const generateChangeDescription = (
  oldItem: Item,
  newItem: Item
): string => {
  const changes: string[] = [];

  // Handle name change as a special case
  if (oldItem.name !== newItem.name) {
    changes.push(`Changed name of ${oldItem.name} to ${newItem.name}.`);
  }
    //Get the keys of the new item object
    const keys = Object.keys(newItem) as (keyof Item)[];

    //For each key of the item object
    for (const key of keys) {
      //omit id for the purposes of changes
      if (key === 'id' || key === "name") continue;
  
      const oldValue = oldItem[key];
      const newValue = newItem[key];

      const itemName = newItem.name

    if (oldValue !== newValue) {
      changes.push(
        `Changed ${itemName} ${key} from ${oldValue} to ${newValue}.`
      );
    }
  }

  return changes.join(" ");
};
