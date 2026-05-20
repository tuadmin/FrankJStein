---
name: frankjstein-tucontainer
description: >
  Dependency Injection (DI) patterns with TuContainer in FrankJStein.
  Trigger: Business logic, services, TuContainer, TuLazyInject, data architecture.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.1"
---

## Critical Patterns for TuContainer (DI)

Keep the UI clean from heavy network calls or spaghetti global state. Isolate
logic in pure JavaScript/TypeScript classes and connect them using the
`TuContainer` as the central orchestrator (Kernel).

### 1. Service Registration

Registered in the kernel at some entry point of the application.

- `addSingleton`: Creates a SINGLE instance for the lifetime of the app. Ideal
  for Authentication, Configuration, or global shared state.
- `addTransient`: Creates a NEW instance every time this dependency is
  requested. Ideal for rapidly mutating services or isolated component state.
- `addScope`: Creates one instance per Scope hierarchy (Context). While
  Singleton is enough for SPAs, scoped shines in Node.js/Bun servers to isolate
  user requests.

```javascript
import { TuContainer } from "frankjstein";

TuContainer.addSingleton(AuthService);
TuContainer.addTransient(ApiService);

// ⚠️ CRITICAL RULE: Registration MUST occur before any call to .resolve()
// Ensure the Kernel/Entry point is loaded before your components try to inject.
```

### 2. Recommended Injection: `TuLazyInject`

Whenever a service depends on another (e.g., ApiService needs to read tokens
from AuthService), **the recommended and clean way** is to inject it lazily
using `TuLazyInject` (or the `DI.LazyInject` namespace alias).

This avoids any memory registration order collisions and protects against
circular references during instantiation.

> [!WARNING]
> **TypeScript Strict Typing Required** In pure `.js` environments, autocomplete
> works naturally. However, in `.ts` files, the type inference will often
> default to `unknown`, causing strict linter errors. **When generating
> TypeScript code**, you MUST explicitly pass the generic type to the injection
> method to guarantee semantic type safety and prevent linter crashes:
>
> ```typescript
> import { DI, TuLazyInject } from "frankjstein";
>
> export class ApiService {
>   // ✅ CORRECT: Injecting via Abstract Token (Interface simulation)
>   #auth = TuLazyInject<IAuthService>(() => IAuthService);
>
>   // ✅ CORRECT: Injecting via Concrete Token (Pragmatic approach)
>   #config = TuLazyInject<AppConfig>(() => AppConfig);
> }
> ```

```javascript
import { TuLazyInject } from "frankjstein";
import { IAuthService } from "./interfaces/IAuthService.js";

export class ApiService {
  // RECOMMENDED: Lazy injection via Abstract Token
  #auth = TuLazyInject(() => IAuthService);

  async fetchDashboard() {
    // Used transparently via the contract defined in IAuthService
    if (!this.#auth.user.isLogged) throw new Error("Not logged in");
    return await fetch(`/api/user/${this.#auth.user.name}`);
  }
}
```

### 3. Injection Methods Comparison — `TuLazyInject` vs `TuInject` vs `TuContainer.resolve()`

> [!IMPORTANT]
> **`TuLazyInject` is NOT restricted to classes.** It works in any context — classes, functions, module scope — because it is **lazy**: it defers resolution until the first time the value is actually accessed. This makes it **safer and preferable** to `TuContainer.resolve()` even inside UI component functions.

| Method | Resolves | Works in | Fails if registration is after? |
|--------|----------|----------|----------------------------------|
| `TuLazyInject(() => Token)` | On first access | Anywhere (class, function, module) | ❌ No — lazy, waits |
| `TuInject(Token)` | Immediately | Anywhere | ✅ Yes — resolves at call site |
| `TuContainer.resolve(Token)` | Immediately | Anywhere | ✅ Yes — resolves at call site |

```javascript
// ✅ IN A CLASS (canonical pattern — using private field # syntax)
export class ApiService {
  #auth = TuLazyInject(() => IAuthService);  // # is class-only JS syntax
}

