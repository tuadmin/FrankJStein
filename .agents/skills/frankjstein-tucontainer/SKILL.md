---
name: frankjstein-tucontainer
description: >
  Dependency Injection (DI) patterns with TuContainer in FrankJStein.
  Trigger: Business logic, services, TuContainer, TuLazyInject, data architecture.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
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
>   // TS explicitly typed (Option A)
>   #auth = TuLazyInject<IAuthService>(() => IAuthService);
>
>   // TS explicitly typed using the DI namespace (Option B)
>   #config = DI.LazyInject<IConfigService>(() => IConfigService);
> }
> ```

```javascript
import { TuLazyInject } from "frankjstein";
import { AuthService } from "./auth.service";

export class ApiService {
  // RECOMMENDED: Lazy injection. The Kernel will resolve "AuthService"
  // only in the exact millisecond you access it for the first time.
  #auth = TuLazyInject(() => AuthService);

  async fetchDashboard() {
    // Used transparently
    if (!this.#auth.user.isLogged) throw new Error("Not logged in");
    return await fetch(`/api/user/${this.#auth.user.name}`);
  }
}
```

### 3. Resolution from the UI (Views/Controllers)

To access the master service and its data from the UI builder function
(`TuJsHtml`), use the direct synchronous resolution method from the Kernel.

```javascript
import { TuContainer } from "frankjstein";
import { ApiService } from "./services";

// Get the instance configured and tracked by the Kernel
const api = TuContainer.resolve(ApiService);

btnFetch[$].on("click", async () => {
  const data = await api.fetchDashboard();
});
```
