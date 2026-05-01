---
name: frankjstein-kagebunshin
description: >
  Handling granular reactivity and Signals (KageBunshin) in FrankJStein.
  Trigger: State management, Signals, reactivity, createSignal, createComputedSignal.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Critical Patterns for KageBunshin (Signals)

Reactivity in FrankJStein is **hyper-granular**. Mutating a signal NEVER re-renders the entire component; it only repaints the specific text node or attribute tied to the signal in the DOM.

### 1. Creation and Basic Reading
```javascript
import { createSignal } from "frankjstein";

const counter = createSignal(0);
console.log(counter.value); // Reads the static value
```

### 2. Direct Mutation (PREFERRED)
Assignment triggers the DOM update magically in the next tick. For simple logic (counters, toggles), this is the cleanest and most recommended way.
```javascript
counter.value++;
counter.value = 10;
```

### 3. Destructuring into Tuples (`asTuple`)
Used when you need to separate the getter from the setter (e.g., React-like patterns, dependency injection, or complex/ambiguous setting logic). 

**Where does `asTuple` shine?**
- **Semantics and Intent**: Sometimes `setLoading(true)` conveys much more meaning than `isLoading.value = true`. Using an explicit setter can help make the code more readable when the "action" of changing the state is significant.
- **Complexity and Encapsulation**: If setting requires validation, data sanitization, or triggering side effects, encapsulating that logic in a `setXxx` is preferable to mutating `.value` directly in the component.
- **Dependency Injection**: Ideal for passing only the setter to child components ("Dumb Components") that don't need to know the current state, only trigger the change.

```javascript
const [getCounter, setCounter] = counter.asTuple;

// ✅ RECOMMENDED: Use for semantics in complex flows
const [, setApiResponse] = apiResponse.asTuple;

btnFetch[$].on("click", async () => {
    setApiResponse("Loading from server..."); // Clear intent
    const data = await fetch(...);
    setApiResponse(await data.json());
});
```

### 4. Derived Computed Signals with Explicit Dependencies (`createComputedSignal`)
**CRITICAL DIFFERENCE FROM OTHER FRAMEWORKS:** Unlike React, SolidJS, or TC39 proposals, FrankJStein's computed signals DO NOT use implicit magical watchers. You MUST pass the dependencies explicitly as arguments before the callback. 

This design choice maximizes performance and provides perfect TypeScript autocomplete.

```javascript
import { createSignal, createComputedSignal } from "frankjstein";

const sig1 = createSignal(10);
const sig2 = createSignal(20);
const sig3 = createSignal(30);

// You can pass as many signals as you want. The callback is always the last argument.
const total = createComputedSignal(sig1, sig2, sig3, (v1, v2, v3) => {
    return v1 + v2 + v3;
});
```

### 5. Reactive Objects (`createKageBunshinObject`)
Recommended for large objects where creating individual signals for every property would be tedious or memory-intensive.

### The Reactive Node Pattern ($) for Objects

When using `createKageBunshinObject`, properties are accessed in two ways:
1.  **`clon.power`**: Primitive value (Static Snapshot).
2.  **`clon.$power`**: The **Signal** linked to that property. Use this in `TuJsHtml`.

> [!IMPORTANT]
> **Critical Difference**: 
> - Standalone Signals (`createSignal`): Pass the instance **directly** to the template: `` tags.p`${mySignal}` ``.
> - Bunshin Object Properties: You **MUST** use the `$` prefix: `` tags.p`${clon.$power}` ``.

```javascript
import { createKageBunshinObject, createSignal } from "frankjstein";

const count = createSignal(0);
const user = createKageBunshinObject({ name: "Naruto" });

// ❌ WRONG: Non-reactive. UI will NOT update when power changes.
tags.p`Level: ${clon.power}`; 

// ✅ CORRECT
tags.div((ctx) => {
    ctx.p`Counter: ${count}`;        // Standalone Signal
    ctx.p`User: ${user.$name}`;      // Bunshin Object Property
});

// ✅ MANDATORY: Mutate the CLONE, not the original object
// This triggers the signals and syncs the root 'naruto' object.
clon.power = 9000; 
```
### 6. AI Hallucination Warning 🚨
Do NOT assume the existence of standard signal APIs like `effect()`, `watch()`, or implicit tracking inside computed callbacks. Kagebunshin (the signal engine) intentionally omits them to preserve `O(1)` performance and memory safety (clones returning to the root). Stick strictly to the signatures provided in `frankjstein.d.ts`.

### 7. Reactivity Traps 🚨

#### Trap 1: Reference Identity in Arrays and Objects

KageBunshin compares signal values by **identity** (`===`). If you set a signal with the **same object or array reference**, it detects no change and does NOT trigger an update — even if the internal contents changed.

```javascript
// ❌ TRAP: service.getAll() returns 'this.items' — same reference
const data = await service.getAll();
setItems(data);   // signal sees: data === data → SKIPS update, DOM stays stale

// ✅ FIX: Force a new reference
setItems([...data]);       // spread array
setItems({ ...data });     // spread object

// ✅ OPTIMAL FIX for large datasets: version signal pattern
// The service exposes a versionSignal it increments on every mutation:
//   this.versionSignal.value++;
// The $block observes versionSignal, reads the array directly from the service.
// Avoids the memory cost of spreading thousands of items.
ctx.$block(service.versionSignal, (ctxBlock) => {
    for (const item of service.getAll()) {
        ctxBlock.li(item.name);
    }
});
```

> [!NOTE]
> For patterns involving `@classToggle`, `@addClass`, `@attrs`, `@bind:*`, and other `@` directives — those belong to **TuJsHtml**. See the `frankjstein-tujshtml` skill, section on Configuration Directives.
