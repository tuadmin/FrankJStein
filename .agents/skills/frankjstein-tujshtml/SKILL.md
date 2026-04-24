---
name: frankjstein-tujshtml
description: >
  UI building patterns with TuJsHtml in FrankJStein.
  Trigger: DOM construction, UI manipulation, events, or when using TuJsHtml.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Critical Patterns for TuJsHtml

### 1. Template Literals vs Functions

Use pure JavaScript Template Literals to render static strings or inject Signals
idiomatically.

```javascript
// CORRECT (Template Literals for text and signals)
tags.p`Hello world, my name is ${nameSignal}`;

// Valid but less preferred for simple text
tags.p`Hello world`;
```

### 2. Restrictive Configuration Parameters

Configuration options (HTML attributes, static styles, directives) MUST **always
be the first argument**.

```javascript
// CORRECT
div({ class: "container", "data-id": 123 }, () => { ... });

// INCORRECT - The TS Linter will yell at you!
p("text", { style: "color: red" }); // The config MUST NOT go at the end
```

### 3. Builder Callbacks (Functional but NOT recommended)

While it's possible to pass a callback to the builder to mutate the instance on
the fly (`_ => _().style = "..."`), **it is not the recommended practice** for
readability reasons. It is preferred to use the initial configuration object or
assign attributes/events natively.

```javascript
// NOT RECOMMENDED (Even though it works)
button("Exit", (_) => _().style = "margin-left: 10px;");

// PREFERRED (Config object always at the beginning)
button({ style: { marginLeft: "10px" } }, "Exit");

// Or native DOM:
button`Exit`.addEventListener("click", () => {});
```

### 4. DOM Utility and Events (`ELEMENT_UTIL as $`)

The library exposes a special Symbol to attach utilities. Alias it to `$` in
your imports for faster typing. Alternatively, you can use the native
`.addEventListener`.

```javascript
import { ELEMENT_UTIL as $ } from "frankjstein";
const btn = button`Add`;

// Using the framework's utility
btn[$].on("click", () => { ... });

// Conventional native DOM
btn.addEventListener("click", () => { ... });
```

### 5. Async Suspense (`$f`)

Purely native asynchronous handling without blocking the hierarchy.

```javascript
tags.$f(async ({ h2 }) => {
  const data = await fetchData();
  h2`Loaded: ${data}`;
}, function fallback({ p }) {
  p`Loading...`;
});
```

### 6. Avoid @innerHTML (Not Yet Implemented)

If you need to inject pure reactive HTML from a Signal, the framework does not
yet support the `@innerHTML` binding. The idiomatic and high-performance way to
achieve this is by capturing the node reference in the tag's callback and
mutating it manually with a `createComputedSignal`:

```javascript
// CORRECT
div({ className: "log-box" }, (tags, refDiv) => {
  createComputedSignal(logs, (value) => {
    refDiv.innerHTML = value.replace(/\n/g, "<br>");
  });
});
```

### 7. Context Isolation (Arrow vs Traditional Functions)
`TuJsHtml` uses extreme optimization by sharing a context pointer for arrow functions, making rendering 3x faster. However, this shared pointer is strictly sequential.
- **Arrow Functions `(ctx, parent) => {}`:** Use for ALL synchronous DOM building. Extremely fast. **NEVER use async operations (`setTimeout`, `fetch`) inside them**, or the shared pointer will render elements in the wrong DOM parent.
- **Traditional Functions `function(ctx, parent) {}`:** Forces `TuJsHtml` to create a dedicated, isolated root context for that element. Safe for async operations, but slightly slower.

```javascript
// ❌ WRONG: Arrow function + async = elements render in the wrong parent!
tags.div((ctx) => {
    setTimeout(() => ctx.p("I am lost in the DOM"), 10);
});

// ✅ CORRECT: Traditional function locks the context safely.
tags.div(function(ctx) {
    setTimeout(() => ctx.p("I am safely inside the div"), 10);
});
```
*(Note: Always prefer using `$f`, `$fragment`, or `$block` for robust async UI rendering instead of manual timeouts).*
