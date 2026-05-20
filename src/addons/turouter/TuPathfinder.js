// @ts-check
/**
 * @file TuPathfinder.js
 * @description Motor de búsqueda de rutas de alta performance (Radix Tree con Backtracking).
 * Optimizado con caché de parámetro único y cero asignaciones en el camino rápido.
 */

class Node {
    /**
     * @param {string} segment
     */
    constructor(segment = "") {
        this.segment = segment;
        /** @type {Map<string, Node>} */
        this.staticChildren = new Map();
        /** @type {Map<string, Node>} */
        this.paramChildren = new Map();
        /** @type {Node|null} */
        this.wildcardChild = null;
        /** @type {any} */
        this.handler = null;
        /** @type {Function|null} */
        this.lazyLoader = null;
        /** @type {Promise<any>|null} */
        this.pendingLoad = null;

        // Caché del caso común (Single Param Child) para evitar iteradores
        /** @type {string|null} */
        this.singleParamName = null;
        /** @type {Node|null} */
        this.singleParamNode = null;
        /** @type {string[]|null} */
        this.lazyPrefixSegments = null;
    }
}

export class TuPathfinder {
    constructor() {
        this.root = new Node();
        /** @type {Map<string, { handler: any, params: Record<string, string> }>} */
        this.staticCache = new Map();
    }

    /**
     * @param {string} path
     * @param {any} handler
     */
    insert(path, handler) {
        if (!path.includes("{") && !path.includes("*")) {
            this.staticCache.set(path, { handler, params: {} });
            return;
        }

        const segments = this.#splitPath(path);
        let node = this.root;

        for (const segment of segments) {
            node = this.#insertSegment(node, segment);
        }
        node.handler = handler;
    }

    /**
     * @param {any} prefixOrGroup
     * @param {Function} loader
     */
    insertLazy(prefixOrGroup, loader) {
        const prefix =
            typeof prefixOrGroup?.toString === "function"
                ? prefixOrGroup.toString()
                : prefixOrGroup;
        const segments = this.#splitPath(prefix);
        let node = this.root;
        for (const segment of segments) {
            node = this.#insertSegment(node, segment);
        }
        node.lazyLoader = loader;
        node.lazyPrefixSegments = segments;
    }

    /**
     * @param {string} path
     * @param {any} [options]
     * @returns {any}
     */
    find(path, options = {}) {
        const cached = this.staticCache.get(path);
        if (cached) return cached;

        const segments = this.#splitPath(path);
        return this.#traverse(this.root, segments, 0, {}, options);
    }

    /**
     * @param {Node} node
     * @param {string[]} segments
     * @param {number} index
     * @param {Record<string, string>} params
     * @param {any} options
     * @returns {any}
     */
    #traverse(node, segments, index, params, options) {
        if (options?.signal?.aborted) {
            const error = new Error("AbortError");
            error.name = "AbortError";
            throw error;
        }

        // Hidratación Lazy
        if (node.lazyLoader) {
            const loader = node.lazyLoader;
            node.lazyLoader = null;
            try {
                const result = loader(
                    (/** @type {string|Function} */ subPathOrFn, /** @type {any} */ subHandler) => {
                        let subPath =
                            typeof subPathOrFn === "function" ? subPathOrFn() : subPathOrFn;
                        const prefixSegs = node.lazyPrefixSegments;
                        if (prefixSegs && prefixSegs.length > 0) {
                            const subSegs = this.#splitPath(subPath);
                            let match = true;
                            if (subSegs.length >= prefixSegs.length) {
                                for (let i = 0; i < prefixSegs.length; i++) {
                                    if (subSegs[i] !== prefixSegs[i]) {
                                        match = false;
                                        break;
                                    }
                                }
                            } else {
                                match = false;
                            }
                            if (match) {
                                subPath = "/" + subSegs.slice(prefixSegs.length).join("/");
                            }
                        }
                        this.#insertSubPath(node, subPath, subHandler);
                    },
                    options
                );

                if (result && typeof result.then === "function") {
                    const pending = result
                        .catch((/** @type {any} */ err) => {
                            node.lazyLoader = loader;
                            throw err;
                        })
                        .finally(() => {
                            node.pendingLoad = null;
                        });
                    node.pendingLoad = pending;
                    return pending.then(() =>
                        this.#traverse(node, segments, index, params, options)
                    );
                }
            } catch (err) {
                node.lazyLoader = loader;
                throw err;
            }
        }

        const activeLoad = node.pendingLoad;
        if (activeLoad) {
            return activeLoad.then(() => this.#traverse(node, segments, index, params, options));
        }

        if (index === segments.length) {
            return node.handler ? { handler: node.handler, params } : null;
        }

        const segment = segments[index];

        // 1. Prioridad: Coincidencia Estática (Static Match)
        const nextStatic = node.staticChildren.get(segment);
        if (nextStatic) {
            const result = this.#traverse(nextStatic, segments, index + 1, params, options);
            if (result && typeof result.then === "function") {
                return result.then((/** @type {any} */ resolved) => {
                    if (resolved) return resolved;
                    return this.#traverseParams(node, segments, index, params, options);
                });
            }
            if (result) return result;
        }

        return this.#traverseParams(node, segments, index, params, options);
    }

