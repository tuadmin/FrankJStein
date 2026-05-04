/**
 * EL WORKER
 *
 * Solo importa el Hub. No necesita conocer FrankJStein directamente
 * ni usar alias que romperían la ejecución.
 */
import { Hub, Remote } from "./hub.js";

export class DiscoveryWorker extends Remote.Simple {
    /**
     * Realiza un cálculo usando un módulo descubierto dinámicamente.
     */
    async doWork(n) {
        console.log("[Worker] Resolviendo módulo math a través del Hub...");

        // Obtenemos el módulo perezoso sin usar alias
        const math = await Hub.math;

        const result = math.calculateHeavy(n);
        return {
            result,
            pi: math.PI,
            message: "Cálculo finalizado con éxito desde el Worker"
        };
    }
}

// Registro estándar de FrankJStein
DiscoveryWorker.register(import.meta);
