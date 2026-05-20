---
name: frankjstein-architecture-patterns
description: >
  Macro-architectural guidelines tying together TuJsHtml, KageBunshin, RemoteModule, and TuContainer.
  Trigger: When making high-level design decisions, structuring full applications, or deciding where logic belongs.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.1"
---

## When to Use

- Deciding where a `Signal` belongs (Service vs Component).
- Determining if a task should be offloaded to a Web Worker (`RemoteModule`).
- Designing state management across multiple browser tabs.

## Critical Patterns

### 1. The Reactivity Boundary (Signals belong to the UI)

`KageBunshin` (Signals) is a Pub/Sub mechanism designed to mutate the DOM
efficiently. They carry computational and Garbage Collection overhead.

- **Rule of Thumb:** Services should be pure JavaScript and expose traditional
  methods (e.g., `async getUser()`). The Smart UI Component is responsible for
  taking that data and placing it inside a local `createSignal()`.
- **Exception:** A Service can expose a Signal via a getter ONLY if the state is
  strictly shared and requires cross-component reactivity. Use this sparingly to
  avoid memory leaks and GC blocking.

### 2. The Worker Boundary (`RemoteModule`)

Web Workers are powerful but come with strict limitations. Do not hallucinate
Worker usage unnecessarily.

- **When to use:** For CPU-blocking tasks (heavy math, massive array processing)
  that freeze the User Experience.
- **When NOT to use:** If the data requires DOM parsing (e.g., `DOMParser`), it
  will fail because Workers have no DOM access.
- **SSL Requirement:** Web Workers operate best (and sometimes exclusively)
  under HTTPS/SSL contexts. If the project is not SSL-ready, avoid proposing
  them.

### 3. Multi-Tab Architecture (`Remote.Global`)

The most powerful architectural use-case for `RemoteModule` in FrankJStein is
cross-tab communication.

- A `Remote.Global` service acts as a Singleton across all open tabs of the
  application.
- **Example:** A "Logout" action triggered in Tab A calls a method on the
  `Remote.Global` module, which instantly notifies or updates the state in Tab B
  and Tab C.
- _Warning:_ Combining `TuContainer` singletons _inside_ a `Remote.Global`
  worker is purely theoretical and untested. Stick to simple class proxying for
  remote modules.

### 4. Mandatory Typing & Orchestration

FrankJStein is designed for Human-AI coordination.

- AI agents MUST ALWAYS generate strongly typed code (TypeScript or JSDoc) so
  the Deno/TS Linter can validate the architecture across these boundaries.
- If you are unsure whether to use a Worker, a Service, or a Signal, STOP and
  ask the human orchestrator.

### 5. Architectural Anti-Patterns (NEVER DO)

- **❌ Business Logic in Templates**: Never perform calculations, data transformations, or complex conditional logic inside a `TuJsHtml` builder. Templates are for structure and layout only.
- **❌ Unsanitized Signal Mutation**: Avoid mutating signals from multiple unrelated places. State updates should be predictable and ideally localized in a service or a smart component's handler.
- **❌ Crossing Boundary Contexts**: Do not use outer context tags inside async blocks (`$f`, `$block`). Use the internal context provided by the callback.
- **❌ Deep Relative Paths**: Avoid long relative imports (e.g., `../../../utils.js`). 

### 6. Import Aliases & Project Scalability

For medium-to-large projects, using **Import Aliases** (e.g., `#services/`, `#types/`) is highly recommended to keep the architecture clean.

- **Check First**: Before using aliases, verify if the project has an `import_map.json`, `deno.json`, `tsconfig.json`, or `package.json` with "imports" configured.
- **Constraint**: If no alias system is detected, stick to standard relative paths.
- **Suggestion**: If the project is growing and lacks aliases, suggest configuring them to the user (e.g., using Deno's native imports or Node/Bun's "subpath imports").

### 7. Resource Management (The Disposable Pattern)

For classes that create event listeners, timers, or spawn sub-components, memory leaks are a huge risk. FrankJStein provides a native `Disposable` base class (and `IDisposable` pattern) leveraging `Symbol.dispose`.

- **When to use**: Any UI Controller or Service that manages external subscriptions, timers, or spawns other disposable instances.
- **How to use**: Extend `Disposable` (or `TuScope` which is also disposable). Use `this._register(resource)` to tie sub-resources to the instance's lifecycle.
- **AI Rule**: If a class you are designing has a "cleanup", "destroy", or "teardown" method, DO NOT invent your own names. ALWAYS use the standard `[DISPOSE]()` or `dispose()` method. 
- **AI Rule (Polyfill/Compat)**: The exported `DISPOSE` symbol from FrankJStein is an alias for native `Symbol.dispose`. It provides a fallback (`Symbol.for("Symbol.dispose")`) if the environment lacks support. ALWAYS use the imported `DISPOSE` instead of raw `Symbol.dispose` to guarantee backward compatibility in older browsers.
- **AI Rule**: Before calling methods on a service, defensively check `if (this.isDisposed) return;` if it's an asynchronous callback.

## Code Examples

### Correct Reactivity Flow (Service -> UI)

```javascript
// 1. The Pure Service (No Signals)
export class UserService {
  async fetchUser() {
    return { name: "John", active: true }; // Plain JS Object
  }
}

// 2. The Smart Component (Handles Signals)
import { createSignal } from "frankjstein";

/**
 * @typedef {import("frankjstein").TuJsHtml.Types.Tags} Tags
 */

/**
 * @param {Tags} tags
 * @param {UserService} userService
 */
export function UserProfile(tags, userService) {
  const userName = createSignal("Loading...");
  const [, setUserName] = userName.asTuple;

  // The Component owns the reactivity, not the Service
  userService.fetchUser().then((data) => setUserName(data.name ?? "unknown"));

  return tags.div(
    tags.h1`Profile`,
    tags.p`Name: ${userName}`, // UI reacts to the Signal
  );
}
```

## Resources

- **Component Design**: See `frankjstein-component-design`
- **Inversion of Control**: See `frankjstein-ioc-templates`
- **Reactivity Rules**: See `frankjstein-kagebunshin`