    /**
     * @param {Node} node
     * @param {string[]} segments
     * @param {number} index
     * @param {Record<string, string>} params
     * @param {any} options
     * @returns {any}
     */
    #traverseParams(node, segments, index, params, options) {
        const segment = segments[index];

        if (node.singleParamNode) {
            const paramName = /** @type {string} */ (node.singleParamName);
            params[paramName] = segment;
            const result = this.#traverse(
                node.singleParamNode,
                segments,
                index + 1,
                params,
                options
            );
            if (result && typeof result.then === "function") {
                return result.then((/** @type {any} */ resolved) => {
                    if (resolved) return resolved;
                    delete params[paramName];
                    return this.#traverseWildcard(node, segments, index, params, options);
                });
            }
            if (result) return result;
            delete params[paramName];
        } else if (node.paramChildren.size > 0) {
            const entries = Array.from(node.paramChildren.entries());
            return this.#traverseParamMap(node, segments, index, params, entries, 0, options);
        }

        return this.#traverseWildcard(node, segments, index, params, options);
    }

    /**
     * @param {Node} node
     * @param {string[]} segments
     * @param {number} index
     * @param {Record<string, string>} params
     * @param {[string, Node][]} entries
     * @param {number} entryIndex
     * @param {any} options
     * @returns {any}
     */
    #traverseParamMap(node, segments, index, params, entries, entryIndex, options) {
        if (entryIndex >= entries.length) {
            return this.#traverseWildcard(node, segments, index, params, options);
        }

        const [paramName, paramNode] = entries[entryIndex];
        const segment = segments[index];
        params[paramName] = segment;

        const result = this.#traverse(paramNode, segments, index + 1, params, options);
        if (result && typeof result.then === "function") {
            return result.then((/** @type {any} */ resolved) => {
                if (resolved) return resolved;
                delete params[paramName];
                return this.#traverseParamMap(
                    node,
                    segments,
                    index,
                    params,
                    entries,
                    entryIndex + 1,
                    options
                );
            });
        }

        if (result) return result;
        delete params[paramName];
        return this.#traverseParamMap(
            node,
            segments,
            index,
            params,
            entries,
            entryIndex + 1,
            options
        );
    }

    /**
     * @param {Node} node
     * @param {string[]} segments
     * @param {number} index
     * @param {Record<string, string>} params
     * @param {any} options
     * @returns {any}
     */
    #traverseWildcard(node, segments, index, params, options) {
        if (node.wildcardChild) {
            params["*"] = segments.slice(index).join("/");
            const result = this.#traverse(
                node.wildcardChild,
                segments,
                segments.length,
                params,
                options
            );
            if (result && typeof result.then === "function") {
                return result.then((/** @type {any} */ resolved) => {
                    if (resolved) return resolved;
                    delete params["*"];
                    return null;
                });
            }
            if (result) return result;
            delete params["*"];
        }
        return null;
    }

    /**
     * @param {string} path
     * @returns {string[]}
     */
    #splitPath(path) {
        return path.split("/").filter((s) => s.length > 0);
    }

    /**
     * @param {Node} node
     * @param {string} segment
     * @returns {Node}
     */
    #insertSegment(node, segment) {
        const paramMatch = segment.match(/^\{(.+)\}$/) || segment.match(/^:(.+)$/);
        if (paramMatch) {
            const paramName = paramMatch[1];
            if (!node.paramChildren.has(paramName)) {
                node.paramChildren.set(paramName, new Node(segment));
            }
            const childNode = /** @type {Node} */ (node.paramChildren.get(paramName));

            // Actualizar la caché del parámetro único
            if (node.paramChildren.size === 1) {
                node.singleParamName = paramName;
                node.singleParamNode = childNode;
            } else {
                node.singleParamName = null;
                node.singleParamNode = null;
            }

            return childNode;
        }
        if (segment === "*") {
            if (!node.wildcardChild) node.wildcardChild = new Node(segment);
            return node.wildcardChild;
        }
        if (!node.staticChildren.has(segment)) {
            node.staticChildren.set(segment, new Node(segment));
        }
        return /** @type {Node} */ (node.staticChildren.get(segment));
    }

    /**
     * @param {Node} parentNode
     * @param {string|Function} pathOrFn
     * @param {any} handler
     */
    #insertSubPath(parentNode, pathOrFn, handler) {
        const path = typeof pathOrFn === "function" ? pathOrFn() : pathOrFn;
        const segments = this.#splitPath(path);
        let node = parentNode;
        for (const segment of segments) {
            node = this.#insertSegment(node, segment);
        }
        node.handler = handler;
    }

    dispose() {
        this.staticCache.clear();
    }
}
