/**
 * @file registry-parser.ts
 * @description Hardened parser for the Sovereign Skill Registry.
 */
import { existsSync, readFileSync } from "node:fs";
import { IRegistryParser } from "./bundle.types.ts";

export class SovereignRegistryParser extends IRegistryParser {
    /** @inheritdoc */
    getOrderedPaths(registryPath: string): string[] {
        if (!existsSync(registryPath)) {
            throw new Error(`CRITICAL: Sovereign Registry not found at ${registryPath}. Check your .atl directory.`);
        }

        const content = readFileSync(registryPath, "utf-8");
        const lines = content.split("\n");
        
        // 1. Mandatory Section Validation
        const sectionIndex = lines.findIndex(l => l.trim() === "## User Skills");
        if (sectionIndex === -1) {
            throw new Error("MALFORMED REGISTRY: Missing '## User Skills' section. Architectural sovereignty is at risk!");
        }

        // 2. Mandatory Table Validation
        const tableHeaderIndex = lines.findIndex((l, i) => i > sectionIndex && l.includes("| Trigger | Skill | Path |"));
        if (tableHeaderIndex === -1) {
            throw new Error("MALFORMED REGISTRY: Missing skills table under '## User Skills'. Any IA touching this must be punished.");
        }

        const orderedPaths: string[] = [];
        // Start parsing after the header separator (|---|---|---|)
        for (let i = tableHeaderIndex + 2; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line.startsWith("|")) break; // End of table

            const columns = line.split("|").map(col => col.trim());
            if (columns.length >= 4 && columns[3].endsWith(".md")) {
                orderedPaths.push(columns[3]);
            }
        }

        if (orderedPaths.length === 0) {
            throw new Error("EMPTY REGISTRY: No skills found in the table. Documentation bundle would be incomplete.");
        }

        return orderedPaths;
    }
}
