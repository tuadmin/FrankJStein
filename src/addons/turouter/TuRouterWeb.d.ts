import type { ReactiveNode, RouteParams, NavigationGuard, RouterOptions } from "./types";
import { TuRouterCore } from "./TuRouterCore";
import { ITuRouterWeb } from "./ITuRouterWeb";
import { TuPathfinder } from "./TuPathfinder";

/**
 * TuRouterWeb: The orchestrator for the Web.
 * Implements the stateful behavior required for SPAs.
 *
 * @es TuRouterWeb: El orquestador para la Web.
 * Implementa el comportamiento stateful requerido para SPAs.
 */
export class TuRouterWeb extends TuRouterCore implements ITuRouterWeb {
    constructor(config?: { adapters?: RouterAdapter[]; pathfinder?: TuPathfinder; base?: string });

    /**
     * Base path for the application.
     * @es El path base de la aplicación.
     */
    public readonly base: string;

    /**
     * Reactive signal containing the current browser path.
     * @es Señal reactiva con el path actual del navegador.
     */
    public readonly currentPath: ReactiveNode<string>;

    /**
     * Reactive signal containing the current route parameters.
     * @es Señal reactiva con los parámetros de la ruta actual.
     */
    public readonly params: ReactiveNode<Record<string, string>>;

    currentParams<T extends (args: any) => string>(routeFn?: T): RouteParams<T>;
    currentParams(): Record<string, string>;

    getSlot<T = unknown>(name: string, options?: { persistent?: boolean }): ReactiveNode<T>;

    navigate(path: string, options?: RouterOptions): Promise<void>;

    beforeEach(guard: NavigationGuard): void;

    /**
     * Cleans up all subscriptions and event listeners.
     * @es Limpia todas las suscripciones y event listeners.
     */
    dispose(): void;
}

export abstract class RouterAdapter {
    constructor(prefix?: string);
    prefix: string;
    abstract getCurrentPath(): string;
    abstract updateUrl(path: string): void;
    matches(path: string): boolean;
}

export class HistoryAdapter extends RouterAdapter {
    getCurrentPath(): string;
    updateUrl(path: string): void;
    matches(path: string): boolean;
}

export class HashAdapter extends RouterAdapter {
    getCurrentPath(): string;
    updateUrl(path: string): void;
    matches(path: string): boolean;
}

export class QueryAdapter extends RouterAdapter {
    getCurrentPath(): string;
    updateUrl(path: string): void;
    matches(path: string): boolean;
}
