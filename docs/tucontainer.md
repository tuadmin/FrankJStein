# TuContainer (Dependency Injection)

`TuContainer` es el contenedor de inversión de control (IoC) y orquestador de
dependencias de FrankJStein. Está diseñado para centralizar la instanciación de
servicios y aislar la lógica de negocio pura del entorno visual o de red.

## Ciclos de Vida

El contenedor maneja dos tipos de instanciación principales:

### Singleton (`addSingleton`)

Crea una única instancia del servicio. Toda la aplicación comparte exactamente
el mismo objeto. Ideal para:

- Servicios de Autenticación.
- Almacenamiento local (LocalStorage/SessionStorage abstractions).
- Conexiones a bases de datos o websockets globales.

### Transient (`addTransient`)

Crea una nueva instancia cada vez que el servicio es inyectado o resuelto. Ideal
para:

- Servicios de estado efímero (como un formulario que se abre y cierra).
- Controladores específicos de una vista que no deben compartir datos entre
  ellos.
- Objetos que deben reiniciarse cada vez que se accede a ellos.

### Scoped (`addScope`)

Registra una dependencia que mantiene una única instancia _por jerarquía de
Scope (Contexto)_. 

**Realidad en la Web:** En aplicaciones Web Single-Page (SPA) tradicionales, el `addScope` casi no tiene utilidad real frente al Singleton, a menos que quieras crear **"Micro Universos"** (aislamiento total de contextos para un módulo específico). Sin embargo, brilla en entornos SSR (Server Side Rendering), Bun o servidores Node.js.

Puedes crear contextos anidados usando `TuContainer.createScope()`. Esto te permite aislar instancias por cada petición HTTP (fetch) de un usuario, evitando que los datos de la sesión del Usuario A se mezclen con los del Usuario B en el mismo servidor.

## Inyección Lazy (`TuLazyInject`)

La característica más fuerte de `TuContainer` es su capacidad de inyección perezosa mediante `TuLazyInject`. Esto permite que un módulo, clase o función declare sus dependencias, pero el framework solo las instanciará o resolverá en la fracción de milisegundo en la que se lea por primera vez.

A diferencia de otros métodos de resolución, **`TuLazyInject` funciona perfectamente tanto en clases como en funciones regulares** (componentes UI), siendo el patrón preferido para evitar problemas de orden de inicialización en arquitecturas complejas.

**Beneficios Técnicos:**
1. Elimina errores de Dependencias Circulares (A depende de B, B depende de A).
2. Mejora drásticamente el tiempo de inicio de la aplicación.

### Opciones Avanzadas de Inyección (`{ context, optional }`)

En el 99% de los casos (propiedades de clases normales o componentes sincrónicos), `TuLazyInject` captura automáticamente el Scope porque la instanciación ocurre de forma sincrónica durante la fase de inyección. **No necesitas pasar opciones.**

Sin embargo, hay **Casos Especiales** (como la carga dinámica de módulos con `import()`, integraciones con Micro-Frontends o callbacks asíncronos) donde la inyección ocurre **fuera** del ciclo síncrono del contenedor.

> [!IMPORTANT]
> **Secuestro Asíncrono:** Si inyectás una dependencia de forma dinámica dentro de una promesa, un macro-task (`setTimeout`) o una resolución diferida, el motor de DI **perderá el rastro del Scope actual** y caerá silenciosamente en el Root Container, lo que causa zombificación o sobre-escritura de dependencias.
> 
> **Solo para estos casos especiales**, `TuLazyInject` exige pasar el contexto al cual atarse, usando un objeto de opciones: `{ context: target }`.

