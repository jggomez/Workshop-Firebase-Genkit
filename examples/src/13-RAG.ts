import { genkit, z } from "genkit";
import { gemini25FlashPreview0417, googleAI } from "@genkit-ai/googleai";
import { textEmbedding005, vertexAI } from "@genkit-ai/vertexai";
import {
  devLocalIndexerRef,
  devLocalVectorstore,
  devLocalRetrieverRef,
} from "@genkit-ai/dev-local-vectorstore";
import { Document } from "genkit/retriever";
import path from "path";
import pdf from "pdf-parse";
import fs from "fs";
import { chunk } from "llm-chunk";

const ai = genkit({
  plugins: [
    // VertexAI for embeddings
    vertexAI({ location: "us-central1", projectId: "devhack" }),
    googleAI(),
    devLocalVectorstore([
      {
        indexName: "cop16",
        embedder: textEmbedding005,
      },
    ]),
  ],
});

export const cop16PdfIndexer = devLocalIndexerRef("cop16");

export const indexerDocuments = ai.defineFlow(
  {
    name: "indexerDocuments",
    inputSchema: z.string().describe("PDF File"),
    outputSchema: z.void(),
  },
  async (filePath: string): Promise<void> => {
    filePath = path.resolve(filePath);

    const pdfText = await pdf(fs.readFileSync(filePath));

    const chunks = chunk(pdfText.text, {
      minLength: 1000,
      maxLength: 2000,
      splitter: "sentence",
      overlap: 100,
      delimiters: "",
    });

    const documents = chunks.map((chunk) => {
      return Document.fromText(chunk, { filePath });
    });

    await ai.index({
      indexer: cop16PdfIndexer,
      documents,
    });
  }
);

export const cop16Retriever = devLocalRetrieverRef("cop16");

export const cop16Flow = ai.defineFlow(
  {
    name: "cop16Flow",
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (input: string): Promise<string> => {
    const docs = await ai.retrieve({
      retriever: cop16Retriever,
      query: input,
      options: { k: 3 },
    });

    const { text } = await ai.generate({
      model: gemini25FlashPreview0417,
      prompt: `
            You are acting as a helpful AI assistant that can answer 
            questions about COP16 Cali.

            Use only the context provided to answer the question.
            If you don't know, do not make up an answer.

            Question: ${input}`,
      docs,
    });
    return text;
  }
);


