import { genkit } from "genkit/beta"; // Note: chat API is in beta and imported from genkit/beta
import { googleAI } from "@genkit-ai/googleai";
import { createInterface } from "node:readline/promises";

const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model("gemini-2.5-flash"),
});

async function main() {
  const chat = ai.chat();
  console.log("You're chatting with Gemini. Ctrl-C to quit. \n");
  const readline = createInterface(process.stdin, process.stdout);
  while (true) {
    const userInput = await readline.question("> ");
    const { text } = await chat.send(userInput);
    console.log(text);
  }
}

main();
