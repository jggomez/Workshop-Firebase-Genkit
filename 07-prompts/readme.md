## Managing Prompts with Dotprompt: A Workshop Chapter

Prompt engineering is the art of crafting inputs to generative AI models to achieve desired outputs. This involves fine-tuning not just the prompt text, but also the choice of model and its parameters (like temperature or top-k). Because the optimal combination often requires extensive trial and error, Genkit provides Dotprompt to streamline this iterative process.

Dotprompt treats **prompts as code**, allowing you to define prompts, their associated models, and parameters in separate files. This separation facilitates rapid experimentation, especially with the Genkit Developer UI, before integrating them into your application.

### 1. Creating Prompt Files

Dotprompt prioritizes organizing prompts as `.prompt` files, typically within a `prompts/` directory at your project's root, which Genkit automatically loads. You can specify a different directory if needed, for example: `genkit({ promptDir: './llm_prompts' })`.

#### 1.1. Using a Text Editor
A `.prompt` file begins with optional YAML front matter, enclosed by `---`, followed by the prompt content. The front matter usually contains metadata such as the model to be used.

**Example: `prompts/recommendations_medications.prompt`**
```yaml
---
model: googleai/gemini-1.5-flash
config:
  temperature: 0.4
  topK: 31
  topP: 0.92
input:
  schema:
    symptoms?: string
  default:
    symptoms: "headache"
---
{{role "system"}}
You are a doctor with an extensive experience. Please supply recommendations about treatment and medications.

{{role "user"}}
I'm feeling bad and have the following symptoms: {{symptoms}}. Please describe recommendations and medications.
```
The prompt content can also use Handlebars templates for dynamic input.

#### 1.2. Using the Developer UI
The Genkit Developer UI offers an interactive way to create prompt files. After initializing Genkit with necessary model plugins (e.g., `@genkit-ai/googleai`), you can launch the UI (`genkit start -- tsx --watch src/your-code.ts`). From the "Models" section, you can experiment with prompts and configurations, then use the "Export" button to save your refined prompt to your `prompts/` directory.

### 2. Running Prompts

Once created, `.prompt` files can be executed from your application code or via Genkit's tooling, provided Genkit and required model plugins are initialized.

#### 2.1. Run Prompts from Code
Load a prompt using `ai.prompt('file_name')`. The loaded prompt can then be called like a function.

```typescript
import { genkit } from "genkit";
import { googleAI, gemini25FlashPreview0417 } from "@genkit-ai/googleai";

const ai = genkit({
  plugins: [googleAI()],
  model: gemini25FlashPreview0417,
  // promptDir: './llm_prompts', // Uncomment if using a custom prompt directory
});

async function runPrompt() {
  const recommendationsMedicationsPrompt = ai.prompt(
    "recommendations_medications"
  );
  const { text } = await recommendationsMedicationsPrompt();
  console.log(text);
}

runPrompt();

```
Prompts also support streaming output, similar to `generateStream()`:
```typescript
const { response, stream } = recommendationsMedicationsPrompt.stream();
for await (const chunk of stream) {
  console.log(chunk.text);
}
console.log((await response).text); // Optional final response
```
Callable prompts accept optional input and a configuration object, which overrides any parameters defined in the prompt file.

#### 2.2. Using the Developer UI
The Genkit Developer UI is invaluable for testing and refining prompts. Launch it using `genkit start -- tsx --watch src/your-code.ts`. The UI will load all defined prompts, allowing you to interactively test them with various inputs and configurations, and export changes back to your project.

### 3. Model Configuration

You can specify model configuration values directly within the YAML front matter of your `.prompt` files. These settings map to the `config` parameter used when calling the prompt, influencing output characteristics.

**Example: `prompts/configured_prompt.prompt`**
```yaml
---
model: googleai/gemini-2.0-flash
config:
  temperature: 0.9
  topK: 50
  topP: 0.4
  maxOutputTokens: 400
  stopSequences:
    - "<end>"
    - "<fin>"
---
Generate a creative story.
```
Common parameters include `maxOutputTokens` and `stopSequences` to control length, and `temperature`, `topP`, and `topK` to adjust creativity. Lower `temperature` values yield less creative, more deterministic output, while higher values promote creativity. `topP` and `topK` control the number of tokens considered during generation.

### 4. Input and Output Schemas

Dotprompt allows defining input and output schemas in the front matter, providing type safety and enabling structured output. These schemas function similarly to those in `generate()` requests or flow definitions.

