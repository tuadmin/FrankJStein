---
name: frankjstein-tujshtml
description: >
  UI building patterns with TuJsHtml in FrankJStein.
  Trigger: DOM construction, UI manipulation, events, or when using TuJsHtml.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.4"
---

# 📜 Whitelist of Abstractions (THE SOVEREIGN WAY)

In FrankJStein, complexity is handled through rigid, high-performance patterns. There are ONLY three valid ways to construct a tag. Any other syntax (especially hybrids) is a hallucination.

## 0. The `tags` Proxy Convention and JSDoc
The variables `tags` and `ctx` are just **naming conventions** for the TuJsHtml Proxy Context passed to your components or callbacks. 
**DO NOT try to import them from the framework:**
```javascript
// ❌ FATAL ERROR: 'tags' is not exported by frankjstein!
import { tags } from "frankjstein";
```
To enable autocomplete and prevent hallucinations, ALWAYS use JSDoc to type the `tags` parameter in your components:
```javascript
/**
 * @param {import("frankjstein").TuJsHtml.Types.Tags} tags
 */
export function MyComponent(tags) {
    const { div, h1, p } = tags; // Destructure the tags proxy here
    return div(
        h1("Title"),
        p("Content")
    );
}
```

### 0.1 The `TuJsHtml_NativeTags` Interface and the `.d.ts` Source of Truth
The `tags` proxy is strictly typed under the hood using the `TuJsHtml_NativeTags` interface. HTML tags are mapped to specific function types depending on their behavior (e.g., `SpecificTagFunction`, `MetadataTagFunction`, `InputTagFunction`), guaranteeing exact DOM typings:
```typescript
// Examples from the .d.ts file:
div: SpecificTagFunction<HTMLDivElement>;
script: MetadataTagFunction<HTMLScriptElement>;
input: InputTagFunction<HTMLInputElement>;
```
This behaves like a mathematical domain. The Linter knows exactly which attributes belong to which tag (e.g., `href` is valid on `a`, but not on `div`), enforcing a 1:1 mapping with the native DOM.

> [!TIP]
> **🔍 WHEN IN DOUBT:** If you are unsure about what attributes or parameters a tag accepts, **DO NOT HALLUCINATE**. 
> Find the `frankjstein.d.ts` file in your workspace (it might be in `dist/`, `node_modules/frankjstein/`, or downloaded locally). Inspect it (e.g., search for ` script:` or ` input:`) to see its exact JSDoc and TypeScript interface. If you cannot find the `.d.ts` file in the project, **ASK THE USER** to provide it or clarify the interface before proceeding.

## 1. The Trinity of Tag Invocation

### I. Pure Function Call (N-Arguments) — THE GOLD STANDARD
Used for 99% of UI building. It is type-safe, allows **infinite nesting**, and prevents string-parsing bugs. You can mix plain strings, nodes, and callbacks in a single call.
```javascript
// ✅ CORRECT: Deep N-Arguments composition
div({ className: "card" }, 
    h1`Hello World`,
    p(ctx2 => {
        ctx2.span("Nested inside a callback ");
        ctx2.strong(ctx3 => ctx3`and even deeper!`);
    }),
    p("Back to inline siblings")
);
```

### II. Pure Tagged Template
Used **ONLY** for pure text nodes with simple signal interpolation. NEVER use with configuration objects.
```javascript
// ✅ CORRECT: Pure text interpolation
h1`Title: ${titleSignal}`;
```

### III. CSS Selector Abstraction
Used for design system tokens and reusable atoms.
```javascript
// ✅ CORRECT
const { "button.btn.btn-primary": PrimaryButton } = tags;
PrimaryButton({ "@on": { click: save } }, "Save Chang
## 2. Reactivity Whitelist (Signals in DOM)

There are ONLY two ways to bind reactivity to the UI:

### I. Standalone Signal
For primitive signals created via `createSignal(T)`.
```javascript
const count = createSignal(0);
// ✅ Correct: Pass the signal object itself as a child
p(count);
```
```javascript
// ✅ Correct: Or via pure Tagged Template
p`Clicks: ${count}`;
```

### II. Bunshin Property ($)
For reactive objects created via `createKageBunshinObject(T)`.
```javascript
const user = createKageBunshinObject({ name: "Naruto" });
// ✅ Correct: Use the $ prefix to pass the Signal
p(user.$name);
```

---

## 3. Structural Refactoring Evaluation (The Nesting Limit)

As a Senior Architect, you must evaluate when a template is becoming "Spaghetti Code". While `TuJsHtml` supports infinite nesting, you should follow these triggers to propose or perform a refactoring:

### 3.1 The "4-Level Rule"
If your nesting exceeds **4 levels of indentation** inside a single callback, STOP and evaluate:
- **Repetitive Logic?** -> Extract to a separate sub-component function (e.g., `renderItem(tags, data)`).
- **Static vs Dynamic?** -> Use the **Destructured Selectors** pattern for local tags to keep the main flow readable.

### 3.2 Single Source of Truth (SSOT)
If you detect that the same structural fragment (like a Menu Link or a Card Header) is used in two different places (e.g., Mobile vs Desktop), you **MUST** extract it into a dedicated function.

```javascript
// ✅ CORRECT: Extracting shared logic (e.g., Header links)
/**
 * @param {import('frankjstein').TuJsHtml.Types.Callback<HTMLAnchorElement>} aTag
 */ 
