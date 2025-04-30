import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { subscribeToItemHistory } from "@/services/itemChanges"; // adjust path
import { Item, ItemHistoryEntry } from "@/types/types"; // adjust path
import { useOrganization } from "@clerk/clerk-expo";

const ItemHistoryScreen = () => {
  const { id } = useLocalSearchParams(); // id = itemId
  const [history, setHistory] = useState<ItemHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // https://clerk.com/docs/hooks/use-organization
  const { organization } = useOrganization();

  useEffect(() => {
    if (!organization?.id) {
      return;
    }
    if (typeof id === "string") {
      // Start subscribing to real-time updates
      const unsubscribe = subscribeToItemHistory(
        organization.id,
        id,
        (entries: ItemHistoryEntry[]) => {
          setHistory(entries);
          setLoading(false);
        }
      );
      
      return () => unsubscribe();
    }
  }, [organization?.id, id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Item History</Text>

      {history.length === 0 ? (
        <Text style={styles.emptyText}>No changes have been recorded.</Text>
      ) : (
        history.map((entry, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.description}>{entry.description}</Text>
            <Text style={styles.timestamp}>
              {entry.timestamp.toDate().toLocaleString()}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 32,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  description: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 13,
    color: "#888",
  },
});

export default ItemHistoryScreen;
