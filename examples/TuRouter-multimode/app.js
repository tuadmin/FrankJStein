import {
    TuRouterWeb,
    ITuRouterWeb,
    TuPathfinder,
    HistoryAdapter,
    HashAdapter,
    QueryAdapter,
    createComputedSignal,
    TuJsHtml,
    TuContainer
} from "./libs.js";
import { setupRoutes, URL_LOGIN } from "./routes.js";

// --- SERVICIO DE AUTENTICACIÓN EMULADO PARA CONTEXTOS DI ---
import { IAuthService } from "./contratos.js";
import { AuthService } from "./servicios/AuthService.js";

window._test2 = new Map();
window._test3 = [];

// 0. REGISTRO DE SERVICIOS EN TUCONTAINER (DI Kernel)
// Registramos el AuthService atado a singleton.
TuContainer.addSingleton(IAuthService, () => {
    return new AuthService(() => window.app.updateAuthUI());
});
/**
 * App: Orquestador con Scopes (Mundillos Aislados)
 */
class App {
    constructor() {
        /** @type {import("./libs.js").TuScope} */
        this.currentScope = null;
        /** @type {AbortController | null} */
        this.currentAbortController = null;
        this.currentMode = "hash";
        this.viewElement = document.getElementById("router-view");
        this.infoElement = document.getElementById("adapter-info");
        this.routeDisplay = document.querySelector("#route");
        this.authPanel = document.getElementById("auth-panel");
        this.pendingRedirect = null;

        // Calculamos la base automáticamente
        const path = window.location.pathname;
        this.basePath = path.substring(0, path.lastIndexOf("/"));

        this.init();
        this.setupEventListeners();
        this.initTheme();

        window.app = this;
        this._test = null;
    }

    init() {
        // 1. ELIMINACIÓN DEL MUNDO ANTERIOR
        // Al disponer el scope, se limpian todas las instancias y listeners asociados
        if (this.currentScope) {
            console.log("💥 Aniquilando el scope anterior para evitar zombis...");
            this.currentScope.dispose();

            if (this._test) {
                console.log("Borrando el Router del Scope");
                this._test.dispose(); //esto es un parche pero por alguna razon no funciona en el TuScope q deberia de invocar a su Dispose
            }
        }

        // 2. CONFIGURACIÓN DEL ADAPTADOR
        let adapter;
        switch (this.currentMode) {
            case "hash":
                adapter = new HashAdapter();
                break;
            case "query":
                adapter = new QueryAdapter("ruta");
                break;
            default:
                adapter = new HistoryAdapter();
        }
        // Registramos el router como Scoped dentro de este nuevo mundo
        // addScope asegura que sea "singleton" PERO SOLO DENTRO DE ESTE SCOPE
        TuContainer.addScope(ITuRouterWeb, (ctx) => {
            return new TuRouterWeb({
                pathfinder: new TuPathfinder(),
                adapters: [adapter],
                base: this.currentMode === "history" ? this.basePath : ""
            });
        });
        // 3. CREACIÓN DE UN NUEVO MUNDO (CHILD SCOPE)
        // Usamos createScope para aislar las dependencias de este modo de ejecución
        this.currentScope = TuContainer.createScope((scope) => {
            // ya qye tenemos funciones q hacen uso de "this.currentScope" en versiones sincronas dara error asi q hacemos esto para cubrir
            this.currentScope = scope;

            // Resolvemos la instancia para este mundo
            const router = scope.resolve(ITuRouterWeb);

            // console.log(router);
            // this._test = router;
            // ;
            // window._test2.set(router,
            //     (window._test2.has(router) ? window._test2.get(router) : 0)
            //     + 1);
            // window._test3.push(router);
            // Cargamos las rutas
            setupRoutes(router);

            console.log(`🌍 Nuevo mundo creado [Modo: ${this.currentMode}]`);

            // Reacción interna al cambio de ruta (Local al router de este scope)
            createComputedSignal(router.currentPath, (path) => {
                console.log(`📍 [Scope: ${this.currentMode}] Navegando a: ${path}`);
                if (this.routeDisplay) this.routeDisplay.innerHTML = path;
                this.handleRouteChange(router, path);
            });

            // Navegación inicial del nuevo router
            router.navigate(router.currentPath.value || "/").catch((err) => {
                console.warn("[App] Error en carga inicial del scope:", err.message);
                this.renderNotFound(router);
            });

            this.updateUI(router);
            this.updateAuthUI();
            return scope;
        });
    }