function menuLinks(aTag) {
    aTag({ href: "#home" }, "Home");
    aTag({ href: "#services" }, "Services");
}
/**
 * @param {import('frankjstein').TuJsHtml.Types.Tags} tags
 */ 
export function Header(tags) {
    return tags.header(ctx => {
        // Desktop
        ctx.nav(({ a }) => menuLinks(a));
        // Mobile
        ctx.div({ className: "mobile-menu" }, ({ a }) => menuLinks(a));
    });
}
```

### 3.3 Destructured Selectors (Local Components)
For large sections (like Success Cases) that are not reused elsewhere, use destructuring to define "local tags" with their Tailwind classes. This keeps the loop body clean.

```javascript
// ✅ CORRECT: Cleaning loops with local tag destructuring
_.div({ className: "grid" }, ({ "article[class=card-style]": articleCard, h3, p }) => {
    for (const item of data) {
        articleCard(
            h3(item.title),
            p(item.desc)
        );
    }
});
```

---

## 4. 🛑 THE BLACKLIST (FATAL ERRORS)

### 4.1 The Tag Invocation Trap (Hybrid Nesting)
Never use a configuration object and a Tagged Template simultaneously.
```javascript
// ❌ FATAL ERROR: Throws TypeError because div returns an Element, not a function.
div({ className: "error" })`This is wrong`;
```

### 4.2 The Computed DOM Signal Trap
Signals in FrankJStein are designed for **primitive values only**. Never use `createComputedSignal` to return a DOM node.
```javascript
// ❌ FATAL ERROR: Renders "[object HTMLDivElement]" text.
const loaderSignal = createComputedSignal(isProcessing, p => p ? div() : '');
div(loaderSignal);
```

### 4.3 BEWARE: String Interpolation vs Tagged Templates
When injecting a **Signal** or a **DOM Node** into a text node, you MUST use the framework's **Tagged Template** syntax or N-Arguments. Avoid standard JS template literals (backticks without tag).

```javascript
// ❌ CRITICAL BUG: Static string evaluation.
tags.p(`Clicks: ${count}`);

// ✅ CORRECT: Tagged Template syntax.
tags.p`Clicks: ${count}`;
```

### 4.4 The Tagged Template Nesting Trap (DX Pollution)
NEVER nest complex tags or callbacks inside a Tagged Template literal.

```javascript
// ❌ CRITICAL DX ERROR: Technically works, but it's a mess.
tags.div`
    ${tags.h1("Title")}
    ${tags.p(ctx => ctx.span("This is hard to read"))}
`;
```

---
x to pass the Signal
p(user.$name);
```

---

## 5. Critical Patterns for TuJsHtml

### 5.1 Binding vs Output Reactivity (MANDATORY)
This is the most frequent source of AI errors. You MUST distinguish between **Output-Only Reactivity** and **Two-Way Binding**.

- **Output-Only (Native Property)**: Assigning a Signal to a native property (e.g., `value`, `disabled`, `textContent`, `src`). The DOM listens to the Signal. **NEVER use the '@' prefix for native properties**.
```javascript
// ❌ FATAL ERROR
button({ "@disabled": true });
```
- **Two-Way Binding**: Using `@bind:value` or `@bind:checked`. This creates a bidirectional link.
```javascript
const query = createSignal("initial");
// ✅ CORRECT: Two-way binding. The Signal stays in sync with user input.
input({ "@bind:value": query });
```

### 5.2 The Async Closure Trap & Escape Hatch (CRITICAL)
The context proxy is **highly optimized for synchronous execution**. 
- **Rule**: NEVER use the context object inside a `setTimeout`, `setInterval`, or an `async` block that was not initiated by `$f`.
- **Reason**: The internal builder state might have changed or been cleared by the time the async closure executes.
- **Solution**: Use the **Native Escape Hatch** (2nd parameter) for any async or direct DOM manipulation.

