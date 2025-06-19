import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

const ai = genkit({
  plugins: [googleAI()],
  // promptDir: './llm_prompts', // Uncomment if using a custom prompt directory
});

async function runPrompt() {
  const recommendationsMedicationsPrompt = ai.prompt(
    "recommendations_medications"
  );
  const { text } = await recommendationsMedicationsPrompt({
    symptoms: "Fever, Cough, Sore throat, Headaches, Fatigue",
  });
  console.log(text);
}

runPrompt();
