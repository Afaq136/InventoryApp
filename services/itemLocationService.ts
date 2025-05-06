import { ItemLocation } from "@/types/types";
import { collection, getDoc, getDocs, addDoc, deleteDoc, updateDoc, doc, onSnapshot, Timestamp, setDoc, query, where } from "firebase/firestore";
import { db } from "@firebaseConfig";
import { FirebaseError } from "firebase/app";


// Add a new itemLocation to Firestore
export const addItemLocation = async (organizationId: string, itemLocation: Omit<ItemLocation, "id">): Promise<boolean> => {
  
  if (!organizationId){
    console.error("addItemLocation", "No organizationId provided");
    return false;
  }

  const orgRef = doc(db, "organizations", organizationId); // doc ref to organization
  const itemLocationsRef = collection(orgRef, "itemLocations"); // subcollection "itemLocation" under that doc
    
  // Check for duplicate location name
    const q = query(itemLocationsRef, where("name", "==", itemLocation.name));
    const querySnapshot = await getDocs(q);
  
    if (!querySnapshot.empty) {
      const errorMsg = `Location with name ${itemLocation.name} already exists.`;
      throw new Error(errorMsg);  // Throw an error if duplicate location exists
    }
  try {

    // Add the new item Location and get its reference
    const docRef = await addDoc(itemLocationsRef, itemLocation);

    return true;
  } catch (error) {
    console.error("Error adding item Location:", error);
    return false;
  }
};

// Function to fetch item locations from Firestore based on an Organization Id
export const subscribeToItemLocations = (
  organizationId: string,
  callback: (itemLocations: ItemLocation[]) => void
) => {
  if (!organizationId) {
    console.error("subscribeToItemLocations", "No organizationId provided");
    return () => {};
  }

  const orgRef = doc(db, "organizations", organizationId);
  const itemLocationsRef = collection(orgRef, "itemLocations");

  const unsubscribe = onSnapshot(itemLocationsRef, (snapshot) => {
    //Construct the full item location array
    const itemLocations: ItemLocation[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ItemLocation, "id">), // Type-safe spreading
    }));
    callback(itemLocations); // Pass the full Location objects
  });

  return unsubscribe; // Return the unsubscribe function for cleanup
};

export const removeItemLocation = async (
  organizationId: string,
  itemLocationName: string
): Promise<{ success: boolean; errorMessage?: string }> => {
  if (!organizationId) {
    const msg = "No organization ID provided.";
    console.error("removeItemLocation", msg);
    return { success: false, errorMessage: msg };
  }

  try {
    const itemLocationsRef = collection(db, "organizations", organizationId, "itemLocations");
    const q = query(itemLocationsRef, where("name", "==", itemLocationName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      const msg = `No location found with the name ${itemLocationName}`;
      console.warn("removeItemLocation", msg);
      return { success: false, errorMessage: msg };
    }

    const deletePromises = querySnapshot.docs.map((docSnapshot) =>
      deleteDoc(docSnapshot.ref)
    );
    await Promise.all(deletePromises);

    return { success: true };
  } catch (error) {
    let errorMessage = "An unknown error occurred.";

    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "permission-denied":
          errorMessage = "You do not have permission to delete this location.";
          break;
        case "unavailable":
          errorMessage = "The service is currently unavailable. Please try again later.";
          break;
        case "not-found":
          errorMessage = "The document was not found.";
          break;
        default:
          errorMessage = error.message;
      }
    }

    console.error("removeItemLocation error", error);
    return { success: false, errorMessage };
  }
};