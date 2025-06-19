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
import { genkit, z } from 'genkit'; // z is used for schema definition
import { googleAI } from '@genkit-ai/googleai';

const ai = genkit({
  plugins: [ googleAI() ],
  model: googleAI.model('gemini-2.5-flash'), // Model must support tool calling
});

// Define a tool to get weather information
const getWeather = ai.defineTool(
  {
    name: 'getWeather', // Required: Unique name for the tool
    description: 'Gets the current weather in a given location', // Required: Describes the tool's purpose to the LLM
    inputSchema: z.object({ // Required: Defines the input parameters using Zod
      location: z.string().describe('The location to get the current weather for'),
    }),
    outputSchema: z.string(), // Defines the expected output type
  },
  async (input) => {
    // In a real application, this would involve an actual API call or database query.
    // For this example, we return a fixed value.
    return `The current weather in ${input.location} is 63°F and sunny.`;
  },
);
```

### 3. Using Tools

Once defined, tools can be included in your prompts for content generation. Genkit offers several ways to integrate tools into your LLM interactions:

#### 3.1. With `ai.generate()`
You can pass a list of defined tools directly to the `ai.generate()` method.

```typescript
// Assuming 'getWeather' tool is defined as above
async function runWeatherQuery() {
  const response = await ai.generate({
    prompt: "What is the weather in Baltimore?",
    tools: [getWeather], // Include the defined tool
  });
  console.log(response.text);
}
runWeatherQuery();
```

#### 3.2. With `ai.definePrompt()` and `.prompt` Files
Tools can be associated with prompts defined programmatically using `ai.definePrompt()` or within `.prompt` files using YAML front matter.

**Using `ai.definePrompt()`:**
```typescript
// Assuming 'getWeather' tool is defined
import { z } from 'genkit';

const weatherPrompt = ai.definePrompt(
  {
    name: "weatherPrompt",
    tools: [getWeather], // Attach the tool to the prompt definition
    input: { schema: z.object({ location: z.string() }) },
  },
  "What is the weather in {{location}}?" // Handlebars template for the prompt
);

async function runPromptWithTool() {
  const response = await weatherPrompt({ location: "Baltimore" });
  console.log(response.text);
}
runPromptWithTool();
```

**Using a `.prompt` file (e.g., `weatherPrompt.prompt`):**
```yaml
---
tools: [ getWeather ] # Specify tools in YAML front matter
input:
  schema:
    location: string
---
What is the weather in {{ location }}?
```
To use this in your code:
```typescript
// Assuming 'weatherPrompt.prompt' file exists and 'getWeather' is defined
const weatherPromptFromFile = ai.prompt("weatherPrompt");

async function runPromptFromFileWithTool() {
  const response = await weatherPromptFromFile({ location: "Baltimore" });
  console.log(response.text);
}
runPromptFromFileWithTool();
```

#### 3.3. With `ai.chat()`
Genkit's chat API (which is currently in Beta and imported from `genkit/beta`) also supports tool calling, allowing the model to use tools within a conversational context. Tools can be provided when initializing the chat session or for specific messages.

```typescript
import { genkit } from 'genkit/beta'; // Note: chat API is in beta
import { googleAI } from '@genkit-ai/googleai';
import { createInterface } from 'node:readline/promises';
import { z } from 'genkit'; // Zod for schema definition

// Assuming Genkit and googleAI are configured as in previous examples, and getWeather is defined.

async function chatWithTool() {
  const chat = ai.chat({
    system: "Answer questions using the tools you have.",
    tools: [getWeather], // Tools available for the entire chat session
  });
  console.log("Chatting with weather assistant. Ctrl-C to quit. \n");
  const readline = createInterface(process.stdin, process.stdout);
  while (true) {
    const userInput = await readline.question('> ');
    const { text } = await chat.send(userInput); // Send message, model can use tools
    console.log(text);
  }
}

