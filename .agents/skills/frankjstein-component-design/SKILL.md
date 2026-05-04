---
name: frankjstein-component-design
description: >
    Architectural guidelines and conventions for building UI components in FrankJStein.
    Trigger: When building, refactoring, or designing UI components, views, or layouts.
license: Apache-2.0
metadata:
    author: gentleman-programming
    version: "1.2"
---

## When to Use

- Creating new UI components (buttons, modals, headers, etc).
- Deciding how to pass state to a component.
- Structuring files, folders, and CSS for a specific view.

## Critical Patterns

### 1. Mandatory TypeScript / JSDoc Typing & Aliasing

FrankJStein components are usually pure functions that receive the `tags`
builder as their first parameter. To prevent hallucinations and empower the
Deno/TS Linter, **you MUST ALWAYS strictly type the `tags` parameter**.

To avoid visual clutter (JSDoc cancer) and save tokens when declaring multiple
components in the same file, ALWAYS use a `@typedef` alias at the top of your
`.js` files.

```javascript
// At the top of the file
/**
 * @typedef {import("frankjstein").TuJsHtml.Types.Tags} Tags
 * @typedef {import("frankjstein").TuJsHtml.Types.ConfigureAttributes<HTMLButtonElement>} BtnConfig
 */

/**
 * @param {Tags} tags
 * @param {BtnConfig} config
 * @param {string} text
 */
export function PrimaryButton(tags, config, text) {
    return tags.button({ ...config, className: "btn-primary" }, text);
}
```

### 2. Custom Elements (Web Components) Integration

TuJsHtml fully supports native Web Components, but the TS Linter needs to know
about them for autocomplete to work on custom methods. You can extend the base
`Tags` type to inject your custom elements using template literal types.

```javascript
/**
 * Extend the base interface to inject our Custom Element.
 * @typedef {import("frankjstein").TuJsHtml.Types.Tags & { [key: `custom-el${string}`]: import("frankjstein").TuJsHtml.Types.CustomTag<CustomEl>} } MyAppTags
 */

/**
 * @param {MyAppTags} tags
 */
export function CustomView(tags) {
    // The linter now knows that 'tags["custom-el"]' returns the CustomEl class
    return tags["custom-el"]({ id: "my-el" }, (ctx) => {
        // You get full autocomplete for CustomEl methods here
    });
}
```

### 3. State Locality (Smart vs. Dumb)

- **Dumb Components (Preferred for reuse):** Keep small, reusable components as
  stateless as possible. Pass pure values or Signals down. This guarantees
  maximum performance and predictability.
- **Smart/Robust Components:** If a component is highly complex, unique (e.g., a
  massive DataGrid or an isolated widget), or acts as a Micro-Frontend SPA, it
  CAN and SHOULD initialize its own internal state (`createSignal`) or inject
  dependencies via `TuContainer`.

- **The Proxy Trap (TuLazyInject)**: Be aware that `TuLazyInject` returns a **Proxy**. It looks and behaves like the real instance, but if you need to perform `instanceof` checks or pass it to low-level libraries that don't support Proxies, you might need to access a property to trigger resolution. For 99% of UI cases, it is transparent.

### 4. CSS Strategy

Freedom is a double-edged sword. TuJsHtml allows you to create `<style>` tags on
the fly, but this can lead to CSS spaghetti.

- **Default:** Rely on a global CSS architecture (e.g., utility classes or BEM
  global stylesheets).
- **Complex/Isolated Components:** If a component is massive and strictly needs
  isolation, it can dynamically resolve its own path (using `import.meta.url`)
  to load an adjacent `.css` file or safely inject a scoped `<style>` block. DO
  NOT do this for simple components.

### 5. File Structure & Scalability

Adapt to the project's scale:

- **Small projects:** A simple `components/` folder is enough.
- **Giant projects:** Enforce Atomic Design principles (`atoms/`, `molecules/`,
  `organisms/`, `templates/`, `pages/`). Always evaluate the project's current
  structure before generating new files.

### 6. Inversion of Control via Decorators (Binding Logic)

To keep templates "dumb" and reusable, avoid writing handlers directly inside them. Instead, use the **Decorator Pattern**. The template creates a pure element and passes it to a "binder" function (decorator) received via props.

- **The Pattern**: `renderElement(tags, data, bindLogic)`
- **The Benefit**: The template doesn't know about `signals`, `services`, or `global state`. It only knows it must call `bindLogic(element, data)` for specific interactive parts.

```javascript
/**
 * @typedef {import("frankjstein").TuJsHtml.Types.Tags} Tags
 * @typedef { { id: string, name: string } } User
 * @typedef { (el: HTMLInputElement, data: User) => void } BindSelection
 */

/**
 * Dumb Template with Injected Logic.
 * @param {Tags} tags
 * @param {User} user
 * @param {BindSelection} bindSelection
 */
export function UserRow(tags, user, bindSelection) {
    return tags.tr((ctx, el) => {
        ctx.td`ID: ${user.id}`;
        ctx.td`Name: ${user.name}`;
        ctx.td((ctxTd) => {
            // ✅ BEST PRACTICE: Use the second param (el) to bind logic
            ctxTd.input({ type: "checkbox" }, (ctxInp, elInp) => {
                bindSelection(elInp, user); 
            });
        });
    });
}
```

## Code Examples

### The Pure Presentational Component (Atom)

```javascript
/**
 * @typedef {import("frankjstein").TuJsHtml.Types.Tags} Tags
 * @typedef {import("frankjstein").TuJsHtml.Types.ConfigureAttributes<HTMLButtonElement>} BtnConfig
 */

/**
 * @param {Tags} tags
 * @param {BtnConfig} config
 * @param {string} label
 */
export function ActionButton(tags, config, label) {
    // Merge config classes with default classes safely
    return tags.button({
        ...config,
        className: `action-btn ${config.className || ""}`,
    }, label);
}
```

### The Smart View Component

```javascript
import { createSignal, TuLazyInject } from "frankjstein";
import { IAuthService } from "../interfaces/IAuthService.js";
// Assuming ActionButton and Tags typedef are imported/available

/**
 * @param {Tags} tags
 */
export function UserProfileView(tags) {
    // Correct: Lazy injection with factory callback
    const auth = TuLazyInject(() => IAuthService);
    const isLoading = createSignal(false);
    const [, setLoading] = isLoading.asTuple;

    return tags.div({ className: "profile-view" }, (ctx) => {
        ctx.h2`User Profile`;

        // Composing with Dumb components. We pass the 'ctx' (which is the tags proxy)
        ctx.$insert(ActionButton(ctx, {
            "@on": {
                click: () => setLoading(true),
            },
        }, "Load Data"));

        ctx.p(
            { "@classToggle": { "hidden": isLoading } },
            "Content goes here...",
        );
    });
}
```

## Resources

- **TuJsHtml Core Rules**: Load `frankjstein-tujshtml` for low-level DOM
  building rules.
- **Signals**: Load `frankjstein-kagebunshin` for reactivity patterns.
- **IoC Container**: Load `frankjstein-tucontainer` if the component requires
  complex service injections.
