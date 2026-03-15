# 🧟‍♂️ FrankJStein

> **F**ragment **R**eactive **A**sync **N**ode **K**it **J**avaScript **S**uspense **T**ree **E**ngine **I**ntegrated **N**atively

**Frank J. Stein** es un motor de renderizado y framework UI para JavaScript nativo. Construye interfaces de usuario asíncronas, reactivas y ultrarrápidas sin necesidad de transpiladores, Virtual DOM complejos o configuraciones pesadas.

*Escríbelo en JS, córrelo en el navegador. Así de simple.*

## ✨ Características Principales

* 🚀 **Cero Transpilación:** Es 100% JavaScript nativo. No necesitas Webpack, Vite, Babel ni JSX. Funciona directamente en el navegador.
* ⏳ **Asincronía y Suspense Nativo:** Maneja promesas y estados de carga de forma declarativa con fragmentos (`$f`) y `fallbacks` integrados. Olvídate de los dolores de cabeza de `useEffect` o componentes envolventes.
* ⚡ **Reactividad con Signals (KageBunshin):** Usa `createSignal` para una reactividad granular y de alto rendimiento. El DOM se actualiza solo donde es necesario.
* 🧠 **IntelliSense Completo:** Diseñado para que tu editor (como VSCode) autocomplete etiquetas HTML, atributos y selectores de clases mágicamente mientras escribes.
* 🧩 **Patrón Builder:** Escribe la jerarquía del DOM utilizando funciones puras e intuitivas.

## 📦 Instalación

Instala el paquete a través de NPM:

```bash
npm install frankjstein

```

Y luego impórtalo en tu proyecto:

```javascript
import { TuJsHtml, ELEMENT_UTIL, createSignal } from "frankjstein";

```

## 💻 Uso Básico: El poder del Suspense Asíncrono

Aquí tienes un ejemplo de lo fácil que es crear una interfaz que consume datos asíncronos con un estado de carga (Fallback) integrado:

```javascript
import { TuJsHtml, ELEMENT_UTIL } from "frankjstein";

const app = new TuJsHtml(function (tags) {
    const { main, h1, p, button, hr } = tags;
    const { "div.user-card": userCard, "span.badge": badge } = tags;

    main({ style: { padding: "20px", fontFamily: "sans-serif" } });
    h1("Panel de Usuario");
    p("Ejemplo básico de asincronía con Frank J. Stein");
    hr();

    // Fragmento Asíncrono ($f) con Suspense integrado
    tags.$f(async ({ h2, ul, li }) => {
        
        // Simulamos una petición fetch que tarda 2 segundos
        await new Promise(resolve => setTimeout(resolve, 2000));

        userCard(({ div }) => {
            h2("Frank Stein");
            badge({ style: { backgroundColor: "green", color: "white" } }, "Online");
            
            ul(({ li }) => {
                li("Rol: Desarrollador Frontend");
                li("Nivel: Dios del DOM");
            });
        });

        const btn = button("Saludar");
        btn[ELEMENT_UTIL].on("click", () => alert("¡Está vivo!"));

    }, 
    // Fallback: Lo que el usuario ve mientras la promesa se resuelve
    function fallback({ div, p, i }) {
        div({ className: "loading-skeleton" }, ({ p, i }) => {
            p( i("Cargando datos del usuario, por favor espera...") );
        });
    });
});

document.body.append(app);

```

## ⚡ Reactividad Granular con Signals (KageBunshin)

El corazón reactivo de **Frank J. Stein** está potenciado por su propia librería interna llamada `KageBunshin`. Un Signal es una envoltura alrededor de un valor que notifica automáticamente a los nodos del DOM exactos que dependen de él para que se actualicen al instante.

### Ejemplo: Un Contador Reactivo Simple

```javascript
import { TuJsHtml, ELEMENT_UTIL, createSignal } from "frankjstein";

const app = new TuJsHtml(function (tags) {
    const { div, h3, p, button, span } = tags;

    // 1. Creamos el Signal con un valor inicial de 0
    const contador = createSignal(0);

    div({ style: { padding: "15px", border: "1px solid #ddd", borderRadius: "8px" } }, () => {
        h3("Prueba de Reactividad KageBunshin");
        
        // 2. Pasamos el signal directamente al nodo.
        // El DOM se actualizará solo aquí cuando el valor cambie.
        p("Has hecho clic ", span({ style: { fontWeight: "bold", color: "blue" } }, contador), " veces.");

        // 3. Mutamos el valor desde un evento
        const btnIncrementar = button("Incrementar +1");
        
        btnIncrementar[ELEMENT_UTIL].on("click", () => {
            // El framework detecta la mutación y actualiza solo el 'span'
            contador.value = contador.value + 1; 
        });
    });
});

document.body.append(app);

```

## 🤝 Contribuir

¡A darle vida a nuevas ideas! Si tienes ejemplos interesantes creados con **Frank J. Stein**, quieres proponer nuevas funcionalidades o ayudar a mejorar la documentación, los *Pull Requests* son totalmente bienvenidos.

## 📄 Licencia

Este proyecto está bajo la Licencia Apache 2.0 - mira el archivo [LICENSE](https://github.com/tuadmin/FrankJStein/blob/main/LICENSE) para más detalles.
