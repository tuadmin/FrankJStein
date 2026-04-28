# TuDiscovery Example

Este ejemplo demuestra el uso de `TuDiscovery` como un **Localizador de Servicios** y **Puente (Bridge)** para entornos multihilo.

## El Patrón Bridge

En este ejemplo, `hub.js` centraliza todas las dependencias usando rutas relativas. Esto permite que tanto la UI principal (`app.js`) como el Worker (`worker.js`) consuman los mismos módulos sin errores de resolución de alias.

### Estructura
- `hub.js`: Define el Hub de descubrimiento y re-exporta utilidades de FrankJStein.
- `worker.js`: Un worker que importa únicamente el Hub.
- `modules/math.js`: Un módulo perezoso cargado bajo demanda.
- `app.js`: La interfaz de usuario que consume el Hub de forma dual.

## Cómo ejecutarlo
Simplemente sirve la raíz del proyecto con cualquier servidor estático (ej: `npx serve`) y navega a esta carpeta.

> **Nota**: Este patrón es la solución recomendada cuando necesitas usar librerías complejas dentro de un `RemoteModule` sin depender de configuraciones globales de Import Maps que el Worker no puede ver.
