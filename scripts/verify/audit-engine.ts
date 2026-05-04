/**
 * @file audit-engine.ts
 * @description The core validation logic for the FrankJStein ecosystem.
 * Implements the "Snake Eating Itself" pattern: using the framework's own DI kernel
 * to verify its architectural integrity.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { TuContainer as SovereignContainer, TuLazyInject } from "../../dist/frankjstein.js";
import { AUDIT_CONFIG, IAuditLogger, IAuditService } from "./audit.types.ts";

/**
 * The Sovereign Audit Engine.
 * Responsible for verifying version synchronization, skill consistency,
 * and adherence to the "Blue-Green" documentation workflow.
 */
export class AuditEngine extends IAuditService {
    /**
     * Sovereign Dependency Injection using the Lazy Pattern.
     * The logger is NOT resolved until it is accessed for the first time.
     * This prevents circular dependency issues and ensures the container is ready.
     * @private
     */
    private readonly logger = TuLazyInject<IAuditLogger>(() => IAuditLogger);

    /** Internal counter to track total audit violations. */
    private errorCount: number = 0;

    /** @inheritdoc */
    async run(): Promise<boolean> {
        this.logger.info("Initiating FrankJStein Sovereign Audit...");

        // Load critical ecosystem files
        const agentsContent = this.safeReadFile(join(AUDIT_CONFIG.ROOT, AUDIT_CONFIG.AGENTS_PATH));
        const registryContent = this.safeReadFile(
            join(AUDIT_CONFIG.ROOT, AUDIT_CONFIG.REGISTRY_PATH)
        );
        const pkgContent = this.safeReadFile(join(AUDIT_CONFIG.ROOT, AUDIT_CONFIG.PKG_PATH));

        // Early exit if infrastructure files are missing
        if (this.errorCount > 0) return false;

        const pkg = JSON.parse(pkgContent);

        /** Phase 1: Semantic Version Synchronization */
        this.validateVersionSynchronization(pkg.version, agentsContent);

        /** Phase 2: Skill Ecosystem & Blue-Green Workflow Audit */
        this.auditSkillEcosystem(agentsContent, registryContent);

        console.log("\n-------------------------------------------");

        if (this.errorCount === 0) {
            this.logger.success("FRANKJSTEIN AUDIT PASSED (Sovereign Engine)");
            return true;
        } else {
            this.logger.error(`AUDIT FAILED: Detected ${this.errorCount} structural violations.`);
            return false;
        }
    }

    /**
     * Safely reads a file from the filesystem.
     * @private
     */
    private safeReadFile(filePath: string): string {
        if (!existsSync(filePath)) {
            this.logger.error(`Critical file missing: ${filePath}`);
            this.errorCount++;
            return "";
        }
        return readFileSync(filePath, "utf-8");
    }

    /**
     * Ensures that AGENTS.md is synchronized with the primary package version.
     * @private
     */
    private validateVersionSynchronization(pkgVersion: string, agentsContent: string): void {
        const canonicalVersion = pkgVersion.split("-")[0]; // Strip pre-release suffixes
        const match = agentsContent.match(/\(v(\d+\.\d+\.\d+)\)/);
        const agentsVersion = match ? match[1] : null;

        if (!agentsVersion) {
            this.logger.error("Failed to detect version pattern (vX.Y.Z) in AGENTS.md manifesto.");
            this.errorCount++;
        } else if (agentsVersion !== canonicalVersion) {
            this.logger.error(
                `Architectural Mismatch: package.json is ${canonicalVersion} but AGENTS.md is ${agentsVersion}.`
            );
            this.errorCount++;
        } else {
            this.logger.success(`Version Synchronization Verified: v${agentsVersion}`);
        }
    }

    /**
     * Audits the entire skills ecosystem for indexing, leaks, and backup compliance.
     * @private
     */
    private auditSkillEcosystem(agentsContent: string, registryContent: string): void {
        const skillsRoot = join(AUDIT_CONFIG.ROOT, AUDIT_CONFIG.SKILLS_DIR);
        const skillModules = readdirSync(skillsRoot, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);

        this.logger.info(
            `Auditing ${skillModules.length} skill modules and 'Blue-Green' backup policy compliance...`
        );

        skillModules.forEach((moduleName) => {
            const moduleDir = join(skillsRoot, moduleName);
            const mainSkillFile = join(moduleDir, "SKILL.md");
            const relativePath = relative(AUDIT_CONFIG.ROOT, mainSkillFile);

            // Validation A: Core Asset Existence
            if (!existsSync(mainSkillFile)) {
                this.logger.error(`Module '${moduleName}' is missing the primary SKILL.md asset.`);
                this.errorCount++;
                return;
            }

            // Validation B: Global Indexing (AGENTS.md)
            if (!agentsContent.includes(relativePath)) {
                this.logger.error(
                    `Module '${moduleName}' is not indexed in the Sovereign Manifesto (AGENTS.md).`
                );
                this.errorCount++;
            }

            // Validation C: Blue-Green Workflow Compliance
            const directoryFiles = readdirSync(moduleDir);
            const versionedBackups = directoryFiles
                .filter((f) => f.startsWith("SKILL-v") && f.endsWith(".md"))
                .sort((a, b) => b.localeCompare(a, undefined, { numeric: true })); // Descending

            if (versionedBackups.length > 0) {
                // If backups exist, SKILL.md must reflect a version >= the latest backup
                const latestBackup = versionedBackups[0];
                const latestBackupVersion = latestBackup.match(/v(\d+\.\d+)/)?.[1];
                const currentSkillContent = readFileSync(mainSkillFile, "utf-8");
                const currentVersion = currentSkillContent.match(
                    /version: ["'](\d+\.\d+)["']/
                )?.[1];

                if (
                    currentVersion &&
                    latestBackupVersion &&
                    parseFloat(currentVersion) < parseFloat(latestBackupVersion)
                ) {
                    this.logger.error(
                        `WORKFLOW VIOLATION: '${moduleName}' SKILL.md (v${currentVersion}) is older than its latest backup (${latestBackup}).`
                    );
                    this.errorCount++;
                } else {
                    this.logger.success(
                        `Skill Module '${moduleName}' verified (Blue-Green Sync: OK).`
                    );
                }
            } else {
                // It's a "Greenfield" skill or no backups yet — allowed per user rules.
                this.logger.success(`Skill Module '${moduleName}' verified (Greenfield: OK).`);
            }

            // Validation D: Environmental Leak Prevention (Multi-platform)
            // Checks for common absolute path patterns in macOS, Linux, and Windows to prevent sensitive data leaks.
            const content = readFileSync(mainSkillFile, "utf-8");
            const absolutePathRegex = /(\/Users\/|\/home\/|\/Volumes\/|[a-zA-Z]:\\Users\\)/i;

            if (absolutePathRegex.test(content)) {
                this.logger.error(
                    `Security Violation: Module '${moduleName}' contains absolute local paths. Use relative paths instead to protect sensitive data.`
                );
                this.errorCount++;
            }
        });
    }
}
