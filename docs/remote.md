# RemoteModule (Web Workers Bridge)

`RemoteModule` es un subsistema puente integrado para ejecutar procesos de forma concurrente mediante la API nativa de Web Workers, ocultando la complejidad del pase de mensajes (`postMessage`).

## Funcionamiento Interno (Mirror Proxy)
FrankJStein utiliza el patrón "Mirror Proxy". Cuando invocas `.connect()`, el framework levanta un Worker en el fondo y te devuelve un objeto que emula a la clase original.
La gran diferencia es que **todo método en este proxy devuelve una Promesa**, incluso si el método original era síncrono. Esto permite a la interfaz esperar sin bloquear el Event Loop.

### El Host (Worker)
Cualquier archivo de worker debe tener una clase que herede de `RemoteModule` y ejecutarse a sí mismo invocando el método estático desde la clase hija: `MiClase.register(import.meta)`. 
El framework analiza el entorno y si detecta que está en un `WorkerGlobalScope`, activa el lado servidor de este puente RPC. Es **vital** registrar la clase hija para que el framework sepa qué métodos instanciar.

### El Cliente (Main Thread)
Al llamar a `HeavyService.connect({ name: 'WorkerName' })`, se compila internamente la URL desde donde se importó y se levanta.

## Variantes del Namespace `Remote`
El framework provee clases pre-configuradas (disponibles en el namespace `Remote` o como exportaciones directas) para manejar los ciclos de vida y ámbitos del Worker sin tener que pasar configuraciones repetitivas en cada llamada a `connect()`:

1. **`RemoteModule` (o `Remote.Simple`)**: Puente estándar. Por defecto, cada `connect()` crea una instancia nueva y aislada de Web Worker.
2. **`RemoteLocalModule` (o `Remote.Local`)**: *Tab Singleton*. Garantiza que haya una única instancia compartida dentro de la PESTAÑA ACTUAL (SPA). Múltiples vistas o componentes que se conecten hablarán con el mismo Worker en background.
3. **`RemoteSharedModule` (o `Remote.Shared`)**: *Multi-Tab*. Utiliza la API nativa de `SharedWorker`. Permite que varias pestañas o ventanas abiertas compartan exactamente la misma instancia del Worker.
4. **`RemoteGlobalModule` (o `Remote.Global`)**: *Browser Singleton*. Una única instancia maestra para toda la sesión del navegador en su totalidad.

## ⚠️ El Problema de los "Bare Specifiers" (IMPORTANTE)
Los Web Workers **no soportan Import Map Aliases** (ej: `#services/`) en la mayoría de los navegadores. 
- **REGLA DE ORO**: Todo import dentro de un archivo de Worker (o dependencias que el Worker consuma) DEBE usar rutas relativas puras (`./` o `../`).
- Si ves un error de resolución al hacer `.connect()`, revisa tus imports.

## ¿Qué variante de `Remote` elegir?

| Variante | Cuándo usarla | Beneficio |
| :--- | :--- | :--- |
| **`Simple`** | Tareas pesadas únicas y aisladas. | Máximo aislamiento de memoria. |
| **`Local`** | Procesamiento de datos de la sesión actual (SPA). | Ahorro de recursos al reutilizar el Worker en la pestaña. |
| **`Shared`** | Sincronización entre múltiples pestañas del mismo sitio. | Estado persistente entre ventanas. |

## Restricciones y Arquitectura
- **Datos Transferibles**: Los argumentos deben ser serializables. No puedes pasar funciones o referencias al DOM.
- **Aislamiento**: Dentro del worker, NO tienes acceso a `document` o `window`.
