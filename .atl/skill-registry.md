# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| FrankJStein work, load first | frankjstein | .agents/skills/frankjstein/SKILL.md |
| High-level design, where logic belongs | frankjstein-architecture-patterns | .agents/skills/frankjstein-architecture-patterns/SKILL.md |
| UI components, Atomic design, Smart vs Dumb | frankjstein-component-design | .agents/skills/frankjstein-component-design/SKILL.md |
| Services, repositories, IoC patterns | frankjstein-ioc-templates | .agents/skills/frankjstein-ioc-templates/SKILL.md |
| Signals, reactivity, createSignal, createComputedSignal | frankjstein-kagebunshin | .agents/skills/frankjstein-kagebunshin/SKILL.md |
| Web Workers, multi-threading, RemoteModule, heavy async | frankjstein-remote | .agents/skills/frankjstein-remote/SKILL.md |
| Business logic, TuContainer, TuLazyInject, DI kernel | frankjstein-tucontainer | .agents/skills/frankjstein-tucontainer/SKILL.md |
| Service Locator, Hub patterns, Lazy Loading | frankjstein-tudiscovery | .agents/skills/frankjstein-tudiscovery/SKILL.md |
| DOM construction, UI, events, TuJsHtml | frankjstein-tujshtml | .agents/skills/frankjstein-tujshtml/SKILL.md |
| Async caching, time slicing, forms, debounce | frankjstein-utils | .agents/skills/frankjstein-utils/SKILL.md |
| Routing, navigation, URL parameters, router guards, TuRouter | frankjstein-turouter | .agents/skills/frankjstein-turouter/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### frankjstein
- Always adopt a Senior Architect persona: explain *why* before *how*, enforce SOLID.
- NEVER mix Function call with Tagged Template children in one statement: ``` div({...})`text` ``` → TypeError.
- Workers NEVER use Import Map Aliases or bare specifiers (`"frankjstein"`, `#services`). Relative paths only.
- Signals belong to UI (Smart Components). Services use pure JS/TS classes; no Signals inside services.
- Enable `// @ts-check` at the top of every new `.js` file. Use `@typedef` at file top — avoid JSDoc cancer.
- Load sub-skills on demand: tujshtml → UI, kagebunshin → Signals, tucontainer+ioc → services, remote → Workers.

### frankjstein-architecture-patterns
- Services expose plain methods (`async getUser()`). Smart Components hold `createSignal()` locally, not services.
- Use Workers (`RemoteModule`) ONLY for CPU-blocking tasks. Workers have no DOM — avoid if `DOMParser` is needed.
- Workers require HTTPS/SSL context — do not propose them in non-SSL projects.
- Cross-tab state: use `Remote.Global` or `Remote.Shared`.
- Classes with cleanup MUST use `[DISPOSE]()` / `dispose()` (exported `DISPOSE` symbol, not raw `Symbol.dispose`).
- Anti-patterns: business logic in templates, async context crossing, deep relative paths (`../../../`).
- Import Aliases (`#services/`) recommended for medium+ projects — check for `tsconfig.json` or `package.json#imports` first.

### frankjstein-tujshtml
- Three valid tag invocations ONLY: (1) N-Args `div({class:"x"}, span("A"))`, (2) Tagged Template ``` h1`Title: ${sig}` ```, (3) CSS Selector `const {"button.btn": Btn} = tags`.
- FATAL HYBRID: ``` div({class:"x"})`text` ``` → TypeError. Never combine config object + Tagged Template.
- Config object MUST be first argument: `div({...}, children)`, never `div(children, {...})`.
- NEVER pass a DOM node through a computed Signal → renders `[object HTMLElement]`. Use `ctx.$block` instead.
- NEVER use `count.value` inside Tagged Template — kills reactivity. Pass the Signal object directly.
- Arrow functions in callbacks share a context pointer (fast, sync only). Traditional functions create isolated context (safe for async/setTimeout).
- NEVER cross contexts: inside `$f` or `$block`, use the inner ctx, not the outer one.
- `ELEMENT_UTIL as $`: use `el[$].on("event", fn)` as ergonomic wrapper for `addEventListener`.
- Special context methods: `$block(signal, fn)`, `$f(asyncFn, fallback?)`, `$fragment(fn)`, `$insert(node)`. No `forEach`, `map`, `if` — do not hallucinate them.
- Native writable properties (`disabled`, `innerHTML`, `src`) accept Signals directly — no `@` prefix needed.
- `@bind:value` / `@bind:checked` for two-way binding. `@on` for persistent events. `@one`/`@once` for one-time events.

