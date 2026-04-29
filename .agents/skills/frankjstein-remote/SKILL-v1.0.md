---
name: frankjstein-remote
description: >
  Patterns for executing Web Workers and Multi-Threading with RemoteModule in FrankJStein.
  Trigger: Heavy tasks, Web Workers, secondary threads, RemoteModule, intense async processing.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

Never block the Main Thread with heavy calculations, cryptography, or massive array manipulations. Delegate that work to a native transparent Worker using the `RemoteModule` class.

### ⚠️ CRITICAL: The "Alias Infection" Warning
**NEVER use Import Map Aliases (`#/`, `@/`) inside code that will be loaded by a Worker.** 
Workers run in a separate context that DOES NOT INHERIT the Import Map from the HTML page. 

- **Symptom**: `Worker Failure: Loading or execution error... Likely due to unsupported Import Map Aliases (#/@)`.
- **Solution**: Use relative paths (`./`, `../`) or the `TuDiscovery` pattern to resolve dependencies without relying on aliases.

### 1. The Isolated Service (Worker)
Create a class that extends `RemoteModule` and expose it at the end of the file by invoking its own inherited static method `register()`. NEVER use `RemoteModule.register()` directly! Always use the child class.

```javascript
// worker.js
// @since 0.1.1-alpha
import { RemoteModule } from "frankjstein";

export class HeavyService extends RemoteModule {
    processGiantMatrix() {
        // ...hard synchronous algorithm that takes 3 seconds...
        return result;
    }
}

// CORRECT: Register the class itself, not the parent abstract class.
HeavyService.register(import.meta);
```

### 2. The Transparent Client (Main Thread)
In your UI or controller (`app.js`), you must import the class declared in the worker **not to instantiate it with `new`**, but to connect it through its child class static method, returning a "Mirror Proxy".

```javascript
// app.js
import { HeavyService } from "./worker.js"; // Import the class

async function startProcess() {
    // 1. Gets a Mirror Proxy. Every call will be forwarded to the real Worker.
    const workerProxy = await HeavyService.connect({ name: 'HeavyJob' });
    
    // 2. Execute. Notice that even though "processGiantMatrix"
    // was synchronous in the class, here it returns a Promise!
    const result = await workerProxy.processGiantMatrix();
    
    console.log("Finished without freezing the tab:", result);
}
```

### 3. Lifecycle Variants (Namespace `Remote`)
Instead of manually passing configuration options to `connect()`, you should extend the specific pre-configured class depending on the required lifecycle:

- `RemoteModule` (`Remote.Simple`): Standard isolated instance.
- `RemoteLocalModule` (`Remote.Local`): **Tab Singleton**. The worker is shared across all components in the current tab.
- `RemoteSharedModule` (`Remote.Shared`): **Multi-Tab**. SharedWorker architecture to sync multiple tabs.
- `RemoteGlobalModule` (`Remote.Global`): **Browser Singleton**. Only one instance runs for the entire browser session.

```javascript
// ❌ CRITICAL BUG: NEVER use bare specifiers like "frankjstein" inside a worker.
// The Worker does NOT inherit the main thread's Import Map.
import { Remote } from "frankjstein"; 

// ✅ CORRECT (Option A): Use a relative path to the library
import { Remote } from "../../dist/frankjstein.js";

// ✅ CORRECT (Option B - BEST): Use the Hub (Bridge Pattern)
import { Hub, Remote } from "../core/hub.js";

// By extending Remote.Local, the worker becomes a tab-wide singleton automatically.
export class GlobalDBService extends Remote.Local {
    // ...
}

// Register using the child class
GlobalDBService.register(import.meta);
```

### 4. The TuDiscovery Pattern & Bridge (Worker Safe)
When your worker needs dependencies, use a central Hub that re-exports FrankJStein utilities using relative paths. This prevents "Alias Infection".

**Example**:
```javascript
// hub.js (Project Bridge)
import { TuDiscovery, Remote } from "./frankjstein.js"; // Relative path!

export const Hub = TuDiscovery.create({
    repo: () => import("./repositories/DataRepo.js"),
    math: () => import("./utils/Math.js")
});

export { Remote };

// worker.js
import { Hub, Remote } from "./../core/hub.js"; // Only one import!

export class MyService extends Remote.Local {
    async run() {
        const repo = await Hub.repo;
        return repo.fetch();
    }
}
MyService.register(import.meta);
```
