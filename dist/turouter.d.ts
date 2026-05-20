/**
 * Generic interface for reactive objects (Duck Typing for Signals).
 * This decouples the router from specific reactivity implementations.
 *
 * @es Interfaz genérica para objetos reactivos (Duck Typing para Signals).
 * Esto desacopla el enrutador de implementaciones específicas de reactividad.
 */
interface ReactiveNode<T = unknown> {
    value: T;
    get(): T;
    set(newValue: T): void;
    subscribe(listener: (newValue: T, oldValue: T) => void): () => void;
}

/**
 * Represents the result of a route resolution.
 *
 * @es Representa el resultado de una resolución de ruta.
 */
interface RouteMatch<T = unknown> {
    handler: T;
    params: Record<string, string>;
}

/**
 * Type utility to extract parameters from a route generator function.
 *
 * @es Utilidad de tipos para extraer los parámetros de una función constructora de ruta.
 */
type RouteParams<T extends (args: any) => string> = Parameters<T>[0];

/**
 * Represents a navigation guard function.
 *
 * @es Representa una función de guardia de navegación.
 * @param to The target path. / La ruta de destino.
 * @param from The current path. / La ruta actual.
 * @returns boolean, string, or Promise. Return false to abort, or a string to redirect. / Retorna false para abortar, o un string para redireccionar.
 */
type NavigationGuard = (to: string, from: string) => boolean | string | Promise<boolean | string>;

/**
 * Options passed to the router during resolution or navigation.
 *
 * @es Opciones pasadas al enrutador durante la resolución o navegación.
 */
interface RouterOptions {
    /**
     * AbortSignal to cancel lazy-loading operations if the user navigates away early.
     * @es AbortSignal para cancelar operaciones de carga diferida si el usuario navega a otra parte prematuramente.
     */
    signal?: AbortSignal;

    /**
     * Forces navigation even if the route match is not initially found (useful for programmatic overrides).
     * @es Fuerza la navegación incluso si la coincidencia de ruta no se encuentra inicialmente.
     */
    force?: boolean;

    [key: string]: unknown;
}

type ExtractRouteParams<T extends string> = T extends `${string}{${infer Param}}${infer Rest}`
    ? { [K in Param | keyof ExtractRouteParams<Rest>]: string }
    : {};

type MergeParams<Prefix extends string, SubRoute> = SubRoute extends string
    ? ExtractRouteParams<Prefix> & ExtractRouteParams<SubRoute>
    : SubRoute extends (params: infer P) => any
      ? ExtractRouteParams<Prefix> & (P extends undefined ? {} : P)
      : ExtractRouteParams<Prefix>;

type Simplify<T> = { [K in keyof T]: T[K] };

type ParamsArg<Prefix extends string, SubRoute> =
    {} extends Simplify<MergeParams<Prefix, SubRoute>>
        ? [params?: Simplify<MergeParams<Prefix, SubRoute>>]
        : [params: Simplify<MergeParams<Prefix, SubRoute>>];

declare class GroupUrl {
    prefix: string;
    subRoutes: Record<string, string | ((params: any) => string)>;
    constructor(prefix: string, subRoutes: Record<string, string | ((params: any) => string)>);
    toString(): string;
    [key: string]: any;
}

declare function createGroupUrl<
    const Prefix extends string,
    const T extends Record<string, string | ((params: any) => string)>
>(
    prefix: Prefix,
    subRoutes: T
): GroupUrl & {
    [K in keyof T]: (...args: ParamsArg<Prefix, T[K]>) => string;
};

/**
 * Abstract contract for any Router implementation in FrankJStein.
 * Provides an agnostic interface for route registration and resolution.
 *
 * @es Contrato abstracto para cualquier implementación de Router en FrankJStein.
 * Proporciona una interfaz agnóstica para el registro y resolución de rutas.
 */
declare abstract class ITuRouter {
    /**
     * Registers a new route in the system using a generator function.
     * Automatically infers parameters for code completion.
     *
     * @es Registra una nueva ruta en el sistema usando una función constructora.
     * Infiere automáticamente los parámetros para el autocompletado.
     * @example
     * router.add(({ id = '0' }) => `/users/${id}`, (params) => renderUser(params.id));
     */
    abstract add<T extends (args: any) => string>(
        routeFn: T,
        handler: (params: RouteParams<T>) => unknown
    ): void;

    /**
     * Registers a new route in the system using a string pattern.
     *
     * @es Registra una nueva ruta en el sistema usando un string.
     * @example
     * router.add('/about', () => renderAbout());
     */
    abstract add(path: string, handler: (params: Record<string, string>) => unknown): void;

    /**
     * Defines a group of routes that share a common prefix.
     *
     * @es Define un grupo de rutas que comparten un prefijo.
     * @example
     * router.group('/api', (add) => {
     *   add('/users', handleUsers);
     * });
     * // with GroupUrl
     * const URL_PAGES = createGroupUrl("/pages/{user}",{ SETTINGS:()=>'/settings' })
     * router.group(URL_PAGES, (add) => {
     *   add(URL_PAGES.SETTINGS, handleUsersSettings);
     * }); // for navigate use router.navigate(URL_PAGES.SETTINGS())
     *
     *
     */
    abstract group(
        prefix: string | GroupUrl,
        callback: (
            add: (path: string | Function, handler: unknown) => void,
            options?: RouterOptions
        ) => void | Promise<void>
    ): void;

