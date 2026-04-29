---
description: Blue-Green Skill Versioning Strategy to prevent AI destruction of instructions.
---

# Skill Maintenance Workflow (v1.0)

This workflow MUST be followed whenever an AI agent needs to modify or update any skill in `.agents/skills/`.

## 1. Version Detection
- Read the current `SKILL.md` file.
- Extract the version from the YAML frontmatter (e.g., `version: "1.0"`).

## 2. Backup Current State
- Copy `SKILL.md` to `SKILL-v[CURRENT_VERSION].md`.
- Example: `cp SKILL.md SKILL-v1.0.md`.

## 3. Prepare New Version
- Calculate the incremental version (e.g., `1.0` -> `1.1`).
- Create `SKILL-v[NEW_VERSION].md` with the proposed changes.
- Update the `version` field in the frontmatter of the new file.

## 4. Architectural Validation
- Compare `SKILL-v[NEW_VERSION].md` against `SKILL-v[CURRENT_VERSION].md`.
- Check for:
  - Contradictions with "Golden Rules" in `AGENTS.md`.
  - Loss of critical context.
  - Regression in architectural standards.
  - "AI Sludge" (mediocre or redundant explanations).

## 5. Promotion
- If the validation passes, copy the content of `SKILL-v[NEW_VERSION].md` to `SKILL.md`.
- The version history remains in the ignored `-v*.md` files for local recovery if needed.

## 6. Final Sync
- After updating `SKILL.md`, ensure the `skill-registry.md` in `.atl/` is updated if necessary (e.g., if a new trigger or metadata field was added).
