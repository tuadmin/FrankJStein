# Security Policy

## Supported Versions

FrankJStein is currently in **Alpha** stage. Only the latest published version on npm receives security attention.

| Version | Supported          |
| ------- | ------------------ |
| 0.6.x   | ✅ Active           |
| < 0.6   | ❌ No longer supported |

---

## Reporting a Vulnerability

Open a **[GitHub Issue](https://github.com/tuadmin/FrankJStein/issues/new)** with the label `security` and include:

1. Affected module (`TuJsHtml`, `KageBunshin`, `TuContainer`, `RemoteModule`, `TuDiscovery`, `TuRouter`, or the bundle entrypoint)
2. A minimal reproduction using the CDN (see template below)
3. Expected vs. actual behavior

### Minimal Reproduction Template

```html
<!DOCTYPE html>
<html>
<body>
  <script type="module">
    import { createSignal } from "https://esm.sh/frankjstein@0.6.4";
    // Reproduce the issue here
  </script>
</body>
</html>
```

Replace `@0.6.4` with the version where you found the issue. This makes it immediately runnable without any build step.

---

## Architecture and Security Surface

Understanding FrankJStein's architecture helps scope what types of vulnerabilities are relevant.

### Distribution Model

FrankJStein is an **assembler repository** — the `/dist` folder is the sole published artifact. The original source lives in private internal repositories. Security fixes must propagate from those sources into `/dist`. Pull Requests modifying `/dist` directly are not accepted.

---

### CSP Compatibility

Both bundles (`frankjstein.js` and `turouter.js`) were audited and contain **zero occurrences of `eval()` or `new Function()`**. This means:

- A strict Content Security Policy with `script-src 'self'` is **fully compatible**.
- KageBunshin Signals are implemented as plain ES6 classes — no dynamic code execution of any kind.
- `TuJsHtml` builds the DOM programmatically via the standard DOM API, not via `innerHTML` or template string injection.

The only CSP directive you need to add for Workers is:

```
worker-src 'self'
```

If you load the framework from a CDN (e.g., `esm.sh`), also add the CDN domain to both `script-src` and `worker-src`.

---

### Module-Level Security Notes

#### `TuJsHtml` — DOM Builder

Constructs DOM nodes via the native DOM API — not via `innerHTML`. This eliminates the primary XSS vector at the framework level.

**Consumer responsibility**: sanitize any user-controlled data before passing it as text content or attribute values. The framework trusts the application layer.

#### `KageBunshin` — Signals & Reactivity

Plain ES6 classes. No network access, no serialization, no dynamic code. No CSP implications.

#### `TuContainer` — Dependency Injection Kernel

Manages service lifetimes and scope isolation via `TuScope`. Key design decisions:

- `TuScope.dispose()` implements **IDisposable** — automatic cleanup of scoped instances prevents zombie listeners and retained references.
- `TuLazyInject` uses a transparent `Proxy` with hardened async scope capture.
- Singleton registration has an override guard to prevent unintentional re-registration.

**Consumer responsibility**: avoid registering user-scoped services as global singletons. Use `createScope()` to enforce isolation between security boundaries.

#### `RemoteModule` — Web Workers

Workers run in a separate global scope with no DOM access. Key constraint:

> **Import Map aliases and bare specifiers are not supported inside Workers.** All imports must use relative paths (`./` or `../`). Violating this silently fails at Worker load time.

Consumer responsibility: never construct Worker code dynamically from user input.

#### `TuRouter` — Client-Side Router (Addon)

URL reversion is fully delegated to adapters — the router core never calls `window.history.pushState` directly. Route guards are implemented at the application layer via the DI container.

**Consumer responsibility**: always implement route guards on sensitive paths. The router does not enforce authorization — that is the application's job.

---

## Zero Runtime Dependencies

FrankJStein has **no runtime dependencies**. The published package contains only `/dist`. All `devDependencies` (Biome, Rollup, Bun, Happy DOM) are build and test tooling and are never shipped.

Run `npm audit` in your own project to check vulnerabilities in your application's dependency tree — none of them originate from this package.

---

## License

Distributed under the **Apache License 2.0**. See [LICENSE](./LICENSE).

The Apache 2.0 license explicitly excludes any warranty of fitness for a particular purpose, including security guarantees. This is an Alpha-stage library — use it in production at your own risk.