// chatWithTool(); // Uncomment to run this example
```
You can also specify tools for a single message within an ongoing chat:
```typescript
// ... (within an async function or main block)
const chat = ai.chat(); // Chat initialized without session-wide tools
const response = await chat.send({
  prompt: "What is the weather in Baltimore?",
  tools: [getWeather], // Tools specific to this message
});
console.log(response.text);
```

### 4. Streaming and Tool Calling

When combining tool calling with streaming responses (`generateStream()`), the stream chunks can include `toolRequest` and `toolResponse` content parts. This allows your application to dynamically construct the full message sequence as it receives streaming data, including the intermediate steps of tool invocation.

```typescript
// Assuming 'getWeather' tool is defined
async function streamWithTool() {
  const { stream } = ai.generateStream({
    prompt: "What is the weather in Baltimore?",
    tools: [getWeather],
  });

  console.log("Streaming response with tool calls:");
  for await (const chunk of stream) {
    console.log(chunk); // You will see 'toolRequest' and 'toolResponse' content parts
  }
}
// streamWithTool(); // Uncomment to run this example
```
The output might resemble:
```
{ index: 0, role: "model", content: [{text: "Okay, I'll check the weather"}]}
{ index: 0, role: "model", content: [{text: "for Baltimore."}]}
{ index: 0, role: "model", content: [{toolRequest: {name: "getWeather", input: {location: "Baltimore"}}}]}
{ index: 1, role: "tool", content: [{toolResponse: {name: "getWeather", output: "Temperature: 68 degrees \n Status: Cloudy."}}]}
{ index: 2, role: "model", content: [{text: "The weather in Baltimore is 68 degrees and cloudy."}]}
```


### 5. Limiting Tool Call Iterations with `maxTurns`

For scenarios where tools might trigger multiple sequential calls, the `maxTurns` parameter can be used to set a hard limit on how many back-and-forth interactions the model can have with your tools within a single generation cycle. This is crucial for:
*   **Cost Control**: Preventing unexpected API usage charges from excessive tool calls.
*   **Performance**: Ensuring responses complete within reasonable timeframes.
*   **Safety**: Guarding against infinite loops in complex tool interactions.
*   **Predictability**: Making your application's behavior more deterministic.

The default value for `maxTurns` is 5. Each "turn" represents one complete cycle where the model makes tool calls and receives responses. If the `maxTurns` limit is reached, Genkit stops the tool-calling loop and returns the model's current response, which may be partial.

```typescript
// Example: A research agent needing multiple web searches
const webSearch = ai.defineTool(
  {
    name: 'webSearch',
    description: 'Search the web for current information',
    inputSchema: z.object({
      query: z.string().describe('Search query'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    // Simulate web search API call
    return `Search results for "${input.query}": [relevant information here]`;
  },
);

async function runResearchAgent() {
  const response = await ai.generate({
    prompt: 'Research the latest developments in quantum computing, including recent breakthroughs, key companies, and future applications.',
    tools: [webSearch],
    maxTurns: 8, // Allow up to 8 research iterations
  });
  console.log(response.text);
}
// runResearchAgent(); // Uncomment to run this example
```
This parameter can be set in `generate()` options, `definePrompt()`, or directly in `.prompt` files.

### 6. Dynamically Defining Tools (`ai.dynamicTool`)

While it's generally recommended to predefine tools during your application's initialization for interaction with the Genkit Dev UI, there are scenarios where a tool must be defined dynamically per user request. For these cases, Genkit provides `ai.dynamicTool()`.

`ai.dynamicTool()` is similar to `ai.defineTool()` but differs in that dynamic tools are not tracked by the Genkit runtime and thus cannot be interacted with from the Genkit Dev UI. They must be passed to the `ai.generate()` call by reference. You can specify input and output schemas using Zod or manually constructed JSON Schema.

```typescript
// Defining a flow where a tool is dynamically created
ai.defineFlow('dynamicWeatherFlow', async () => {
  const getWeatherDynamic = ai.dynamicTool(
    {
      name: 'getWeatherDynamic',
      description: 'Gets the current weather in a given location',
      inputSchema: z.object({
        location: z.string().describe('The location to get the current weather for'),
      }),
      outputSchema: z.string(),
    },
    async (input) => {
      return `The current weather in ${input.location} is 63°F and sunny (dynamically defined).`;
    },
  );
  const { text } = await ai.generate({
    prompt: 'What is the weather in Baltimore?',
    tools: [getWeatherDynamic], // Pass dynamic tool by reference
  });
  return text;
});

// To run this, you would use genkit flow:run dynamicWeatherFlow from CLI
```
You can also define a dynamic tool without an implementation function; in this case, it behaves like an interrupt, allowing for manual tool call handling.

### 7. Explicit Tool Call Handling (`returnToolRequests`)

By default, Genkit manages the tool-calling loop automatically, repeatedly calling the LLM until all tool calls are resolved. However, if you need full control over this loop—for example, to introduce complex logic, ask the user a question, confirm a risky action, or request out-of-band approval—you can set the `returnToolRequests` parameter to `true`. This pauses the tool loop and returns control to your code, making you responsible for fulfilling all tool requests. This is closely related to "interrupts" which provide a way to pause the generation for external handling.

```typescript
// Assuming 'getWeather' tool is defined as above
import { GenerateOptions, ToolResponsePart } from 'genkit/ai'; // Conceptual imports

const generateOptions: GenerateOptions = {
  prompt: "What's the weather like in Baltimore?",
  tools: [getWeather],
  returnToolRequests: true, // Request explicit control
};

let llmResponse;
while (true) {
  llmResponse = await ai.generate(generateOptions);
  const toolRequests = llmResponse.toolRequests;

  if (toolRequests.length < 1) {
    break; // No more tool requests, exit loop
  }

  // Manually process each tool request
  const toolResponses: ToolResponsePart[] = await Promise.all(
    toolRequests.map(async (part) => {
      switch (part.toolRequest.name) {
        case 'getWeather': // Handle your tool
          // Execute the tool and get its output
          const output = await getWeather(part.toolRequest.input);
          return {
            toolResponse: {
              name: part.toolRequest.name,
              ref: part.toolRequest.ref, // Reference to original tool request
              output: output,
            },
          };
        default:
          throw Error(`Tool not found: ${part.toolRequest.name}`);
      }
    }),
  );

  // Update generateOptions for the next turn, including previous messages and new tool responses
  generateOptions.messages = llmResponse.messages;
  generateOptions.prompt = toolResponses; // Send tool responses back to the model as prompt content
}
console.log(llmResponse.text);
```
