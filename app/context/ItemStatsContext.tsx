import React, { createContext, useContext, useEffect, useState } from "react";
import { subscribeToItems } from "@/services/itemService";
import { ItemsByFolder, Item } from "@/types/types";

type ItemStats = {
  itemsByFolder: ItemsByFolder;
  lowStockItemsByFolder: ItemsByFolder;
  totalCategories: number;
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
};

const ItemStatsContext = createContext<ItemStats | undefined>(undefined);

export const ItemStatsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [itemsByFolder, setItemsByFolder] = useState<ItemsByFolder>({});

  //Subscribe to Firestore and update itemsByFolder as items change
  useEffect(() => {
    const unsubscribe = subscribeToItems(setItemsByFolder);
    return () => unsubscribe();
  }, []);

  /* Derived Stats */

  //Count up the total number of categories
  const totalCategories = Object.keys(itemsByFolder).length;

  //Add up the total number of items
  const totalItems = Object.values(itemsByFolder).reduce(
    (sum, items) => sum + items.length,
    0
  );

  //Add up the total quantity
  const totalQuantity = Object.values(itemsByFolder).reduce((sum, items) => {
    return (
      sum +
      items.reduce((itemSum, item) => itemSum + (Number(item.quantity) || 0), 0)
    );
  }, 0);

  //Add up the total value
  const totalValue = Object.values(itemsByFolder).reduce((sum, items) => {
    return (
      sum +
      items.reduce(
        (itemSum, item) =>
          itemSum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
        0
      )
    );
  }, 0);

  //Include only items that are low in stock
  const lowStockItemsByFolder: ItemsByFolder = Object.entries(
    itemsByFolder
  ).reduce((result, [folder, items]) => {
    //Filter array of items only to those whose quantity is less then minLevel
    const lowStock = items.filter((item) => item.quantity < item.minLevel);
    //If there are low stock items in the folder, add them to the result
    if (lowStock.length > 0) {
      result[folder] = lowStock;
    }
    return result;
  }, {} as ItemsByFolder);

  //Bundle the stats into an object
  const value: ItemStats = {
    itemsByFolder,
    lowStockItemsByFolder,
    totalCategories,
    totalItems,
    totalQuantity,
    totalValue,
  };

  //Make value available to nested components
  return (
    <ItemStatsContext.Provider value={value}>
      {children}
    </ItemStatsContext.Provider>
  );
};

export const useItemStats = () => {
  const context = useContext(ItemStatsContext);
  if (!context) {
    throw new Error("useItemStats must be used within an ItemStatsProvider");
  }
  return context;
};
