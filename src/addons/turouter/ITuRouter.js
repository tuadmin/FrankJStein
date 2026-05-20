/**
 * @file ITuRouter.js
 * @description Contrato abstracto para implementaciones de enrutamiento en FrankJStein.
 */

export class ITuRouter {
    /**
     * Registra una nueva ruta.
     * @param {string} path
     * @param {any} handler
     */
    add(path, handler) {
        throw new Error("Not implemented");
    }

    /**
     * Define un grupo de rutas con prefijo común.
     * @param {string} prefix
     * @param {Function} callback
     */
    group(prefix, callback) {
        throw new Error("Not implemented");
    }

    /**
     * Resuelve una ruta y devuelve el manejador y los parámetros.
     * @param {string} path
     * @param {Object} [options]
     * @returns {{handler: unknown, params: Object}| Promise<{ handler: unknown; params: Object; }> | null}
     */
    resolve(path, options) {
        throw new Error("Not implemented");
    }

    /**
     * Registra un guard de navegación global.
     * @param {(to: string, from: string) => boolean | Promise<boolean>} guard
     */
    beforeEach(guard) {
        throw new Error("Not implemented");
    }

    /**
     * Navega a una ruta específica.
     * @param {string} path
     * @param {Object} [options]
     */
    navigate(path, options) {
        throw new Error("Not implemented");
    }
}
