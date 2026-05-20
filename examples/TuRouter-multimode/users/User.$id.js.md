# Historial de Desarrollo: `User.$id.js`

Este archivo registra el proceso de evolución del componente y las correcciones de lógica/código realizadas durante su desarrollo.

## Intentos Previos de la IA (Con errores menores)

La IA intentó escribir el componente importando `tags` directamente desde la librería:

```javascript
// import { tags } from "../libs.js"; // ❌ Error conceptual/alucinación

/**
 * @param {{ params: { id: string } }} props 
 */
export default function UserDetail({ params }) {
    return tags.div({ class: "page" }, [
        tags.h2({}, `👤 Perfil de Usuario`),
        tags.div({ class: "card" }, [
            tags.p({}, [
                "Viendo los detalles para el ID: ",
                tags.code({}, params.id)
            ]),
            tags.button({ 
                onclick: () => window.history.back() 
            }, "⬅️ Volver")
        ])
    ]);
}
```

### ¿Por qué no funciona?
El componente de detalle de usuario debe preservar y respetar la vinculación del Scope del DI contextual. Al importar un supuesto `tags` global se perdería el Scope. Además, la versión definitiva ilustra el uso de manipulación nativa de nodos DOM reales vinculando `TuLazyInject(ITuRouterWeb, { context: params })` para resolver de forma segura e independiente el Router del scope actual.
