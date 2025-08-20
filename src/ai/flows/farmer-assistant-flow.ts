
// src/ai/flows/farmer-assistant-flow.ts
'use server';
/**
 * @fileOverview A multi-modal AI assistant for farmers.
 *
 * - farmerAssistantFlow - A function that handles crop diagnosis and farming advice.
 */

import { ai } from '@/ai/ai-instance';
import { FarmerAssistantInputSchema, type FarmerAssistantInput, type FarmerAssistantOutput, type LanguageCode } from '@/types';

const languageMap: Record<LanguageCode, string> = {
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
