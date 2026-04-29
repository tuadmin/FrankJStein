---
name: frankjstein-tudiscovery
description: >
  Service Discovery and Lazy Loading patterns with TuDiscovery.
  Trigger: Dependency management, Service Locator, Hub patterns, Lazy Loading, or worker-safe resolution.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Critical Patterns for TuDiscovery

`TuDiscovery` is the **Service Locator** of FrankJStein. It allows you to define a map of services that are only imported and instantiated when they are actually accessed (Lazy Loading).

### 1. The Project Hub (Worker Safe)
This is the most critical use case. Web Workers cannot use Import Map Aliases or Bare Specifiers. By creating a `hub.js` using `TuDiscovery`, you centralize service resolution using relative paths that work everywhere.

```javascript
// core/hub.js
// ❌ WRONG (Inside Worker): import { TuDiscovery } from "frankjstein";
// ✅ CORRECT (Worker Safe): Use relative path to the library
import { TuDiscovery } from "../dist/frankjstein.js"; 
// alternative CDN
// import { TuDiscovery } from "https://esm.sh/gh/tuadmin/frankjstein";

export const Hub = TuDiscovery.create({
    // Services are defined as dynamic imports
    stats: () => import("../services/StatsService.js"),
    auth: () => import("../services/AuthService.js"),
    db: () => import("../services/Database.js")
});
```

### 2. Consuming Services (Main Thread vs Worker)
Accessing a property on a Discovery object returns a **Promise** (if it's not yet resolved) or a **Proxy** that resolves to the instance.

```javascript
import { Hub } from "./core/hub.js";

async function initApp() {
    // RESOLUTION: The first access triggers the dynamic import
    const stats = await Hub.stats; 
    stats.calculate();
}
```

### 3. Verification and Graph Integrity (`$verify`)
`TuDiscovery` includes a built-in method to validate that all registered services are reachable and their factories don't crash. Use this in testing environments or during initialization in development.

```javascript
const discovery = TuDiscovery.create({ ... });

// Internal tool for AIs and Devs to check the health of the dependency graph
const report = await discovery.$verify(); 
// Returns: { serviceName: "✅ Resolved" | "❌ Failed - Error message" }
```

### 4. Why use TuDiscovery instead of TuContainer?
- **TuContainer**: Best for **Dependency Injection** in the Main Thread. Services are usually registered at startup and resolved by type/token.
- **TuDiscovery**: Best for **Service Location and Lazy Loading**, especially in **Web Workers**. It avoids circular dependencies and the "Alias Infection" problem by using dynamic imports.

### 5. AI Architecture Rule: The Alias Trap
- **The Problem**: Main threads usually have bundlers (Vite) or Import Maps that resolve aliases like `#services/*` or `"frankjstein"`. Workers DO NOT.
- **The Solution**: If a file is intended to be used by a Worker (like a Hub), you MUST use relative paths (starting with `./` or `../`) for EVERY import, including the framework itself.
- **Detection**: If you see a bare specifier in a file that might be imported by a Worker, flag it as a CRITICAL BUG.
