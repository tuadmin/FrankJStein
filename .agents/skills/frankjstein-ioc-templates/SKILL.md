---
name: frankjstein-ioc-templates
description: >
    Dependency Injection (DI) and Inversion of Control patterns using TuContainer.
    Trigger: When building business logic, services, repositories, or injecting dependencies.
license: Apache-2.0
metadata:
    author: gentleman-programming
    version: "1.1"
---

## When to Use

- Creating new business logic Services or Repositories.
- Deciding how to inject a service into a Smart Component or another Service.
- Registering modules into the global or scoped `TuContainer`.
- Simulating Interfaces in Vanilla JS for strong typing and autocompletion.

## Critical Patterns

### 1. Abstract Classes as Interfaces (Tokens)

JavaScript lacks native Interfaces. To provide the TS Linter and AI agents with robust autocomplete without executing code, **simulate interfaces using Abstract Classes prefixed with `I`**. These classes serve as BOTH the TypeScript interface AND the `TuContainer` registration token. 

> [!NOTE]
> **Concrete Classes as Tokens (The Pragmatic Approach):** 
> You are NOT strictly forced to use Abstract Classes. Injecting a concrete class directly (e.g., `AppConfig`) is a 100% valid, highly pragmatic pattern in FrankJStein. Because of the container's IoC nature, if you ever need to change the implementation in the future, you can simply override it in the Kernel: `TuContainer.addSingleton(AppConfig, AppConfigV2)`. All dependent files will automatically receive `AppConfigV2` without needing any refactoring.

```javascript
/**
 * Simulated Interface for Autocomplete and DI Token.
 */
export class IApiService {
    /** @returns {Promise<any>} */
    fetchData() {
        throw new Error("Not Implemented");
    }
}

// Registration uses the abstract class as the Token!
// NOTE: You can import TuContainer directly or use the 'DI' alias object
import { DI, TuContainer } from "frankjstein";
import { RealApiService } from "./RealApiService.js";

// SIMPLE REGISTRATION (Recommended): If the constructor has no parameters or dependencies.
TuContainer.addSingleton(IApiService, RealApiService);

// FACTORY REGISTRATION: Use ONLY if you must manually pass parameters to the constructor.
// Useful for tests (mocks/fakes) or passing configuration strings.
TuContainer.addScope(IApiService, () => new RealApiService("apikey-xxx", "https://api.dev"));

// CONTEXT-AWARE FACTORY: Use the 'di' context to resolve other dependencies manually.
TuContainer.addSingleton(IApiService, (di) => {
    const config = di.resolve(IConfigService);
    return new RealApiService(config.apiKey, config.url, di.resolve(IHttpClient));
});

// Alternatively using the DI alias:
// DI.Container.addSingleton(IApiService, RealApiService);
```

### 2. Dependency Injection Strategy (`TuLazyInject` vs Constructor)

By default, inject dependencies into **private class fields** (`#field`) using
`TuLazyInject` combined with an arrow function returning the Interface token.
This prevents circular dependencies. Constructor injection is strictly reserved
for Mocking/Testing environments.

- **AI Rule (Async Boundaries)**: When injecting properties directly in the class body or in the constructor, you do NOT need options. But if you dynamically inject a dependency **inside** an asynchronous method, Promise, or callback, you MUST pass `{ context: this }` to `TuLazyInject` or `TuInject` to retain the Service's DI Scope.

```javascript
import { TuLazyInject } from "frankjstein";
import { IApiService } from "./IApiService.js";

export class UserService {
    /** @type {IApiService} */
    #api = TuLazyInject(() => IApiService); // ✅ Sync property initialization (No context needed)

    // Constructor injection is ONLY for tests/mocks!
    constructor(mockApi = null) {
        if (mockApi) this.#api = mockApi;
    }

    async getUser() {
        // The Linter provides 100% Autocomplete here!
        return await this.#api.fetchData();
    }
    
    async lazyFeature() {
        // ✅ Async injection REQUIRES context explicitly to avoid losing scope
        const dynamicService = TuLazyInject(() => IFeatureService, { context: this });
        return await dynamicService.execute();
    }
}
```

### 3. Architecture & Separation of Concerns

FrankJStein is extremely flexible. As an AI Agent, if the macro architecture
(e.g., Clean Architecture, Hexagonal, MVC) is NOT explicitly defined by the user
in the prompt or project:

- **DO NOT hallucinate complex architectures.**
- **Default to Simple Service Architecture**: Smart Components call Services.
- **ASK THE USER**: If you are acting autonomously and the scope is large, stop
  and ask the orchestrator/human for the desired architecture before generating
  a chaotic folder structure.

### 4. Container Modularity

Always use strict JSDoc/TS typing and ensure the linter is active.

- **Small Apps**: A single `container.js` is fine.
- **Large Apps**: Split registrations by domain (e.g., `auth.container.js`,
  `users.container.js`) and import them into a central bootstrapper. Do not
  over-segment to the point of chaos.

## Code Examples

### Complete Injection Flow

```javascript
import { TuContainer, TuLazyInject } from "frankjstein";

// 1. The Interface (Token)
export class ILogger {
    /** @param {string} msg */
    log(msg) {
        throw new Error("Not Implemented");
    }
}

// 2. The Implementation
export class ConsoleLogger extends ILogger {
    /** @param {string} msg */
    log(msg) {
        console.log(`[LOG]: ${msg}`);
    }
}

// 3. The Consumer Service
export class CheckoutService {
    /** @type {ILogger} */
    #logger = TuLazyInject(() => ILogger);

    constructor(mockLogger = null) {
        if (mockLogger) this.#logger = mockLogger;
    }

    process() {
        this.#logger.log("Processing checkout...");
    }
}

// 4. The Registration (usually in a container.js file)
// Remember: Use addSingleton, addTransient, or addScope.
TuContainer.addSingleton(ILogger, ConsoleLogger);
TuContainer.addSingleton(CheckoutService, CheckoutService);
```

## Resources

- **Component Design**: Load `frankjstein-component-design` to see how smart
  components consume these services.
- **Remote Workers**: Load `frankjstein-remote` if the injected service requires
  heavy multi-threading.
