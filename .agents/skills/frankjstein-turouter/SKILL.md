---
name: frankjstein-turouter
description: >
  Routing patterns, configuration, and navigation with TuRouter in FrankJStein.
  Trigger: Routing, navigation, URL parameters, router guards, TuRouterWeb, TuRouterCore, TuPathfinder.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Configuring single-page application (SPA) routing.
- Managing URL state, adapters (Hash, History, Query).
- Protecting routes using navigation guards.
- Loading components lazily (Dynamic Imports) based on routes.
- Defining routing constants and URL builders.

## Critical Patterns

### 0. The Addon Import Rule (MANDATORY)

TuRouter is an **addon**, it is NOT part of the core `frankjstein` bundle. You must import it from its specific subpath.

```javascript
// ❌ WRONG: It does not live in the core package
import { TuRouterWeb } from "frankjstein";

// ✅ CORRECT: Import from the turouter addon path
import { TuRouterWeb } from "frankjstein/turouter";
```

### 1. Single Source of Truth (SSOT) for Route URLs

**Never hardcode string paths in your templates or router configuration.** Always define routes as factory functions or constants in a centralized `routes.js` file. This provides intelligent autocompletion and centralizes changes.

```javascript
// ✅ CORRECT: Centralized route definitions
export const URL_HOME = () => "/";
export const URL_USERS = () => "/usuarios";
// Dynamic routes use parameters with defaults for easy definition
export const URL_USER_DETAIL = ({ id = "{id}" } = {}) => `/usuario/${id}`;

// ❌ WRONG: Hardcoded strings scattered in code
router.navigate("/usuario/123"); 
```

### 2. Router Initialization and Adapters

`TuRouterWeb` orchestrates the navigation on the frontend. It relies on `RouterAdapter` implementations to interact with the browser's URL.

- `HistoryAdapter`: Clean URLs (`/usuarios`). Requires server-side fallback to `index.html`.
- `HashAdapter`: Hash URLs (`#!/usuarios`). Safe for static hosts without rewrite rules.
- `QueryAdapter`: Query parameter URLs (`?ruta=/usuarios`).

```javascript
import { TuRouterWeb, TuPathfinder, HistoryAdapter } from "frankjstein/turouter";

const router = new TuRouterWeb({
    pathfinder: new TuPathfinder(),
    adapters: [new HistoryAdapter()],
    base: window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")) // Optional base path
});
```

### 3. Route Registration & Lazy Loading

`TuRouter` natively supports Promises and dynamic imports. 

- **Convention `Tpl`**: If the dynamically imported module exports a default function ending in `Tpl` (e.g., `UserListTpl`), you can wrap it in `TuJsHtml` at the orchestrator level, keeping the router configuration perfectly clean.
- **Lazy Groups**: Use `createGroupUrl` and `router.group()` to group related routes and load them only when the user accesses the group prefix.

```javascript
import { createGroupUrl } from "frankjstein/turouter";

// Define a group of URLs
export const URL_PAGES = createGroupUrl("/pages", {
    HOME: () => "/home",
    CONTACT: () => "/contacto"
});

export function setupRoutes(router) {
    // 1. Direct Dynamic Import (Module exports a function)
    router.add(URL_USER_DETAIL, () => import("./users/User.$id.js"));

    // 2. Lazy Route Group (Routes are only registered when hitting /pages/*)
    router.group(URL_PAGES, (add) => {
        add(URL_PAGES.HOME, () => import("./pages/Home.js"));
        add(URL_PAGES.CONTACT, () => import("./pages/Contact.js"));
    });
}
```

### 4. Navigation Guards (`beforeEach`)

Guards are async interceptors executed before entering a route. They can allow navigation (`true`), abort it (`false`), or redirect (return a `string`).

```javascript
import { DI } from "frankjstein";
import { IAuthService } from "./contracts.js";
// (Note: TuRouter itself is imported from frankjstein/turouter, but DI is from core)

router.beforeEach(async (to, from) => {
    // Check if the route is protected
    if (to.startsWith("/usuario/")) {
        const auth = DI.Inject(IAuthService); // Or TuContainer.resolve(IAuthService)
        if (auth.isLoggedIn) return true;
        
        // Redirect to login
        return URL_LOGIN(); 
    }
    return true; // Allow navigation
});
```

### 5. Orchestrator Integration (DI and Scope)

When integrating `TuRouter` into a robust `TuContainer` setup (like multiple scopes or advanced DI), you must handle the component rendering manually in your app root.

`router.resolve(path)` returns the matching route (`{ handler, params }`). The orchestrator should invoke the handler and render the result.

```javascript
// Inside your App orchestrator listening to router.currentPath changes:
const match = await router.resolve(targetPath);
if (!match?.handler) {
    renderNotFound();
    return;
}

// Pass parameters (including AbortSignal for cancellation)
const module = await match.handler(match.params);

if (module[Symbol.toStringTag] === "Module") {
    const component = module.default;
    
    // ILUSTRA CONVENTION (IPageTpl): Function ends in 'Tpl'
    if (component.name.endsWith("Tpl")) {
        // Wrap in TuJsHtml to enable TuLazyInject to detect current Scope
        viewElement.appendChild(new TuJsHtml(tags => component(tags, match.params)));
    } else {
        // Standard Vanilla JS component
        const result = component({ params: match.params });
        viewElement.appendChild(result);
    }
}
```

### 6. Cancellation (AbortSignal)

Since routes are lazily loaded and components might fetch data on mount, the orchestrator should generate an `AbortController` on every route change and inject its `signal` into the route `params`. Components MUST listen to this signal to cancel pending fetches if the user navigates away before loading completes.

```javascript
// In the orchestrator:
const signal = this.currentAbortController.signal;
match.params.signal = signal; // Inject into params

// In the component:
export async function UserDetailTpl(tags, params) {
    const data = await fetch(`/api/users/${params.id}`, { signal: params.signal });
    // ...
}
```

## Architectural Anti-Patterns (NEVER DO)

- **❌ Hardcoding string URLs in links**: `tags.button({ "@on": { click: () => router.navigate("/login") } })`. Use `URL_LOGIN()` instead.
- **❌ Heavy sync work in guards**: Guards block the navigation pipeline. Keep them fast (e.g., checking token existence).
- **❌ Ignoring the AbortSignal**: If you do heavy async work in a route, ignoring the signal can cause the component to render *after* the user has already navigated to a different page, corrupting the DOM.
