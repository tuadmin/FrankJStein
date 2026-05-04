/**
 * @file bundle-engine.ts
 * @description Core orchestration engine for documentation bundling.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
// @ts-expect-error
import { TuLazyInject } from "../../dist/frankjstein.js";
import { BUNDLE_CONFIG, IBundleService, IRegistryParser, IScriptLogger } from "./bundle.types.ts";

export class BundleEngine extends IBundleService {
    /** Injected dependencies using the Lazy Pattern */
    private readonly parser = TuLazyInject<IRegistryParser>(() => IRegistryParser);
    private readonly logger = TuLazyInject<IScriptLogger>(() => IScriptLogger);

    private fullPayload: string =
        `# FrankJStein: Sovereign AI Context\n\n> Comprehensive architectural patterns and rules for AI Agents.\n\n`;
    private navigationIndex: string =
        `# FrankJStein AI Index\n\n> Global roadmap for LLMs and Agentic AI.\n\n`;

    /** @inheritdoc */
    async run(): Promise<void> {
        this.logger.info("Initiating Sovereign AI Documentation Orchestration...");

        const orderedPaths = this.parser.getOrderedPaths(
            join(BUNDLE_CONFIG.ROOT, BUNDLE_CONFIG.REGISTRY_PATH)
        );

        this.logger.info(
            `Sovereign sequence detected (${orderedPaths.length} skills). Building context...`
        );
        this.processSkills(orderedPaths);

        /** Phase 2: Workflow Orchestration */
        this.processWorkflows();

        /** Phase 3: Documentation Integration */
        this.processGeneralDocs();

        /** Phase 4: Metadata Persistence */
        this.finalize();
    }

    private processSkills(orderedPaths: string[]): void {
        this.fullPayload += `\n# SECTION: AI SKILLS (ENGINEERING STANDARDS)\n`;
        this.fullPayload += `> Technical rules and non-negotiable architectural patterns.\n\n`;
        this.navigationIndex += `\n## 🤖 AI Skills (Architectural Rules)\n\n`;

        const processedSet = new Set<string>();

        // A. Add skills from registry
        for (const path of orderedPaths) {
            const fullPath = join(BUNDLE_CONFIG.ROOT, path);
            if (existsSync(fullPath)) {
                this.addAssetToBundle(fullPath, false);
                processedSet.add(path);
            }
        }

        // B. Check for orphan skills in the directory (Hardened Integrity Check)
        const discovered = this.discoverFiles(join(BUNDLE_CONFIG.ROOT, BUNDLE_CONFIG.SKILLS_DIR));
        const orphans = discovered.filter((p) => {
            const rel = relative(BUNDLE_CONFIG.ROOT, p).replace(/\\/g, "/");
            return !processedSet.has(rel) && p.endsWith("SKILL.md");
        });

        if (orphans.length > 0) {
            this.logger.error(
                `INTEGRITY VIOLATION: Discovered ${orphans.length} skills not present in the registry.`
            );
            orphans.forEach((o) => {
                this.logger.error(`Missing from Registry: ${relative(BUNDLE_CONFIG.ROOT, o)}`);
            });
            throw new Error(
                "Registry Integrity Failure: All discovered skills must be explicitly registered in .atl/skill-registry.md"
            );
        }
    }

    private processWorkflows(): void {
        const workflowAssets = this.discoverFiles(
            join(BUNDLE_CONFIG.ROOT, BUNDLE_CONFIG.WORKFLOWS_DIR)
        );

        this.fullPayload += `\n# SECTION: WORKFLOWS (OPERATIONAL PROTOCOLS)\n`;
        this.fullPayload += `> Deterministic guides for maintenance, testing, and deployment.\n\n`;
        this.navigationIndex += `\n## ⚙️ Workflows (Sovereign Procedures)\n\n`;

        for (const assetPath of workflowAssets) {
            this.addAssetToBundle(assetPath, true);
        }
    }

    private processGeneralDocs(): void {
        const docsAssets = this.discoverFiles(join(BUNDLE_CONFIG.ROOT, BUNDLE_CONFIG.DOCS_DIR));

        this.fullPayload += `\n# SECTION: DOCUMENTATION (DOMAIN KNOWLEDGE)\n`;
        this.fullPayload += `> Comprehensive framework manuals and usage guides.\n\n`;
        this.navigationIndex += `\n## 📚 Core Documentation (Aesthetics & Logic)\n\n`;

        for (const assetPath of docsAssets) {
            this.addAssetToBundle(assetPath, true);
        }
    }

    private addAssetToBundle(fullPath: string, isDoc: boolean): void {
        const rawContent = readFileSync(fullPath, "utf-8");
        const relPath = relative(BUNDLE_CONFIG.ROOT, fullPath).replace(/\\/g, "/");

        let title = basename(fullPath);
        if (!isDoc) {
            const match = rawContent.match(/name: (.*)/);
            if (match) title = match[1];
        } else {
            const match = rawContent.match(/^# (.*)/m);
            if (match) title = match[1];
        }

        this.navigationIndex += `- [${title}](/${relPath})\n`;
        this.fullPayload += `\n---\n# Source: ${relPath}\n\n${rawContent}\n`;
        this.logger.success(`Asset integrated: ${title} (${relPath})`);
    }

    private discoverFiles(dir: string): string[] {
        const results: string[] = [];
        const walk = (currentDir: string) => {
            if (!existsSync(currentDir)) return;
            const assets = readdirSync(currentDir).sort();
            for (const asset of assets) {
                const fullPath = join(currentDir, asset);
                if (statSync(fullPath).isDirectory()) {
                    walk(fullPath);
                } else if (asset.endsWith(".md")) {
                    results.push(fullPath);
                }
            }
        };
        walk(dir);
        return results;
    }

    private finalize(): void {
        this.navigationIndex += `\n## ⚡ Sovereign Payload\n\n- [llms-full.txt](/${BUNDLE_CONFIG.OUTPUT_FULL}): The complete FrankJStein knowledge base.\n`;

        writeFileSync(join(BUNDLE_CONFIG.ROOT, BUNDLE_CONFIG.OUTPUT_FULL), this.fullPayload);
        writeFileSync(join(BUNDLE_CONFIG.ROOT, BUNDLE_CONFIG.OUTPUT_INDEX), this.navigationIndex);

        console.log(`✅ Success! Sovereign AI artifacts generated.`);
        console.log(`  - Manifest: ${BUNDLE_CONFIG.OUTPUT_INDEX}`);
        console.log(
            `  - Payload: ${BUNDLE_CONFIG.OUTPUT_FULL} (${(this.fullPayload.length / 1024).toFixed(2)} KB)`
        );
    }
}