    /**
     * Resuelve la ruta y carga el componente
     * @param {import("./libs.js").TuRouterWeb} router
     */
    async handleRouteChange(router, path) {
        // Cancelamos cualquier operación asíncrona pendiente del componente anterior
        if (this.currentAbortController) {
            this.currentAbortController.abort();
        }
        this.currentAbortController = new AbortController();
        const signal = this.currentAbortController.signal;

        try {
            // --- PROTECCIÓN DE RUTAS (ROUTE GUARD) ---
            // const auth = this.currentScope.resolve(IAuthService);
            // const isProtected = path.startsWith("/pokemon") || path.startsWith("/usuario") || path === "/usuarios";

            // let targetPath = path;
            // if (isProtected && !auth.isLoggedIn) {
            //     console.warn(`🔒 Acceso denegado a [${path}]: Sesión requerida. Redirigiendo a /login...`);
            //     this.pendingRedirect = path;
            //     targetPath = "/login";
            // }

            // const match = await router.resolve(targetPath);
            const match = await router.resolve(path);
            if (!match?.handler) {
                this.renderNotFound(router);
                return;
            }
            this.viewElement.innerHTML = "";

            // Carga dinámica (Lazy Loading) con vinculación de contexto (Poisoning)
            TuContainer.link(match.params, this.currentScope);

            // Inyectamos la señal de cancelación para contratos asíncronos
            match.params.signal = signal;

            const module = await match.handler(match.params);

            // Si el usuario navegó rápido y abortó antes de completar la carga del módulo
            if (signal.aborted) {
                console.log("🛑 Navegación rápida detectada: carga de componente cancelada.");
                return;
            }

            if (!module) {
                this.renderNotFound(router);
            } else if (module instanceof Node) {
                // ILUSTRA: Componente que devuelve un nodo del DOM nativo directamente
                this.viewElement.appendChild(module);
            } else if (module[Symbol.toStringTag] === "Module") {
                const component = module.default;
                if (component) {
                    // ILUSTRA CONVENCIÓN 1 (IPageTpl): El nombre de la función exportada termina en 'Tpl'.
                    // Se envuelve automáticamente en TuJsHtml(tags => component(tags, params)).
                    if (component.name.endsWith("Tpl")) {
                        // IMPORTANTE: Al instanciar TuJsHtml aquí, los TuLazyInject dentro
                        // del componente detectarán el currentScope activo.
                        this.viewElement.appendChild(
                            new TuJsHtml((tags) => component(tags, match.params))
                        );
                    } else {
                        // ILUSTRA CONVENCIÓN 2 (IPage): Función estándar que recibe ({ params })
                        // y puede devolver un Node o un String de HTML puro.
                        const result = component({ params: match.params });
                        if (result instanceof Node) {
                            this.viewElement.appendChild(result);
                        } else {
                            this.viewElement.innerHTML = result;
                        }
                    }
                }
            }
        } catch (err) {
            if (err.name === "AbortError") {
                console.log("⏳ Operación asíncrona abortada exitosamente.");
                return;
            }
            console.error("[App] Error al renderizar ruta:", err);
            this.renderNotFound(router);
        }
    }

