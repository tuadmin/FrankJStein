# Suspense y Bloques Reactivos

El motor `TuJsHtml` de FrankJStein incluye herramientas de renderizado avanzado para el manejo declarativo de asincronía y reactividad, sin depender de un Virtual DOM. Esto se logra mediante etiquetas especiales (`$`) en el constructor.

## 1. Async Suspense (`$f` / `$fragment`)
El framework está diseñado orgánicamente para comportarse como un **"Suspense Tree Engine"**. Permite manejar estados de espera (Loadings o Skeleton UIs) de manera nativa mientras se resuelve una promesa (como un `fetch` a una API), sin bloquear el renderizado del resto del árbol DOM.

`$f` (o su alias completo `$fragment`) acepta dos callbacks:
1. **Callback Principal**: Una función que puede ser `async`. Se ejecuta y suspende la inyección de sus nodos hasta que la promesa se resuelva.
2. **Fallback (Opcional)**: Una función síncrona que renderiza nodos inmediatamente en el lugar del fragmento. Cuando la promesa del callback principal se resuelve, estos nodos de fallback son destruidos y reemplazados por el contenido real.

### Ejemplo de Uso
```javascript
import { TuJsHtml } from "frankjstein";

const app = new TuJsHtml(function(tags) {
    const { div, h2, p, $f } = tags;

    div({ className: "container" }, () => {
        h2`Perfil del Usuario`;

        // Renderizado asíncrono con Suspense
        $f(async (ctx) => {
            const data = await fetch('/api/user/1').then(res => res.json());
            
            // Esto se renderizará cuando el fetch termine
            ctx.div({ className: "user-card" }, () => {
                ctx.b(`Nombre: ${data.name}`);
                ctx.p(`Email: ${data.email}`);
            });

        }, function fallback(ctx) {
            // Esto aparece inmediatamente en pantalla (Skeleton UI)
            ctx.p({ className: "skeleton-loader" }, "Cargando perfil...");
        });
    });
});
```
*Ventaja Arquitectónica:* A diferencia de forzar `await` en todo el componente bloqueando el árbol, `$f` permite que el resto de tu aplicación (`h2` en el ejemplo) se renderice de forma instantánea.

## 2. Bloques Reactivos (`$block`)
Mientras que `$f` reacciona a Promesas, **`$block` reacciona a Signals y Objetos Reactivos**. 
Crea un bloque de renderizado (un `DocumentFragment` gestionado internamente) que vigila activamente las dependencias en su interior. Cuando la dependencia (ej. un `Signal`) cambia de valor, FrankJStein destruye únicamente el contenido del `$block` y lo vuelve a ejecutar.

Esto te permite crear componentes reactivos extremadamente granulares sin afectar el rendimiento de los nodos hermanos.

### Ejemplo de Uso
```javascript
import { TuJsHtml, createSignal } from "frankjstein";

const app = new TuJsHtml(function(tags) {
    const { div, h2, button, p, $block } = tags;
    
    const count = createSignal(0);
    const [, setCount] = count.asTuple;

    div(() => {
        h2`Contador Reactivo`;
        
        button({ 
            "@on": { click: () => setCount(prev => prev + 1) } 
        }, "Incrementar");

        // Este bloque se re-renderiza completamente cuando 'count' muta.
        $block(count, (ctx) => {
            if (count.value > 5) {
                // Al estar dentro de un $block, usar interpolación nativa es más rápido.
                // Evita crear una subscripción secundaria redundante en el TextNode.
                ctx.p({ style: { color: "green" } }, `¡Superaste 5! Vas por: ${count}`);
            } else {
                ctx.p(`Clicks actuales: ${count}`);
            }
        });
    });
});
```

## 3. Regla de Oro: Cuidado con el Cruce de Contextos
Al usar `$f`, `$block` o `$tpl`, el callback interno recibe un nuevo parámetro de contexto (usualmente lo llamamos `ctx`).
**Es CRÍTICO que utilices las etiquetas de ese `ctx` interno y no las etiquetas del scope padre.**

Cruzar contextos (intentar renderizar un `div` del scope padre dentro de un bloque hijo asíncrono) corrompe la jerarquía del DOM y genera comportamientos inesperados, ya que el motor intenta inyectar el nodo en el padre equivocado.

```javascript
const { div, p, $f } = tags;

// ❌ MAL: Cruce de contextos (usando el 'div' del padre dentro de $f)
$f(async (ctx) => {
    div("ERROR: Este div se insertará en el lugar incorrecto");
});

// ✅ BIEN: Usar el contexto interno
$f(async (ctx) => {
    ctx.div("CORRECTO: Inyección segura en el fragmento");
});
```

*Nota: Sí es completamente válido hacer referencias directas a objetos o nodos ya construidos del padre para mutar sus propiedades (ej: `_refDiv.style.color = "red"`), lo que está prohibido es invocar sus constructores.*

## 4. Re-Renderizado Manual (El método `.reset()`)
Si observas el archivo de tipos `.d.ts`, notarás que tanto `$f`, `$fragment` como `$block` devuelven una instancia de tipo `TuJsHtml`. 

Esto significa que guardan internamente todo el estado y el `DocumentFragment`. Si por alguna razón necesitas forzar una recarga manual del bloque completo (por ejemplo, para volver a ejecutar el *fetch* de un `$f` de manera imperativa), puedes llamar al método `.reset()` sobre la instancia retornada:

```javascript
const myBlock = $f(async (ctx) => {
    const data = await fetch('/api/random').then(r => r.json());
    ctx.p(`Dato: ${data}`);
});

// En algún evento externo, forzamos que se vuelva a cargar y re-renderizar
btnActualizar[$].on("click", () => {
    myBlock.reset();
});
```

## Resumen de Cuándo Usar Qué
- **Funciones Normales (`div() => {}`)**: Estructuras de la UI estáticas o donde querés que las Signals actualizar.
- **`$f` / `$fragment`**: Para peticiones a APIs, cargas de módulos o cualquier lógica de inicialización que involucre Promesas.
- **`$block`**: Cuando una Signal condiciona la adición/eliminación de nodos complejos.
