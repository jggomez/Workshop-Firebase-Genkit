### Passing Information Through Context in Genkit

In Genkit, understanding and effectively using the `context` object is crucial for building robust and secure AI-powered applications. This section will detail what context is, why it's important, how it's structured, and how to utilize it across your Genkit workflows.

#### What is Context?
The **`context` object** in Genkit provides a **consistent mechanism to propagate generation and execution context** throughout your AI workflows. It's automatically made available to **all Genkit actions**, including flows, tools, and prompts.

Developers typically handle three categories of information simultaneously when working with LLMs:
*   **Input**: Information directly relevant to guide the LLM's response for a particular call (e.g., text to be summarized).
*   **Generation Context**: Information relevant to the LLM, but not specific to a single call (e.g., current time, user's name).
*   **Execution Context**: Information important to the surrounding code but not necessarily to the LLM itself (e.g., a user's current authentication token).

#### Why is Context Important?
It is considered a **best practice to provide the minimum necessary information to the LLM** to complete its task. This approach offers several benefits:
*   **Improved Performance**: Less extraneous information helps the LLM perform better at its task.
*   **Preventing Information Leaks**: By using context as a **"side channel"**, sensitive information like user or account IDs can be used by your code without being directly exposed to the LLM, reducing the risk of it being tricked into leaking data.
*   **Enhanced Security**: Context can be used to restrict tool queries to the current user's available scope, adding a layer of security.

#### Context Structure
The `context` object **must be an object**, and its properties are determined by you, the developer. Genkit may also automatically populate certain properties; for instance, the `state` property is added to context when using persistent chat sessions.

A common and recommended use of context is to store information about the current user, typically within an `auth` property, structured as follows:
```json
{
  "auth": {
    "uid": "...",
    "token": {  },
    "rawToken": "..."
  }
}
```
Essentially, the context object can hold any information relevant to the execution flow that your code might need.

#### Using Context in Genkit Actions
Context is automatically supplied to your function definitions within various Genkit actions:

*   **Flows**: You can access context as a parameter in your flow definition. For example, to summarize messages between users while ensuring authentication:
    ```typescript
    const summarizeHistory = ai.defineFlow({ /* ... */ }, async ({ friendUid }, { context }) => {
      if (!context.auth?.uid) throw new Error("Must supply auth context.");
      // ... use context.auth.uid to retrieve messages
    });
    ```
*   **Tools**: Similarly, context is available as a parameter in tool definitions, enabling secure operations (e.g., searching user-specific notes):
    ```typescript
    const searchNotes = ai.defineTool({ /* ... */ }, async ({ query }, { context }) => {
      if (!context.auth?.uid) throw new Error("Must be called by a signed-in user.");
      // ... use context.auth.uid to search notes
    });
    ```
*   **Prompt Files (.prompt)**: In Dotprompt templates, context properties are accessible using the **`@` variable prefix**. For example, if your context object is `{auth: {name: 'Michael'}}`, you can use `{{@auth.name}}` in your prompt.
    ```handlebars
    {{ #if pirateStyle }} Avast, {{@auth.name}}, how be ye today? {{ else }} Hello, {{@auth.name}}, how are you today? {{ /if }}
    ```

#### Providing Context at Runtime
To supply context to a Genkit action, you pass the context object as an option when calling the action:

*   **Flows**:
    ```typescript
    const summary = await summarizeHistory(friend.uid, {
      context: { auth: currentUser },
    });
    ```
*   **Generations (`ai.generate`)**: Context passed here will automatically propagate to any tool calls made within that generation loop.
    ```typescript
    const { text } = await ai.generate({
      prompt: "Find references to ocelots in my notes.",
      tools: [searchNotes],
      context: { auth: currentUser },
    });
    ```
*   **Prompts (`ai.prompt`)**:
    ```typescript
    const helloPrompt = ai.prompt("sayHello");
    helloPrompt({ pirateStyle: true }, { context: { auth: currentUser } });
    ```

#### Context Propagation and Overrides
**Context automatically propagates** to all actions called within the scope of an execution. This means if a flow calls other flows, or a generation calls tools, the same context will be available to those subsequent actions.

You can also **override the existing context** within an action by passing a new context object. This new context will then propagate to all subsequent actions called within that updated scope. You can either completely replace the context or selectively merge new properties:
```typescript
const myFlow = ai.defineFlow({ /* ... */ }, (input, { context }) => {
  // Override the existing context completely
  otherFlow({ /*...*/ }, { context: { newContext: true } });

  // Or selectively override (merge)
  otherFlow({ /*...*/ }, { context: { ...context, updatedContext: true } });
});
```
