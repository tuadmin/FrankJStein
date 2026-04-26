# Templates y Clonación Masiva

La fábrica `createTemplateHtml` (y su contraparte nativa `$tpl` dentro de
TuJsHtml) es el mecanismo de más alto rendimiento en FrankJStein para el
renderizado masivo.

Cuando necesitas renderizar listas de 10.000 elementos (como una tabla de datos
pesada o un log infinito), construir nodos individualmente con la API estándar
de TuJsHtml genera un ligero overhead. Para estos casos extremos, usas
`createTemplateHtml`.

## ¿Cómo Funciona?

`createTemplateHtml` toma un callback y lo ejecuta **una única vez** en memoria,
construyendo un fragmento de HTML crudo. Luego, devuelve una fábrica optimizada
que puede generar cientos de clones (utilizando internamente
`Node.cloneNode(true)`) a una velocidad brutal.

Aún mejor: te permite **inferir referencias** a nodos específicos del clon
resultante, dándote autocompletado en TypeScript para manipularlos de forma
directa y síncrona.

## 1. Múltiples Elementos con Inferencia de Nodos Expuestos

Podés construir una plantilla compleja y extraer referencias directas a los
nodos que vas a necesitar mutar más adelante.

```javascript
import { createTemplateHtml } from "frankjstein";

// Definimos la plantilla UNA SOLA VEZ
const templateLi = createTemplateHtml((root) => {
    const refs = {
        texto: document.createTextNode("texto inicial"),
    };

    root(({ li, span, b, i }) => {
        li(() => {
            i`italic `;
            b(refs.texto); // Insertamos el nodo de texto vivo
            span(" span");
        });
    });

    // Retornamos el objeto con las referencias que queremos exponer
    return refs;
});
```

### Método A: Clonación por Propiedad (`clone()`)

El método `.clone()` genera el nodo raíz clonado e inyecta las referencias
expuestas en una propiedad llamada `refs` (por defecto) en el propio elemento
del DOM.

```javascript
const ul = document.createElement("ul");

for (let i = 0; i < 3; i++) {
    // Genera un elemento <li> que internamente contiene la propiedad 'refs'
    const li = templateLi.clone();

    // Autocompletado nativo: sabe que li.refs.texto es un TextNode
    li.refs.texto.textContent = `Elemento número ${i}`;
    ul.appendChild(li);
}
```

### Método B: Clonación en Tupla (`cloneAsTuple()`)

El método `.cloneAsTuple()` devuelve un array donde el primer elemento es el
Fragment/Elemento raíz clonado, y el segundo elemento es el objeto de
referencias aisladas. Es ideal para desestructuración.

```javascript
for (let i = 0; i < 3; i++) {
    const [li, refs] = templateLi.cloneAsTuple();

    // Referencia aislada y fuertemente tipada
    refs.texto.textContent = `Tupla número ${i}`;
    ul.appendChild(li);
}
```

## 2. Inferencia Automática con Tagged Literals

Si prefieres usar `template literals` crudos para construir el HTML, la fábrica
lo soporta y permite utilizar selectores DOM estándar (`querySelector`) para
inferir las referencias que devolverás.

```javascript
const templateCard = createTemplateHtml((root) => {
    // Generamos el DOM crudo usando el Tagged Template del root
    const dom =
        root`<div class="card"><span class="label">{label}</span></div>`;

    return {
        // Extraemos y nombramos las referencias expuestas
        label: dom.querySelector(".label"),
    };
});

const [cardNode, cardRefs] = templateCard.cloneAsTuple();
cardRefs.label.textContent = "Usuario Premium";
document.body.appendChild(cardNode);
```

## `$tpl`: Fragmentos Estáticos en TuJsHtml

Dentro de la función principal de construcción `TuJsHtml`, tienes acceso a la
herramienta rápida `$tpl`. A diferencia de `createTemplateHtml` (que está
pensada para crear una fábrica externa), `$tpl` simplemente genera un
`DocumentFragment` independiente y estático, ideal para componer interfaces
complejas y anidarlas sin inyectarlas en el DOM real inmediatamente.

```javascript
tags.div((ctx) => {
    const fragmentoEstilo = ctx.$tpl((fCtx) => {
        fCtx.h1`Encabezado estático`;
        fCtx.p`Párrafo inmutable`;
    });

    // ... en otro momento o tras una lógica condicional ...
    ctx.div(fragmentoEstilo);
});
```

## Cuándo usar Templates vs TuJsHtml Puro

- Usa `TuJsHtml` normal (con Reactividad KageBunshin) para el 95% de la
  aplicación.
- Usa `createTemplateHtml` **estrictamente** cuando vas a iterar y renderizar un
  array masivo de datos (`map` o bucles grandes), asegurando que el GC (Garbage
  Collector) y el Motor de Renderizado no sufran el impacto de parsear callbacks
  miles de veces.
