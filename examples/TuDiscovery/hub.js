/**
 * EL HUB (The Bridge)
 * 
 * Centraliza las rutas usando TuDiscovery.
 * Re-exporta utilidades de FrankJStein para que los Workers no tengan que importar nada más.
 */
// OPCIÓN A: Importe local (útil durante el desarrollo)
import { TuDiscovery, Remote, createSignal } from "../../dist/frankjstein.js";

// OPCIÓN B: Importe Universal (Recomendado para Workers/Producción)
// Esto garantiza que el Worker pueda resolver la librería desde cualquier contexto.
//import { TuDiscovery, Remote, createSignal } from "https://esm.sh/frankjstein@0.5.2";

// Definimos el mapa de descubrimiento
export const Hub = TuDiscovery.create({
    math: () => import("./modules/math.js"),
    // Podrías tener más servicios aquí...
});

// Patrón Bridge: Exponemos lo que el Worker necesita
export { Remote, createSignal };