```javascript
tags.div((ctx, el) => {
    // ctx: Use for building children (Synchronous)
    // el: The actual HTMLDivElement (Safe for anything)

    // ✅ SAFE: Using the element directly for async logic
    setTimeout(() => {
        el.style.backgroundColor = "red";
    }, 1000);
});
```

### 6. Configuration Parameters and Mounting

Configuration options (HTML attributes, static styles, directives) MUST **always be the first argument**.

```javascript
// ✅ CORRECT
div({ className: "container", "@on": { click: () => {} } }, () => { });

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

### 7. Builder Callbacks (Functional but NOT recommended)
While it's possible to pass a callback to the builder to mutate the instance on the fly, **it is not the recommended practice** for readability reasons. It is preferred to use the initial configuration object or assign attributes natively.

```javascript
// NOT RECOMMENDED (Even though it works)
button("Exit", (_) => _().style = "margin-left: 10px;");

// PREFERRED (Config object always at the beginning)
button({ style: { marginLeft: "10px" } }, "Exit");
```

### 8. DOM Utility and Events (`ELEMENT_UTIL as $`)
The library exposes a special Symbol to attach utilities. Alias it to `$` in your imports for faster typing. Alternatively, you can use the native `.addEventListener`.

```javascript
import { ELEMENT_UTIL as $ } from "frankjstein";
const btn = button`Add`;

// Using the framework's utility
btn[$].on("click", () => { /* ... */ });

// Conventional native DOM
btn.addEventListener("click", () => { /* ... */ });
```

### 9. Async Suspense (`$f`)
Purely native asynchronous handling without blocking the hierarchy.

```javascript
tags.$f(async ({ h2 }) => {
  const data = await fetchData();
  h2`Loaded: ${data}`;
}, function fallback({ p }) {
  p`Loading...`;
});
```

### 10. Native Property Reactivity (`innerHTML`, `textContent`, etc.)
You do NOT need special `@` directives for standard DOM properties. Thanks to the framework's strict typing, **any writable native property accepts a `Signal` directly**.

```javascript
const userHtml = createSignal("<b>Loading...</b>");
const isDisabled = createSignal(true);

// ✅ CORRECT: Pass the Signal directly to the native property! No @ needed.
button({ 
  innerHTML: userHtml, 
  disabled: isDisabled,
  className: "btn"
});
```

### 11. Context Isolation (Arrow vs Traditional Functions)
`TuJsHtml` uses extreme optimization by sharing a context pointer for arrow functions, making rendering 3x faster. However, this shared pointer is strictly sequential.
- **Arrow Functions:** Use for ALL synchronous DOM building. Extremely fast. **NEVER use async operations inside them**.
- **Traditional Functions:** Forces `TuJsHtml` to create a dedicated, isolated root context for that element. Safe for async operations, but slightly slower.

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

### 12. Avoid Crossing Contexts in Blocks/Fragments
When using async suspense or fragments, the callback receives a new context parameter. **You MUST use the tags from this internal context to render elements inside the block.** Using the outer tags inside an async block will corrupt the DOM hierarchy.

```javascript
const { div, $f } = tags;

// ❌ WRONG: Crossing contexts (using outer 'div' inside async suspense)
$f(async (ctx) => {
    div("ERROR: This injects in the wrong place");
});

// ✅ CORRECT: Use the internal context
$f(async (ctx) => {
    ctx.div("CORRECT: Safe injection");
});
```

### 13. The ".value" Reactivity Trap (CRITICAL)
When using Tagged Templates with Signals, you MUST pass the **Signal object itself**, not its primitive value. Using `.value` inside a template literal resolves the value statically at render time and **KILLS granular reactivity**.

```javascript
const count = createSignal(0);

// ❌ STATIC (Dead): Will show "0" and never update.
tags.p`Count: ${count.value}`; 

// ✅ REACTIVE (Alive): The framework subscribes to the Signal.
tags.p`Count: ${count}`;
```

### 14. Descheduled CSS Selectors (Local Components)
The `tags` Proxy allows destructuring keys that are valid CSS selectors. This creates a "base element" that can be reused as a local component.

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
});
```

### 15. Configuration Directives — Complete Reference
All configuration keys starting with `@` are **special TuJsHtml directives**. Most accept `SignalOr<T>` (static or a Signal).

