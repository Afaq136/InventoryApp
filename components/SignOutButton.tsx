import { useClerk } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

export const SignOutButton = () => {
  const styles = getStyles();

  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
      <Text style={styles.signOutButtonText}>Sign out</Text>
    </TouchableOpacity>
  );
};

const getStyles = () => {
  return StyleSheet.create({
    signOutButton: {
      backgroundColor: "#ff4d4d",
      paddingVertical: 10,
      borderRadius: 10,
      marginTop: 20,
    },
    signOutButtonText: {
      textAlign: "center",
      color: "white",
    },
  });
};
export default SignOutButton;