**Example: `prompts/recommendations_medications.prompt` with schemas**
```yaml
---
model: googleai/gemini-1.5-flash
input:
  schema:
    symptoms?: string
  default:
    symptoms: "headache"
output:
  schema:
    recommendations: string
    medications: string
---
I'm feeling bad and have the following symptoms:
{{symptoms}}
Please describe recommendations and medications.
```
When called, this prompt will produce structured output conforming to the defined schema.

You can define schemas using:
*   **Picoschema**: A compact, YAML-optimized format ideal for LLM usage, supporting scalar types, objects, arrays, and enums. Properties are required by default unless optional (`?`), and objects don't allow additional properties unless a wildcard field `(*)` is specified.
*   **JSON Schema**: For more complex schema requirements.
*   **Zod schemas defined in code**: Register Zod schemas with `ai.defineSchema()` and reference them by name in your `.prompt` file for TypeScript type checking.

### 5. Prompt Templates

The core content of a `.prompt` file is the prompt itself, which uses the Handlebars templating language to incorporate dynamic user input.

**Example with Handlebars:**
```yaml
---
model: googleai/gemini-2.0-flash
input:
  schema:
    theme?: string
---
Invent a menu item for a {{ #if theme }}{{ theme }} themed {{ /if }} restaurant.
```
Here, `{{ theme }}` resolves to the value of the `theme` input property. Handlebars also supports conditional rendering with helpers like `{{#if}}`.

Genkit automatically defines certain values for templates:
*   **Multi-message prompts**: Use the `{{role}}` helper to define conversational contexts, such as `system` or `user` messages.
*   **Multimodal prompts**: The `{{media}}` helper can embed media (e.g., images via HTTPS or base64 data URIs) into the prompt for models supporting multimodal input.

**Example Multimodal prompts:**
```yaml
---
model: googleai/gemini-2.0-flash
input:
  schema:
    photoUrl: string
---
Describe this image in a detailed paragraph:

{{media url=photoUrl}}
```

```typescript
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

const ai = genkit({
  plugins: [googleAI()],
});

async function runPrompt() {
  const describeImagePrompt = ai.prompt("describe_image");
  const { text } = await describeImagePrompt({
    photoUrl:
      "https://storage.googleapis.com/questionsanswersproject/animales_mexico.jpeg",
  });
  console.log(text);
}

runPrompt();

```

### 6. Partials

Partials are reusable Handlebars templates that promote consistency across prompts. Any `.prompt` file prefixed with an underscore (e.g., `_personality.prompt`) is treated as a partial.

**Example: `_personality.prompt`**
```
You should speak like a {{ #if style }}{{ style }}{{ else }} helpful assistant. {{ /if }}.
```
**Including in another prompt:**
```yaml
---
model: googleai/gemini-2.0-flash
input:
  schema:
    name: string
    style?: string
---
{{ role "system" }} {{> personality style = style }}
{{ role "user" }} Give the user a friendly greeting.
User's Name: {{ name }}
```
Partials are inserted using `{{>NAME_OF_PARTIAL args...}}` syntax and can accept named or positional arguments. You can also define partials in code using `ai.definePartial()` to make them globally available. Custom helpers can be defined with `ai.defineHelper()` to process data within a prompt.

### 7. Prompt Variants

Dotprompt's variant feature enables side-by-side testing of different prompt versions, useful for A/B testing in production. Create a variant by naming the file `[name].[variant].prompt` (e.g., `my_prompt.gemini25pro.prompt`).

To use a specific variant:
```typescript
const myPrompt = ai.prompt('my_prompt', { variant: 'gemini25pro' });
```
The variant name is included in generation traces, allowing for performance comparison in the Genkit trace inspector.

### 8. Defining Prompts in Code

While `.prompt` files are the recommended approach, you can also define prompts programmatically using the `definePrompt()` function. This is useful for use cases not well-suited by file-based prompts. It takes parameters analogous to the YAML front matter and either a Handlebars template string or a function that returns a `GenerateRequest`.

**Example:**
```typescript
import { z } from 'genkit';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const ai = genkit({ plugins: [googleAI()] });

const myPromptInCode = ai.definePrompt({
  name: 'myPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: {
    schema: z.object({
      name: z.string(),
    }),
  },
  prompt: 'Hello, {{name}}. How are you today?',
});

async function runCodeDefinedPrompt() {
  const { text } = await myPromptInCode({ name: 'Alice' });
  console.log(text);
}

runCodeDefinedPrompt();
```
