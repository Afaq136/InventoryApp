import { GeoPoint, Timestamp } from "firebase/firestore";

export interface Item {
  id: string;
  name: string;
  category: string;
  tags: string[];
  minLevel: number;
  quantity: number;
  price: number;
  qrValue?: string;
  location: string;
  createdAt?: Timestamp; //Creation timestamp
  editedAt?: Timestamp; //Last edit timestamp
}

export interface ItemHistoryEntry {
  itemId: string;
  timestamp: Timestamp;
  changes: Partial<Omit<Item, 'id'>>; // only changed fields
  description: string;
}

export interface ItemLocation {
  id: string;
  name: string;
  coordinates: GeoPoint;
}

export type ItemsByFolder = {
  [folderName: string]: Item[];
};

export type CategoryStats = {
  [name: string]: {totalQuantity: number, totalValue: number};
};
