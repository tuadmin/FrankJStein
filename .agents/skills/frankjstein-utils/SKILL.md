---
name: frankjstein-utils
description: Core and Web utilities for high-performance async orchestration and data handling.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.1"
---

## High-Performance Utilities (TUtils & TuWebUtils)

These utilities are essential for maintaining O(1) performance and professional-grade error handling within the FrankJStein ecosystem.

### TuSerializer (High-Performance Packing & Rehydration)

When persisting complex state (e.g., passing data to Web Workers, saving to `localStorage`, or cross-language data transfer), DO NOT use standard JSON parsing. Use `TuSerializer`.

It operates in two distinct modes:

#### Mode 1: Inherited (For Domain Classes - Best DX)
The class extends `TuSerializer`. This provides automatic integration with `JSON.stringify()` (via `toJSON`) and great TypeScript autocompletion via `.fromJSON()`.

```javascript
import { TuSerializer } from "frankjstein";

class Profile extends TuSerializer {
    static VERSION = 1; // MANDATORY for validation
    constructor() {
        super();
        this.data = new Set([1, 2]);
        this._private = "secret"; // Ignored automatically
    }
}

// Packing: Intercepted automatically
const json = JSON.stringify(new Profile());

// 2. Unpacking: Returns properly typed `Profile` instance
// NOTE: `Profile` is implicitly known by the engine. You only need to pass a registry `{}`
// for *other* custom classes that might be nested inside (e.g. `{ Role }`).
const restored = Profile.fromJSON(json, {});
```

#### Mode 2: Universal Static (For Any Object/Class)
Used for arrays, generic objects, or external classes that cannot extend `TuSerializer`. If a class lacks `static VERSION`, it defaults to `1`. The developer must cast types manually.

```javascript
// Packing
const json = TuSerializer.pack(anyExternalData);

// Unpacking (Requires registry for classes)
const restored = TuSerializer.unpack(json, { ExternalClass });
```

**Critical Rules for TuSerializer:**
1. **Manifest Validation**: Unpacking will fail-fast with a `TypeError` if a class is missing from the registry or if the JSON version is higher than the local class version.
2. **Registry Injection**: When using `Class.fromJSON(str, registry)`, the root `Class` is implicitly known. The `registry` is only required for *nested* custom classes. When using `TuSerializer.unpack(str, registry)`, you MUST pass all custom classes including the root.
3. **Cross-Language Intent**: The packed format (`{"manifest": {...}, "payload": {"@": "ClassName", ...}}`) is designed as a cheap alternative to Protobuf.

### 1. Async Caching for Suspense (`cachedAsync`)
**Rule**: Always use `TUtils.cachedAsync` for data fetching or dynamic imports inside components that might re-render (like those using `$f` or `$block`).

```javascript
// ✅ PREFERRED: The fetch will only run ONCE even if the component re-renders
const fetchUser = TUtils.cachedAsync((id) => fetch(`/api/user/${id}`).then(r => r.json()));

// ✅ NEW (v1.1): Memoization by arguments (useful for shared pools)
const fetchProduct = TUtils.cachedAsyncByArgs(
    (id) => fetch(`/api/p/${id}`).then(r => r.json()),
    (id) => `product_${id}` // Cache key resolver
);

$f(async (ctx) => {
    const user = await fetchUser(userId);
    ctx.p(user.name);
});
```

### 1.1 Chainable Execution (`repeatCall`)
**Rule**: Use `TUtils.repeatCall` for creating fluid logging or event-aggregation chains.
```javascript
const log = TUtils.repeatCall((msg) => console.log(msg));
log("F")("R")("A")("N")("K"); // Executes 5 times, returns self.
```

---

### 2. Go-Style Error Handling (`safe`)
**Rule**: Avoid deep `try/catch` nests. Use `TUtils.safe` to handle promises as tuples.

```javascript
// ✅ PREFERRED: Clean control flow
const [err, data] = await TUtils.safe(myService.getData());
if (err) return ctx.p("Error loading data");
ctx.b(data.title);
```

### 3. Time Slicing for Heavy Iterations (`forEachAsync`)
**Rule**: NEVER use native `.forEach` or `.map` for collections larger than 1,000 items if you are performing DOM operations or heavy logic. Use `TuWebUtils.forEachAsync` to prevent UI freezing.

```javascript
// ✅ PREFERRED: UI stays responsive during processing
await TuWebUtils.forEachAsync(hugeArray, (item) => {
    process(item);
}, { batchSize: 50 });
```

### 4. Smart Form Handling (`formToObject`)
**Rule**: Use `TuWebUtils.formToObject` for form submissions. It handles native validation and `name[]` array grouping automatically.

```javascript
const onSubmit = (e) => {
    e.preventDefault();
    const data = TuWebUtils.formToObject(e.target);
    if (!data) return; // Validation failed
    api.save(data);
};
```

### 5. Task Scheduling
- Use `TUtils.scheduleTask(fn)` for microtasks (before paint).
- Use `TUtils.scheduleTask(fn, true)` for macrotasks (after paint/next loop).
- Use `TUtils.sleepAsync(ms, signal)` for cancelable delays.

### 6. Visibility and Layout
- Use `TuWebUtils.whenVisibleAsync(el)` for lazy-loading or on-scroll animations.
- Use `TuWebUtils.debounce(fn, ms)` for high-frequency events (resize/scroll).
