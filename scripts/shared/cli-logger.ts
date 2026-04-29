/**
 * @file cli-logger.ts
 * @description Shared CLI implementation of IScriptLogger.
 */
import { IScriptLogger } from "./logger.types.ts";

export class CliLogger extends IScriptLogger {
    success(msg: string): void { console.log(`  ✅ [OK]: ${msg}`); }
    error(msg: string): void { console.error(`  ❌ [ERROR]: ${msg}`); }
    info(msg: string): void { console.log(`  🔍 [INFO]: ${msg}`); }
    warn(msg: string): void { console.warn(`  ⚠️ [WARN]: ${msg}`); }
}
