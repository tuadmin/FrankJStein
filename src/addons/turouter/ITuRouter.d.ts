import type { RouteMatch, RouteParams, NavigationGuard, RouterOptions } from "./types";
import type { GroupUrl } from "./GroupUrl";
/**
 * Abstract contract for any Router implementation in FrankJStein.
 * Provides an agnostic interface for route registration and resolution.
 *
 * @es Contrato abstracto para cualquier implementación de Router en FrankJStein.
 * Proporciona una interfaz agnóstica para el registro y resolución de rutas.
 */
export abstract class ITuRouter {
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
