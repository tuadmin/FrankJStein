import { TuLazyInject, ITuRouterWeb } from "../libs.js";
import { URL_POKEMON } from "../routes.js";

/**
 * Página de listado de Pokémon utilizando puro HTML y JavaScript Vanilla.
 * Ilustra el contrato IPage (retornar un Node nativo de forma sincrónica y mutarlo de forma asincrónica).
 *
 * @type {import("../convencion.js").IPage}
 */
export default function PokemonList({ params }) {
    // IMPORTANTE: Al cargarse de forma diferida, debemos inyectar el Router
    // atado al contexto de params para no perder el scope en llamadas asíncronas.
    const router = TuLazyInject(ITuRouterWeb, { context: params });

    // 1. CREACIÓN SÍNCRONA DEL NODO CONTENEDOR
    // El cargador en app.js espera un Node nativo inmediatamente.
    // Creamos los elementos básicos del DOM con APIs nativas del navegador.
    const container = document.createElement("div");
    container.className = "page";

    const title = document.createElement("h2");
    title.innerHTML = "👥 PokeList (Vanilla JS)";
    container.appendChild(title);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = "<p>Cargando pokemones de la base de datos nacional...</p>";
    container.appendChild(card);

    // 2. PROCESAMIENTO ASÍNCRONO CON CANCELACIÓN (AbortSignal)
    async function fetchPokemons() {
        try {
            // Realizamos la petición remota pasándole la señal de aborto obligatoria
            const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20", {
                signal: params.signal
            });

            if (!res.ok) throw new Error("No se pudo conectar con la PokeAPI.");
            const data = await res.json();

            // Si el usuario navegó rápido y se canceló la operación, salimos limpiamente sin mutar el DOM
            if (params.signal.aborted) return;

            // Limpiamos el texto de carga inicial
            card.innerHTML = "";

            const ul = document.createElement("ul");
            ul.className = "user-list";

            data.results.forEach((poke, index) => {
                const li = document.createElement("li");

                const span = document.createElement("span");
                // Usamos interpolación y markup nativo
                span.innerHTML = `<strong>#${index + 1}</strong> - ${poke.name.toUpperCase()}`;
                li.appendChild(span);

                const btn = document.createElement("button");
                btn.innerText = "Ver Perfil";
                btn.onclick = () => {
                    // Navegación programática pura usando la URL mapeada en el router
                    router.navigate(URL_POKEMON({ name: poke.name }));
                };
                li.appendChild(btn);

                ul.appendChild(li);
            });

            card.appendChild(ul);
        } catch (err) {
            // Capturamos el aborto silenciosamente al navegar
            if (err.name === "AbortError") {
                console.log("⏳ Carga de lista Pokémon abortada con éxito.");
                return;
            }
            // Mostramos el mensaje de error de forma vanilla
            card.innerHTML = `<p style="color: red; font-weight: bold;">❌ Error: ${err.message}</p>`;
        }
    }

    // Iniciamos la llamada asíncrona en segundo plano
    fetchPokemons();

    // Retornamos el nodo de inmediato de forma síncrona
    return container;
}
