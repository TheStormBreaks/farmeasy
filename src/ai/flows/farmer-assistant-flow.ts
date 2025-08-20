// src/ai/flows/farmer-assistant-flow.ts
'use server';
/**
 * @fileOverview A multi-modal AI assistant for farmers.
 *
 * - farmerAssistantFlow - A function that handles crop diagnosis and farming advice.
 * - FarmerAssistantInput - The input type for the flow.
 * - FarmerAssistantOutput - The return type for the flow.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

export const FarmerAssistantInputSchema = z.object({
  question: z.string().describe('The farmer\'s question in text form.'),
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

const languageMap: Record<z.infer<typeof FarmerAssistantInputSchema>['language'], string> = {
    en: 'English',
    hi: 'Hindi',
    kn: 'Kannada',
    ma: 'Maithili'
};

const prompt = ai.definePrompt({
    name: 'farmerAssistantPrompt',
    input: { schema: FarmerAssistantInputSchema },
    prompt: `You are an expert agronomist and farming assistant. Your goal is to help farmers with their questions.
Always respond in the language specified: {{language}}. The language to use is ${languageMap.kn} if 'kn' is passed, ${languageMap.hi} if 'hi' is passed, and so on.

The user has provided the following information:
Question: {{{question}}}
{{#if photoDataUri}}
Photo of the crop: {{media url=photoDataUri}}
{{/if}}

Please perform the following tasks based on the user's input:

1.  **If an image is provided**:
    *   Identify the plant in the photo.
    *   Diagnose any visible diseases, pests, or nutrient deficiencies.
    *   Provide a clear, step-by-step solution, including organic and chemical treatment options if applicable.
    *   If the image is not a plant or is unclear, politely ask for a better picture.

2.  **If no image is provided, or in addition to the image analysis**:
    *   Answer the user's text question to the best of your ability.
    *   Provide advice on general farming practices, crop information, government schemes, or market prices based on publicly available knowledge.

3.  **Language**:
    *   Your entire response MUST be in the specified language: {{language}}.

Keep your response clear, concise, and easy for a farmer to understand.
`,
});

export async function farmerAssistantFlow(input: FarmerAssistantInput): Promise<FarmerAssistantOutput> {
  const llmResponse = await prompt(input);
  return llmResponse.text;
}
