# Historial de Desarrollo: `Contact.js`

Este archivo registra el proceso de evolución del componente y las correcciones de lógica/código realizadas durante su desarrollo.

## Intentos Previos de la IA (Con errores menores)

La IA intentó estructurar el componente asumiendo que `tags` es un import global:

```javascript
// import {tags} from '../libs.js' // ❌ Error conceptual/alucinación

export default function Contact(){
    tags.div({ class: "page" }, [
        tags.h2({}, "📞 Contacto"),
        tags.form({ onsubmit: (e) => { e.preventDefault(); alert("Enviado!"); } }, [
            tags.div({}, [
                tags.label({}, "Mensaje: "),
                tags.input({ type: "text", placeholder: "Escribí algo..." })
            ]),
            tags.button({ type: "submit" }, "Enviar")
        ])
    ]);
}
```

### ¿Por qué no funciona?
Igual que en `Home.js`, `tags` no se importa globalmente. Además, en `FrankJStein` la estructura del DOM se crea de forma secuencial y fluida pasando funciones hijo o nodos directos, no arrays tradicionales de React.
