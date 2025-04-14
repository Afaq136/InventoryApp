import React from "react";
import { router, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { useTheme } from "./context/DarkModeContext";
import { BarChart } from "react-native-chart-kit";

export default function InventorySummary() {
  const { darkMode } = useTheme();

  const data = [
    {
      id: "1",
      code: "SIK7T0002",
      name: "Papers",
      category: "All Items",
      quantity: "13 units",
    },
    {
      id: "2",
      code: "SIK7T0001",
      name: "Jacket",
      category: "Clothing",
      quantity: "1 unit",
    },
  ];

  const chartWidth = Dimensions.get("window").width - 20;
  const chartData = {
    labels: ["Papers", "Jacket"],
    datasets: [{ data: [13, 1] }],
  };

  return (
    <SafeAreaView
      style={[tw`flex-1 p-5`, darkMode ? tw`bg-black` : tw`bg-white`]}
    >
      <View
        style={[styles.container, darkMode && { backgroundColor: "#1F2937" }]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={tw`p-2`}>
            <Ionicons
              name="arrow-back"
              size={28}
              color={darkMode ? "#00bcd4" : "#00bcd4"}
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.headerText,
              darkMode ? { color: "#3b82f6" } : { color: "#3b82f6" },
            ]}
          >
            INVENTORY SUMMARY
          </Text>
          <TouchableOpacity>
            <Ionicons
              name="ellipsis-horizontal"
              size={24}
              color={darkMode ? "white" : "black"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.summary}>
          <Text style={[styles.summaryText, darkMode && { color: "white" }]}>
            Total Quantity
          </Text>
          <Text style={[styles.summaryValue, darkMode && { color: "white" }]}>
            14 units
          </Text>
          <Text style={[styles.summaryText, darkMode && { color: "white" }]}>
            Total Value
          </Text>
          <Text style={[styles.summaryValue, darkMode && { color: "white" }]}>
            $0
          </Text>
        </View>

        <View style={styles.listHeader}>
          <Text style={[styles.listHeaderText, darkMode && { color: "white" }]}>
            Last Updated
          </Text>
          <Ionicons
            name="filter"
            size={20}
            color={darkMode ? "white" : "black"}
          />
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[styles.item, darkMode && { backgroundColor: "#374151" }]}
            >
              <Text style={[styles.itemCode, darkMode && { color: "white" }]}>
                {item.code}
              </Text>
              <Text style={[styles.itemName, darkMode && { color: "white" }]}>
                {item.name}
              </Text>
              <Text
                style={[styles.itemCategory, darkMode && { color: "white" }]}
              >
                {item.category}
              </Text>
              <Text
                style={[styles.itemQuantity, darkMode && { color: "white" }]}
              >
                {item.quantity}
              </Text>
            </View>
          )}
        />

        <Text
          style={[
            styles.chartTitle,
            { color: darkMode ? "#3b82f6" : "#3b82f6" },
          ]}
        >
          Inventory Breakdown
        </Text>
        <BarChart
          data={chartData}
          width={chartWidth}
          height={220}
          yAxisLabel=""
          yAxisSuffix=" units"
          chartConfig={{
            backgroundGradientFrom: darkMode ? "#1F2937" : "#fff",
            backgroundGradientTo: darkMode ? "#1F2937" : "#fff",
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            labelColor: (opacity = 1) =>
              darkMode
                ? `rgba(255, 255, 255, ${opacity})`
                : `rgba(0, 0, 0, ${opacity})`,
          }}
          verticalLabelRotation={30}
          style={{ marginVertical: 10, borderRadius: 10 }}
        />

        <TouchableOpacity style={styles.fab}>
          <Ionicons name="share-social" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  summaryText: {
    color: "#888",
  },
  summaryValue: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  listHeaderText: {
    color: "black",
    fontWeight: "bold",
  },
  item: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  itemCode: {
    color: "#888",
  },
  itemName: {
    color: "black",
    fontWeight: "bold",
  },
  itemCategory: {
    color: "#888",
  },
  itemQuantity: {
    color: "black",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#00bcd4",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
});
