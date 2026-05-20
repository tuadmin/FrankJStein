# Guía de Convenciones y Receta de Enrutamiento (router-multimode)

Este ejemplo es el laboratorio de pruebas oficial para ilustrar la **arquitectura modular, reactiva y desacoplada** de FrankJStein. A diferencia de un proyecto cerrado de producción, este proyecto está diseñado con fines **pedagógicos**, por lo cual contiene y contrasta **múltiples estilos de renderizado y contratos de plantillas**.

Para asegurar la predictibilidad del código, evitar fugas de memoria por secuestro de hilos asíncronos y dar pautas inequívocas (esqueletos lógicos) tanto a desarrolladores humanos como a agentes de IA, establecemos las siguientes reglas y convenciones.

---

## 1. El Marco de Convenciones (`convencion.js` y `convencion.d.ts`)

Para que el editor de código proporcione autocompletado nativo completo y las IAs entiendan perfectamente los contratos esperados, el archivo [convencion.js](file:///Volumes/Monterey-DISK/Users/v3ct0r/ProyectosGit/FrankJStein/examples/router-multimode/convencion.js) y [convencion.d.ts](file:///Volumes/Monterey-DISK/Users/v3ct0r/ProyectosGit/FrankJStein/examples/router-multimode/convencion.d.ts) definen las firmas y tipos de los "esqueletos lógicos" de la aplicación.

### Contrato A: Plantillas Sincrónicas (`IPageTpl`)
- **Descripción:** Plantilla declarativa y fluida que usa `TuJsHtml`.
- **Regla:** Su nombre de función exportada por defecto **DEBE** terminar en `Tpl` (ej: `EjemploTpl`).
- **Instanciación:** El cargador automatizado de `app.js` detecta este sufijo y lo envuelve automáticamente en `new TuJsHtml(...)`.
- **Tipo:** `(tags: TuJsHtml.Types.Tags, params: Record<string, string>) => void;`

### Contrato B: Funciones Genéricas / Legacy (`IPage`)
- **Descripción:** Función tradicional que recibe parámetros y devuelve directamente un `Node` del DOM real, o un `string` HTML puro para renderizado legacy.
- **Regla:** Su nombre de función **NO** debe terminar en `Tpl` (ej: `Home`, `UserDetail`).
- **Tipo:** `(params: Record<string, string>) => Node | string;`

### Contrato C: Plantillas Asincrónicas con Cancelación (`IAsyncPageTpl`)
- **Descripción:** Plantilla que realiza operaciones asíncronas remotas (llamadas a APIs, `fetch`) y **exige** el control obligatorio de aborto para evitar race conditions y peticiones fantasma.
- **Regla:** Su nombre de función exportada por defecto **DEBE** terminar en `Tpl` (ej: `PokemonTpl`).
- **Tipo:** `(tags: TuJsHtml.Types.Tags, params: Record<string, string> & { signal: AbortSignal }) => Promise<void> | void;`

---

## 2. El Contrato Asíncrono de Cancelación (`AbortSignal`)

Cuando un usuario navega rápidamente de una página a otra, las peticiones HTTP que estén en curso dentro de un componente asíncrono deben ser abortadas de inmediato para no saturar la red ni actualizar elementos del DOM que ya no están montados.

### Cómo funciona en `app.js`:
Cada vez que el enrutador cambia de ruta, el orquestador ejecuta el ciclo de cancelación:
1. Llama a `this.currentAbortController.abort()` para cancelar las tareas del componente anterior.
2. Inicializa un nuevo `AbortController`.
3. Inyecta la señal de aborto (`signal`) dentro del objeto de parámetros que recibe la página: `match.params.signal = signal;`.

### Cómo consumirlo en una página asíncrona:
Dentro de tu plantilla asíncrona (ej: [Pokemon.$name.js](./pages/Pokemon.%24name.js)), siempre debes pasar `params.signal` a tus llamadas asíncronas de `fetch`:

```javascript
export default async function PokemonTpl(tags, params) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/...`, {
            signal: params.signal // 👈 Petición abortable en red automáticamente
        });
        const data = await res.json();
        
        if (params.signal.aborted) return; // 👈 Evita procesar si ya se navegó a otro lado
        
        // ... Renderizar datos ...
    } catch (err) {
        if (err.name === "AbortError") {
            console.log("⏳ Fetch cancelado con éxito.");
            return;
        }
        // ... Manejar otros errores ...
    }
}
```

---

## 3. Ilustración de los 7 Estilos de Enrutamiento

Para aprender las diferentes técnicas soportadas por el motor de enrutamiento y el inyector de dependencias (DI) de FrankJStein, en [routes.js](file:///Volumes/Monterey-DISK/Users/v3ct0r/ProyectosGit/FrankJStein/examples/router-multimode/routes.js) se exponen y comentan 7 enfoques de registro:

| Estilo | Mecánica | Carga | Ejemplo |
|---|---|---|---|
| **A** | Instanciación `TuJsHtml` manual inline directamente en el handler. | Diferida manual | `URL_USERS` |
| **B** | Importación dinámica pura. Autodetecta el sufijo `*Tpl` y lo monta. | Diferida automática | `URL_USER_DETAIL` |
| **C** | Legacy/Raw HTML. Retorna un string plano y se monta vía `innerHTML`. | Diferida automática | `URL_PAGES.HOME` |
| **D** | Retorna un `Node` real o `TuJsHtml` directo mediante función tradicional. | Diferida automática | `URL_PAGES.CONTACT` |
| **E** | `IAsyncPageTpl`. Importación asíncrona abortable con `AbortSignal`. | Diferida asíncrona | `URL_POKEMON` |
| **F** | Componente básico sincrónico estructurado bajo la convención JSDoc. | Diferida automática | `URL_EJEMPLO` |
| **G** | `IPage` (Vanilla JS DOM). Listado asíncrono que retorna un `Node` nativo de inmediato y carga/muta el DOM en segundo plano de forma abortable con APIs nativas del navegador. | Diferida asíncrona | `URL_POKEMON_LIST` |

---

## 4. Convención de Nombres de Archivos Dinámicos (`$param`)

Cuando una ruta acepta parámetros comodín (ej: `:name` o `:id`), el archivo correspondiente dentro del sistema de archivos debe seguir la estructura:
`NombreComponente.$parametro.js`

Esto le da a la estructura del directorio una pista visual explícita de qué archivos son dinámicos y a qué parámetros corresponden:
- [User.$id.js](file:///Volumes/Monterey-DISK/Users/v3ct0r/ProyectosGit/FrankJStein/examples/router-multimode/users/User.%24id.js) -> Atiende a `/usuario/:id` (`params.id`).
- [Pokemon.$name.js](file:///Volumes/Monterey-DISK/Users/v3ct0r/ProyectosGit/FrankJStein/examples/router-multimode/pages/Pokemon.%24name.js) -> Atiende a `/pokemon/:name` (`params.name`).

---

## 5. Receta para Agregar una Nueva Página (Checklist)

### Paso 1: Definir la URL en `routes.js`
Define tu constante exportada:
```javascript
export const URL_MYPAGE = () => "/mipagina";
```

### Paso 2: Crear el archivo usando el esqueleto correspondiente
Crea tu archivo (ej: `pages/MyPage.js`) aplicando el tipado JSDoc de `convencion.js` para asegurar el autocompletado:

```javascript
/**
 * @type {import("./../convencion.js").IPageTpl}
 */