```typescript
import { DI, TuContainer, TuLazyInject } from "frankjstein";

// --- USO EN CLASES (Patrón Convencional) ---
class ApiService {
    // REGLA OBLIGATORIA EN TS: Pasar el genérico <IConfigService>
    // En JS puro, el genérico no es necesario: const config = TuLazyInject(() => IConfigService)
    
    // NOTA: Para clases normales instanciadas síncronamente, NO es necesario pasar { context: this }
    #config = TuLazyInject<IConfigService>(() => IConfigService);

    fetchData() {
        console.log("Token:", this.#config.token);
    }
}

// --- USO EN FUNCIONES / COMPONENTES UI (TuJsHtml) ---
export function MyComponent(tags) {
    // Fuera de una clase usamos 'const'. No usamos '#' ya que es sintaxis privada de clase JS.
    const config = TuLazyInject<IConfigService>(() => IConfigService);

    return tags.div(() => {
        // La dependencia se instanciará RECIÉN en este punto de renderizado
        tags.p(`El token actual es: ${config.token}`);
    });
}
```

### Componentes Híbridos (El Flag `optional`)

A veces creás un componente UI puro o una clase de servicio que puede ser instanciada **dentro de un Entorno Aislado** (donde tendrá un Scope vinculado) o directamente en el **Root de la app** (donde no lo tendrá).

Si le pasás `{ context: this }` y el contexto no está en el ScopeRegistry, el framework por seguridad **crasheará**. Para decirle a FrankJStein que es legítimo que este componente a veces no tenga Scope, usamos `{ optional: true }`:

```javascript
class ReusableComponent {
  // Si 'this' está en un Scope, lo usará. Si no (ej. root app), hará fallback al Singleton general sin explotar.
  #service = TuLazyInject(() => MyService, { context: this, optional: true });
}
```

## Desacoplamiento con Clases Abstractas (Tokens)
Para lograr un desacoplamiento real y facilitar el testing (Mocking), se recomienda usar **clases abstractas** como tokens de inyección. Esto permite inyectar una interfaz y registrar una implementación específica.

```javascript
// 1. Definición (El Contrato)
class IApiService { 
    async getData() { throw new Error("Not implemented"); }
}

// 2. Implementación Real
class RealApiService extends IApiService {
    async getData() { return fetch(...); }
}

// 3. Inyección (Patrón Lazy)
class MyComponent {
    // SIEMPRE usar una arrow function para evitar dependencias circulares
    #api = TuLazyInject(() => IApiService); 
}

// 4. Registro Simple
TuContainer.addSingleton(IApiService, RealApiService);
```

## Inyección Sincrónica (`TuInject`)

Aunque `TuLazyInject` es la norma en FrankJStein gracias a los beneficios de la carga diferida, a veces necesitás resolver la dependencia de forma **inmediata** y **sincrónica** (por ejemplo, cuando querés interactuar con la instancia real y no con un Proxy, o al inicializar configuraciones críticas).

Para esto usamos `TuInject`. Al igual que su contraparte perezosa, respeta el contexto de forma segura:

```javascript
class LoginController {
    async init() {
        // TuInject instancia y devuelve el objeto REAL inmediatamente.
        // También protege el ciclo de vida exigiendo { context: this }.
        const auth = TuInject(IAuthService, { context: this });
        
        await auth.checkSession();
    }
}
```

## Registros con Factorías (Casos Avanzados)

A veces no basta con pasar la clase; quizás necesitás pasarle parámetros al constructor o resolver otras dependencias de forma manual. Para eso usamos las **Factorías**.

### Factoría Simple
Útil para pasar configuraciones, tokens o mocks en tests.
```javascript
TuContainer.addScope(IApiService, () => new RealApiService("api-key-123", "https://prod.api.com"));
```

### Factoría con Contexto (DI)
Podés recibir el contexto del contenedor (`scope` o `ctx`) para resolver otras dependencias antes de crear tu instancia.
```javascript
TuContainer.addSingleton(IApiService, (scope) => {
    // Resolvemos dependencias manualmente antes de instanciar
    const config = scope.resolve(IConfigService);
    const http = scope.resolve(IHttpClient);
    
    return new RealApiService(config.token, http);
});
```


> [!TIP]
> Al registrar el par `(Abstracción, Implementación)`, podés cambiar el comportamiento de toda la app (por ejemplo, para tests o entornos de desarrollo) modificando una sola línea en el Kernel.
