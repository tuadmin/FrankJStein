import type { RouteMatch, RouteParams, NavigationGuard, RouterOptions } from "./types";
import type { GroupUrl } from "./GroupUrl";
import { ITuRouter } from "./ITuRouter";
import { TuPathfinder } from "./TuPathfinder";

/**
 * Agnostic core orchestrator for routing.
 * Delegates path matching to TuPathfinder.
 *
 * @es Orquestador de enrutamiento agnóstico.
 * Delega el matching al Pathfinder para permitir intercambiar algoritmos.
 */
export class TuRouterCore extends ITuRouter {
    constructor(pathfinder?: TuPathfinder);
    add<T extends (args: any) => string>(
        routeFn: T,
        handler: (params: RouteParams<T>) => unknown
    ): void;
    add(path: string, handler: (params: Record<string, string>) => unknown): void;
    group(
        prefix: string | GroupUrl,
        callback: (
            add: (path: string | Function, handler: unknown) => void,
            options?: RouterOptions
        ) => void | Promise<void>
    ): void;
    resolve(path: string, options?: RouterOptions): Promise<RouteMatch | null> | RouteMatch | null;
    navigate(path: string, options?: RouterOptions): Promise<void>;
    beforeEach(guard: NavigationGuard): void;
}
