# TUtils (Utilidades de Propósito General)

`TUtils` es un conjunto de herramientas estáticas diseñadas para optimizar la lógica asíncrona, el rendimiento de la memoria y la robustez del código en FrankJStein.

## 1. Caching Asíncrono (`cachedAsync`)

Esta es una de las utilidades más potentes para usar junto con el sistema de **Suspense (`$f`)**. Permite que una función asíncrona (como un `fetch` o un `import` dinámico) se ejecute **una sola vez**, devolviendo el mismo resultado (o error) en todas las llamadas subsiguientes.

### Uso Básico
```javascript
import { TUtils } from "frankjstein";

// Definimos un cargador cacheado
const loadHeavyConfig = TUtils.cachedAsync(async () => {
    console.log("Consultando API...");
    const res = await fetch("/config.json");
    return res.json();
});

// Primera llamada: Ejecuta el fetch
const config1 = await loadHeavyConfig(); 

// Segunda llamada: Devuelve el resultado instantáneamente sin repetir el fetch
const config2 = await loadHeavyConfig(); 
```

### Uso con Argumentos (`cachedAsyncByArgs`)
Ideal para peticiones que dependen de un parámetro (ej: un ID de usuario) y quieres que cada ID tenga su propia caché.

```javascript
const fetchUser = TUtils.cachedAsyncByArgs(
    (id) => fetch(`/api/users/${id}`).then(r => r.json()),
    ([id]) => `user_${id}` // Generador de clave de caché
);

await fetchUser(1); // Llamada real
await fetchUser(1); // ⚡ Caché
await fetchUser(2); // Llamada real para ID 2
```

---

## 2. Manejo Seguro de Errores (`safe`)

Inspirado en patrones de lenguajes como Go o Rust, `safe` convierte cualquier promesa en una tupla `[error, data]`, eliminando la necesidad de bloques `try/catch` anidados y facilitando el flujo de control.

```javascript
const [error, data] = await TUtils.safe(fetchData());

if (error) {
    console.error("Falló la carga:", error);
    return;
}

console.log("Datos recibidos:", data);
```

---

## 3. Control del Event Loop (`scheduleTask`)

Permite ejecutar callbacks de forma asíncrona priorizando microtareas (más rápido que `setTimeout(0)`) o macrotareas si no quieres bloquear el renderizado.

- **Microtask (Default)**: Se ejecuta inmediatamente después del código síncrono actual, antes de que el navegador pinte.
- **Macrotask**: Se ejecuta en el siguiente ciclo del loop (útil para tareas de baja prioridad).

```javascript
TUtils.scheduleTask(() => {
    console.log("Esto corre después del renderizado actual");
}, true); // true = MacroTask (setTimeout)
```

---

## 4. Orquestación y Lazy Loading

### `defineLazyPropertyGetter`
Define una propiedad en un objeto que solo se calcula cuando se accede a ella por primera vez. Perfecto para inicializaciones pesadas.

```javascript
const config = {};
TUtils.defineLazyPropertyGetter(config, "database", () => {
    return connectToDb(); // Solo ocurre al hacer config.database
});
```

### `sleepAsync`
Una versión moderna de `delay` que soporta cancelación nativa mediante `AbortSignal`.

```javascript
const controller = new AbortController();
// ... en algún punto: controller.abort();

await TUtils.sleepAsync(2000, controller.signal);
```

---

## 5. Llamadas Encadenadas (`repeatCall`)
Transforma una función para que pueda ser llamada en cadena de forma infinita.

```javascript
const log = TUtils.repeatCall(msg => console.log(msg));
log("Hola")("Mundo")("FrankJStein"); 
// Imprime las 3 líneas secuencialmente
```