// ✅ IN A FUNCTION/COMPONENT — also valid, even preferred over resolve()
export function MyComponent(tags) {
  // TuLazyInject works here — resolves lazily on first use, not at this line
  const service = TuLazyInject(() => IMyService);  // ✅ no # needed, just const
  return tags.div(() => { /* use service here */ });
}

// ⚠️  TuInject — resolves immediately, order-sensitive
export function MyComponent(tags) {
  const service = TuInject(IMyService);  // ⚠️ registration MUST have happened before this line
}

// ⚠️  TuContainer.resolve() — same behavior as TuInject, order-sensitive
export function MyComponent(tags) {
  const service = TuContainer.resolve(IMyService);  // ⚠️ same constraint
}
```

> [!CAUTION]
> **The `#field` syntax is JavaScript private class field syntax — it is NOT part of `TuLazyInject`.** It only exists inside `class` bodies. If you try to use `#varname =` inside a plain function you will get:
> ```
> Uncaught SyntaxError: Private field '#varname' must be declared in an enclosing class
> ```
> The fix is simple: drop the `#` and use a regular `const` or `let`. `TuLazyInject` itself is perfectly valid outside a class.
>
> ```javascript
> // ❌ JS SyntaxError — # is class-only syntax
> export function MyComponent(tags) {
>     #service = TuLazyInject(() => IMyService);  // 💥 SyntaxError (the # is the problem)
> }
>
> // ✅ CORRECT — same TuLazyInject, no # needed
> export function MyComponent(tags) {
>     const service = TuLazyInject(() => IMyService);  // ✅ Works perfectly
> }
> ```

### 4. Resolution from the UI (Views/Controllers)

To access a service from the UI builder function (`TuJsHtml`), prefer `TuLazyInject`
over `TuContainer.resolve()` — the lazy resolution gives more flexibility on
registration order and is safer for dynamic module loading scenarios.

```javascript
import { TuLazyInject } from "frankjstein";
import { IApiService } from "./services.js";

export function DashboardView(tags) {
  // ✅ PREFERRED: lazy, order-independent
  const api = TuLazyInject(() => IApiService);

  // ✅ ALSO VALID: immediate, but registration must precede this
  // const api = TuContainer.resolve(IApiService);

  return tags.div(function(ctx) {
    ctx.$f(async (ctxAsync) => {
      const data = await api.fetchDashboard();
      ctxAsync.p(data.title);
    });
  });
}
```

### 5. Contextual Injection & Async Environments (Advanced)

By default, `TuLazyInject` and `TuInject` synchronously capture the current DI Scope during component/class instantiation. **You do NOT need options for 99% of normal property initializations.**

However, if you are calling an injection dynamically from **inside an async closure, a promise, or dynamic module loading (e.g., a Router)**, the synchronous `currentScope` is lost.

> [!IMPORTANT]
> **AI INSTRUCTION: Preventing Zombie Scopes:** Whenever injecting inside an asynchronous boundary, you MUST explicitly provide the `context` option (usually `this` or the `tags/params` object) to trace back the scope. Failing to do so will cause the DI Kernel to fallback to Root, creating memory leaks.
> 
> ```javascript
> // ❌ WRONG (Inside Async): currentScope is lost!
> setTimeout(() => {
>   const api = TuLazyInject(() => IApiService); // Will fallback to Root unexpectedly!
> }, 100);
> 
> // ✅ CORRECT (Inside Async):
> setTimeout(() => {
>   const api = TuLazyInject(() => IApiService, { context: this }); 
> }, 100);
> ```

**The `optional` Flag:**
If you pass `{ context: target }`, the DI kernel expects that `target` is linked to a valid Scope. If it is not, it strictly throws an error to prevent DI corruption. 

If you are building a generic/hybrid component that *might* be used outside a Scope (e.g. in the Root app), pass `{ optional: true }` so it falls back gracefully:
```javascript
// ✅ For Reusable/Hybrid UI Components that might not have a dedicated Scope
const auth = TuLazyInject(() => IAuthService, { context: this, optional: true });
```
> [!WARNING]
> **AI INSTRUCTION:** NEVER append `{ optional: true }` randomly or defensively in regular classes. Only use it when the component is explicitly designed to live both inside and outside of Router Scopes.
