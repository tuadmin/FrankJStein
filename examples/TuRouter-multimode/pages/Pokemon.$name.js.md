# Historial de Desarrollo: `Pokemon.$name.js`

Este archivo registra el proceso de evolución del componente y las correcciones de lógica/código realizadas durante su desarrollo.

## Intentos Previos de la IA (Con errores menores)

La IA intentó escribir el render final declarativo comentando las interacciones nativas con el nodo. Intentó usar `tags.div` dentro de un bloque que requería desestructuración o manipulación directa de nodos:

```javascript
// Volvemos a usar los tags de TuJsHtml de forma declarativa e interactiva
// tags.div({ className: "page" },
//     tags.h2(`✨ Pokémon: ${data.name.toUpperCase()}`),
//     tags.div({ className: "card" },
//         (ctx) => {
//             ctx.img({ src: data.sprites.front_default || "", alt: data.name, style: "width: 120px; display: block; margin: 0 auto;" });
//             ctx.p`ID Nacional: <code>#${data.id}</code>`;
//             ctx.p`Tipo principal: <code>${data.types[0]?.type?.name}</code>`;
//             ctx.p`Altura: <code>${data.height / 10} m</code>`;
//             ctx.p`Peso: <code>${data.weight / 10} kg</code>`;
//             ctx.button({ onclick: () => router.navigate("/") }, "🏠 Volver al Inicio");
//         }
//     )
// );
```

Y en el renderizado de errores:

```javascript
// tags.div({ className: "page" },
//     tags.h2("❌ Error en la Búsqueda"),
//     tags.div({ className: "card" },
//         tags.p(err.message),
//         tags.button({ onclick: () => router.navigate("/") }, "Volver a la Home")
//     )
// );
```

### ¿Por qué se modificó?
Porque el orquestador y los tests del framework comprueban que el nodo contenedor mantenga sus manejadores de ciclo de vida intactos. Al limpiar el contenedor y re-inyectar los elementos usando la desestructuración de `container[$].tags` (la API nativa y optimizada de `TuJsHtml`), garantizamos que el recolector de basura limpie las referencias anteriores y que el rendimiento sea óptimo.
