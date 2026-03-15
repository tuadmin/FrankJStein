<p align="center">
  <img src="./assets/logo-full.svg" alt="FrankJStein Framework Logo" width="500" />
</p>

# FrankJStein

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
import { TuJsHtml } from "frankjstein";

const app = new TuJsHtml(function (tags) {
    const { main, h1, p, hr } = tags;
    // ❌ Error común: Desestructurar etiquetas que se usarán post-await en el scope global.
    // const { "div.user-card": userCard } = tags; 

    main({ style: { padding: "20px", fontFamily: "sans-serif" } });
    h1`Panel de Usuario`;
    p`Ejemplo básico de asincronía con Frank J. Stein`;
    hr();

    // Fragmento Asíncrono ($fragment) con Suspense integrado
    // ✅ Siempre desestructura desde los 'tags' internos pasados al callback
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
        btn.addEventListener("click", () => alert("¡Está vivo!"));

    }, 
    // Fallback: Lo que el usuario ve mientras la promesa se resuelve
    function fallback({ div, p, i }) {
        div({ className: "loading-skeleton" }, ({ p, i }) => {
            p(i`Cargando datos del usuario, por favor espera...`);
        });
    });
});

document.body.append(app);
```

## ⚡ Reactividad Granular con Signals (KageBunshin)

El corazón reactivo de **Frank J. Stein** está potenciado por su propia librería interna llamada `KageBunshin`. Un Signal es una envoltura alrededor de un valor que notifica automáticamente a los nodos del DOM exactos que dependen de él para que se actualicen al instante.

### Ejemplo: Un Contador Reactivo Simple

```javascript
import { TuJsHtml, ELEMENT_UTIL as $, createSignal } from "frankjstein";

const app = new TuJsHtml(function (tags) {
    const { div, h3, p, button, span } = tags;

    // 1. Creamos el Signal con un valor inicial de 0
    const contador = createSignal(0);

    div({ style: { padding: "15px", border: "1px solid #ddd", borderRadius: "8px" } }, () => {
        h3`Prueba de Reactividad KageBunshin`;
        
        // 2. Pasamos el signal directamente interpolado en literales.
        // El DOM se actualizará solo aquí cuando el valor cambie.
        p`Has hecho clic ${span({ style: { fontWeight: "bold", color: "blue" } }, contador)} veces.`;

        // 3. Mutamos el valor desde un evento
        const btnIncrementar = button`Incrementar +1`;
        
        btnIncrementar[$].on("click", () => {
            // El framework detecta la mutación y actualiza solo el 'span'
            contador.value = contador.value + 1; 
        });
    });
});

document.body.append(app);
```

## 🧠 Filosofía y Buenas Prácticas

FrankJStein te da un poder absoluto sobre el DOM, pero un gran poder requiere responsabilidad. Para evitar caer en "Pyramids of Doom" o en errores de Scope, te recomendamos adoptar estas prácticas:

### 1. Usa Template Literals
En lugar de pasar strings como argumentos formales `h1("Hello World js")`, las etiquetas de FrankJStein soportan funciones de literales. **Usa \`strings\` directamente**: 
```js
h1`Hello World js` 
```
También puedes interpolar nodos y signals limpiamente: 
```js
h1`Conteo: ${tags.i(signal)}`;
```

### 2. Mini-componentes y JSDoc (Separación de Dominios)
Cuando la UI empieza a crecer, extrae porciones de la interfaz a funciones puras. Utiliza el tipo `TuJsHtml.Types.Tags` a través de JSDoc para que tu editor mantenga el auto-completado nativo en todo lugar.

```javascript
/**
 * @param {TuJsHtml.Types.Tags} tags 
 * @param {number} id 
 */
function renderProductCard({ "div.card": card, img, p, b }, id) {
    card(() => {
        img({ src: `https://picsum.photos/200?random=${id}` });
        b(`Producto #${id}`);
        p`Precio: $${(id * 15.5).toFixed(2)}`;
    });
}
```

### 3. El Gotcha del "Contexto Asíncrono"
El motor inyecta nodos de forma secuencial síncrona mediante un "cursor" interno. Si cruzas un `await` en un fragmento asíncrono e intentas utilizar una etiqueta desestructurada *antes* de ese await (en el scope global), perderás el contexto y se inyectará en la raíz del documento. 

**Solución**: Siempre que uses `$fragment`, desestructura los recursos visuales utilizando el objeto inyectado **dentro del callback asíncrono**. No declares componentes visuales por fuera de su scope temporal si planeas cruzarlos mediante asincronías.

## 🤝 Contribuir

¡A darle vida a nuevas ideas! Si tienes ejemplos interesantes creados con **Frank J. Stein**, quieres proponer nuevas funcionalidades o ayudar a mejorar la documentación, los *Pull Requests* son totalmente bienvenidos.

## 📄 Licencia

Este proyecto está bajo la Licencia Apache 2.0 - mira el archivo [LICENSE](https://github.com/tuadmin/FrankJStein/blob/main/LICENSE) para más detalles.

## 📜 Créditos y Reconocimientos

* **Skeleton UI:** Los estilos de carga utilizados en los ejemplos de Suspense provienen de [Skeleton Screen CSS](https://github.com/nullilac/skeleton-screen-css) por nullilac (Licencia MIT).
* **Core Engine:** FrankJStein utiliza una arquitectura nativa optimizada para el rendimiento del DOM.

## ❤️ Apoya el proyecto

Si FrankJStein te ha sido útil, considera apoyar su desarrollo. ¡Cada pequeña contribución ayuda a mantener al monstruo con vida!

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor_me-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white)](https://github.com/sponsors/tuadmin)