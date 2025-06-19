import { googleAI, gemini25FlashPreview0417 } from "@genkit-ai/googleai";
import { genkit } from "genkit";

const ai = genkit({ plugins: [googleAI()], model: gemini25FlashPreview0417 });

async function runMultimodalInput() {
  // Example 1: Multimodal input using a publicly accessible URL
  const response1 = await ai.generate({
    prompt: [
      {
        media: {
          url: "https://storage.googleapis.com/questionsanswersproject/animales_mexico.jpeg",
        },
      },
      { text: "Describe this image." },
    ],
  });
  console.log("Description from URL:", response1.text);
}

runMultimodalInput();
