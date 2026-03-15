---
name: frankjstein
description: >
  Guidelines for using the FrankJStein library for UI rendering in Vanilla JavaScript.
  Trigger: When the user asks to build UI, use TuJsHtml, createSignal, or work with FrankJStein elements.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- When building web applications or components using the `frankjstein` library.
- When creating UI without a transpilator (no JSX, no React, no Vue).
- When handling async UI rendering and suspense natively.
- When working with `TuJsHtml` and `createSignal`.

## Critical Patterns

1. **NO JSX, NO REACT, NO VUE**: This library uses a native JavaScript Builder Pattern. You must construct elements by destructuring the `tags` object provided by `TuJsHtml`.
2. **Native JavaScript Only**: Do not propose Webpack, Vite, Babel, JSX, or any setup steps. It runs directly in the browser.
3. **TuJsHtml Initialization**: UI components or apps are built by passing a builder function to `TuJsHtml`.
4. **DOM Utility & Event Listeners**: You can use the standard native DOM API like `element.addEventListener('click', ...)` for any event. Alternatively, you can use the `ELEMENT_UTIL` Symbol exported by the library which adds superpowers. In real projects, alias it as `$`: `import { ELEMENT_UTIL as $ } from "frankjstein"`, then use it like: `element[$].on("click", callback)`.
5. **Async Suspense**: Use `tags.$f(async ({ tags... }) => {...}, function fallback({ tags... }) {...})` to handle asynchronous operations natively without React's `Suspense` or `useEffect`.
6. **Reactivity**: Use `createSignal(initialValue)` for state. Pass the signal directly to elements. Mutate the state via `signal.value = newValue`. Do NOT use hooks like `useState`.
7. **Special Directives**: You can use special attributes for reactivity and listeners directly in the tag function like `"@classToggle"`, `"@on"`, `"@bind:value"`, `"@bind:form"`.

## Code Examples

### Basic Component with Builder Pattern

```javascript
import { TuJsHtml, createSignal } from "frankjstein";

const app = new TuJsHtml(function (tags) {
    const { main, h1, p } = tags;
    // You can alias class names directly in destruction
    const { "div.card": card } = tags;

    main({ style: { padding: "20px" } });
    h1("Hello Frank J. Stein");
    
    card(({ p }) => {
        p("This is a simple card built with native JS.");
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
        p("Clics: ", span({ style: { fontWeight: "bold", color: "blue" } }, contador));

        const btn = button("Sumar +1");
        
        // Option A: Using ELEMENT_UTIL aliased as $
        btn[$].on("click", () => {
            contador.value = contador.value + 1;
        });

        // Option B: Native approach
        // btn.addEventListener("click", () => { contador.value = contador.value + 1; });
    });
});
```

### Async Suspense ($f)

```javascript
import { TuJsHtml, ELEMENT_UTIL as $ } from "frankjstein";

const app = new TuJsHtml(function (tags) {
    const { div, h2, p, button } = tags;

    tags.$f(async ({ h2, p, button }) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        h2("Datos Cargados");
        p("Data loaded successfully!");
        
        const btn = button("Ok");
        btn[$].on("click", () => alert("Todo piola."));
    }, 
    function fallback({ p, i }) {
        p(i("Loading data... please wait."));
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
