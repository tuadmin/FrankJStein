import { describe, test } from "bun:test";

/**
 * @description Aviso de limitación para RemoteModule (Web Workers).
 * @standards Protocolo de Testing Soberano v1.0
 */
describe("RemoteModule: Multi-threading", () => {
    /**
     * @warning LIMITACIÓN DE ENTORNO
     * Los Web Workers no pueden ser testeados de forma nativa en Bun/Happy-DOM
     * debido a la falta de soporte para el constructor 'Worker' y la carga
     * de módulos dentro del hilo secundario en entornos de emulación de DOM.
     *
     * Para validar la funcionalidad de RemoteModule, referirse a:
     * - examples/remote/ (Demo interactiva)
     * - Pruebas manuales en navegador real.
     */
    // @ts-ignore TODO en BUN
    test.todo("RemoteModule requiere entorno de navegador real para validación de hilos.");
});
