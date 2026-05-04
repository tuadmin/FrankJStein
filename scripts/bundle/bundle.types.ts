/**
 * @file bundle.types.ts
 * @description Abstractions for the AI Documentation Bundling Strategy.
 */
import { IScriptLogger } from "../shared/logger.types.ts";

export { IScriptLogger };

/**
 * Interface for parsing the Sovereign Skill Registry.
 */
export abstract class IRegistryParser {
    /**
     * Extracts ordered paths from the registry.
     * @throws {Error} If the registry format is invalid.
     */
    abstract getOrderedPaths(path: string): string[];
}

/**
 * Interface for orchestrating the documentation bundling.
 */
export abstract class IBundleService {
    /**
     * Executes the bundling logic.
     */
    abstract run(): Promise<void>;
}

/**
 * Global configuration for the bundler.
 */
export const BUNDLE_CONFIG = {
    ROOT: process.cwd(),
    DOCS_DIR: "docs",
    SKILLS_DIR: ".agents/skills",
    WORKFLOWS_DIR: ".agents/workflows",
    REGISTRY_PATH: ".atl/skill-registry.md",
    OUTPUT_FULL: "llms-full.txt",
    OUTPUT_INDEX: "llms.txt"
} as const;