    renderNotFound(router) {
        this.viewElement.innerHTML = `
            <div class="page">
                <h2>❌ 404 - Mundo Desconocido</h2>
                <p>La ruta no existe en el scope <b>${this.currentMode}</b>.</p>
                <button onclick="window.app.to('/')">Volver al Inicio</button>
            </div>
        `;
    }
    to(path) {
        return this.currentScope.resolve(ITuRouterWeb).navigate(path);
    }
    setupEventListeners() {
        // Toggle de Adaptadores (Crea nuevos mundos)
        document.getElementById("adapter-toggle").addEventListener("click", (e) => {
            if (e.target.tagName === "BUTTON") {
                this.currentMode = e.target.dataset.mode;
                this.init();
            }
        });

        // Navegación delegada
        document.getElementById("navigation").addEventListener("click", (e) => {
            if (e.target.tagName === "BUTTON") {
                const path = e.target.dataset.path;
                // Resolvemos el router del scope actual para navegar
                const router = this.currentScope.resolve(ITuRouterWeb);
                router.navigate(path);
            }
        });
    }

    updateUI(router) {
        document.querySelectorAll("#adapter-toggle button").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.mode === this.currentMode);
        });

        const modeLabels = {
            history: "History API (Clean)",
            hash: "Hash (#!/...)",
            query: "Query (?ruta=...)"
        };

        this.infoElement.innerHTML = `
            Modo: <b>${modeLabels[this.currentMode]}</b> | 
            Base: <code>${router.base || "(none)"}</code> |
            Scope: <code>${this.currentMode.toUpperCase()}</code>
        `;
    }

    updateAuthUI() {
        //como el IAuthService es un singleto, lo que ocurre es que busca si ay en el scope esa KEY y si no va Subiendo hasta arriba
        const auth = this.currentScope.resolve(IAuthService);
        if (!this.authPanel) return;

        if (auth.isLoggedIn) {
            this.authPanel.innerHTML = `
                <span>Bienvenido, <span class="user-name">${auth.username}</span></span>
                <button class="btn-danger" id="logout-btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; margin-left: 0.5rem;">Salir</button>
            `;
            const btn = document.getElementById("logout-btn");
            if (btn) {
                btn.onclick = () => {
                    auth.logout();
                    const router = this.currentScope.resolve(ITuRouterWeb);
                    router.navigate("/");
                };
            }
        } else {
            this.authPanel.innerHTML = `
                <input type="text" placeholder="Tu Nombre" id="login-username" style="width: 100px;">
                <button class="btn-accent" id="login-btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Entrar</button>
            `;
            const btn = document.getElementById("login-btn");
            const input = document.getElementById("login-username");
            if (btn && input) {
                btn.onclick = () => {
                    const val = input.value.trim();
                    if (val) {
                        auth.login(val);
                        const router = this.currentScope.resolve(ITuRouterWeb);
                        if (this.pendingRedirect) {
                            const target = this.pendingRedirect;
                            this.pendingRedirect = null;
                            router.navigate(target);
                        } else {
                            router.navigate(URL_LOGIN());
                        }
                    } else {
                        alert("¡Introduce un nombre!");
                    }
                };
                input.onkeydown = (e) => {
                    if (e.key === "Enter") btn.click();
                };
            }
        }
    }

    initTheme() {
        const toggleBtn = document.getElementById("theme-toggle");
        if (!toggleBtn) return;

        // 1. Detectar preferencia previa o del navegador
        const getPreferredTheme = () => {
            const stored = localStorage.getItem("theme");
            if (stored) return stored;

            const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
            return prefersLight ? "light" : "dark";
        };

        const applyTheme = (theme) => {
            if (theme === "light") {
                document.documentElement.setAttribute("data-theme", "light");
                toggleBtn.textContent = "☀️";
                toggleBtn.title = "Modo Noche";
            } else {
                document.documentElement.removeAttribute("data-theme");
                toggleBtn.textContent = "🌙";
                toggleBtn.title = "Modo Día";
            }
            localStorage.setItem("theme", theme);
        };

        // Estado inicial
        const currentTheme = getPreferredTheme();
        applyTheme(currentTheme);

        // Click handler
        toggleBtn.onclick = () => {
            const isLight = document.documentElement.getAttribute("data-theme") === "light";
            applyTheme(isLight ? "dark" : "light");
        };

        // Escuchar preferencias del sistema en vivo
        window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
            if (!localStorage.getItem("theme")) {
                applyTheme(e.matches ? "light" : "dark");
            }
        });
    }
}

// Inicialización Sanchopancesca
new App();
