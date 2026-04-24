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

## Critical Patterns for RemoteModule

Never block the Main Thread with heavy calculations, cryptography, or massive array manipulations. Delegate that work to a native transparent Worker using the `RemoteModule` class.

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
import { Remote } from "frankjstein";

// By extending Remote.Local, the worker becomes a tab-wide singleton automatically.
// No need to pass 'singleton: true' in connect().
export class GlobalDBService extends Remote.Local {
    // ...
}

// Register using the child class
GlobalDBService.register(import.meta);
```
