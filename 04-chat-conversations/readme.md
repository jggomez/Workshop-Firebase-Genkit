## Chat Conversations

For multi-turn conversations, you can use the `messages` parameter instead of `prompt` to provide a conversation history but the history is not saved automatically. This helps maintain context across interactions.

```javascript
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

```

You can combine `messages` with `system` prompts. For persistent chat sessions with automatic history management, the Chat API is recommended.
