import { TuJsHtml } from "./libs.js";
/**
 * Plantilla sincrónica estándar que usa TuJsHtml.
 * Su nombre de función exportada por defecto DEBE terminar en 'Tpl' (ej: EjemploTpl).
 *
 * @param {TuJsHtml.Types.Tags} tags - Constructor de nodos fluidos de TuJsHtml
 * @param {Record<string,string> & { signal?: AbortSignal }} params - Parámetros de la URL con AbortSignal opcional
 * @returns {void}
 */
export function IPageTpl(tags, params) {
    throw new Error("Only for Convention");
}

/**
 * Función estándar que recibe parámetros de la URL y devuelve un Node del DOM real o un String HTML.
 * Su nombre de función NO termina en 'Tpl' (ej: Home, UserDetail).
 *
 * @param {{ params: Record<string,string> & { signal?: AbortSignal } }} options - Objeto de opciones que envuelve los parámetros
 * @returns {Node | string}
 */
export function IPage({ params }) {
    throw new Error("Only for Convention");
}

/**
 * Plantilla asincrónica que usa TuJsHtml y soporta operaciones diferidas (ej: llamadas a APIs fetch).
 * Exige el uso obligatorio de AbortSignal para cancelar peticiones HTTP pendientes al cambiar de página.
 * Su nombre de función exportada por defecto DEBE terminar en 'Tpl' (ej: PokemonTpl).
 *
 * @param {TuJsHtml.Types.Tags} tags - Constructor de nodos fluidos de TuJsHtml
 * @param {Record<string,string> & { signal: AbortSignal }} params - Parámetros de la URL con AbortSignal obligatorio
 * @returns {Promise<void> | void}
 */
export function IAsyncPageTpl(tags, params) {
    throw new Error("Only for Convention");
}
