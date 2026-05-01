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
h1`Counter`;
p`Welcome, ${nameSignal}!`;

// ✅ EXCEPTION: If the content is ONLY a Signal, use function call (shorter)
div(count); 

// ⚠️ SIGNAL USAGE: Standalone Signals are passed directly. 
// KageBunshinObject properties MUST use the '$' prefix.
p`Counter: ${count}`;        // Standalone Signal
p`User: ${user.$name}`;      // Bunshin Object Property
```

### 2. Configuration Parameters and Mounting

Configuration options (HTML attributes, static styles, directives) MUST **always be the first argument**.

```javascript
// ✅ CORRECT
div({ className: "container", "@on": { click: () => ... } }, () => { ... });

// ❌ INCORRECT: The config MUST NOT go at the end
p("text", { className: "error" });
```

#### Mounting Rules (new TuJsHtml)
The constructor `new TuJsHtml(callback, parent?)` executes the callback and **returns** the resulting node (DocumentFragment or HTMLElement). If `parent` is provided, it appends automatically.

```javascript
class MyWidget extends HTMLElement {
    connectedCallback() {
        // Manual append (constructor returns the node)
        this.append(new TuJsHtml(tags => tags.p`Hello`));
    }
}
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

### 6. Native Property Reactivity (`innerHTML`, `textContent`, etc.)

You do NOT need special `@` directives for standard DOM properties. Thanks to the framework's strict typing (`ConfigureAttributes` and `CatchExcessProps`), **any writable native property accepts a `Signal` directly**.

When you pass a Signal to a native property (like `textContent`, `innerHTML`, `id`, `disabled`), Kagebunshin automatically binds it to the DOM node.

> [!NOTE]
> The linter's `SpecialExclusionsProps` actively blocks read-only, complex, or internal DOM properties (like `childNodes` or `outerHTML`). But standard writable properties are natively reactive!

```javascript
const userHtml = createSignal("<b>Loading...</b>");
const isDisabled = createSignal(true);

// ✅ CORRECT: Just pass the Signal directly to the native property! No @ needed.
button({ 
  innerHTML: userHtml, 
  disabled: isDisabled,
  className: "btn"
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

// ❌ HARD RULE: NEVER wrap component calls in JS Template Literals (${}) when nesting.
// This converts the DOM Node into the string "[object HTMLElement]".
div({ className: "parent" }, `${span("error")}`); // ❌ FATAL ERROR
div({ className: "parent" }, span("correct"));   // ✅ CORRECT: Direct nesting
div({ className: "parent" }, tags.span`correct`); // ✅ CORRECT: Tagged template nesting
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

### 11. Configuration Directives (`@`) — Complete Reference

All configuration keys starting with `@` are **special TuJsHtml directives**. They appear in the first argument (config object) of any tag. They are defined in `DirectiveAttributes<TElement>` in `frankjstein.d.ts`.

Most directives accept `SignalOr<T>` — meaning the value can be **either static or a Signal**. When a Signal is passed, the directive becomes reactive and updates automatically. When a static value is passed, it is evaluated once at render time.

```typescript
// From the d.ts — SignalOr<T> definition:
type SignalOr<T> = T | TuSignal<T> | Subscribable<T>;
// → pass T directly (static) OR pass a Signal<T> (reactive)
```

#### Directive Reference Table

| Directive | Type | Description |
|-----------|------|-------------|
| `@classToggle` | `{ [className]: SignalOr<boolean> }` | Toggle one or more CSS classes. Each key is a class name; the value is a static boolean or a Signal. |
| `@addClass` | `SignalOr<string>` | Appends one or more class names to the element. Combines with existing classes. |
| `@attrs` | `GetRawAttributesMap<TElement>` | Set raw HTML/SVG/MathML attributes (type-safe per element). Also accepts `data-*` and `aria-*`. |
| `@on` | `EventListenerMap<TElement>` | Attach persistent event listeners. |
| `@one` / `@once` | `EventListenerMap<TElement>` | Attach one-time event listeners (fire once, then remove). |
| `@bind:value` | `SignalOr<string \| number \| string[]>` | Two-way binding for input value. |
| `@bind:checked` | `SignalOr<boolean>` | Two-way binding for checkbox/radio checked state. |
| `@bind:form` | `SignalOr<FormStateObject>` | Captures form submit data into a Signal. Prevents default submission. |


#### `@classToggle` — Static vs Reactive

`@classToggle` is the most commonly misused directive. It is intentionally flexible:

```javascript
// ✅ STATIC: Condition set once at render — never changes
div({ "@classToggle": { "is-admin": user.isAdmin } });    // boolean from data

