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

## Workshop Structure

The workshop is divided into sequential modules. Each folder contains a `README.md` file with specific instructions for that step.

1.  ### [01-install](https://www.google.com/search?q=./01-install/)

    Initial environment setup, installation of Genkit dependencies, and configuration of the API key to communicate with AI models.

2.  ### [02-development-tools](https://www.google.com/search?q=./02-development-tools/)

    An introduction to Genkit's development tools: the **CLI** and the **Developer UI**, which will allow you to test, debug, and inspect your AI flows interactively.

3.  ### [03-generate-content](https://www.google.com/search?q=./03-generate-content/)

    Make your first call to an AI model for basic text generation. You will learn to use the `ai.generate()` method.

4.  ### [04-chat-conversations](https://www.google.com/search?q=./04-chat-conversations/)

    Learn to manage history and context in multi-turn (chat-like) conversations to create more fluid and coherent interactions.

5.  ### [05-output-structured](https://www.google.com/search?q=./05-output-structured/)

    Force the model to return responses in a structured and predictable JSON format using **Zod** schemas.

6.  ### [06-multimodal-output](https://www.google.com/search?q=./06-multimodal-output/)

    Explore the multimodal capabilities of models, allowing them to process inputs that combine text and images.

7.  ### [07-flows](https://www.google.com/search?q=./07-flows/)

    Define and use **Flows** to encapsulate complex AI logic, orchestrate multiple steps, and simplify the deployment of your functions.

8.  ### [08-rag](https://www.google.com/search?q=./08-rag/)

    Implement a complete **RAG (Retrieval-Augmented Generation)** flow to build a question-answering system based on knowledge from external documents.

## How to Use This Repository

1.  **Clone the repository to your local machine:**

    ```bash
    git clone https://github.com/jggomez/Workshop-Firebase-Genkit.git
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd Workshop-Firebase-Genkit
    ```

3.  **Start with the first module:**
    Enter the first folder (`cd 01-install`) and follow the instructions in its respective `README.md` file.

4.  **Advance sequentially:**
    Complete the modules in numerical order for the best learning experience.

-----

Enjoy building with Genkit\!
