---
name: frankjstein-architecture-patterns
description: >
  Macro-architectural guidelines tying together TuJsHtml, KageBunshin, RemoteModule, and TuContainer.
  Trigger: When making high-level design decisions, structuring full applications, or deciding where logic belongs.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
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
  userService.fetchUser().then((data) => setUserName(data.name));

  return tags.div(
    tags.h1`Profile`,
    tags.p("Name: ", userName), // UI reacts to the Signal
  );
}
```

## Resources

- **Component Design**: See `frankjstein-component-design`
- **Inversion of Control**: See `frankjstein-ioc-templates`
- **Reactivity Rules**: See `frankjstein-kagebunshin`
