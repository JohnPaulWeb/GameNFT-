'use server';

/**
 * @fileOverview An AI-powered item suggestion tool for the SuiPlay Marketplace.
 *
 * This tool analyzes market data and recommends game items to mint and sell,
 * helping users make informed decisions to potentially increase their profits.
 *
 * @interface AIPoweredItemSuggestionInput - The input type for the aiPoweredItemSuggestion function.
 * @interface AIPoweredItemSuggestionOutput - The output type for the aiPoweredItemSuggestion function.
 * @function aiPoweredItemSuggestion - A function that handles the item suggestion process.
 */

import {ai} from '@/app/ai/genkit';
import {z} from 'zod';

const AIPoweredItemSuggestionInputSchema = z.object({
  marketData: z
    .string()
    .describe(
      'A detailed report of the current market trends and sales data in the SuiPlay Marketplace.'
    ),
  userInventory: z
    .string()
    .describe('A list of items the user already owns in their inventory.'),
  suiAccountBalance: z
    .number()
    .describe('The current SUI balance of the user, in SUI.'),
});
export type AIPoweredItemSuggestionInput = z.infer<typeof AIPoweredItemSuggestionInputSchema>;

const AIPoweredItemSuggestionOutputSchema = z.object({
  suggestedItem: z.string().describe('The name of the game item recommended to mint and sell.'),
  estimatedProfit: z
    .number()
    .describe('The estimated profit from minting and selling the suggested item.'),
  reasoning: z
    .string()
    .describe(
      'The AI’s reasoning behind the item suggestion, based on market data and user inventory.'
    ),
  isProfitable: z
    .boolean()
    .describe(
      'Whether or not minting and selling the item suggestion would be profitable to the user.'
    ),
});
export type AIPoweredItemSuggestionOutput = z.infer<typeof AIPoweredItemSuggestionOutputSchema>;

export async function aiPoweredItemSuggestion(
  input: AIPoweredItemSuggestionInput
): Promise<AIPoweredItemSuggestionOutput> {
  return aiPoweredItemSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredItemSuggestionPrompt',
  input: {schema: AIPoweredItemSuggestionInputSchema},
  output: {schema: AIPoweredItemSuggestionOutputSchema},
  prompt: `You are an AI assistant specializing in advising users on the most profitable items to mint and sell in the SuiPlay Marketplace.

  Analyze the provided market data, user inventory, and SUI account balance to determine the best item to mint and sell. Provide the estimated profit, reasoning behind the suggestion, and an assessment of whether the suggestion would be profitable to the user.

  Market Data: {{{marketData}}}
  User Inventory: {{{userInventory}}}
  SUI Account Balance: {{{suiAccountBalance}}}

  Consider all factors to maximize potential profits for the user.
  IsProfitable should be based on the estimated profit and their current SUI balance.
  If their SUI balance is too low to mint the item, then isProfitable should be false.
  `,
});

const aiPoweredItemSuggestionFlow = ai.defineFlow(
  {
    name: 'aiPoweredItemSuggestionFlow',
    inputSchema: AIPoweredItemSuggestionInputSchema,
    outputSchema: AIPoweredItemSuggestionOutputSchema,
  },
  async (input: AIPoweredItemSuggestionInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
