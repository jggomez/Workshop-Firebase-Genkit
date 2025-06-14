## Building Flows

Flows are a core Genkit construction for defining tightly-linked AI logic, encompassing pre- and post-processing steps around generative model calls. They offer type safety, integration with the developer UI for debugging, and simplified deployment.

### Defining and Calling Flows

Flows are defined using `ai.defineFlow()`, wrapping functions that may include `ai.generate()` calls or other logic.

```javascript
import { z } from "genkit"; // For schema definitions
import { googleAI, gemini25FlashPreview0417 } from "@genkit-ai/googleai";
import { genkit } from "genkit";

const ai = genkit({ plugins: [googleAI()], model: gemini25FlashPreview0417 });

// Define a schema for menu item output
const MenuItemSchema = z.object({
  dishname: z.string(),
  description: z.string(),
});

// Define a simple flow wrapping a generate() call
export const menuSuggestionFlow = ai.defineFlow(
  {
    name: "menuSuggestionFlow",
    inputSchema: z.object({ theme: z.string() }), // Input schema
    outputSchema: z.object({ menuItem: z.string() }), // Output schema
  },
  async ({ theme }) => {
    const { text } = await ai.generate({
      prompt: `Invent a menu item for a ${theme} themed restaurant.`,
    });
    return { menuItem: text }; // Ensure output matches schema
  }
);

// Define a flow with structured output schema
export const menuSuggestionFlowWithSchema = ai.defineFlow(
  {
    name: "menuSuggestionFlowWithSchema",
    inputSchema: z.object({ theme: z.string() }),
    outputSchema: MenuItemSchema, // Using the defined schema
  },
  async ({ theme }) => {
    const { output } = await ai.generate({
      model: googleAI.model("gemini-2.0-flash"),
      prompt: `Invent a menu item for a ${theme} themed restaurant.`,
      output: { schema: MenuItemSchema },
    });
    if (output == null) {
      throw new Error("Response doesn't satisfy schema.");
    }
    return output;
  }
);

async function callFlows() {
  const { menuItem } = await menuSuggestionFlow({ theme: "bistro" });
  console.log("Simple Flow Output:", menuItem);

  console.log("********************************");

  const { dishname, description } = await menuSuggestionFlowWithSchema({
    theme: "bistro",
  });
  console.log("Structured Flow Output - Dish:", dishname);
  console.log("Structured Flow Output - Description:", description);
}

callFlows();
```
