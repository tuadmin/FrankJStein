---
name: frankjstein-tujshtml
description: >
  Guidelines for using the FrankJStein library for UI rendering in Vanilla JavaScript.
  Trigger: When the user asks to build UI, use TuJsHtml, createSignal, or work with FrankJStein elements.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.1"
---

## When to Use

- When building web applications or components using the `frankjstein` library.
- When creating UI without a transpilator (no JSX, no React, no Vue).
- When handling async UI rendering and suspense natively.
- When working with `TuJsHtml` and `createSignal`.

## Critical Patterns

1. **NO JSX, NO REACT, NO VUE**: This library uses a native JavaScript Builder Pattern. You must construct elements by destructuring the `tags` object provided by `TuJsHtml`.
2. **Native JavaScript Only**: Do not propose Webpack, Vite, Babel, JSX, or any setup steps. It runs directly in the browser.
3. **TuJsHtml Initialization**: UI components or apps are built by passing a builder function to `TuJsHtml`. This returns a native HTML component / DOM Node that can be directly appended without lifecycle mounts.
4. **Template Literals Support**: All tag methods (`tags.h1`) support template literals for cleaner syntax. Instead of `tags.h1("Hello")`, use `tags.h1\`Hello\``. They also support nested signals: `tags.h1\`Count: ${tags.i(signal)}\``.
5. **DOM Utility & Event Listeners**: You can use the standard native DOM API like `element.addEventListener('click', ...)` for any event. Alternatively, you can use the `ELEMENT_UTIL` Symbol exported by the library which adds superpowers. In real projects, alias it as `$`: `import { ELEMENT_UTIL as $ } from "frankjstein"`, then use it like: `element[$].on("click", callback)`.
6. **Async Suspense**: Use `tags.$f(async ({ tags... }) => {...}, function fallback({ tags... }) {...})` to handle asynchronous operations natively without React's `Suspense` or `useEffect`. `$f` is an alias for `$fragment`.
7. **Reactivity**: Use `createSignal(initialValue)` for state. Pass the signal directly to elements. Mutate the state via `signal.value = newValue`. Do NOT use hooks like `useState`.
8. **Special Directives**: You can use special attributes for reactivity and listeners directly in the tag function like `"@classToggle"`, `"@on"`, `"@bind:value"`, `"@bind:form"`.
9. **Async Scope Context Loss**: When using async `$fragment`s, do NOT use tags destructured from the outer scope AFTER an `await`. The framework relies on synchronous sequential appends. After an `await`, the execution context is deferred, and outer tags will append to the root instead of the fragment. ALWAYS destructure UI elements from the internal argument provided directly by the async fragment `tags.$f(async ({ element1, element2 }) => ...)` to maintain correct DOM hierarchy.
10. **Separation of Concerns (Minicomponents)**: Avoid "callback hell" or the "pyramid of doom" when building complex UI nodes. Create abstract pure functions documented with JSDoc `/** @param {TuJsHtml.Types.Tags} tags */` that take the `tags` object and return node structures. This enables reusable UI minicomponents without losing scope.

## Code Examples

### Basic Component & Literals

```javascript
import { TuJsHtml, createSignal } from "frankjstein";

const app = new TuJsHtml(function (tags) {
    const { main, h1, p, "div.card": card } = tags;

    main({ style: { padding: "20px" } });
    
    // Prefer Template Literals for cleaner text nodes
    h1`Hello Frank J. Stein`;
    
    card(({ p }) => {
        p`This is a simple card built with native JS.`;
    });
});

document.body.append(app);
```

### Reactivity with Signals

```javascript
import { TuJsHtml, ELEMENT_UTIL as $, createSignal } from "frankjstein";

const app = new TuJsHtml(function (tags) {
    const { div, p, button, span } = tags;

    const contador = createSignal(0);

    div(() => {
        // Signals can be interpolated directly in literals if wrapped in a tag
        p`Clics: ${span({ style: { fontWeight: "bold", color: "blue" } }, contador)}`;

        const btn = button`Sumar +1`;
        
        btn.addEventListener("click", () => {
            contador.value = contador.value + 1;
        });
    });
});
```

### Async Suspense ($f) and External Components

To avoid the "pyramid of doom" and safely work with async scope context, separate your logic into independent functions (minicomponents) that receive the inner `tags` reference.

```javascript
import { TuJsHtml } from "frankjstein";

/**
 * @param {TuJsHtml.Types.Tags} tags
 */
function renderFallback({ div }) {
    div({ className: "loading-skeleton" }, () => {
        div({ className: "skeleton-img" });
        div({ className: "skeleton-text" });
    });
}

/**
 * @param {TuJsHtml.Types.Tags} tags
 * @param {string} customTitle
 */
function userCardBody({ h2, "span.badge": badge, ul }, customTitle) {
    h2(customTitle);
    badge({ style: { backgroundColor: "green", color: "white" } }, "Online");

    ul(({ li }) => {
        li`Role: Frontend Dev`;
        li`Level: DOM God`;
    });
}

const app = new TuJsHtml(function (tags) {
    const { main, h1, hr } = tags;
    // WRONG TO USE INSIDE ASYNC AWAIT: const { "div.user-card": userCard } = tags;

    main();
    h1`User Panel`;
    hr();

    // Async Suspense Fragment
    tags.$f(async ({ "div.user-card": userCard }) => {

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Use the minicomponent pattern, passing the specific inner scope tags
        userCard(innerTags => userCardBody(innerTags, 'Frank Stein'));

    }, 
    // Fallback passed as a pure function minicomponent
    tags => renderFallback(tags));
});
```

### ⚠️ Async Scope Context (Gotcha)

When writing async fragments, **never** use a tag destructured from an outer scope after an `await`.

❌ **Incorrect (Loses Parent Context):**
```javascript
const app = new TuJsHtml(function (tags) {
    const { "div.card": card } = tags; // Destructured in root scope

    tags.$f(async ({ h2 }) => {
        await new Promise(r => setTimeout(r, 1000));
        
        // BUG: 'card' still assumes the root is its parent.
        // It will append to the end of the app, escaping the fragment!
        card(() => { h2`Lost child`; });
    });
});
```

✅ **Correct (Context Preserved):**
```javascript
const app = new TuJsHtml(function (tags) {
    tags.$f(async ({ h2, "div.card": card }) => { 
        // Always destructure inside the fragment's own arguments
        await new Promise(r => setTimeout(r, 1000));
        
        // Works perfectly, appends to the fragment's placeholder
        card(() => { h2`Correct child`; });
    });
});
```

### Special Directives

You can use special attributes for reactivity and listeners:

```javascript
const { input, div } = tags;
const nameSignal = createSignal("");
const isActive = createSignal(false);

input({ type: "text", "@bind:value": nameSignal });
div({ "@classToggle": { "is-active": isActive } });
```

## Commands

```bash
npm install frankjstein
```

## Resources

- **GitHub Repository**: [FrankJStein](https://github.com/tuadmin/FrankJStein)
