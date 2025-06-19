import { z } from "genkit";
import { googleAI, gemini25FlashPreview0417 } from "@genkit-ai/googleai";
import { genkit } from "genkit";

const ai = genkit({ plugins: [googleAI()], model: gemini25FlashPreview0417 });

// Define a Zod schema for your desired output structure
const MenuItemSchema = z.object({
  name: z.string().describe("The name of the menu item."),
  description: z.string().describe("A description of the menu item."),
  calories: z.coerce.number().describe("The estimated number of calories."), // z.coerce.number() for robust parsing
  allergens: z
    .array(z.string())
    .describe("Any known allergens in the menu item."),
});

async function runStructuredOutput() {
  const response = await ai.generate({
    prompt: "Suggest a menu item for a pirate-themed restaurant.",
    output: { schema: MenuItemSchema }, // Specify the schema for structured output
  });

  const menuItem = response.output; // Typed output, might be null if validation fails

  if (menuItem) {
    console.log(`Dish Name: ${menuItem.name}`);
    console.log(`Description: ${menuItem.description}`);
    console.log(`Calories: ${menuItem.calories}`);
    console.log(`Allergens: ${menuItem.allergens.join(", ")}`);
  } else {
    console.error("Failed to generate structured output conforming to schema.");
  }
}

runStructuredOutput();
