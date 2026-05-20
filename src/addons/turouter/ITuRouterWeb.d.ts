import type { ReactiveNode, RouteParams } from "./types";
import { ITuRouter } from "./ITuRouter";

/**
 * Abstract contract for Web-specific routing implementations.
 * It extends ITuRouter adding stateful features (Signals) for browser environments.
 *
 * @es Contrato abstracto para implementaciones de enrutamiento específicas de Web.
 * Extiende de ITuRouter añadiendo características stateful (Signals) para el navegador.
 */
export abstract class ITuRouterWeb extends ITuRouter {
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
