# Workshop: Firebase Genkit

Welcome to the Firebase Genkit workshop\!

In this repository, you will find a series of guided, hands-on modules to learn how to build end-to-end generative AI applications. Through code examples, you will explore the key features of Genkit, from the initial setup to implementing advanced flows like RAG (Retrieval-Augmented Generation).

## Prerequisites

Before you begin, please ensure you have the following installed:

  * **Node.js**: Version `v20+` or higher.
  * **`npm`** (or your preferred package manager like `yarn` or `pnpm`).
  * **Git** to clone the repository.
  * A code editor like **Visual Studio Code**.
  * An **API key** for a generative model. For these examples, we will use the **Gemini API**, which you can get for free from [Google AI Studio](https://aistudio.google.com/app/apikey).

This workshop provides hands-on experience with **Genkit**, an open-source framework for building AI-powered applications, specifically focusing on its integration with **Firebase projects**. You'll learn how to build robust and scalable generative AI features, from basic setup to advanced AI functionalities.

---

### Workshop Modules

The workshop is structured into sequential modules, each in its own directory:

* **01-install**: Get started by setting up your environment and installing Genkit and its dependencies.
* **02-development-tools**: Learn to use Genkit's powerful development tools for inspecting and debugging your AI flows.
* **03-generate-content**: Explore the fundamentals of generating text and other content using Genkit.
* **04-chat-conversations**: Dive into building conversational AI experiences, including managing chat history and context.
* **05-output-structured**: Understand how to generate structured outputs from large language models for easier integration into your applications.
* **06-multimodal-output**: Learn to generate multimodal content, combining text with images or other media.
* **07-flows**: Focus on creating and managing complex AI flows, orchestrating multiple AI operations.
* **08-prompts**: Discover best practices and techniques for designing effective prompts to guide AI model behavior.
* **09-chat-sessions**: Deep dive into managing persistent chat sessions, user context, and conversation history.
* **10-tool-calling**: Enable your AI models to interact with external tools and APIs, extending their capabilities.
* **11-rag**: Learn about Retrieval Augmented Generation (RAG) to enhance AI responses with external knowledge bases.

---

### Setup and Prerequisites

To participate in this workshop, you'll need:

* **Node.js** (LTS version recommended)
* **npm** or **Yarn**
* A **Google Cloud Project** (for Firebase and AI services)
* Familiarity with **JavaScript/TypeScript**

Detailed setup instructions are provided within the `01-install` module.

---

### Running Examples

Each module directory contains a `README.md` with specific instructions for running its examples. Generally, the process involves:

1.  Navigating to the module directory (e.g., `cd 01-install`).
2.  Installing dependencies (`npm install` or `yarn install`).
3.  Running the example (`npx genkit start -- npx tsx --watch src/01.ts`).

---

### Contributing and License

This repository is primarily for workshop participants. If you have any problems or have suggestions, please feel free to open an issue. The project is licensed under the MIT License.