### frankjstein-kagebunshin
- State-to-UI: pass Signal directly as child (`p(count)` or ``` p`Clicks: ${count}` ```).
- UI-to-State: use `@bind:value` directive, NOT assigning a Signal to `input({ value: signal })`.
- `createComputedSignal(sig1, sig2, (v1, v2) => ...)` — dependencies always EXPLICIT. No implicit tracking.
- `createKageBunshinObject`: access with `$` prefix for reactive (`obj.$name`) — no `.value` on `$` props.
- NEVER pass DOM node through computed Signal → renders `[object HTMLElement]`. Use `ctx.$block`.
- Reference identity trap: if setter receives same array/object reference, signal sees no change — spread first: `setItems([...data])`.
- Proxy identity: `instanceof` fails on KageBunshin proxies. Use `obj.constructor === TargetClass` instead.
- No `effect()`, no `watch()`. Use `.subscribe()` ONLY for non-DOM side effects.
- Version Signal pattern for large mutable datasets: service exposes a `versionSignal`, `$block` observes it.

### frankjstein-remote
- Workers NEVER use bare specifiers or aliases. Relative paths (`./`, `../`) for ALL imports including the framework.
- Each child class MUST call `ChildClass.register(import.meta)` at end of file — NEVER `RemoteModule.register()`.
- Connect with `await ChildClass.connect()` — returns a Mirror Proxy. All methods become Promises.
- Race condition: wrap `connect()` AND dependent UI inside `$f` (Suspense) to prevent premature binding.
- Lifecycle: `Remote.Simple` (isolated), `Remote.Local` (tab singleton), `Remote.Shared` (multi-tab), `Remote.Global` (browser singleton).
- Hub/Bridge pattern: create `hub.js` that re-exports framework via relative path — workers import only from the Hub.

### frankjstein-tucontainer
- Register BEFORE resolve: kernel/entry-point must register all services before any component calls `.resolve()`.
- `TuLazyInject(() => Token)` — preferred everywhere (class, function, module scope). Lazy, order-independent.
- `TuInject(Token)` / `TuContainer.resolve(Token)` — immediate, order-sensitive. Registration must precede.
- In TypeScript: always pass generic `TuLazyInject<IService>(() => IService)` to prevent `unknown` type errors.
- `#field` private syntax is JS class-only. In plain functions, use `const service = TuLazyInject(() => Token)`.
- Async boundary injection REQUIRES `{ context: this }` option — without it, scope falls back to Root (memory leak).
- `{ optional: true }` ONLY for components explicitly designed to live both inside and outside Scopes. Not defensive default.
- `addSingleton` → app-wide single instance. `addTransient` → new instance per request. `addScope` → one per Scope.

### frankjstein-ioc-templates
- Abstract classes prefixed with `I` simulate TypeScript interfaces AND serve as DI tokens.
- Concrete class as token is valid: `TuContainer.addSingleton(AppConfig)` — override later with `addSingleton(AppConfig, AppConfigV2)`.
- Factory registration only when constructor needs manual args: `addSingleton(IService, () => new Service(key, url))`.
- Context-aware factory: `addSingleton(IService, (di) => new Service(di.resolve(IDep)))`.
- Constructor injection ONLY for mocks/tests. Never for production DI.
- Default to Simple Service Architecture if macro architecture not specified — do NOT hallucinate complex structures.

### frankjstein-tudiscovery
- Use for Lazy Loading and Service Location, especially in Workers where aliases fail.
- `TuDiscovery.create({ key: () => import("./Service.js") })` — factories are dynamic imports.
- First access triggers import and instantiation. Returns a Promise on first access, cached Proxy after.
- Hub file MUST use relative paths for all imports (including the framework itself) — never bare specifiers.
- `$verify()` for dependency graph health check in dev/test environments.
- Choose TuDiscovery over TuContainer when: Worker context, lazy loading needed, or circular dep risk.

### frankjstein-component-design
- Always type `tags` parameter: `@typedef {import("frankjstein").TuJsHtml.Types.Tags} Tags` at file top.
- Dumb components: stateless, receive values or Signals, no DI. Smart components: own `createSignal`, can inject.
- Decorator pattern: `renderElement(tags, data, bindLogic)` — template stays pure, logic is injected.
- Composition styles: Callback-Style (needs parent `el`), N-Args (clean nesting), CSS Selector Destructuring (flat Tailwind).
- Atomic Design: Atoms (stateless), Molecules/Organisms (stateful Smart).
- DI in components: prefer Singletons. Transient/Scoped in UI is a code smell unless strictly justified.
- Async injection in UI: MUST pass `{ context: tags }` to `TuLazyInject` to avoid losing Scope.
- SSOT: if a fragment appears in 2+ places, extract to a shared function — never copy-paste.

