/**
 * @file logger.types.ts
 * @description Shared logging abstractions for FrankJStein scripts.
 */

export abstract class IScriptLogger {
    abstract success(msg: string): void;
    abstract error(msg: string): void;
    abstract info(msg: string): void;
    abstract warn?(msg: string): void;
}