    /**
     * Resolves a path and returns the associated handler and parameters.
     *
     * @es Resuelve un path y devuelve el manejador asociado y sus parámetros.
     * @example
     * const match = await router.resolve('/users/123');
     * if (match) console.log(match.params.id); // '123'
     */
    abstract resolve(
        path: string,
        options?: RouterOptions
    ): Promise<RouteMatch | null> | RouteMatch | null;

    /**
     * Executes logical navigation to a route.
     *
     * @es Ejecuta la navegación lógica a una ruta.
     */
    abstract navigate(path: string, options?: RouterOptions): Promise<void>;

    /**
     * Registers a global navigation guard to be executed before each route change.
     *
     * @es Registra un guard global de navegación que se ejecuta antes de cada cambio de ruta.
     * @param guard The guard function. If it returns false or a Promise resolving to false, the navigation is aborted.
     * @example
     * router.beforeEach((to, from) => {
     *   if (to.startsWith('/admin') && !isAuthenticated) return false;
     *   return true;
     * });
     */
    abstract beforeEach(guard: NavigationGuard): void;
}

/**
 * Abstract contract for Web-specific routing implementations.
 * It extends ITuRouter adding stateful features (Signals) for browser environments.
 *
 * @es Contrato abstracto para implementaciones de enrutamiento específicas de Web.
 * Extiende de ITuRouter añadiendo características stateful (Signals) para el navegador.
 */
declare abstract class ITuRouterWeb extends ITuRouter {
    /**
     * Reactive signal containing the current path.
     * @es Señal reactiva con el path actual.
     */
    abstract readonly currentPath: ReactiveNode<string>;

    /**
     * Base path for the application.
     * @es El path base de la aplicación.
     */
    abstract readonly base: string;

    /**
     * Retrieves the current, synchronous snapshot of route parameters,
     * isolating the read from reactive tracking.
     *
     * @es Obtiene el snapshot actual de los parámetros de ruta, aislando la lectura del tracking reactivo.
     * @example
     * const params = router.currentParams(myRouteFn);
     */
    abstract currentParams<T extends (args: any) => string>(routeFn?: T): RouteParams<T>;
    abstract currentParams(): Record<string, string>;

    /**
     * Retrieves a reactive slot (Signal) for contextual UI communication.
     * Exclusive to Stateful environments (Browser).
     *
     * @es Obtiene un slot reactivo (Signal) para comunicación contextual.
     * Exclusivo de entornos Stateful (Navegador).
     * @example
     * const fabSlot = router.getSlot('fab');
     * fabSlot.set(myComponent);
     */
    abstract getSlot<T = unknown>(
        name: string,
        options?: { persistent?: boolean }
    ): ReactiveNode<T>;
}

/**
 * Agnostic path resolution engine based on a Trie graph.
 * Supports static paths, dynamic segments (/:id), and wildcards (/*).
 *
 * @es Motor de resolución agnóstico basado en un grafo Trie.
 * Soporta rutas estáticas, segmentos dinámicos (/:id) y comodines (/*).
 */
declare class TuPathfinder {
    /**
     * Inserts a static route and its handler into the graph.
     * @es Inserta una ruta estática y su manejador en el grafo.
     */
    insert(path: string, handler: unknown): void;

    /**
     * Registers a lazy loader for a path prefix.
     * @es Registra un cargador perezoso para un prefijo de ruta.
     */
    insertLazy(prefix: string, loader: Function): void;

    /**
     * Finds a matching route for the given path.
     * @es Encuentra una ruta coincidente para el path dado.
     */
    find(path: string): RouteMatch | null;
}

/**
 * Agnostic core orchestrator for routing.
 * Delegates path matching to TuPathfinder.
 *
 * @es Orquestador de enrutamiento agnóstico.
 * Delega el matching al Pathfinder para permitir intercambiar algoritmos.
 */
declare class TuRouterCore extends ITuRouter {
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

/**
 * TuRouterWeb: The orchestrator for the Web.
 * Implements the stateful behavior required for SPAs.
 *
 * @es TuRouterWeb: El orquestador para la Web.
 * Implementa el comportamiento stateful requerido para SPAs.
 */
declare class TuRouterWeb extends TuRouterCore implements ITuRouterWeb {
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

declare abstract class RouterAdapter {
    constructor(prefix?: string);
    prefix: string;
    abstract getCurrentPath(): string;
    abstract updateUrl(path: string): void;
    matches(path: string): boolean;
}

declare class HistoryAdapter extends RouterAdapter {
    getCurrentPath(): string;
    updateUrl(path: string): void;
    matches(path: string): boolean;
}

declare class HashAdapter extends RouterAdapter {
    getCurrentPath(): string;
    updateUrl(path: string): void;
    matches(path: string): boolean;
}

declare class QueryAdapter extends RouterAdapter {
    getCurrentPath(): string;
    updateUrl(path: string): void;
    matches(path: string): boolean;
}

export {
    GroupUrl,
    HashAdapter,
    HistoryAdapter,
    ITuRouter,
    ITuRouterWeb,
    QueryAdapter,
    RouterAdapter,
    TuPathfinder,
    TuRouterCore,
    TuRouterWeb,
    createGroupUrl
};
export type {
    ExtractRouteParams,
    MergeParams,
    NavigationGuard,
    ParamsArg,
    ReactiveNode,
    RouteMatch,
    RouteParams,
    RouterOptions,
    Simplify
};
