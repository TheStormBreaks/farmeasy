
import { z } from 'zod';

export type UserType = 'KVK' | 'FARMER' | 'SUPPLY' | null;

export type LanguageCode = 'en' | 'hi' | 'kn' | 'ma';

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
    supplierUpiId: string; // UPI ID of the supplier for this product
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

export interface Query {
  id: string;
  farmerId: string; // ID of the farmer who asked
  questionText: string;
  timestamp: number; // When the question was asked
  status: 'new' | 'answered'; // Status of the query
  answerText?: string; // Optional answer from KVK
  answeredAt?: number; // Optional timestamp for answer
}


// New Types for Training Programs and Registrations
export interface TrainingProgram {
    id: string;
    title: string;
    description: string;
    date: number; // Timestamp for the training date
    location: string;
    registrationDeadline?: number; // Optional timestamp for deadline
    createdAt: number; // Timestamp when created
    kvkId: string; // ID of the KVK center posting it (assuming KVK is the user ID)
}

export interface Registration {
    id: string;
    programId: string; // ID of the TrainingProgram
    farmerId: string; // ID of the Farmer registering
    farmerName: string;
    mobileNumber: string;
    registrationTimestamp: number; // When the farmer registered
}

// AI Assistant Types
export const FarmerAssistantInputSchema = z.object({
  question: z.string().describe("The farmer's question in text form."),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.enum(['en', 'hi', 'kn', 'ma']).describe("The language for the response (English, Hindi, Kannada, or Maithili).")
});
export type FarmerAssistantInput = z.infer<typeof FarmerAssistantInputSchema>;

export type FarmerAssistantOutput = string;