| Directive | Type | Description |
|-----------|------|-------------|
| `@classToggle` | `{ [className]: SignalOr<boolean> }` | Toggle one or more CSS classes. |
| `@addClass` | `SignalOr<string>` | Appends one or more class names to the element. |
| `@attrs` | `GetRawAttributesMap<TElement>` | Set raw HTML/SVG/MathML attributes. |
| `@on` | `EventListenerMap<TElement>` | Attach persistent event listeners. |
| `@one` / `@once` | `EventListenerMap<TElement>` | Attach one-time event listeners. |
| `@bind:value` | `SignalOr<string \| number \| string[]>` | Two-way binding for input value. |
| `@bind:checked` | `SignalOr<boolean>` | Two-way binding for checkbox/radio checked state. |
| `@bind:form` | `SignalOr<FormStateObject>` | Captures form submit data into a Signal. |

#### `@classToggle` — Static vs Reactive
```javascript
// ✅ STATIC: Condition set once at render
div({ "@classToggle": { "is-admin": user.isAdmin } });

// ✅ REACTIVE: Signal — class toggles automatically on every change
div({ "@classToggle": { "active": isActiveSignal } });

// ✅ CORRECT: Use createComputedSignal for reactive negation
div({ "@classToggle": { "hidden": createComputedSignal(isLoadingSignal, v => !v) } });
```

#### `@attrs` — Raw Attribute Access
Use `@attrs` when the standard config object doesn't expose the attribute you need (SVG, ARIA).
```javascript
// SVG attributes not exposed at top level
svg.circle({ "@attrs": { cx: 50, cy: 50, r: radiusSignal } });

// data-* works at top level directly
div({ "data-user-id": userId, "data-role": "admin" });
```

#### `@bind:*` — Two-Way Reactive Binding
```javascript
const query = createSignal("");

// @bind:value keeps the signal in sync with the input automatically
input({ "@bind:value": query, type: "search" });

// @bind:form — captures all form fields on submit
const formData = createSignal({});
form({
    "@bind:form": formData,
    "@on": { submit: () => console.log(formData.value) }
});
```

### 16. N-Arguments in the Tags Proxy (Inline vs Callback Children)
The `tags` Proxy accepts **N children arguments** directly. You are NOT forced to use a single callback for children.

```javascript
// ✅ MIXED: Inline node + callback (both valid children)
tags.p(
    tags.span("label"),
    (childs) => childs.strong("value")
);
```

| Approach | When to Use |
|----------|-------------|
| `tags.p(child1, child2)` | Static children, no parent DOM reference needed. Clean and flat. |
| `tags.p((ctx, parentEl) => { ... })` | When you need `parentEl` to call `.classList`, `.focus()`, or add listeners. |
| `tags.p(function(ctx, parentEl) { ... })` | When children contain async operations (`setTimeout`, `fetch`). |

### 17. Context API — Special Methods and What Does NOT Exist
The context object supports any valid HTML tag plus these **special extension methods**:

| Method | Description |
|--------|-------------|
| `ctx.$block(signal, fn)` | Reactive block. Destroys and recreates its DOM subtree whenever signal changes. |
| `ctx.$f(asyncFn, fallbackFn?)` | Async Suspense. Executes asyncFn without blocking the DOM hierarchy. |
| `ctx.$fragment(fn)` | Isolated fragment. Groups nodes without a wrapper element. |
| `ctx.$insert(node)` | Inserts an **already-created external** DOM node. |

**CAUTION**: Methods like `forEach`, `map`, `repeat`, or `if` **do NOT exist** on the context. Do not invent them. Use native JavaScript inside a `$block` callback instead.

```javascript
// ✅ CORRECT: Native iteration inside a reactive block
ctx.$block(listSignal, (ctxBlock) => {
    for (const item of listSignal.value) {
        ctxBlock.li(item.name);
    }
});
```

### 18. `$insert` — When to Use and When NOT To
`$insert` is for injecting **externally-created or externally-owned** DOM nodes.
```javascript
// ✅ VALID: External DOM node not created by this context
const legacy = document.getElementById("legacy-widget");
ctx.$insert(legacy);

// ❌ UNNECESSARY: MyComponent already builds inside ctx
ctx.$insert(MyComponent(ctx));

// ✅ CORRECT: Call directly — it builds in-place
MyComponent(ctx);
```

### 19. Deep Async Nesting
When combining async blocks, **always use the innermost context to build DOM**. Each block creates its own context pointer. Crossing to an outer context inside an async block will silently inject nodes into the wrong DOM parent.

```javascript
// ❌ WRONG: Using outer context inside nested async block
ctx.$block(versionSignal, (ctxBlock) => {
    ctx.$f(async (ctxF) => { // ❌ ctx is outer
        ctxF.p`data loaded`;
    });
});

// ✅ CORRECT: Each level uses ITS OWN context
ctx.$block(versionSignal, (ctxBlock) => {
    ctxBlock.$f(async (ctxF) => { // ✅ $f lives inside ctxBlock
        ctxF.p`data loaded`;
    });
});
```
