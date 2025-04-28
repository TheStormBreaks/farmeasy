
export type UserType = 'KVK' | 'FARMER' | null;

export interface Announcement {
  id: string;
  text: string;
  timestamp: number; // Store timestamp as number (Date.now()) for easier handling
}
