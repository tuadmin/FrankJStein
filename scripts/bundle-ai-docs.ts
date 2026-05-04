/**
 * @file bundle-ai-docs.ts
 * @description Sovereign AI Documentation Bundler Entry Point.
 * Bootstraps the bundling strategy using the FrankJStein IoC Kernel.
 */
import { TuContainer as DependencyInjection } from "../dist/frankjstein.js";
import { IBundleService, IRegistryParser } from "./bundle/bundle.types.ts";
import { BundleEngine } from "./bundle/bundle-engine.ts";
import { SovereignRegistryParser } from "./bundle/registry-parser.ts";
import { CliLogger } from "./shared/cli-logger.ts";
import { IScriptLogger } from "./shared/logger.types.ts";

/**
 * Bootstraps the Bundling Strategy.
 * Configures the Sovereign IoC Container and executes the bundle engine.
 */
async function bootstrap(): Promise<void> {
    try {
        /**
         * 1. Service Registration
         * We bind our hardened parser, our orchestration engine, and our shared logger.
         */
        DependencyInjection.addSingleton(IScriptLogger, CliLogger);
        DependencyInjection.addSingleton(IRegistryParser, SovereignRegistryParser);
        DependencyInjection.addSingleton(IBundleService, BundleEngine);

        /**
         * 2. Execution
         * Resolve the service and initiate the bundling sequence.
         */
        const bundler = DependencyInjection.resolve(IBundleService);
        await bundler.run();
    } catch (error) {
        console.error("FATAL: AI Documentation Bundler failed during bootstrap sequence.");
        if (error instanceof Error) {
            console.error(`Reason: ${error.message}`);
        }
        process.exit(1);
    }
}

// Ignition
bootstrap();
