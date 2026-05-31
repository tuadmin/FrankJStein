/**
 * @file TuRouterWeb.js
 * @description Implementación para Navegador con soporte de Adaptadores y Scaffold.
 */

import { createSignal, Disposable } from "../../../dist/frankjstein.js";
import { TuRouterCore } from "./TuRouterCore.js";

/**
 * Adaptadores para diferentes entornos de URL
 */
export class RouterAdapter {
    constructor(prefix) {
        this.prefix = prefix;
    }
    matches(path) {
        return path.startsWith(this.prefix);
    }
    getCurrentPath() {
        throw new Error("Method not implemented");
    }
    updateUrl(path) {
        throw new Error("Method not implemented");
    }
    replaceUrl(path) {
        throw new Error("Method not implemented");
    }
}

export class HistoryAdapter extends RouterAdapter {
    constructor(prefix = "/") {
        super(prefix);
    }
    getCurrentPath() {
        return window.location.pathname;
    }
    updateUrl(path) {
        window.history.pushState(null, "", path);
    }
    replaceUrl(path) {
        window.history.replaceState(null, "", path);
    }
}

export class HashAdapter extends RouterAdapter {
    constructor(prefix = "#/") {
        super(prefix);
    }
    getCurrentPath() {
        const hash = window.location.hash;
        return hash.startsWith(this.prefix) ? hash.slice(this.prefix.length - 1) : "/";
    }
    updateUrl(path) {
        window.location.hash = (path.startsWith("/") ? "#" : "#/") + path;
    }
    replaceUrl(path) {
        window.location.replace((path.startsWith("/") ? "#" : "#/") + path);
    }
}

export class QueryAdapter extends RouterAdapter {
    constructor(paramName = "route") {
        super(`?${paramName}=`);
        this.paramName = paramName;
    }
    getCurrentPath() {
        const params = new URLSearchParams(window.location.search);
        return params.get(this.paramName) || "/";
    }
    updateUrl(path) {
        const url = new URL(window.location);
        url.searchParams.set(this.paramName, path);
        window.history.pushState(null, "", url.toString());
    }
    replaceUrl(path) {
        const url = new URL(window.location);
        url.searchParams.set(this.paramName, path);
        window.history.replaceState(null, "", url.toString());
    }
}

/**
 * TuRouterWeb: El orquestador para la Web
 */
