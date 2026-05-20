/**
 * @file ITuRouterWeb.js
 * @description Contrato abstracto para implementaciones de enrutamiento específicas de entornos reactivos (Web).
 */

import { ITuRouter } from "./ITuRouter.js";

export class ITuRouterWeb extends ITuRouter {
    /**
     * @returns {import('./index').ReactiveNode<string>}
     */
    get currentPath() {
        throw new Error("Not implemented");
    }

    /**
     * Obtiene el snapshot actual y sincrónico de los parámetros de ruta,
     * aislando la lectura del tracking reactivo.
     * @param {Function} [routeFn] - Función generadora opcional para inferencia de tipos en TypeScript.
     * @returns {Record<string, string>}
     */
    currentParams(routeFn) {
        throw new Error("Not implemented");
    }

    /**
     * Obtiene un slot reactivo para UI contextual (FAB, Header, etc).
     * Exclusivo de entornos Stateful (Navegador).
     * @param {string} name
     * @param {{ persistent?: boolean }} [options]
     * @returns {import('./index').ReactiveNode<unknown>}
     */
    getSlot(name, options) {
        throw new Error("Not implemented");
    }

    /**
     * Soporte de metaprogramación para permitir `router instanceof ITuRouterWeb` en runtime.
     * Devuelve true si el objeto implementa las Signals esperadas del contrato Web.
     * @param {Object} instance
     * @returns {boolean}
     */
    static [Symbol.hasInstance](instance) {
        if (!instance) return false;
        // Permite herencia nativa si en el futuro alguien extiende directamente de ITuRouterWeb
        if (ITuRouterWeb.prototype.isPrototypeOf(instance)) return true;

        // Duck Typing robusto: Es un router y cumple las firmas exclusivas de Web
        return (
            instance instanceof ITuRouter &&
            "currentPath" in instance &&
            "currentParams" in instance
        );
    }
}
