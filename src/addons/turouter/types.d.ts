/**
 * Generic interface for reactive objects (Duck Typing for Signals).
 * This decouples the router from specific reactivity implementations.
 *
 * @es Interfaz genérica para objetos reactivos (Duck Typing para Signals).
 * Esto desacopla el enrutador de implementaciones específicas de reactividad.
 */
export interface ReactiveNode<T = unknown> {
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
export interface RouteMatch<T = unknown> {
    handler: T;
    params: Record<string, string>;
}

/**
 * Type utility to extract parameters from a route generator function.
 *
 * @es Utilidad de tipos para extraer los parámetros de una función constructora de ruta.
 */
export type RouteParams<T extends (args: any) => string> = Parameters<T>[0];

/**
 * Represents a navigation guard function.
 *
 * @es Representa una función de guardia de navegación.
 * @param to The target path. / La ruta de destino.
 * @param from The current path. / La ruta actual.
 * @returns boolean, string, or Promise. Return false to abort, or a string to redirect. / Retorna false para abortar, o un string para redireccionar.
 */
export type NavigationGuard = (
    to: string,
    from: string
) => boolean | string | Promise<boolean | string>;

/**
 * Options passed to the router during resolution or navigation.
 *
 * @es Opciones pasadas al enrutador durante la resolución o navegación.
 */
export interface RouterOptions {
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
