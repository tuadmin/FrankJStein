// @since 0.1.1-alpha
import { RemoteModule /*,Remote*/ } from "../../dist/frankjstein.js";

/**
 * MathService
 * Este servicio corre 100% aislado dentro de un Web Worker.
 * Ningún proceso largo aquí adentro va a congelar la pantalla del usuario.
 *
 * Extendemos de RemoteModule para heredar el puente de comunicación.
 */
//export class MathService extends Remote.Simple { // cero que a veces nos oporta Namespace
export class MathService extends RemoteModule {
    constructor() {
        super();
    }
    /**
     * Método síncrono pesado. El proxy lo convertirá automáticamente en Asíncrono (Promesa).
     * @param {number} n
     * @returns {number}
     */
    calculateFibonacci(n) {
        if (n <= 1) return n;
        return this.calculateFibonacci(n - 1) + this.calculateFibonacci(n - 2);
    }

    // Método asíncrono
    async processImageMock() {
        // Simulamos un procesamiento de imagen en paralelo
        await new Promise((r) => setTimeout(r, 2000));
        return {
            status: "success",
            resolution: "1080p",
            filter: "sepia",
            processedBy: "WebWorker"
        };
    }
}

// Inicia el hosting. Expone TODA la lógica de este archivo hacia el hilo principal.
// Si este archivo se lee desde el Main Thread, FrankJStein sabe ignorarlo,
// pero si se levanta como Worker, lo activa.
MathService.register(import.meta);
