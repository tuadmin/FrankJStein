# TuJsHtml (DOM Builder & UI)

`TuJsHtml` es el motor de renderizado primario. A diferencia de React o Vue, aquí no hay un "Virtual DOM" intermedio. El código interactúa de manera directa y optimizada con el Document Object Model (DOM) real del navegador, usando abstracciones ligeras.

## Documentación Avanzada (Deep Dives)
- [Suspense y Bloques Reactivos (`$f`, `$block`)](./suspense-and-blocks.md): Para manejo de asincronía y reactividad extrema vinculada a Signals.
- [Templates y Clonación Masiva (`createTemplateHtml`)](./templates.md): Para optimización de renderizado masivo y reutilización de nodos de alto rendimiento.

## Template Literals y Tagged Templates
La construcción idiomática de la UI en FrankJStein es a través de funciones Template Tagged proporcionadas por el framework (`h1`, `p`, `div`, etc.).

```javascript
tags.p`Hola mundo, el valor es ${contadorSignal}`;
```
Esto es internamente convertido a operaciones eficientes de TextNodes reactivos.

> [!WARNING]
> **Error Común: String Interpolation vs Tagged Templates**
> Es muy fácil confundir la sintaxis de invocación de función `()` con la sintaxis de Tagged Template `\``, y la diferencia de rendimiento/comportamiento es abismal.
> 
> **Escenario 1: Renderizado Estándar (Reactividad Granular)**
> Si utilizas paréntesis `()` con interpolación nativa de JavaScript `${}`, JS resuelve el string devolviendo el valor inicial de la Signal y la reactividad **se rompe**.
> ```javascript
> // ❌ MAL: JS resuelve el string y muere la reactividad granular.
> ctx.p(`Clicks actuales: ${count}`);
> 
> // ✅ BIEN (Tagged Template): El framework intercepta la Signal y crea un TextNode reactivo.
> ctx.p`Clicks actuales: ${count}`;
> ```
> 
> **Escenario 2: Nodos DOM Inyectados**
> NUNCA uses interpolación nativa para inyectar Nodos del DOM, o JS llamará a su método `.toString()` destruyéndolos visualmente.
> ```javascript
> // ❌ ERROR CRÍTICO: Imprime "Clicks actuales: [object HTMLElement]"
> ctx.p(`Clicks actuales: ${ctx.i(count)}`);
> 
> // ✅ BIEN: El Tagged Template maneja el objeto Nodo correctamente.
> ctx.p`Clicks actuales: ${ctx.i(count)}`;
> ```
> 
> **Excepción de Rendimiento: Dentro de un `$block`**
> Si estás *dentro* de un `$block` reactivo, el bloque entero ya se destruye y re-renderiza con cada cambio. En este caso específico, usar un Tagged Template para un valor primitivo crearía una doble-suscripción redundante (una del bloque, una del nodo de texto). Aquí, **sí se recomienda** usar interpolación nativa para valores primitivos.
> ```javascript
> $block(count, (ctx) => {
>    // ⚡ SUPER RÁPIDO: El bloque maneja la reactividad, el string literal es estático y barato.
>    ctx.p(`Clicks actuales: ${count}`);
> });
> ```

## Parámetros de Configuración (`ConfigureAttributes`)
Todo elemento en TuJsHtml recibe un parámetro opcional inicial: un objeto de configuración que se alinea fuertemente con la interfaz de TypeScript `ConfigureAttributes`.
**Regla estricta:** Este objeto siempre debe ir como el primer argumento. Lo que pasas aquí se asigna como si hicieras `elemento.propiedad = valor` en el DOM nativo.
```javascript
// Configuración válida (observa que style es un OBJETO, como en el DOM nativo)
tags.button({ id: "main-btn", style: { color: "red", marginTop: "10px" } }, "Aceptar");
```

## Referencias a Nodos Reales
Cuando llamas a una función de etiqueta (`p`, `div`), esta **retorna** inmediatamente el elemento HTML puro. Esto permite mutarlo usando la API estándar del DOM antes de que siquiera se monte en pantalla.

```javascript
const miBoton = tags.button`Confirmar`;
miBoton.addEventListener("click", () => { ... });
miBoton.style.color = "blue";
```

## Atajos de Utilidad (`ELEMENT_UTIL`)
Para no usar la sintaxis imperativa de `addEventListener` todo el tiempo, el framework provee un símbolo (`ELEMENT_UTIL` alias `$`) que inyecta superpoderes a cualquier elemento renderizado.

```javascript
import { ELEMENT_UTIL as $ } from "frankjstein";

btn[$].on("click", (e) => { ... });
```

## Rendimiento vs Asincronía: Arrow Functions vs Traditional Functions
Una de las optimizaciones más extremas de `TuJsHtml` (aporta un x3 en velocidad) es el reuso del contexto. 
Aunque en JavaScript moderno `() => {}` y `function() {}` a veces son intercambiables, en `TuJsHtml` tienen significados arquitectónicos diametralmente opuestos para los constructores:

