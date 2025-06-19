import { gemini25FlashPreview0417, googleAI } from "@genkit-ai/googleai";
import { genkit, z } from "genkit";

const ai = genkit({
  plugins: [googleAI()],
  model: gemini25FlashPreview0417,
});

const BlogPostSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const BlogPostFlowWithSchema = ai.defineFlow(
  {
    name: "BlogPostFlow",
    inputSchema: z.void(),
    outputSchema: BlogPostSchema,
  },
  async () => {
    const { text } = await ai.generate([
      {
        media: {
          url: "https://storage.googleapis.com/questionsanswersproject/animales_mexico.jpeg",
        },
      },
      { text: "What animals are in the photo?" },
    ]);
    const { output } = await ai.generate({
      model: gemini25FlashPreview0417,
      prompt: `Create a blog post for national geographic over these animals ${text}`,
      output: { schema: BlogPostSchema },
    });
    if (output == null) {
      throw new Error("Response doesn't satisfy schema.");
    }
    return output;
  }
);

(async () => {
  const { title, description } = await BlogPostFlowWithSchema();
  console.log(title);
  console.log(description);
})();
