import { TuJsHtml } from "../../dist/frankjstein.js";
import {
    TuRouterWeb,
    HistoryAdapter,
    QueryAdapter
} from "../../src/addons/turouter/TuRouterWeb.js";

// 1. DEFINICIÓN DE URLS (BI-DIRECCIONALES)
const ROUTES = {
    HOME: () => "/",
    BLOG_LIST: () => "/blog",
    BLOG_DETAIL: (slug) => `/blog/${slug || "{slug}"}`, // {slug} para el registro
    ADMIN: () => "/admin/dashboard"
};

// 2. INSTANCIA CON ADAPTADORES (HÍBRIDO)
const router = new TuRouterWeb({
    base: window.location.pathname,
    adapters: [
        new HistoryAdapter(),
        new QueryAdapter("r") // index.php?r=/blog
    ]
});

// 3. REGISTRO DE RUTAS
router.add(ROUTES.HOME(), (tags) => tags.h2`Página de Inicio`);

// Grupo de Blog
router.add(ROUTES.BLOG_LIST(), (tags) => tags.h2`Listado de Noticias`);

router.add(ROUTES.BLOG_DETAIL(), (tags) => {
    return tags.div(
        tags.h2`Noticia: ${router.params.get().slug}`,
        tags.p`Contenido dinámico resuelto por Trie.`
    );
});

// 4. GRUPO LAZY (Solo se hidrata si alguien entra a /admin/...)
router.group("/admin", (add) => {
    console.log("¡Hidratando rutas de administración de forma Lazy!");
    add("/dashboard", (tags) => tags.h2`Panel de Control`);
    add("/settings", (tags) => tags.h2`Configuración`);
});

// 5. UI CON SCAFFOLD
new TuJsHtml((tags) => {
    const { div, main, h1, p, span, $block, a } = tags;

    const root = div(
        { className: "container" },
        h1`FrankJStein: Advanced Hybrid Routing`,
        p(
            { className: "subtitle" },
            "Orquestación de enrutamiento híbrido sin sobrecarga de rendimiento (History & Query adapters)."
        ),

        // TARJETA 1: NAVEGACIÓN CLIENT-SIDE (SPA)
        div(
            { className: "card" },
            tags.h3(span({ className: "badge" }, "SPA Mode"), " Client-Side Reactivo"),
            p(
                "Navegación instantánea en el cliente sin recargar la pestaña del navegador. Modifica el historial vía HistoryAdapter:"
            ),
            div(
                { className: "nav-group" },
                a(
                    {
                        className: "nav-link nav-link-primary",
                        href: ROUTES.HOME(),
                        onclick: (e) => (e.preventDefault(), router.navigate(ROUTES.HOME()))
                    },
                    "Inicio"
                ),
                a(
                    {
                        className: "nav-link",
                        href: ROUTES.BLOG_DETAIL("nueva-noticia"),
                        onclick: (e) => (
                            e.preventDefault(), router.navigate(ROUTES.BLOG_DETAIL("nueva-noticia"))
                        )
                    },
                    "Ver Noticia (nueva-noticia)"
                ),
                a(
                    {
                        className: "nav-link",
                        href: ROUTES.ADMIN(),
                        onclick: (e) => (e.preventDefault(), router.navigate(ROUTES.ADMIN()))
                    },
                    "Admin Panel (Lazy)"
                )
            )
        ),

        // TARJETA 2: ENTRADA DESDE SERVIDOR (PHP / LEGACY)
        div(
            { className: "card card-server" },
            tags.h3(
                span({ className: "badge badge-server" }, "PHP / Server Mode"),
                " Entrada de Servidor Redirigida"
            ),
            p(
                "Simula la entrada a la app desde un script de servidor PHP tradicional usando parámetros de consulta (query param ?r=...). Al hacer click, el navegador realizará una recarga real y el router levantará el estado inicial:"
            ),
            div(
                { className: "nav-group" },
                a(
                    {
                        className: "nav-link nav-link-server",
                        href:
                            window.location.pathname +
                            "?r=/blog/noticia-desde-php-" +
                            Math.floor(Math.random() * 1000)
                    },
                    "🔗 Cargar Noticia Dinámica"
                ),
                a(
                    {
                        className: "nav-link nav-link-server",
                        href: `{window.location.pathname}?r=/admin/dashboard`
                    },
                    "🔗 Cargar Panel Admin (Lazy)"
                )
            )
        ),

        // VISTA PRINCIPAL (TARGET)
        main(
            $block(router.currentPath, (tags) => {
                const match = router.resolve(router.currentPath.get());
                if (match) return match.handler(tags);
                return tags.p`404 - No encontrado`;
            })
        ),

        // FOOTER DE DEPURACIÓN DE ESTADO
        div(
            {
                "@attrs": {
                    style: "margin-top: 1.5rem; padding: 1rem; font-size: 0.85rem; color: #64748b; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0;"
                }
            },
            $block(router.currentPath, (tags) =>
                tags.span("Ruta Activa: ", tags.code(router.currentPath.get()))
            ),
            $block(router.params, (tags) =>
                tags.span("Parámetros: ", tags.code(JSON.stringify(router.params.get())))
            )
        )
    );

    document.body.append(root);
});
