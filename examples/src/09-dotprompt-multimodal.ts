import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

const ai = genkit({
  plugins: [googleAI()],
});

async function runPrompt() {
  const describeImagePrompt = ai.prompt("describe_image");
  const { text } = await describeImagePrompt({
    photoUrl:
      "https://storage.googleapis.com/questionsanswersproject/animales_mexico.jpeg",
  });
  console.log(text);
}

runPrompt();
