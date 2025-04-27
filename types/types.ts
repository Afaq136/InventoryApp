import { Timestamp } from "firebase/firestore";

export interface Item {
  createdAt: any;
  isLow: any;
  id: string;
  name: string;
  category: string;
  tags: string[];
  minLevel: number;
  quantity: number;
  price: number;
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