1. **Arrow Function `(ctx, parent) => {}`:** Reusa un puntero de contexto global súper rápido. Todo se renderiza secuencialmente a la máxima velocidad posible. **PELIGRO:** Si metes asincronía (ej. un `setTimeout`) dentro de este callback, para cuando el timeout se ejecute, el puntero global ya estará apuntando a otro lado y renderizarás elementos en el padre equivocado o en la raíz.
2. **Traditional Function `function(ctx, parent) {}`:** Fuerza al motor a instanciar un contexto cerrado, seguro y raíz para ese elemento. Es ligeramente más lento, pero el contexto sobrevive a tareas asíncronas.

```javascript
// ✅ RAPIDÍSIMO Y SEGURO (Síncrono)
tags.p((ctx) => ctx.span("Render secuencial"));

// ❌ ERROR CRÍTICO: 'div' terminará en cualquier otro nodo
tags.p((ctx) => {
    setTimeout(() => ctx.div("error"), 10);
});

// ✅ SEGURO ASÍNCRONO: Función tradicional ancla el contexto
tags.p(function(ctx) {
    setTimeout(() => ctx.div("ok"), 10);
});
```
*(Nota: Para asincronía real, se recomienda fuertemente usar el Suspense nativo `$f` o `$block` detallados en la Documentación Avanzada en vez de forzar setTimeouts manuales).*

## Alias y Selectores CSS Nativos
El objeto `tags` provee capacidades mágicas al desestructurar. Puedes crear una etiqueta preconfigurada pasándole clases e IDs como si fuera un selector de CSS clásico, ahorrando código.
```javascript
// Genera una función constructora para un <section id="hero" class="main">
const { "section#hero.main": sectionHero } = tags;

sectionHero({ className: "extra-class" }, () => { ... });
```

## Directivas Especiales (`@`)
Dentro del objeto de configuración, FrankJStein provee directivas especiales prefijadas con `@` para manejar casos de uso complejos de forma declarativa:
- **`@classToggle`**: Añade o remueve clases dinámicamente. Acepta un mapa donde los valores pueden ser booleanos estáticos o Signals.
- **`@addClass`**: Añade una o múltiples clases, combinándose con `className`.
- **`@attrs`**: Setea atributos puros usando `setAttribute()` (muy útil para SVG, MathML, ARIA o `data-attributes`). Todo aquí soporta Signals.
- **`@on` / `@one` / `@once`**: Bindea eventos nativos o custom.
- **`@bind:*`** (`@bind:value`, `@bind:checked`, `@bind:form`): Enlace bidireccional (Two-way binding) automático para inputs y formularios con Signals.

> [!TIP]
> **Atributos Nativos Reactivos (El poder del motor sin magia)**
> No necesitas directivas especiales para propiedades mutables del DOM. Gracias a la inferencia del framework, **las propiedades de escritura estándar del DOM (no excluidas por el linter)** aceptan Signals directamente. 
> 
> *Nota Arquitectónica:* Esto es posible porque el tipado de `TuJsHtml` bloquea propiedades inseguras, de solo lectura o internas (como `outerHTML`, `childNodes`, o `nodeValue`) usando una lista negra (`SpecialExclusionsProps`). Pero las propiedades útiles y seguras como `innerHTML`, `textContent`, `id` o `disabled` se benefician del motor reactivo sin parches:
> ```javascript
> const textSignal = createSignal("Cargando...");
> tags.button({ textContent: textSignal, disabled: true }); // ⚡ Funciona nativamente
> ```


## Multiverso de Renderizado (HTML, SVG, MathML)
FrankJStein aisla estrictamente los contextos (Namespaces) del DOM para evitar mutaciones inválidas. El motor `TuJsHtml` posee tres multiversos:
1. **HTML**: El contexto base (`tags.div`, `tags.p`).
2. **SVG (`$svg`)**: El contexto vectorial (Aún inmaduro / Experimental).
3. **MathML (`$math`)**: El contexto matemático (Aún inmaduro / Experimental).

*(Nota: SVG y MathML están en fase de experimentación, por lo que su uso profundo está reservado para casos muy específicos o pruebas de estrés del linter)*.

## Sobrecargas Mixtas (Composición Extrema)
El constructor acepta una mezcla brutal de primitivas en cualquier orden (después del objeto de configuración). Strings, números, nodos directos o callbacks; todo se orquesta en su lugar correspondiente.
```javascript
tags.p({ className: "ejemplo" }, 13, "texto", tags.b`bold`, ctx => {
    ctx.span("Inyectado desde callback");
});
```

## El Linter como Salvavidas (TypeScript / Deno)
Dado el inmenso poder de las sobrecargas de `TuJsHtml`, es **absolutamente obligatorio o altamente recomendado** desarrollar bajo un linter (TypeScript Server o Deno) apalancado en `frankjstein.d.ts`. 

El linter es el encargado de:
- Evitar que pases propiedades HTML inválidas (`invalido: 2`).
- Bloquear inyecciones de hijos en etiquetas vacías (Void elements como `<img />` o `<circle />`).
- Garantizar que respetes las fronteras entre HTML, SVG y MathML.
