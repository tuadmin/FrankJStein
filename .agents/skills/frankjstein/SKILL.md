---
name: frankjstein
description: >
  Main index and core guidelines for FrankJStein.
  Trigger: Load this skill whenever the user requests to work with FrankJStein.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## FrankJStein Core Principles

You are working with FrankJStein, a native, no-transpiler JavaScript framework focused on high performance. 
**This skill acts as an index.** If you need implementation details to write code or debug, you MUST load the corresponding sub-skills.

### Global Rules and DX (Developer Experience)
1. **Strict Typing and Linter Requirement**: Write your code in TypeScript (`.ts`) or enable JS type checking (`// @ts-check`). The library provides an extremely robust `frankjstein.d.ts` file. 
   **AGENT RULE**: If you are tasked with creating or refactoring modules using FrankJStein, you MUST ensure a TypeScript linter is active. If the user does not have one configured, you must request or suggest setting one up. The `.d.ts` file is the ultimate internal validator.
2. **Zero React/JSX**: No Virtual DOM, JSX, Webpack, or Vite required. Do not propose using classic React Hooks (`useState`, `useEffect`).
3. **Decoupling**: Keep heavy state and network fetching away from the UI. Centralize it in classes registered in the `TuContainer` (Dependency Injection).
4. **Respect the Main Thread**: Use `RemoteModule` for complex CPU calculations or slow promises.

### Sub-Skills Index (Load as needed)

- If the user asks to build UI, DOM, mutate styles, or handle events -> **Load the `frankjstein-tujshtml` skill**.
- If the user asks to design, structure, or architect UI components -> **Load the `frankjstein-component-design` skill**.
- If the user mentions Signals, local state, reactivity, or computed values -> **Load the `frankjstein-kagebunshin` skill**.
- If the user asks to connect business logic, databases, or global services -> **Load the `frankjstein-tucontainer` skill** and **`frankjstein-ioc-templates`**.
- If the user asks to perform heavy processing, parallel processing, or hard async tasks -> **Load the `frankjstein-remote` skill**.
- If the user asks for high-level application structure or where logic belongs -> **Load the `frankjstein-architecture-patterns` skill**.
