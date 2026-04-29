# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| FrankJStein work | frankjstein | .agents/skills/frankjstein/SKILL.md |
| Macro architecture, decisions | frankjstein-architecture-patterns | .agents/skills/frankjstein-architecture-patterns/SKILL.md |
| UI components, Atomic design | frankjstein-component-design | .agents/skills/frankjstein-component-design/SKILL.md |
| DI, Services, Repositories | frankjstein-ioc-templates | .agents/skills/frankjstein-ioc-templates/SKILL.md |
| Signals, Reactivity, State | frankjstein-kagebunshin | .agents/skills/frankjstein-kagebunshin/SKILL.md |
| Workers, Multi-threading, RPC | frankjstein-remote | .agents/skills/frankjstein-remote/SKILL.md |
| Dependency Injection, Kernel | frankjstein-tucontainer | .agents/skills/frankjstein-tucontainer/SKILL.md |
| Lazy Loading, Hubs, Service Locator | frankjstein-tudiscovery | .agents/skills/frankjstein-tudiscovery/SKILL.md |
| DOM construction, Templates | frankjstein-tujshtml | .agents/skills/frankjstein-tujshtml/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### frankjstein-architecture-patterns
- Signals belong to UI (Smart Components). Services should use pure JS/TS objects.
- Use Workers (`RemoteModule`) ONLY for CPU-blocking tasks (>1000 items, crypto, math).
- Cross-tab communication: Use `Remote.Global` or `Remote.Shared`.
- Anti-pattern: Never crossing boundary contexts in async blocks (don't use outer tags inside `$f`).

### frankjstein-tujshtml
- Tagged Templates preferred for text: `h1`Contenido``.
- Configuration (attributes/directives) MUST be the first argument: `div({ class: "..." }, ...)`.
- Context Isolation: Use Arrow Functions for sync building (fast), Traditional Functions for async/timeouts (safe).
- Golden Rule of Nesting: EITHER a Function call OR a Tagged Template. Never hybrid `div()`"..."``.
- Never use standard string interpolation `${}` for Nodes/Signals; use Tagged Templates to preserve reactivity.

### frankjstein-kagebunshin
- Mutate via `.value` for simple types. Assigning triggers granular DOM updates.
- Explicit Dependencies: `createComputedSignal(sig1, sig2, (v1, v2) => ...)` - No magic implicit tracking.
- Reactive Objects: Use `clon.$prop` for UI binding (Signal) and `clon.prop` for logic (Value).
- Escape Hatch: Use `.subscribe()` for non-DOM side effects (logging, analytics). Returns unsubscribe function.
- Hallucination Warning: No `effect()`, `watch()`, or implicit tracking.

### frankjstein-remote
- Alias Infection Warning: NEVER use `#` or `@` aliases inside Worker code.
- Relative Paths Only: Use `./` or `../` for all worker-level imports.
- Lifecycle: `Remote.Simple` (Isolated), `Remote.Local` (Tab-wide), `Remote.Shared` (Multi-tab).
- Registration: Child classes must call `ChildClass.register(import.meta)`.

### frankjstein-tudiscovery
- Use for Service Location and Lazy Loading. Returns Promises on first access.
- Bridge Pattern: Create a `Hub` using `TuDiscovery` to resolve worker dependencies safely.
- Alias Safety: Hubs and worker-bound services MUST use relative paths (./, ../) for all imports. Bare specifiers/aliases will fail in Workers.
- Health Check: Use `discovery.$verify()` to validate the dependency graph.

### frankjstein-tucontainer
- Registration before Resolution: Kernel/Main entry must register services before components try to resolve them.
- `TuLazyInject(() => ServiceToken)`: Preferred injection method to avoid circularity and memory collisions.
- Abstract Classes as Interfaces: Use `class IService { ... }` as both TypeScript interface and DI Token.

### frankjstein-component-design
- Mandatory Typing: Always type the `tags` parameter as `Tags` (or use `@typedef` alias).
- Decorator Pattern: Pass a `bindLogic(el, data)` callback to dumb templates to keep them pure and reusable.
- Atomic Design: Atoms (Dumb/Stateless), Molecules/Organisms (Smart/Stateful).

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| README.md | README.md | General overview and mission |
| tsconfig.json | tsconfig.json | `moduleResolution: nodenext` enforced |
| jsconfig.json | jsconfig.json | `moduleResolution: nodenext` enforced |

Read the convention files listed above for project-specific patterns and rules.
