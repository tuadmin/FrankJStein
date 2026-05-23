# Contributing to FrankJStein

Thanks for your interest in contributing! This document explains what's possible and how to do it well.

---

## Understanding the Repository Structure

FrankJStein is an **assembler project**. The `/dist` folder is the published artifact built from internal private libraries. This means:

- **The core modules** (`TuJsHtml`, `KageBunshin`, `TuContainer`, `RemoteModule`, `TuDiscovery`) live in private repositories and cannot accept direct code contributions here.
- **Addons** (e.g., `TuRouter` in `src/addons/`) are developed openly in this repo and **do accept code contributions**.
- **Documentation**, **examples**, **tests**, and **AI Skills** (`.agents/skills/`) are all open to contributions.

If you're unsure whether what you want to change is in-scope, open an Issue first.

---

## How to Contribute

### Reporting Bugs

1. Search [existing issues](https://github.com/tuadmin/FrankJStein/issues) first.
2. If none match, open a new Issue using the **Bug Report** template.
3. Include a minimal reproduction using [esm.sh](https://esm.sh):
   ```html
   <script type="module">
     import { ... } from "https://esm.sh/frankjstein@latest";
   </script>
   ```

### Requesting Features

Open a **Feature Request** Issue. Describe the use case clearly — why does this need to exist in the framework vs. in the application layer?

For core module features, keep in mind that integration depends on the upstream private libraries. Core feature requests are evaluated but may take longer or be declined if they conflict with the private ecosystem.

### Contributing Code (Addons, Docs, Examples, Tests)

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature` or `fix/your-fix`
3. Make your changes
4. Run lint and tests:
   ```bash
   npm run lint
   npm test
   ```
5. Open a Pull Request using the PR template

#### Code Style

- This project uses [Biome](https://biomejs.dev/) for linting and formatting. Run `npm run lint:fix` before committing.
- Use `// @ts-check` at the top of every `.js` file.
- All identifiers, comments, and documentation must be in **English**.
- Follow the architectural guidelines in [AGENTS.md](./AGENTS.md).

#### Tests

New functionality in addons should include tests under `tests/`. The test runner is [Bun](https://bun.sh/). Run with `bun test`.

---

## What We Won't Merge

- Direct modifications to `/dist` — this folder is generated, not hand-edited.
- Code that skips `// @ts-check` or breaks the framework's type definitions (`frankjstein.d.ts`).
- Features without a clear use case or that duplicate existing functionality.
- PRs that mix unrelated changes.

---

## Questions?

Open an [Issue](https://github.com/tuadmin/FrankJStein/issues/new) with the label `question`. No question is too basic.
