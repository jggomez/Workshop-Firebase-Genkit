# Firebase Genkit Workshop

This workshop will guide you through the process of building AI-powered applications using Genkit, with a focus on its integration capabilities, particularly with Firebase. Genkit is designed to streamline the development of AI features by providing a unified interface for various generative AI models and simplifying complex AI workflows.

## 1. What is Firebase Genkit?

Genkit is a framework that helps you build AI features for your applications. At its core, it focuses on generative model requests, acknowledging that simply passing user input to a model and displaying the output is rarely sufficient. Real-world AI applications typically involve pre- and post-processing steps, such as retrieving contextual information, managing session history, reformatting input/output, evaluating safety, or combining outputs from multiple models.

Genkit addresses these complexities by providing:

* **Unified Interface:** It abstracts away the details of accessing various generative AI model services, offering a single interface to interact with different LLMs and image generation models. This flexibility allows for easy model swapping and combining multiple models.
* **Flows:** Genkit introduces "flows," which are constructions for representing tightly-linked AI logic. Flows are written like ordinary functions but add capabilities like type safety, integration with a developer UI for debugging, and simplified deployment.
* **Developer Tools:** Genkit includes a `Node.js` CLI and a local web app called the **Developer UI** for interactive testing and development.
* **Deployment:** Genkit flows can be deployed directly as web API endpoints, including with Firebase Cloud Functions or any `Node.js` hosting platform.
* **Observability:** Genkit Monitoring allows you to collect and view real-time telemetry data for your deployed features, providing visibility into latency, errors, token usage, and detailed traces for debugging.

While Genkit is a standalone framework, it offers strong integration with Firebase, particularly for deployment via Cloud Functions for Firebase and for monitoring production metrics through the Firebase plugin.

## 2. Prerequisites and Installation

To get started with Genkit, you'll need `Node.js` and `npm`, and an API key for a generative AI model.

### Prerequisites

* Node.js `v20+`
* `npm`
* An API key for a generative AI model (e.g., Gemini API from Google AI Studio).

### Installation

* First of all, create a node project

```shell
npm init
```

Ok, now install dependencies

1.  **Install Genkit dependencies:** Install the `genkit` core library and the `@genkit-ai/googleai` plugin to access Google AI Gemini models.

```shell
npm install genkit @genkit-ai/googleai
```

3.  **Configure your model API key:** Set the `GEMINI_API_KEY` environment variable with your API key.
```shell
export GEMINI_API_KEY=APIKEY
```
