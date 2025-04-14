import { Timestamp } from "firebase/firestore";

export interface Item {
  id: string;
  name: string;
  category: string;
  tags: string[];
  minLevel: number;
  quantity: number;
  price: number;
  totalValue: number;
  qrValue?: string;
  location?: string;
}

export interface ItemHistoryEntry {
  itemId: string;
  timestamp: Timestamp;
  changes: Partial<Omit<Item, 'id'>>; // only changed fields
  description: string;
}

export type ItemsByFolder = {
  [folderName: string]: Item[];
};
