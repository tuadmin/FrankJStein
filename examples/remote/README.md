# RemoteModule: Lógica de Negocio y Arquitectura

Esta carpeta documenta y demuestra cómo funciona el puente de **Web Workers** nativo del framework (`RemoteModule`).

## Intención del Diseño (Para Desarrolladores e IA)

En arquitecturas web modernas, bloquear el "Main Thread" (donde ocurre el renderizado y la captura de eventos) es el peor pecado. FrankJStein asume que vas a tener tareas pesadas, encriptación, decodificación, algoritmos o cálculos masivos, y por eso integra a `RemoteModule` directamente en el core.

### 1. El Patrón "Mirror Proxy" (Espejo Promisificado)
El principal dolor de usar Workers nativos en JavaScript es el uso manual del espagueti `postMessage` y `onmessage`.
Con FrankJStein:
- Definís una clase convencional que extiende `RemoteModule` en tu archivo de Worker.
- Importás ESA MISMA CLASE en tu cliente de la UI.
- Llamás a `await MathService.connect()` y obtenés un "Espejo" (un proxy de JavaScript).
- Desde ese momento, usás los métodos como si fueran locales, pero todos devuelven una Promesa transparente. Cero `postMessage`.

### 2. Aislamiento Físico
Al igual que en `TuContainer` se lograba aislamiento de *responsabilidades*, `RemoteModule` logra aislamiento de *proceso (CPU)*. La Vista no se da cuenta de que el servicio que está llamando corre en otro procesador físico del dispositivo del usuario.

### 3. Escalabilidad Multi-Pestaña (Remote.Shared)
Para el framework, cambiar de un Worker "Exclusivo de esta pestaña" a un Worker "Compartido entre todas las pestañas abiertas" (SharedWorker) es un simple cambio de variable base (por ejemplo heredando de `RemoteSharedModule`). La sintaxis del proxy y la lógica de consumo en el Main Thread son exactamente las mismas.

---

> **📌 Guía para IAs y Asistentes**: 
> Si el usuario te pide armar una función matemática pesada, procesar un array gigante, o una lógica destructiva para los fotogramas (FPS) del navegador, tu sugerencia automática debe ser: *"Vamos a meter esto en un RemoteModule para no freír el hilo principal"*. Escribí la clase, metele el `register(import.meta)` al final y consumila del lado de `TuJsHtml` mediante una Promesa de Proxy en el bloque de Suspense `$f`.