### frankjstein-utils
- `TUtils.cachedAsync(fn)` — prevents redundant fetches inside `$f`/`$block` re-renders.
- `TUtils.cachedAsyncByArgs(fn, keyResolver)` — memoization by arguments for shared pools.
- `TUtils.safe(promise)` → `[err, data]` tuple. Avoid try/catch nesting.
- `TuWebUtils.forEachAsync(array, fn, { batchSize })` — mandatory for collections > 1000 items with DOM ops.
- `TuWebUtils.formToObject(form)` — handles native validation and `name[]` array grouping. Returns `null` on failure.
- `TUtils.scheduleTask(fn)` microtask / `TUtils.scheduleTask(fn, true)` macrotask.
- `TUtils.sleepAsync(ms, signal)` for cancelable delays.
- `TuWebUtils.whenVisibleAsync(el)` for lazy-load / scroll animations.
- `TuWebUtils.debounce(fn, ms)` for high-frequency events.
- `TuSerializer`: Use for packing/rehydrating classes (Workers/LocalStorage/Cross-Language). MUST define `static VERSION`. `Class.fromJSON(str, registry)` implicitly knows the root class, `registry` is for nested classes. `TuSerializer.unpack(str, registry)` requires all classes. Prevents private `_` vars from serializing.

### frankjstein-turouter
- Addon Import Rule (MANDATORY): TuRouter is an addon, not part of the core. ALWAYS import it from `"frankjstein/turouter"` (e.g., `import { TuRouterWeb } from "frankjstein/turouter"`).
- SSOT for URLs: NEVER hardcode string paths (`"/users/1"`). ALWAYS use factory functions or constants (`URL_USER_DETAIL({ id: 1 })`).
- `TuRouterWeb` orchestrates navigation with `RouterAdapter`s (History, Hash, Query).
- Lazy Loading: `router.add(URL, () => import("./page.js"))`. If module default export ends in `Tpl`, wrap it in `TuJsHtml`.
- Route Groups: `createGroupUrl` and `router.group(URL_PAGES, (add) => { ... })` for prefix-based lazy loading.
- Navigation Guards: `router.beforeEach(async (to, from) => { ... })`. Return `true` to allow, `false` to abort, or a string `URL` to redirect.
- Orchestrator Integration: `router.resolve(path)` returns the matching route. The orchestrator must handle `match.handler(match.params)` manually.
- Cancellation: Always create an `AbortController` on route change and inject its `signal` into route `params`. Components MUST listen to it for async fetch cancellation.

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | AGENTS.md | AI governance index — references all skill paths and golden rules |
| .agents/skills/frankjstein/SKILL.md | .agents/skills/frankjstein/SKILL.md | Referenced by AGENTS.md — main index |
| .agents/skills/frankjstein-architecture-patterns/SKILL.md | .agents/skills/frankjstein-architecture-patterns/SKILL.md | Referenced by AGENTS.md |
| .agents/skills/frankjstein-tujshtml/SKILL.md | .agents/skills/frankjstein-tujshtml/SKILL.md | Referenced by AGENTS.md |
| .agents/skills/frankjstein-component-design/SKILL.md | .agents/skills/frankjstein-component-design/SKILL.md | Referenced by AGENTS.md |
| .agents/skills/frankjstein-kagebunshin/SKILL.md | .agents/skills/frankjstein-kagebunshin/SKILL.md | Referenced by AGENTS.md |
| .agents/skills/frankjstein-remote/SKILL.md | .agents/skills/frankjstein-remote/SKILL.md | Referenced by AGENTS.md |
| .agents/skills/frankjstein-tucontainer/SKILL.md | .agents/skills/frankjstein-tucontainer/SKILL.md | Referenced by AGENTS.md |
| .agents/skills/frankjstein-ioc-templates/SKILL.md | .agents/skills/frankjstein-ioc-templates/SKILL.md | Referenced by AGENTS.md |
| .agents/skills/frankjstein-tudiscovery/SKILL.md | .agents/skills/frankjstein-tudiscovery/SKILL.md | Referenced by AGENTS.md |
| .agents/skills/frankjstein-utils/SKILL.md | .agents/skills/frankjstein-utils/SKILL.md | Referenced by AGENTS.md |
| tsconfig.json | tsconfig.json | TypeScript config — moduleResolution enforced |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.
