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

async function usingTool() {
  const response = await ai.generate({
    prompt:
      "Create a poem with 2 commons quotes by Joffrey Lannister in Game Of Thrones",
    tools: [getCharacterQuotesGameOfThrones],
  });
  console.log(response.text);
}

usingTool();
