import { googleAI } from "@genkit-ai/googleai";
import { genkit } from "genkit";

const ai = genkit({
  plugins: [googleAI()],
});

async function run() {
  // Generate with a specific model reference
  const response1 = await ai.generate({
    model: googleAI.model("gemini-2.0-flash"),
    prompt: "Invent a menu item for a restaurant with a pirate theme.",
  });
  console.log(response1.text);

  console.log("*********************");
  
  // Generate with a model string ID
  const response2 = await ai.generate({
    model: "googleai/gemini-2.0-flash-001",
    prompt: "Invent another menu item for a restaurant with a pirate theme.",
  });
  
  console.log(response2.text);
}

run();
