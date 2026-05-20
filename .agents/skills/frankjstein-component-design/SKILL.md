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
  - **AI Rule (DI in Components)**: Do NOT abuse injections in UI components. When injecting, favor **Singletons** (like `AuthService` or `AppConfig`). Injecting Transient or Scoped services into UI components is a code smell unless strictly architected.
  - **AI Rule (Async Context)**: If the injection happens dynamically inside a Promise or an async block within the component, you MUST pass `{ context: tags }` to `TuLazyInject` to avoid losing the UI component's scope.

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

### 7. Single Source of Truth (SSOT) for Fragments
If a UI fragment (e.g., a set of navigation links, a specific icon composition, or a repeated sub-form) is used in more than one place within the same file or across different views, **do not copy-paste it**. 

- **Extract to a Sub-function**: Pass the `tags` or a specific tag proxy (like `aTag`) to a helper function.
- **Benefit**: Centralized maintenance. One change updates all occurrences (e.g., Desktop and Mobile menus).

```javascript
// ✅ CORRECT: Shared fragments logic
function renderSocialLinks(tags) {
    tags.a({ href: "https://twitter.com" }, "Twitter");
    tags.a({ href: "https://github.com" }, "GitHub");
}

export function Footer(tags) {
    return tags.footer(ctx => {
        ctx.div({ className: "social" }, renderSocialLinks(ctx));
    });
}
```

### 8. Composition Styles & Destructuring Patterns (Side-by-Side)

When composing UI in FrankJStein, there are three primary styles of tag invocation. Each has specific trade-offs regarding readability, indentation depth, and how Tailwind utility classes are handled:

#### I. Callback-Style (Inline Builder Callbacks)
Children are defined inside a callback function that receives a nested tags context (usually named `ctx` or `item`).
*   **Pros:** Access to the native parent element (`el`), easy to debug inline, very direct.
*   **Cons:** Can lead to deep nesting/indentation ("callback hell") if overused.
*   **Best for:** When you need the native DOM element reference, or for highly dynamic blocks (like event handlers/async loaders).

```javascript
info.div({ className: "contact-item" }, (item) => {
    item.div({ className: "contact-ico" }, ci.icon);
    item.div({}, (d) => {
        d.p({ className: "contact-lbl" }, ci.lbl);
        d.p({ className: "contact-val" }, ci.render);
    });
});
```

#### II. Pure N-Arguments Style (Nested Functions)
Tags are invoked as pure functions that receive children as sequential arguments (without callbacks).
*   **Pros:** Clean, declarative, behaves like React/Hyperapp nested functions, no callback indentation.
*   **Cons:** Less inline debuggability, no direct access to parent elements within the child nodes unless wrapped.
*   **Best for:** Standard tree nesting where no native element handles/callbacks are needed.

```javascript
const { div, p } = info;
return div({ className: "contact-item" },
    div({ className: "contact-ico" }, ci.icon),
    div(
        p({ className: "contact-lbl" }, ci.lbl),
        p({ className: "contact-val" }, ci.render)
    )
);
```

#### III. Destructuring with Selector-Keys (CSS Abstraction Style)
Destructure the `tags` or `info` proxy using CSS selectors to declare Tailwind-styled tags as local components.
*   **Pros:** ZERO callback nesting, extremely clean markup, matches Tailwind utility conventions perfectly, reusable in the same scope.
*   **Cons:** Overhead of destructuring declarations at the top of the function.
*   **Best for:** Large components, Tailwind-heavy layouts, loops, and keeping indentation flat.

```javascript
const {
    "div.contact-item": divContactItem,
    "div.contact-ico": divContactIco,
    "div.contact-lbl": divContactLbl,
    "div[class=contact-val]": divContactVal, // Using attribute selectors
    div
} = info;

return divContactItem(
    divContactIco(ci.icon),
    div(
        divContactLbl(ci.lbl),
        divContactVal(ci.render)
    )
);
```

---

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