export default function MyPageTpl(tags, params) {
    tags.div({ className: "page" },
        tags.h2("Página Nueva Sincrónica")
    );
}
```

### Paso 3: Registrar la ruta en `routes.js`
Elige el estilo que mejor se adapte (se recomienda **Estilo B** para componentes síncronos simples, o **Estilo E** si consumes APIs):
```javascript
router.add(URL_MYPAGE, () => import("./pages/MyPage.js"));
```

---

## 6. Emulación de Estados y Protección de Rutas (Route Guard)

Para demostrar cómo interactúa el orquestador del enrutador con el inyector de dependencias (`TuContainer`) y resolver estados compartidos, implementamos un sistema completo de autenticación y protección de rutas:

### El Servicio de Autenticación (`AuthService` / `IAuthService`)
Registrado bajo `IAuthService` en el contenedor DI a nivel de Scope, expone la sesión del entrenador:
*   `isLoggedIn`: booleano reactivo que define si el usuario se autenticó.
*   `username`: string con el nombre provisto.
*   `login(username)` & `logout()`: gestionan el estado y notifican cambios para refrescar la interfaz del header de forma reactiva.

### Redirección Transparente (Route Guard)
En [app.js](./app.js), al interceptar el cambio de ruta, evaluamos si la ruta destino está protegida (ej: `/pokemons`, `/pokemon/:name`, `/usuario/:id`). Si no hay sesión iniciada:
1.  Se bloquea el flujo del resolvedor original de la ruta.
2.  Se almacena la ruta original en `pendingRedirect`.
3.  Se redirige internamente hacia `/login`.
4.  Una vez que el usuario inicia sesión de forma exitosa en el componente [Login.js](./pages/Login.js), el sistema lo redirige automáticamente a la pantalla que intentaba ver.

---

## 7. Arquitectura Visual y Separación de Estilos

Para garantizar que el laboratorio sea visualmente premium, implementamos las siguientes mejoras de diseño en [index.css](./index.css):
*   **Aislamiento CSS:** Separamos por completo los estilos embebidos de `index.html` hacia un archivo de diseño unificado `index.css`.
*   **Estética Glassmorphic:** Usamos fondos semitransparentes desenfocados (`backdrop-filter: blur(16px)`), bordes sutiles y sombras profundas inspiradas en diseños modernos premium de Mac OS/iOS.
*   **Esquema HSL Oscuro:** Paleta de colores curada y balanceada para evitar fatiga visual (tonos de gris azulado profundo, con acentos en azul eléctrico y verde esmeralda).
*   **Iconografía en Botones:** Enriquecimos el menú y los botones agregando emojis descriptivos para hacer la navegación mucho más intuitiva.

