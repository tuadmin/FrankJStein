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

### 1. Tagged Template Literals (HIGHLY PREFERRED)
Use Tagged Template Literals for all text content, whether it contains signals or not. This reduces visual noise, avoids "callback hell" feeling, and prepares the code for future nesting (e.g., adding `strong` or `i` inside).

```javascript
// ✅ BEST PRACTICE: Use Tagged Templates for text or interpolation
h1`Contador`;
p`Usa los botones para incrementar o decrementar el valor.`;
p`Welcome, ${nameSignal}!`;

// ✅ EXCEPTION: If the content is ONLY a Signal, use function call (shorter)
div(count); // Better than tags.div`${count}`

// ⚠️ Valid but NOT recommended for simple text
p("Hello world"); 
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

### 8. Avoid Crossing Contexts in Blocks/Fragments
When using `$f`, `$fragment`, or `$block`, the callback receives a new context parameter (`ctx`). **You MUST use the tags from this internal `ctx` to render elements inside the block.** Using the outer `tags` inside an async block will corrupt the DOM hierarchy because the engine will try to inject the nodes into the wrong parent.

```javascript
const { div, $f } = tags;

// ❌ WRONG: Crossing contexts (using outer 'div' inside $f)
$f(async (ctx) => {
    div("ERROR: This injects in the wrong place");
});

// ✅ CORRECT: Use the internal context
$f(async (ctx) => {
    ctx.div("CORRECT: Safe injection");
});
```
*Note: Direct mutation of previously created node references (e.g., `_refDiv.style.color = "red"`) is perfectly valid; what is forbidden is invoking outer builder functions.*

### 9. BEWARE: String Interpolation vs Tagged Templates
This is a critical source of bugs. When injecting a **Signal** (or any reactive object) into a text node, you MUST use the framework's **Tagged Template** syntax.

If you use standard function invocation `()` with JS template literals `${}`, JavaScript evaluates the string *before* passing it to the framework, resolving the primitive value statically and breaking granular reactivity. Furthermore, if you interpolate a DOM Node, it will be cast to `"[object HTMLElement]"`.

```javascript
// ❌ CRITICAL BUG 1: Static string evaluation. Reactivity is dead.
tags.p(`Clicks: ${count}`);

// ❌ CRITICAL BUG 2: Node stringification. Renders "Clicks: [object HTMLElement]"
tags.p(`Clicks: ${tags.i(count)}`);

// ✅ CORRECT: Tagged Template syntax. The framework intercepts the Signal/Node.
tags.p`Clicks: ${count}`;
tags.p`Clicks: ${tags.i(count)}`;
```

**EXCEPTION FOR PERFORMANCE (`$block`):**
If you are inside a reactive `$block`, the entire block is destroyed and recreated on every mutation. In this specific scenario, using Tagged Templates for *primitive values* creates an unnecessary double-subscription. Therefore, **inside `$block` ONLY**, standard string interpolation is preferred for primitive Signals.

```javascript
$block(count, (ctx) => {
    // ⚡ OPTIMIZED: The block handles reactivity. The string literal is fast and static.
    ctx.p(`Clicks: ${count}`);
    
    // ❌ WRONG: Still do not stringify DOM Nodes! Use Tagged Templates for nodes.
    // ctx.p(`Clicks: ${ctx.i(count)}`); // Bad
});
```

### 10. Descheduled CSS Selectors (Local Components)
The `tags` Proxy allows destructuring keys that are valid CSS selectors. This creates a "base element" that can be reused as a local component.

**WHEN TO USE:**
- **Semantic Highlighting**: To highlight important structural elements (e.g., `Card`, `Header`, `MainLayout`).
- **Repetitive Patterns**: When a tag with specific classes/attributes is used multiple times, especially inside loops or maps, to avoid verbosity and improve maintainability.
- **Base Style Abstraction**: To define a design system "token" (e.g., `BaseButton`, `InputError`).

To extend or modify these base elements, use the initial configuration object or the `@addClass` directive.

```javascript
// ✅ POWERFUL PATTERN: Base Tag Abstraction
const { 
    "main.card": Card, 
    "div.actions": Actions,
    "button.btn.btn-primary": BaseButton 
} = tags;

Card(() => {
    BaseButton({ 
        id: "btn-inc", 
        "@addClass": "increment" // Appends a specific class to the base ones
    }, "Increment");
    
    BaseButton({ 
        "@addClass": "decrement" 
    }, "Decrement");
});
```
This pattern minimizes code duplication and improves semantic readability without the overhead of full component classes.
