/**
 * Compiles a path template into a high-performance string concatenation function.
 * @param {string} tpl
 * @returns {(params: Record<string, any>) => string}
 */
function compileTemplate(tpl) {
    const parts = [];
    let lastIndex = 0;
    tpl.replace(/\{([^}]+)\}/g, (match, paramName, offset) => {
        if (offset > lastIndex) {
            parts.push(tpl.slice(lastIndex, offset));
        }
        parts.push({ param: paramName });
        lastIndex = offset + match.length;
        return match;
    });
    if (lastIndex < tpl.length) {
        parts.push(tpl.slice(lastIndex));
    }

    return (params) => {
        let res = "";
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (typeof part === "string") {
                res += part;
            } else {
                const val = params[part.param];
                res += val !== undefined ? val : `{${part.param}}`;
            }
        }
        return res;
    };
}

export class GroupUrl {
    /**
     * @param {string} prefix - Prefix path (e.g. '/user/{user_id}') / Prefijo de ruta.
     * @param {Record<string, string | ((params: any) => string)>} subRoutes - Sub-routes key-value / Sub-rutas clave-valor.
     */
    constructor(prefix, subRoutes) {
        this.prefix = prefix;
        this.subRoutes = subRoutes;
        const prefixFn = compileTemplate(prefix);

        for (const [key, val] of Object.entries(subRoutes)) {
            if (typeof val === "string") {
                // Pre-combine and normalize slashes once at construction time
                const pEnds = prefix.endsWith("/");
                const sStarts = val.startsWith("/");
                let combinedTemplate;
                if (pEnds && sStarts) {
                    combinedTemplate = prefix + val.slice(1);
                } else if (!pEnds && !sStarts) {
                    combinedTemplate = prefix + "/" + val;
                } else {
                    combinedTemplate = prefix + val;
                }
                const compiled = compileTemplate(combinedTemplate);
                this[key] = (params = {}) => compiled(params);
            } else {
                // Fallback for function-based subroutes
                this[key] = (params = {}) => {
                    const p = prefixFn(params);
                    const s = val(params);
                    const pEnds = p.endsWith("/");
                    const sStarts = s.startsWith("/");
                    if (pEnds && sStarts) return p + s.slice(1);
                    if (!pEnds && !sStarts) return p + "/" + s;
                    return p + s;
                };
            }
        }
    }

    /**
     * Returns the prefix path string.
     * Used by JavaScript string conversions, allowing the instance to be passed directly to router.group().
     */
    toString() {
        return this.prefix;
    }
}

/**
 * Factory function to create a GroupUrl instance with full IDE autocomplete for dynamic sub-routes.
 *
 * @es Función constructora para crear una instancia de GroupUrl con autocompletado del IDE completo para sub-rutas dinámicas.
 *
 * @template {Record<string, string | ((params: any) => string)>} T
 * @param {string} prefix - The prefix route path (e.g. '/user/{user_id}') / El prefijo común.
 * @param {T} subRoutes - The sub-routes configuration / La configuración de las sub-rutas.
 * @returns {GroupUrl & { [K in keyof T]: T[K] extends (params: infer P) => any ? (params?: P) => string : (params?: any) => string }}
 */
export function createGroupUrl(prefix, subRoutes) {
    return /** @type {any} */ (new GroupUrl(prefix, subRoutes));
}
