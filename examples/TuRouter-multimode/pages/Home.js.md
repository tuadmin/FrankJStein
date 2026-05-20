# Historial de Desarrollo: `Home.js`

Este archivo registra el proceso de evolución del componente y las correcciones de lógica/código realizadas durante su desarrollo.

## Intentos Previos de la IA (Con errores menores)

La IA intentó escribir el componente importando `tags` directamente desde la librería. 

```javascript
// import {tags} from '../libs.js' // ❌ Error conceptual/alucinación

export default function Home() {
    return tags.div({ class: "page" }, [
        tags.h2({}, "🏠 Bienvenido a la Home"),
        tags.p({}, "Este ejemplo demuestra cómo modularizar una aplicación FrankJStein usando el nuevo TuRouter."),
        tags.div({ class: "card" }, [
            tags.p({}, "Cambiá el modo de enrutamiento arriba y mirá cómo reacciona la URL sin recargar la página.")
        ])
    ]);    
}
```

### ¿Por qué no funciona?
En `FrankJStein`, `tags` no se expone como un objeto global estático desde las exportaciones principales porque esto causaría colisiones de hilos y fugas de contexto cuando se trabaja en arquitecturas multi-threaded o con scopes aislados. 

`tags` siempre debe inyectarse a través de un callback provisto por `new TuJsHtml(tags => ...)` o definirse de forma desestructurada en firmas como las plantillas `HomeTpl({ "div.page": boxPage, ... })`.
