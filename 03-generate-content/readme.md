## Generating Content with AI Models
The primary interface for interacting with generative AI models in Genkit is the `ai.generate()` method.

### Basic Usage

After you’ve created an API key, set the GEMINI_API_KEY environment variable to your key:

```shell
export GEMINI_API_KEY=<your API key>
```

You can specify a default model when configuring Genkit, or provide a model for individual `generate()` calls.

```javascript
// import the Genkit and Google AI plugin libraries
import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';

// configure a Genkit instance
const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-2.0-flash'), // set default model
});

async function main() {
  // make a generation request with the default model
  const { text } = await ai.generate('Create a poem for this beautiful community of developers');
  console.log(text);
}

main();
```

You can execute the code with the following command:

```bash
genkit start -- npx tsx --watch src/FILE_NAME.ts
```

You can also specify a model directly within the `generate()` call using a model reference function or a string identifier:

```javascript
import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';

const ai = genkit({
  plugins: [googleAI()],
});

async function run() {
  // Generate with a specific model reference
  const response1 = await ai.generate({
    model: googleAI.model('gemini-2.0-flash'),
    prompt: 'Invent a menu item for a restaurant with a pirate theme.',
  });
  console.log(response1.text);

  console.log("*********************");

  // Generate with a model string ID
  const response2 = await ai.generate({
    model: 'googleai/gemini-2.0-flash-001',
    prompt: 'Invent another menu item for a restaurant with a pirate theme.',
  });
  console.log(response2.text);
}

run();
```

### System Prompts

Some models support a `system` prompt, which provides instructions on how the model should respond, such as adopting a persona or tone.

```javascript
import { googleAI, gemini25FlashPreview0417 } from "@genkit-ai/googleai";
import { genkit } from "genkit";

const ai = genkit({
  plugins: [googleAI()],
  model: gemini25FlashPreview0417,
});

async function runSystemPrompt() {
  const response = await ai.generate({
    prompt: 'What is your quest?',
    system: "You are a knight from Monty Python's Flying Circus.",
  });
  console.log(response.text);
}

runSystemPrompt();
```
