# TuWebUtils (Utilidades Específicas de la Web)

`TuWebUtils` proporciona herramientas diseñadas para optimizar el rendimiento del navegador al manejar tareas comunes como procesamiento de datos masivos, formularios y visibilidad.

## 1. Procesamiento Masivo con Time Slicing (`forEachAsync`)

Esta es la joya de la corona para el rendimiento en FrankJStein. `forEachAsync` permite procesar colecciones enormes (arrays de 50k+ elementos) sin congelar la interfaz de usuario (el famoso "jank").

### ¿Cómo funciona?
El motor procesa una cantidad pequeña de elementos (`batchSize`), cede el control al navegador para que pueda procesar eventos de entrada (scroll, clicks) y pintar, y luego continúa.

### Uso Estándar
```javascript
import { TuWebUtils } from "frankjstein";

const hugeList = [...Array(100000).keys()];

await TuWebUtils.forEachAsync(hugeList, (item, index) => {
    // Procesa cada item
    doHeavyMath(item);
}, { batchSize: 100 }); 
```

### Uso de Tiempo Libre (`useIdle`)
Si la tarea no es urgente (ej: analíticas o pre-procesamiento), puedes usar `useIdle: true`. El navegador ejecutará el bucle solo cuando esté inactivo utilizando `requestIdleCallback`.

```javascript
await TuWebUtils.forEachAsync(data, (item) => {
    sendToAnalytics(item);
}, { useIdle: true });
```

---

## 2. Serialización Inteligente de Formularios (`formToObject`)

Convierte cualquier `HTMLFormElement` en un objeto JSON plano, manejando automáticamente la validación nativa del navegador.

### Características Especiales:
- **Soporte para Arrays**: Si un input tiene `name="roles[]"`, se agrupará automáticamente en un array en el objeto resultante.
- **Validación Integrada**: Llama internamente a `checkValidity()` y devuelve `null` si el formulario es inválido.

```javascript
const form = document.querySelector("#user-form");

const data = TuWebUtils.formToObject(form);

if (data) {
    console.log("Enviando:", data.roles); // ['admin', 'editor']
}
```

---

## 3. Visibilidad Reactiva (`whenVisibleAsync`)

Un wrapper optimizado de `IntersectionObserver` que devuelve una promesa que se resuelve solo cuando el elemento entra en el viewport por primera vez.

```javascript
const banner = document.querySelector(".banner-footer");

// Esperamos a que sea visible para cargar el recurso pesado
await TuWebUtils.whenVisibleAsync(banner);

console.log("El banner ya es visible, cargando imagen 4k...");
```

---

## 4. Medición y Optimización

### `debounce`
Crea una versión de la función que retrasa su ejecución hasta que hayan pasado 'wait' milisegundos desde la última vez que fue invocada. Ideal para búsquedas en tiempo real o redimensionamiento de ventanas.

```javascript
// ✅ Ejemplo: Filtrar una lista masiva solo cuando el usuario deja de escribir
const search = TuWebUtils.debounce((query) => {
   console.log("Buscando en la DB:", query);
}, 300);

input.oninput = (e) => search(e.target.value);
```

### `throttle`
Crea una versión de la función que, al ser invocada repetidamente, solo ejecuta la original como máximo una vez cada 'wait' milisegundos. Perfecta para optimizar eventos de scroll.

```javascript
// ✅ Ejemplo: Actualizar scroll con alto rendimiento (60fps friendly)
const onScroll = TuWebUtils.throttle((e) => {
   console.log("Nueva posición:", window.scrollY);
}, 100);

window.addEventListener('scroll', onScroll);
```

---

## 🎯 ¿Cuándo usar estas utilidades?

- **`forEachAsync`**: Siempre que tengas que recorrer una lista de más de 1000 elementos y realizar alguna operación en cada uno.
- **`formToObject`**: En cualquier envío de formulario (petición POST) para evitar el mapeo manual de campos.
- **`whenVisibleAsync`**: Para implementar "Lazy Loading" de componentes pesados o disparar animaciones "On Reveal".
