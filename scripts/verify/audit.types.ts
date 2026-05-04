/**
 * @file audit.types.ts
 * @description Sovereign audit abstractions for the FrankJStein ecosystem.
 * Defines the contracts and protocols that govern the framework's self-verification.
 *
 * @author Gemini Antigravity (Sovereign Architect)
 * @version 0.5.3
 */

import { IScriptLogger as IAuditLogger } from "../shared/logger.types.ts";

export { IAuditLogger };

/**
 * Interface representing the primary orchestration engine for the documentation audit.
 * Coordinates the validation of versions, skills, and architectural patterns.
 */
export abstract class IAuditService {
    /**
     * Executes the full suite of sovereign audits.
     * @returns {Promise<boolean>} True if the ecosystem is consistent, false otherwise.
     */
    abstract run(): Promise<boolean>;
}

/**
 * Shared configuration schema for the FrankJStein Audit Strategy.
 */
export const AUDIT_CONFIG = {
    ROOT: process.cwd(),
    AGENTS_PATH: "AGENTS.md",
    REGISTRY_PATH: ".atl/skill-registry.md",
    SKILLS_DIR: ".agents/skills",
    PKG_PATH: "package.json"
} as const;
