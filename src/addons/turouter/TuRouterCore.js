/**
 * @file TuRouterCore.js
 * @description Orquestador de enrutamiento agnóstico.
 * Delega el matching al Pathfinder para permitir intercambiar algoritmos.
 */

import { ITuRouter } from "./ITuRouter.js";
import { TuPathfinder } from "./TuPathfinder.js";

export class TuRouterCore extends ITuRouter {
    #guards = [];

    constructor(pathfinder = new TuPathfinder()) {
        super();
        this.pathfinder = pathfinder;
    }

    add(pathOrFn, handler) {
        let path = typeof pathOrFn === "function" ? pathOrFn() : pathOrFn;
        if (path && typeof path === "object" && typeof path.toString === "function") {
            path = path.toString();
        }
        this.pathfinder.insert(path, handler);
    }

    /**
     * @param {string | any} prefix
     * @param {Function} callback
     */
    group(prefix, callback) {
        this.pathfinder.insertLazy(prefix, callback);
    }

    resolve(path, options = {}) {
        return this.pathfinder.find(path, options);
    }

    beforeEach(guard) {
        this.#guards.push(guard);
    }

    /**
     * Ejecuta los guards registrados secuencialmente.
     * @param {string} to
     * @param {string} from
     * @returns {Promise<boolean | string>} true si la navegación puede proceder, false si fue abortada, o un string para redireccionar
     */
    async runGuards(to, from) {
        for (const guard of this.#guards) {
            const result = await guard(to, from);
            if (result === false) return false;
            if (typeof result === "string") return result; // Redirect
        }
        return true;
    }
}
