---
name: frankjstein-kagebunshin
description: >
  Handling granular reactivity and Signals (KageBunshin) in FrankJStein.
  Trigger: State management, Signals, reactivity, createSignal, createComputedSignal.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.4"
---

# 🌀 KageBunshin Whitelist (REACTIVITY ABSTRACTIONS)

Reactivity in FrankJStein is **Explicit, Granular, and Predictable**. It follows the Principle of Least Magic.

## 1. The Two Pillars of Data Flow

### I. State-to-UI (Signals)
Use Signals to push updates to the DOM.
- **Standalone**: `const s = createSignal(0);` -> Pass `s` directly as a child to TuJsHtml.
- **Object Property**: `const o = createKageBunshinObject({x:0});` -> Pass `o.$x` directly as a child to TuJsHtml.

### II. UI-to-State (Bindings)
Use Directives to pull updates from the DOM.
- **Two-Way**: `input({ "@bind:value": signal })`.

---

## 2. Derived State (The Explicit Way)
There is ONLY ONE way to create computed state: `createComputedSignal`.

```javascript
// ✅ CORRECT: Dependencies are ALWAYS explicit
const total = createComputedSignal(sig1, sig2, (v1, v2) => v1 + v2);
```

### 🛑 The Computed DOM Signal Trap (CRITICAL)
Signals in FrankJStein are designed for **primitive values only**. Never use `createComputedSignal` to return a DOM node. The framework will treat the DOM node as a primitive and render `[object HTMLElement]`.

```javascript
// ❌ FATAL ERROR: Renders "[object HTMLDivElement]" text.
const loaderSignal = createComputedSignal(isProcessing, p => p ? div() : '');
div(loaderSignal);

// ✅ CORRECT: Use ctx.$block for reactive conditional DOM rendering.
div(ctx => {
    ctx.$block(isProcessing, (ctxBlock) => {
        if (isProcessing.value) ctxBlock.div("Loading...");
    });
});
```

---

## 🛑 HALLUCINATION ALERTS (DO NOT USE)
- **NO Implicit Tracking**: There is no magic detection of used signals inside a callback.
- **NO `effect()` or `watch()`**: Use `.subscribe()` for side effects, but ONLY if they are non-DOM related.
- **NO Direct `.value` in Templates**: Using `.value` inside string literals evaluates it statically. Always pass the Signal object directly.

```javascript
// ❌ WRONG (Static)
tags.p`Count: ${sig.value}`;

// ✅ CORRECT (Reactive)
tags.p(sig);
// or
tags.p`Count: ${sig}`;
```

---

## Critical Patterns for KageBunshin (Signals)

Reactivity in FrankJStein is **hyper-granular**. Mutating a signal NEVER re-renders the entire component; it only repaints the specific text node or attribute tied to the signal in the DOM.

### 3. The Two-Way Binding Paradox (MANDATORY)
FrankJStein is **explicit**. Do NOT assume that because a property is reactive (Signal), it will automatically update when the user interacts with the DOM (like in Vue or Angular).

- **Signals handle State-to-UI flow** (Output).
- **Directives handle UI-to-State flow** (Input/Binding).

If you want a Signal to stay in sync with an input, you MUST use the `@bind:value` directive from `TuJsHtml`. Simply assigning a Signal to `input({ value: signal })` only creates a one-way output.

```javascript
// ❌ WRONG: Static/One-way suposition from other frameworks
input({ value: mySignal });

// ✅ CORRECT: Explicit binding
input({ "@bind:value": mySignal });
```

### 4. Creation and Basic Reading

```javascript
import { createSignal } from "frankjstein";

const counter = createSignal(0);
console.log(counter.value); // Reads the static value
```

### 5. Direct Mutation (PREFERRED)
Assignment triggers the DOM update magically in the next tick. For simple logic (counters, toggles), this is the cleanest and most recommended way.
```javascript
counter.value++;
counter.value = 10;
```

### 6. Destructuring into Tuples (asTuple)
Used when you need to separate the getter from the setter (e.g., React-like patterns, dependency injection, or complex/ambiguous setting logic). 

**Where does `asTuple` shine?**
- **Semantics and Intent**: Sometimes `setLoading(true)` conveys much more meaning than mutating `.value`.
- **Complexity and Encapsulation**: If setting requires validation or side effects, encapsulating that logic in a setter is preferable.
- **Dependency Injection**: Ideal for passing only the setter to child components ("Dumb Components") that don't need to know the current state.

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

### 7. Reactive Objects (`createKageBunshinObject`)
Recommended for large objects where creating individual signals for every property would be tedious or memory-intensive.

#### The Reactive Node Pattern ($) for Objects
When using `createKageBunshinObject`, properties are accessed in two ways:
1.  **`clon.power`**: Primitive value (Static Snapshot).
2.  **`clon.$power`**: **Subscribable (Reactive Node)**. Use this in `TuJsHtml`.

> [!IMPORTANT]
> **Critical Difference**: 
> - Standalone Signals: Pass the instance **directly** to the template (has `.value`).
> - Bunshin Object Properties (`$`): You **MUST** use the `$` prefix. They are **Subscribables**, NOT Signals.
> - **NO `.value`**: Reactive nodes (`$`) do NOT have a `.value` property. They are optimized for UI injection only.

```javascript
import { createKageBunshinObject, createSignal } from "frankjstein";

const count = createSignal(0);
const user = createKageBunshinObject({ name: "Naruto" });

// ❌ WRONG: Non-reactive. UI will NOT update when power changes.
tags.p`Level: ${clon.power}`; 

// ✅ CORRECT
tags.div((ctx) => {
    ctx.p(count);                // Standalone Signal
    ctx.p`User: ${user.$name}`;  // Bunshin Object Property
});

// ✅ REACTIVITY TRIGGER: Direct mutation on the CLONE is the trigger.
// By assigning a value, the Proxy detects the change and fires all linked '$' nodes.
clon.power = 9000; // ⚡ Triggers UI update in ctx.p(user.$power)

// ❌ NEVER mutate the original object directly, as the engine will not detect it.
// naruto.power = 9000; // 🔇 Silent, non-reactive.
```

### 8. Reactivity Traps 🚨
Here are common pitfalls when working with KageBunshin.

#### Trap 1: Reference Identity in Arrays and Objects
KageBunshin compares signal values by **identity** (`===`). If you set a signal with the **same object or array reference**, it detects no change and does NOT trigger an update.

```javascript
// ❌ TRAP: service.getAll() returns 'this.items' — same reference
const data = await service.getAll();
setItems(data);   // signal sees: data === data → SKIPS update

// ✅ FIX: Force a new reference
setItems([...data]);       // spread array
setItems({ ...data });     // spread object
```

#### Trap 2: Proxy Identity and instanceof
Most KageBunshin tools (`createKageBunshinObject`) return a **Proxy**.
- **The Problem**: Proxies do NOT pass `instanceof` checks against their target class.
- **The Fix**: Use duck-typing, brand properties, or `obj.constructor === TargetClass`.

```javascript
const userProxy = createKageBunshinObject(new User());

// ❌ FAILS: Returns false
console.log(userProxy instanceof User); 

// ✅ WORKS: Reliable check
console.log(userProxy.constructor === User);
```

### 9. Optimal Fix for Large Datasets: Version Signal Pattern
The service exposes a `versionSignal` it increments on every mutation. The reactive block observes `versionSignal` and reads the array directly from the service.

```javascript
ctx.$block(service.versionSignal, (ctxBlock) => {
    for (const item of service.getAll()) {
        ctxBlock.li(item.name);
    }
});
```
