import { googleAI, gemini25FlashPreview0417 } from "@genkit-ai/googleai";
import { genkit } from "genkit";

const ai = genkit({
  plugins: [googleAI()],
  model: gemini25FlashPreview0417,
});

async function runChat() {
    const response = await ai.generate({
      messages: [
        {
          role: "user",
          content: [{ text: "Hello, can you help me plan a trip?" }],
        },
        {
          role: "model",
          content: [{ text: "Of course! Where are you thinking of going?" }],
        },
        {
          role: "user",
          content: [{ text: "I want to visit Peru for two weeks in May." }],
        },
      ],
    });
  console.log(response.text);
}

runChat();
