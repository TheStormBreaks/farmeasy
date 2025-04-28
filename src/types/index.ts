

export type UserType = 'KVK' | 'FARMER' | 'SUPPLY' | null;

export interface Announcement {
  id: string;
  text: string;
  timestamp: number; // Store timestamp as number (Date.now()) for easier handling
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number; // Store price as a number
    availableQuantity: number;
    supplierId: string; // Could be 'SUPPLY' for now, or a specific user ID if multiple suppliers
    createdAt: number; // Timestamp
    updatedAt: number; // Timestamp
}

export interface CartItem {
    productId: string;
    quantity: number;
    productDetails?: Omit<Product, 'availableQuantity' | 'supplierId' | 'createdAt' | 'updatedAt'>; // Optional: Include product details for display
}

export interface Cart {
    userId: string; // FARMER's user ID
    items: CartItem[];
    lastUpdated: number;
}
