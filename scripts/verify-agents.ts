/**
 * @file verify-agents.ts
 * @description Sovereign Auditor Entry Point.
 * Orchestrates the self-validation of the FrankJStein ecosystem using its own
 * Dependency Injection kernel.
 *
 * "The snake that eats itself": Architectural integrity verified by the framework itself.
 */
import { TuContainer as DependencyInjection } from "../dist/frankjstein.js";
import { CliLogger as CliAuditLogger } from "./shared/cli-logger.ts";
import { IAuditLogger, IAuditService } from "./verify/audit.types.ts";
import { AuditEngine } from "./verify/audit-engine.ts";

/**
 * Bootstraps the Sovereign Audit Strategy.
 * Configures the Dependency Injection container and executes the orchestration engine.
 */
async function bootstrap(): Promise<void> {
    try {
        /**
         * 1. Service Registration Phase
         * Bind abstractions (IAuditLogger, IAuditService) to their concrete implementations.
         * This allows the application to remain decoupled from the specific logging/auditing logic.
         */
        DependencyInjection.addSingleton(IAuditLogger, CliAuditLogger);
        DependencyInjection.addSingleton(IAuditService, AuditEngine);

        /**
         * 2. Execution Phase
         * Resolve the primary auditor service from the container.
         * This is where "Inversion of Control" happens: the container provides the implementation.
         */
        const auditor = DependencyInjection.resolve(IAuditService);
        const isConsistent = await auditor.run();

        // Signal success/failure to the parent environment
        process.exit(isConsistent ? 0 : 1);
    } catch (error) {
        console.error("FATAL: Sovereign Audit Engine failed during bootstrap sequence.");
        console.error(error);
        process.exit(1);
    }
}

// Ignition
bootstrap();
