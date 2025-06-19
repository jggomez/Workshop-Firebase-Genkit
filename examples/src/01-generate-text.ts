// import the Genkit and Google AI plugin libraries
import { googleAI, gemini25FlashPreview0417 } from "@genkit-ai/googleai";
import { genkit } from "genkit";

// configure a Genkit instance
const ai = genkit({
  plugins: [googleAI()],
  model: gemini25FlashPreview0417, // set default model
});

async function main() {
  // make a generation request with the default model
  const { text } = await ai.generate(
    "Create a poem for this beautiful community of developers."
  );
  console.log(text);
}

main();