export class TuRouterWeb extends TuRouterCore {
    #slots = new Map();
    #persistentSlots = new Set();
    #onPopState;
    #onHashChange;
    #currentNavController = null;
    #rawParams = {};
    #disposed = false;
    #initialParamsSynced = false;
    constructor(config = {}) {
        super(config.pathfinder);
        let base = config.base || "";
        // If base has a file extension (e.g., index.html), strip the file name to get the directory base
        if (/\/[^/]+\.[^/]+$/.test(base)) {
            base = base.replace(/\/[^/]+\.[^/]+$/, "");
        }
        this.base = base.replace(/\/$/, "");
        this.adapters = config.adapters || [new HistoryAdapter()];
        this.currentPath = createSignal(this.#detectCurrentPath().split("?")[0]);
        this.params = createSignal({});

        this.#onPopState = () => this.#sync();
        this.#onHashChange = () => this.#sync();
        window.addEventListener("popstate", this.#onPopState);
        window.addEventListener("hashchange", this.#onHashChange);
    }

    dispose() {
        window.removeEventListener("popstate", this.#onPopState);
        window.removeEventListener("hashchange", this.#onHashChange);

        //this.#slots.forEach((slot) => slot.set(null));
        for (const slot of this.#slots) {
            slot.set(null);
        }
        this.#slots.clear();
        this.#persistentSlots.clear();
        // de lo contrario se crean zombis
        this.currentPath.unsubscribeAll();
        this.params.unsubscribeAll();
        this.#disposed = true;
    }

    /**
     * @param {string} name
     * @param {{ persistent?: boolean }} options
     */
    getSlot(name, options = { persistent: false }) {
        if (!this.#slots.has(name)) this.#slots.set(name, createSignal(null));
        if (options.persistent) this.#persistentSlots.add(name);
        return this.#slots.get(name);
    }

    resolve(path, options = {}) {
        const match = super.resolve(path, options);
        if (!this.#initialParamsSynced && match && path === this.currentPath.value) {
            this.#initialParamsSynced = true;
            this.#rawParams = match.params || {};
            this.params.set(this.#rawParams);
        }
        return match;
    }

    async navigate(path, options = {}) {
        const adapter = this.#getAdapterForPath(path) || this.adapters[0];

        const from = this.currentPath.value || "/";
        const canNavigate = await this.runGuards(path, from);

        if (canNavigate === false) return;
        if (typeof canNavigate === "string") {
            return this.navigate(canNavigate, { ...options, force: true });
        }

        if (this.#currentNavController) {
            this.#currentNavController.abort("New navigation started");
        }
        this.#currentNavController = new AbortController();
        const signal = this.#currentNavController.signal;

        const [pathname, search] = path.split("?");

        // Antes de navegar, resolvemos para verificar si existe
        let match;
        try {
            match = await this.resolve(pathname, { signal });
        } catch (error) {
            if (error.name === "AbortError") return;
            throw new Error(`[TuRouterWeb] Failed to resolve route ${pathname}: ${error.message}`, {
                cause: error
            });
        }

        if (signal.aborted) return;

        if (!match && !options.force) {
            throw new Error(`[TuRouterWeb] Route not found: ${pathname}`);
        }

        // Limpiamos slots contextuales (efímeros)
        this.#slots.forEach((slot, name) => {
            if (!this.#persistentSlots.has(name)) {
                slot.set(null);
            }
        });

        adapter.updateUrl(this.base + path);
        await this.#sync(path, match);
    }

    #detectCurrentPath() {
        for (const adapter of this.adapters) {
            let path = adapter.getCurrentPath();

            // Si el adaptador ya devuelve un path, verificamos si empieza con el base
            if (this.base && path.startsWith(this.base)) {
                path = path.slice(this.base.length) || "/";
            }

            // Normalizamos index.html, index.php y main.html de la ruta
            if (path === "/index.html" || path === "/index.php" || path === "/main.html") {
                path = "/";
            } else if (
                path.startsWith("/index.html/") ||
                path.startsWith("/index.php/") ||
                path.startsWith("/main.html/")
            ) {
                path = path.replace(/^\/(?:index\.html|index\.php|main\.html)/, "");
            }

            if (path && path !== "/") return path;
        }
        return "/";
    }

    #getAdapterForPath(path) {
        return this.adapters.find((a) => a.matches(path));
    }

    async #sync(forcePath = null, preResolvedMatch = null) {
        if (this.#disposed) throw new TypeError("[TuRouterWeb] Router has been disposed");
        const fullPath = forcePath || this.#detectCurrentPath();
        const [pathname, search] = fullPath.split("?");

        let result = preResolvedMatch;
        let signal;

        if (!preResolvedMatch) {
            const from = this.currentPath.value || "/";
            // Al hacer popstate (atrás/adelante), ejecutamos guards también
            if (!forcePath) {
                const canNavigate = await this.runGuards(fullPath, from);
                if (canNavigate === false) {
                    // Si el guard bloquea el Back/Forward, revertimos la URL visual usando el adaptador correcto
                    const adapter = this.#getAdapterForPath(from) || this.adapters[0];
                    adapter.replaceUrl(from);
                    return;
                }
                if (typeof canNavigate === "string") {
                    // Si redirecciona, restauramos visualmente y luego navegamos a la redirección
                    const adapter = this.#getAdapterForPath(from) || this.adapters[0];
                    adapter.replaceUrl(from);
                    return this.navigate(canNavigate, { force: true });
                }
            }

            if (this.#currentNavController) {
                this.#currentNavController.abort("New navigation started via history sync");
            }
            this.#currentNavController = new AbortController();
            signal = this.#currentNavController.signal;

            try {
                result = await this.resolve(pathname, { signal });
            } catch (error) {
                if (error.name === "AbortError") return;
                throw new Error(
                    `[TuRouterWeb] Failed to sync route ${pathname}: ${error.message}`,
                    { cause: error }
                );
            }
        } else {
            signal = this.#currentNavController?.signal;
        }

        if (signal?.aborted) return;

        if (result) {
            this.#initialParamsSynced = true;
            this.#rawParams = result.params || {};
            this.params.set(result.params);
            this.currentPath.set(pathname);
        } else if (forcePath) {
            this.#initialParamsSynced = true;
            this.#rawParams = {};
            this.params.set({});
            this.currentPath.set(pathname);
        }
    }

    currentParams(routeFn) {
        return this.#rawParams;
    }
}
