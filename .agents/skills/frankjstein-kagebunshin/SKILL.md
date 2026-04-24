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

### 2. Direct Mutation
Assignment triggers the DOM update magically in the next tick.
```javascript
counter.value++;
counter.value = 10;
```

### 3. Destructuring into Tuples (`asTuple`)
Sometimes (especially inside functions interacting with APIs or if coming from the React ecosystem), it is cleaner to extract an immutable `getter` and `setter`. Use the native `.asTuple` property from the Signal.
```javascript
const [getCounter, setCounter] = counter.asTuple;
setCounter(getCounter() + 1);

// If you only need the setter to clean up code:
const [, setApiResponse] = apiResponse.asTuple;

btnFetch[$].on("click", async () => {
    setApiResponse("Loading from server...");
    // ...
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

### 5. AI Hallucination Warning 🚨
Do NOT assume the existence of standard signal APIs like `effect()`, `watch()`, or implicit tracking inside computed callbacks. Kagebunshin (the signal engine) intentionally omits them to preserve `O(1)` performance and memory safety (clones returning to the root). Stick strictly to the signatures provided in `frankjstein.d.ts`.