// ✅ REACTIVE: Signal — class toggles automatically on every change
div({ "@classToggle": { "active": isActiveSignal } });

// ✅ MULTIPLE CLASSES — mix static and reactive freely
div({
    "@classToggle": {
        "card":        true,               // always applied (static)
        "card--error": hasErrorSignal,     // reactive Signal
        "card--large": config.largeMode,   // static config boolean
    }
});

// ⚠️ TRAP: !signal evaluates the signal object itself (truthy) → always false
div({ "@classToggle": { "hidden": !isLoadingSignal } });   // ❌ static false

// ✅ CORRECT: Use createComputedSignal for reactive negation
div({ "@classToggle": { "hidden": createComputedSignal(isLoadingSignal, v => !v) } });
```

#### `@attrs` — Raw Attribute Access

Use `@attrs` when the standard config object doesn't expose the attribute you need (SVG, MathML, ARIA attributes, or very specific HTML attributes). Every value in `@attrs` also accepts `SignalOr<T>`.

```javascript
// SVG attributes not exposed at top level
svg.circle({ "@attrs": { cx: 50, cy: 50, r: radiusSignal } });

// ARIA attributes
div({ "@attrs": { "aria-label": labelSignal, "aria-expanded": isOpenSignal } });

// data-* also works at top level (no @attrs needed)
div({ "data-user-id": userId, "data-role": "admin" });
```

#### `@bind:*` — Two-Way Reactive Binding

```javascript
const query = createSignal("");

// @bind:value keeps the signal in sync with the input automatically
input({ "@bind:value": query, type: "search" });

// @bind:checked for checkboxes
const agreed = createSignal(false);
input({ "@bind:checked": agreed, type: "checkbox" });

// @bind:form — captures all form fields on submit
const formData = createSignal({});
form({
    "@bind:form": formData,
    "@on": { submit: () => console.log(formData.value) }
});
```

### 12. N-Arguments in the Tags Proxy (Inline vs Callback Children)

The `tags` Proxy accepts **N children arguments** directly. You are NOT forced to use a single callback for children — you can pass nodes inline, mix them, or use callbacks only when you need access to the parent DOM element.

```javascript
// ✅ EQUIVALENT: Both produce the same DOM structure
tags.p(tags.b("algo"), tags.i("otro"));

tags.p(
    (childs) => childs.b("algo"),
    (childs) => childs.i("otro")
);

// ✅ MIXED: Inline node + callback (both valid children)
tags.p(
    tags.span("label"),
    (childs) => childs.strong("value")
);
```

**When to use a callback vs inline:**

| Approach | When to Use |
|----------|-------------|
| `tags.p(child1, child2)` | Static children, no parent DOM reference needed. Clean and flat. |
| `tags.p((ctx, parentEl) => { ... })` | When you need `parentEl` (the DOM element itself), e.g., to call `.classList`, `.focus()`, or add native listeners. |
| `tags.p(function(ctx, parentEl) { ... })` | Same as above, AND the children contain async operations (`setTimeout`, `fetch`) — the `function` keyword creates an isolated context pointer. |

> [!IMPORTANT]
> **The nested callback `(ctx, parentEl)` gives you access to the parent DOM element as the second parameter.** This is the idiomatic way to attach native DOM APIs without polluting the declarative builder pattern.

```javascript
// ✅ ACCESSING THE PARENT ELEMENT
tags.div({ className: "input-wrapper" }, (ctx, wrapperEl) => {
    const input = ctx.input({ type: "text" });
    // Access to the actual HTMLDivElement
    wrapperEl.classList.add("initialized");
    input.focus();
});
```

### 12. Context API — Special Methods and What Does NOT Exist

The `ctx` (context/tags) object is a Proxy over the DOM builder. It supports any valid HTML tag plus these **special extension methods**:

| Method | Description |
|--------|-------------|
| `ctx.$block(signal, fn)` | Reactive block. Destroys and recreates its DOM subtree whenever `signal` changes. |
| `ctx.$f(asyncFn, fallbackFn?)` | Async Suspense. Executes `asyncFn` without blocking the DOM hierarchy. Shows `fallbackFn` while waiting. |
| `ctx.$fragment(fn)` | Isolated fragment. Groups nodes without a wrapper element. |
| `ctx.$insert(node)` | Inserts an **already-created external** DOM node (Text, Fragment, HTMLElement). |

> [!CAUTION]
> **These methods do NOT exist on the context. Do NOT invent them.**
>
> ```javascript
> ctx.forEach(...)   // ❌ Does NOT exist
> ctx.map(...)       // ❌ Does NOT exist
> ctx.each(...)      // ❌ Does NOT exist
> ctx.repeat(...)    // ❌ Does NOT exist
> ctx.if(...)        // ❌ Does NOT exist
> ```
>
> FrankJStein intentionally does NOT replace native JavaScript. Use `for...of`, `Array.prototype.forEach`, etc., **inside** a `$block` callback where you have the reactive context already resolved.

```javascript
// ✅ CORRECT: Native iteration inside $block
ctx.$block(listSignal, (ctxBlock) => {
    for (const item of listSignal.value) {
        ctxBlock.li(item.name);
    }
});

