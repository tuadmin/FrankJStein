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

La característica más fuerte de `TuContainer` es su capacidad de inyección
perezosa mediante `TuLazyInject`. Esto permite que una clase declare sus
dependencias, pero el framework solo las instanciará o resolverá en la fracción
de milisegundo en la que se lea por primera vez.

**Beneficios Técnicos:**

1. Elimina errores de Dependencias Circulares (A depende de B, B depende de A).
2. Mejora drásticamente el tiempo de inicio de la aplicación, ya que los
   servicios no se cargan todos juntos al arranque.

> [!WARNING]
> **El Problema del Tipo `unknown` en TypeScript** En entornos puramente `.js`,
> el autocompletado funciona mágicamente. Sin embargo, en archivos `.ts`, la
> inferencia de tipos de funciones anónimas suele resolverse como `unknown`, lo
> que provocará errores en el linter estricto de TypeScript. **Para evitar esto,
> debes pasar la clase o interfaz como Genérico explícito al inyectar.**

```typescript
import { DI, TuContainer, TuLazyInject } from "frankjstein";

class ConfigService {
    token = "123";
}

class ApiService {
    // REGLA OBLIGATORIA EN TS: Pasar el genérico <ConfigService>
    // para evitar el error de tipo 'unknown'.
    #config = TuLazyInject<ConfigService>(() => ConfigService);

    // También funciona con el alias de Namespace
    #auth = DI.LazyInject<IAuthService>(() => IAuthService);

    fetchData() {
        console.log("Token usado:", this.#config.token);
    }
}

TuContainer.addSingleton(ConfigService);
TuContainer.addTransient(ApiService);
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
## Registros con Factorías (Casos Avanzados)

A veces no basta con pasar la clase; quizás necesitás pasarle parámetros al constructor o resolver otras dependencias de forma manual. Para eso usamos las **Factorías**.

### Factoría Simple
Útil para pasar configuraciones, tokens o mocks en tests.
```javascript
TuContainer.addScope(IApiService, () => new RealApiService("api-key-123", "https://prod.api.com"));
```

### Factoría con Contexto (DI)
Podés recibir el contexto del contenedor (`di` o `ctx`) para resolver otras dependencias antes de crear tu instancia.
```javascript
TuContainer.addSingleton(IApiService, (di) => {
    // Resolvemos dependencias manualmente antes de instanciar
    const config = di.resolve(IConfigService);
    const http = di.resolve(IHttpClient);
    
    return new RealApiService(config.token, http);
});
```


> [!TIP]
> Al registrar el par `(Abstracción, Implementación)`, podés cambiar el comportamiento de toda la app (por ejemplo, para tests o entornos de desarrollo) modificando una sola línea en el Kernel.
