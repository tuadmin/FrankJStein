---
name: frankjstein-utils
description: Core and Web utilities for high-performance async orchestration and data handling.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## High-Performance Utilities (TUtils & TuWebUtils)

These utilities are essential for maintaining O(1) performance and professional-grade error handling within the FrankJStein ecosystem.

### 1. Async Caching for Suspense (`cachedAsync`)
**Rule**: Always use `TUtils.cachedAsync` for data fetching or dynamic imports inside components that might re-render (like those using `$f` or `$block`).

```javascript
// ✅ PREFERRED: The fetch will only run ONCE even if the component re-renders
const fetchUser = TUtils.cachedAsync((id) => fetch(`/api/user/${id}`).then(r => r.json()));

$f(async (ctx) => {
    const user = await fetchUser(userId);
    ctx.p(user.name);
});
```

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
