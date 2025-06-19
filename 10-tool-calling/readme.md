## Integrating Functionality: Understanding Genkit's Tool Calling

Large Language Models (LLMs) can do more than just generate text; they can also be empowered to interact with external systems and data. This is achieved through a powerful feature known as **tool calling** (also referred to as **function calling**). Tool calling allows LLMs to make requests back to your application, enabling them to access information they weren't trained on, perform calculations, or initiate actions.

### 1. What is Tool Calling?

Tool calling provides a structured way to give LLMs the ability to extend their capabilities by calling functions or "tools" defined within your application. It's particularly useful for:
*   **Accessing dynamic or specific information**: Such as current stock prices, weather data, or user profiles that aren't part of the model's training data and change frequently.
*   **Introducing determinism**: Allowing the LLM to perform calculations it cannot reliably complete itself, or to generate specific, verbatim text under certain conditions (e.g., app's terms of service).
*   **Performing actions**: Enabling the LLM to trigger real-world actions, like reserving a table or controlling smart home devices.

While there's an overlap with Retrieval-Augmented Generation (RAG), which also incorporates external information, tool calling is typically more suitable when the required information can be retrieved via a simple function call or database lookup. RAG is often a "heavier" solution, better suited for large amounts of information where relevance might be ambiguous.

#### 1.1. How Tool Calling Works

A typical tool-calling interaction follows these steps:
1.  Your application sends a prompt to the LLM, along with a list of available tools the LLM can use.
2.  The LLM either generates a complete response or a tool call request in a specified format.
3.  If a tool call is received, your application executes the corresponding logic and sends a new request back to the LLM, including the original prompt (or a variation) and the tool's result.
4.  The LLM then processes this new prompt, potentially generating a final response or another tool call.

For this process to work, the model must be trained to make tool requests, and your application must provide tool definitions and prompt the model to generate tool-calling requests in the expected format. Genkit simplifies this by providing a unified interface, with its plugins handling the model-specific formatting, and the `generate()` function automating the tool-calling loop.

### 2. Defining Tools

In Genkit, you define tools using the `ai.defineTool()` function. This function requires `name`, `description`, and `inputSchema` parameters. The wording and descriptiveness of these parameters are crucial, as they guide the LLM in effectively using the tools.

```typescript
import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import axios from "axios";

const API_URL_BASE = "https://api.gameofthronesquotes.xyz/v1/author";

const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model("gemini-2.5-flash"),
});

interface ApiQuota {
  sentence: string;
  character: any;
}

// Function to fetch data from the API
async function fetchData(api: string): Promise<ApiQuota[]> {
  try {
    const response = await axios.get<ApiQuota[]>(api);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

const InputGetQuotesToolSchema = z.object({
  name: z.string().describe("Character name of Game of Thrones"),
  numQuotes: z.number().default(1).describe("Number of quotes to retrieve"),
});

const OutputGetQuotesToolSchema = z.object({
  quotes: z.array(z.string()).describe("Array of quotes"),
});

const getCharacterQuotesGameOfThrones = ai.defineTool(
  {
    name: "getCharacterQuotesGameOfThrones",
    description: "A free API to retrieve some quotes of Game of Thrones",
    inputSchema: InputGetQuotesToolSchema,
    outputSchema: OutputGetQuotesToolSchema,
  },
  async (input) => {
    console.log(input);
    let characterName = "";
    if (input.name) {
      const multipleName = input.name.split(" ");
      characterName = multipleName[0].toLowerCase();
    }
    const response = await fetchData(
      `${API_URL_BASE}/${characterName}/${input.numQuotes}`
    );
    const quotes = new Array<string>();
    response.forEach((sentence) => quotes.push(sentence.sentence));
    console.log(quotes);
    return { quotes };
  }
);
```

### 3. Using Tools

Once defined, tools can be included in your prompts for content generation. Genkit offers several ways to integrate tools into your LLM interactions:

#### 3.1. With `ai.generate()`
You can pass a list of defined tools directly to the `ai.generate()` method.

```typescript
// Assuming 'getCharacterQuotesGameOfThrones' tool is defined as above
async function usingTool() {
  const response = await ai.generate({
    prompt:
      "Create a poem with 2 commons quotes by Joffrey Lannister in Game Of Thrones",
    tools: [getCharacterQuotesGameOfThrones],
  });
  console.log(response.text);
}

usingTool();
```

#### 3.2. With `ai.definePrompt()` and `.prompt` Files
Tools can be associated with prompts defined programmatically using `ai.definePrompt()` or within `.prompt` files using YAML front matter.

**Using `ai.definePrompt()`:**
```typescript
// Assuming 'getCharacterQuotesGameOfThrones' tool is defined
const poemGOTPrompt = ai.definePrompt(
  {
    name: "poemGOTPrompt",
    tools: [getCharacterQuotesGameOfThrones], // Attach the tool to the prompt definition
    input: { schema: z.object({ name: z.string() }) },
  },
  "Create a poem with 2 commons quotes by {{name}} in Game Of Thrones"
);

async function usingTool() {
  const response = await poemGOTPrompt({ name: "JonSnow" });
  console.log(response.text);
}

usingTool();
```

**Using a `.prompt` file (e.g., `poem_got.prompt`):**
```yaml
---
tools: [ getCharacterQuotesGameOfThrones ] # Specify tools in YAML front matter
input:
  schema:
    name: string
---
"Create a poem with 2 commons quotes by {{name}} in Game Of Thrones"
```
To use this in your code:
```typescript
// Assuming 'poem_got.prompt' file exists and 'getCharacterQuotesGameOfThrones' is defined
const poemGOTPrompt = ai.prompt("poem_got");

async function usingTool() {
  const response = await poemGOTPrompt({ name: "jonsnow" });
  console.log(response.text);
}
usingTool();
```
