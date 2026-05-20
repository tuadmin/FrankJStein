import type { RouteMatch } from "./types";

/**
 * Agnostic path resolution engine based on a Trie graph.
 * Supports static paths, dynamic segments (/:id), and wildcards (/*).
 *
 * @es Motor de resolución agnóstico basado en un grafo Trie.
 * Soporta rutas estáticas, segmentos dinámicos (/:id) y comodines (/*).
 */
export class TuPathfinder {
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
