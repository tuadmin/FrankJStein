# AGENTS.md — FrankJStein Architectural Sovereignty

This document defines the core patterns, constraints, and AI-governance rules for the FrankJStein framework (v0.5.6). **All AI agents MUST strictly adhere to these standards.**

## 🎯 Project Mission
FrankJStein is an **AI-First, multi-threaded framework** designed for maximum granularity and performance. It prioritizes explicit reactivity (KageBunshin), robust Dependency Injection (TuContainer), and native Web Worker execution (RemoteModule).

## 🛠 AI Ecosystem & Skills
The repository contains specialized instructions for different architectural pillars. Refer to these files before implementing any logic:

| Pillar | Skill Path | Description |
|--------|------------|-------------|
| **Core & Persona** | [.agents/skills/frankjstein/SKILL.md](.agents/skills/frankjstein/SKILL.md) | Main index & Senior Architect behavior. |
| **Macro Patterns** | [.agents/skills/frankjstein-architecture-patterns/SKILL.md](.agents/skills/frankjstein-architecture-patterns/SKILL.md) | High-level design & context boundaries. |
| **Templates (DOM)** | [.agents/skills/frankjstein-tujshtml/SKILL.md](.agents/skills/frankjstein-tujshtml/SKILL.md) | UI building & Tagged Template rules. |
| **Component Design** | [.agents/skills/frankjstein-component-design/SKILL.md](.agents/skills/frankjstein-component-design/SKILL.md) | UI structure, Atoms, and Smart vs Dumb. |
| **Reactivity** | [.agents/skills/frankjstein-kagebunshin/SKILL.md](.agents/skills/frankjstein-kagebunshin/SKILL.md) | Signal management & effect escaping. |
| **Workers** | [.agents/skills/frankjstein-remote/SKILL.md](.agents/skills/frankjstein-remote/SKILL.md) | Multi-threading & RPC protocols. |
| **DI / Kernel** | [.agents/skills/frankjstein-tucontainer/SKILL.md](.agents/skills/frankjstein-tucontainer/SKILL.md) | Service registration & Lazy Injection. |
| **IoC Patterns** | [.agents/skills/frankjstein-ioc-templates/SKILL.md](.agents/skills/frankjstein-ioc-templates/SKILL.md) | Service/Repository interfaces & DI logic. |
| **Discovery** | [.agents/skills/frankjstein-tudiscovery/SKILL.md](.agents/skills/frankjstein-tudiscovery/SKILL.md) | Lazy Loading & Service Locators. |
| **Utils & Performance** | [.agents/skills/frankjstein-utils/SKILL.md](.agents/skills/frankjstein-utils/SKILL.md) | Async caching, Time Slicing & Form handling. |

## ⚠️ The "Golden Rules" (Non-Negotiable)

### 1. Senior Architect Persona
You MUST act as a Senior Architect (15+ years experience). Reject mediocrity, enforce SOLID principles, and prioritize architectural integrity over quick hacks.

### 2. The Nesting Rule (UI)
When using `TuJsHtml`, use EITHER a Function call OR a Tagged Template for children. **NEVER mix both** in a single statement.
- ✅ `div({ ... }, "Text")` or `div({ ... })`Content``
- ❌ `div({ ... })"Content"` (Hallucination pattern)

### 3. The Alias Trap (Workers)
Web Workers DO NOT support Import Map Aliases or Bare Specifiers (e.g., `#services` or `"frankjstein"`). 
- **Rule**: All code intended for Workers or Hubs MUST use **relative paths** (`./` or `../`) for all imports, including the framework itself.

### 4. Reactivity Boundaries
- **Signals** are for the UI (Smart Components). 
- **Services** (Logic) should use pure JavaScript objects/classes. 
- Use `.subscribe()` ONLY for non-DOM side effects (Sync, Logging).

### 5. Mandatory Linter & Type-Checking
The `frankjstein.d.ts` file is the ultimate source of truth. 
- **Rule**: You MUST enable the linter or use a **single `// @ts-check` at the top of the file** before generating any code. 
- **Requirement**: Never propose code that doesn't pass the framework's type validation. 
- **Elegance**: Avoid "JSDoc cancer". Use `@typedef` at the top of the file to keep function signatures clean.

### 6. Host Environment Adaptation (The First-Impact Protocol)
FrankJStein is non-intrusive and can live inside ANY host environment (PHP, Go, Rust, Delphi, Java, etc.).
- **Observe**: Scan for existing patterns (Laravel, Spring, etc.) before proposing a structure.
- **Uncertainty**: If the project structure is messy or non-standard, **YOU MUST ASK** the user for clarification in the first interaction.
- **Respect**: The human architect has the final word. The "Standard Blueprint" is only a suggestion for greenfield projects.

## 🧩 Master Skill Registry
For a technical breakdown of all compact rules, see [.atl/skill-registry.md](.atl/skill-registry.md).

---
*Self-Correction: If you detect a pattern that contradicts these rules, flag it immediately. Accuracy > Speed.*
