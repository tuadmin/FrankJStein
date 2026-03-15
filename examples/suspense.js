import { TuJsHtml, ELEMENT_UTIL as $ } from "../dist/frankjstein.js";

const app = new TuJsHtml(function (tags) {
    const { main, h1, p, hr } = tags;
    //const { "div.user-card": userCard, "span.badge": badge } = tags;//Scope equivocado

    main({ style: { padding: "20px", fontFamily: "sans-serif" } });
    h1`Panel de Usuario`;
    p`Ejemplo básico de asincronía con Frank J. Stein`;
    hr();

    // Fragmento Asíncrono ($f) con Suspense integrado
    tags.$fragment(async ({ h2, ul, "div.user-card": userCard, "span.badge": badge, button }) => {

        // Simulamos una petición fetch que tarda 2 segundos
        await new Promise(resolve => setTimeout(resolve, 2000));

        userCard(() => {
            h2`Frank Stein`;
            badge({ style: { backgroundColor: "green", color: "white" } }, "Online");

            ul(({ li }) => {
                li`Rol: Desarrollador Frontend`;
                li`Nivel: Dios del DOM`;
            });
        });

        const btn = button`Saludar`;
        //btn[$].on("click", () => alert("¡Está vivo!"));
        btn.addEventListener("click", () => alert("¡Está vivo!"));

    },
        // Fallback: Lo que el usuario ve mientras la promesa se resuelve
        function fallback({ div, p, i }) {
            div({ className: "loading-skeleton" }, ({ p, i }) => {
                p(i`Cargando datos del usuario, por favor espera...`);
            });
        });
    tags.h2`Ultimo elemento ,debajo de aca no deberia haber nada`;
});

export default app;