// ✅ ALSO CORRECT: Native forEach inside $block
ctx.$block(listSignal, (ctxBlock) => {
    listSignal.value.forEach(item => ctxBlock.li(item.name));
});
```

### 13. `$insert` — When to Use and When NOT To

`$insert` is for injecting **externally-created or externally-owned** DOM nodes into the current tree.

```javascript
// ✅ VALID: External DOM node not created by this context
const legacy = document.getElementById("legacy-widget");
ctx.$insert(legacy);

// ✅ VALID: Raw Text node
ctx.$insert(new Text("dynamic text"));

// ✅ VALID: A DocumentFragment from another source
ctx.$insert(templateEl.content.cloneNode(true));
```

> [!WARNING]
> **Do NOT use `$insert` for components you are already building in the same flow.**
> When you pass `ctx` (or any tags proxy) as `tags` to a component function, that component renders **directly into `ctx`**. Wrapping it in `$insert` is redundant and misleading.

```javascript
// ❌ UNNECESSARY: MyComponent already builds inside ctx
ctx.$insert(MyComponent(ctx));

// ✅ CORRECT: Call directly — it builds in-place
MyComponent(ctx);
```

### 14. Deep Async Nesting — `$f` inside `$block` (and vice versa)

When combining async blocks, **always use the innermost context to build DOM**. Each `$block`, `$f`, or `$fragment` creates its own context pointer. Crossing to an outer context inside an async block will silently inject nodes into the wrong DOM parent.

```javascript
// ❌ WRONG: Using outer ctx inside $block's $f
ctx.$block(versionSignal, (ctxBlock) => {
    ctx.$f(async (ctxF) => {     // ❌ ctx is outer — DOM goes to the wrong place
        ctxF.p("data loaded");
    });
});

// ✅ CORRECT: Each level uses ITS OWN context
ctx.$block(versionSignal, (ctxBlock) => {
    ctxBlock.$f(async (ctxF) => {   // ✅ $f lives inside ctxBlock
        ctxF.p("data loaded");
    });
});

// ✅ CORRECT: $block inside $f (opposite nesting)
ctx.$f(async (ctxAsync) => {
    const data = await fetchSomething();
    ctxAsync.$block(filterSignal, (ctxBlock) => {
        for (const item of data.filter(filterFn)) {
            ctxBlock.li(item.name);
        }
    });
}, function fallback(ctxFallback) {
    ctxFallback.p`Loading...`;
});
```

> **Mnemonic rule**: *"The context closest to your hand is the one you must use."*
> If you destructured `{ h2, $f }` from the outer `tags`, and you're now inside a `section()` callback, using that destructured `h2` still works **synchronously** because all of them share the same pointer at that moment. But the moment you enter an async boundary (`$f`, `setTimeout`, `fetch`), the shared pointer has moved on — you MUST use the callback's own context.
