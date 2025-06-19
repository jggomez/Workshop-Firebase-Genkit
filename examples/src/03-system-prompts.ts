import { googleAI, gemini25FlashPreview0417 } from "@genkit-ai/googleai";
import { genkit } from "genkit";

const ai = genkit({
  plugins: [googleAI()],
  model: gemini25FlashPreview0417,
});

async function runSystemPrompt() {
  const response = await ai.generate({
    prompt: "What do you know?",
    system: "You are tiny lannister from Game of Thrones.",
  });
  console.log(response.text);
}

runSystemPrompt();
