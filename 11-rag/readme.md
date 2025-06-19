## Retrieval-Augmented Generation (RAG) with Genkit

Genkit simplifies the process of building **Retrieval-Augmented Generation (RAG)** workflows by providing abstractions and integrations with related tools.

---

### What is RAG?

**Retrieval-Augmented Generation (RAG)** is a technique that incorporates external information sources into a Large Language Model's (LLM) responses. While LLMs are trained on vast amounts of data, they often lack specific domain knowledge required for practical applications. RAG addresses this by augmenting the LLM's prompt with relevant external data at the time of the request.

#### Advantages of RAG:
* **Cost-effective**: It's more economical than fine-tuning a model, as it avoids the need for retraining.
* **Up-to-date information**: You can continuously update your data source, and the LLM can immediately utilize the new information.
* **Citable references**: RAG offers the potential to cite references in the LLM's responses.

#### Genkit's RAG Abstractions:
Genkit provides three main abstractions to facilitate RAG implementations:
* **Indexers**: These components are responsible for adding documents to an "index." This typically involves vector databases that store documents as multidimensional vectors (embeddings), enabling quick retrieval of relevant documents for a given query.
* **Embedders**: An embedder transforms content (like text, images, or audio) into a numeric vector that captures its semantic meaning. Embedders are used in the indexing process but can also be used independently.
* **Retrievers**: A retriever encapsulates the logic for any type of document retrieval. While common cases involve retrieving from vector stores, a Genkit retriever can be any function that returns data.

---

### Step-by-Step RAG Workflow with Genkit JS

This guide uses a local file-based vector similarity retriever for testing and prototyping, which is **not recommended for production environments**.

#### 1. Prerequisites and Install Dependencies
Ensure your development environment meets the following requirements:
* `Node.js v20+`
* `npm`

Install the necessary Genkit dependencies and libraries for PDF processing:
```bash
npm install genkit @genkit-ai/googleai @genkit-ai/dev-local-vectorstore llm-chunk pdf-parse @genkit-ai/vertexai
npm install --save-dev @types/pdf-parse
```
You'll also need a model API key, such as a Gemini API key, set as an environment variable (e.g., `export GEMINI_API_KEY=<your_api_key>`).

#### 2. Configure Genkit with a Local Vector Store and Embedder
Configure your Genkit instance to include the `vertexAI` plugin (which provides an embedder) and the `devLocalVectorstore` plugin.

```javascript
import { genkit, z, } from "genkit";
import { gemini25FlashPreview0417, googleAI } from "@genkit-ai/googleai";
import { textEmbedding005, vertexAI } from "@genkit-ai/vertexai"
import {
    devLocalIndexerRef,
    devLocalVectorstore,
    devLocalRetrieverRef
} from '@genkit-ai/dev-local-vectorstore';
import { Document } from "genkit/retriever";
import path from "path"
import pdf from 'pdf-parse';
import fs from 'fs';
import { chunk } from "llm-chunk";


const ai = genkit({
    plugins: [
        // VertexAI for embeddings
        vertexAI({ location: 'us-central1', projectId: "wordboxdev" }),
        googleAI(),
        devLocalVectorstore([
            {
                indexName: 'cop16',
                embedder: textEmbedding005,
            }
        ])
    ]
});
```
This configuration sets up a local vector store named `cop16` that uses Vertex AI's `text-embedding-005` model for embedding documents.

#### 3. Define an Indexer Flow
An indexer flow is used to ingest your documents into the vector database.
* **Create an Indexer Reference**: Create a reference to your `cop16` indexer.
* **Define Chunking Configuration**: Large documents need to be split into smaller "chunks" because LLMs have limited context windows. The `llm-chunk` library provides text splitting capabilities. This configuration ensures document segments are between 1000 and 2000 characters.
* **Define the Indexer Flow (`indexerDocuments`)**: This flow reads a PDF, extracts text, chunks it, converts chunks into Genkit `Document` objects, and then adds them to your index. The `ai.run` calls ensure that the text extraction and chunking steps are included in the trace viewer for debugging.
* **Run the Indexer Flow**: To seed your vector database, run the `indexerDocuments` flow from the command line, providing the path to your PDF document. After this, the vector database will be ready for retrieval.

```javascript
export const cop16PdfIndexer = devLocalIndexerRef('cop16');

export const indexerDocuments = ai.defineFlow(
    {
        name: 'indexerDocuments',
        inputSchema: z.string().describe("PDF File"),
        outputSchema: z.void()
    },
    async (filePath: string): Promise<void> => {
        filePath = path.resolve(filePath);

        const pdfText = await pdf(fs.readFileSync(filePath));

        const chunks = chunk(pdfText.text, {
            minLength: 1000,
            maxLength: 2000,
            splitter: 'sentence',
            overlap: 100,
            delimiters: '',
        })

        const documents = chunks.map((chunk) => {
            return Document.fromText(chunk, { filePath })
        })

        await ai.index({
            indexer: cop16PdfIndexer,
            documents,
        })
    }
);
```

#### 4. Define a Flow with Retrieval (`cop16Flow`)
This flow demonstrates how to use a retriever to augment a generation request with contextual information.
* **Define the Retriever Reference**: Create a reference to your `cop16` retriever.
* **Define the RAG Flow (`cop16Flow`)**: This flow first calls `ai.retrieve` to get documents relevant to the user's `query` from the retriever. Then, these `docs` are passed to `ai.generate` as additional context for the LLM's prompt, enabling the model to answer questions based on the provided menu information.
* **Run the Retriever Flow**: Execute the RAG flow from the command line. The output should be a model response grounded in the content of your indexed PDF file.

```javascript
export const cop16Retriever = devLocalRetrieverRef("cop16")

export const cop16Flow = ai.defineFlow(
    {
        name: 'cop16Flow',
        inputSchema: z.string(),
        outputSchema: z.string(),
    },
    async (input: string): Promise<string> => {
        const docs = await ai.retrieve({
            retriever: cop16Retriever,
            query: input,
            options: { k: 3 },
        })

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
```

---

### Advanced Options

Genkit also allows you to define your own custom indexers, retrievers, and rerankers if your documents are managed in an unsupported store (e.g., MySQL, Google Drive) or if you need to apply advanced RAG techniques.
* **Simple Retrievers**: Convert existing code into retrievers.
* **Custom Retrievers**: Define more complex retrieval logic, potentially building on existing retrievers and incorporating steps like prompt extension and reranking.
* **Rerankers**: Implement models that reorder retrieved documents based on their relevance to a query, fine-tuning the information provided to the generative model.
