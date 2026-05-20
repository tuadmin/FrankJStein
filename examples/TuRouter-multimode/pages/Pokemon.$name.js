import { TuLazyInject, ITuRouterWeb, ELEMENT_UTIL as $, TUtils } from "../libs.js";
import { URL_PAGES } from "../routes.js";
/**
 * Plantilla asíncrona para buscar detalles de un Pokémon.
 * Cumple con el contrato de convención IAsyncPageTpl.
 *
 * @type {import("../convencion.js").IAsyncPageTpl}
 */
export default async function PokemonTpl(tags, params) {
    // IMPORTANTE: Al ser un componente cargado de forma asíncrona por import(),
    // debemos inyectar el Router atado al contexto de params para conservar el scope.
    const router = TuLazyInject(ITuRouterWeb, { context: params });
    const name = params.name || "pikachu";

    // 1. RENDER INICIAL (Estado "Cargando")
    // Renderiza inmediatamente un esqueleto visual mientras la petición web está en curso
    const container = tags.div(
        { className: "page" },
        tags.h2(`🔍 Buscando Pokémon: ${name}...`),
        tags.div({ className: "card" }, "Consultando base de datos internacional de Pokémon...")
    );

    try {
        await TUtils.sleepAsync(2000, params.signal);
        // 2. PETICIÓN ASÍNCRONA CON CANCELACIÓN (AbortSignal)
        // Pasamos params.signal a la llamada de fetch. Si el usuario hace clic en otro botón
        // de la navegación antes de recibir respuesta, el navegador cortará la conexión HTTP al instante.
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`, {
            signal: params.signal
        });

        if (!res.ok) throw new Error(`El Pokémon "${name}" no fue encontrado en la PokeAPI.`);
        const data = await res.json();

        // Si se canceló durante el procesamiento del JSON, salimos limpiamente
        if (params.signal.aborted) return;

        // 3. RENDER FINAL (Con Datos Reales)
        // Buscamos el nodo contenedor montado para re-renderizar los datos frescos
        if (container) {
            container.innerHTML = ""; // Limpiamos el cargando
            const { h2, div } = container[$].tags;
            h2`✨ Pokémon: ${data.name.toUpperCase()}`;
            div({ className: "card" }, ({ img, p, code, button }) => {
                img({
                    src: data.sprites.front_default || "",
                    alt: data.name,
                    "@attrs": { style: "width: 120px; display: block; margin: 0 auto;" }
                });
                p`ID Nacional: ${code("#", data.id)}`;
                p`Tipo principal: ${code(data.types[0]?.type?.name ?? "")}`;
                p`Altura: ${code(data.height / 10)} m`;
                p`Peso: ${code(data.weight / 10)} kg`;
                button`🏠 Volver al Inicio`.onclick = () => router.navigate("/");
            });
        }
    } catch (err) {
        // Capturamos el aborto sin pintar pantallas de error, ya que la navegación cambió de rumbo
        if (err.name === "AbortError") {
            console.log(`⏳ Fetch del Pokémon [${name}] abortado limpiamente al navegar.`);
            return;
        }

        // Renderizamos pantalla de error si fue una falla de red o dato no encontrado
        if (container) {
            container.innerHTML = "";
            const { h2, "div.card": divCard, p, button } = container[$].tags;
            h2`❌ Error en la Búsqueda`;
            divCard(
                p(err.message),
                button({ onclick: () => router.navigate(URL_PAGES.HOME()) }, "Volver a la Home")
            );
        }
    }
}
