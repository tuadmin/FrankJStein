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

### Scoped (`addScope`)

Registra una dependencia que mantiene una única instancia _por jerarquía de
Scope (Contexto)_. Aunque en aplicaciones Web Single-Page (SPA) el Singleton
suele ser suficiente, el `addScope` brilla en entornos SSR, Bun o servidores
Node.js.

Puedes crear contextos anidados usando `TuContainer.createScope()`. Esto te
permite aislar instancias por cada petición HTTP (fetch) de un usuario, evitando
que los datos de la sesión del Usuario A se mezclen con los del Usuario B en el
mismo servidor.

## Inyección Lazy (`TuLazyInject`)

La característica más fuerte de `TuContainer` es su capacidad de inyección
perezosa mediante `TuLazyInject`. Esto permite que una clase declare sus
dependencias, pero el framework solo las instanciará o resolverá en la fracción
de milisegundo en la que se lea por primera vez.

**Beneficios Técnicos:**

1. Elimina errores de Dependencias Circulares (A depende de B, B depende de A).
2. Mejora drásticamente el tiempo de inicio de la aplicación, ya que los
   servicios no se cargan todos juntos al arranque.

```typescript
import { TuContainer, TuLazyInject } from "frankjstein";

class ConfigService {
    token = "123";
}

class ApiService {
    // Solo se resuelve la primera vez que se accede a this.config
    #config = TuLazyInject(() => ConfigService);

    fetchData() {
        console.log("Token usado:", this.#config.token);
    }
}

TuContainer.addSingleton(ConfigService);
TuContainer.addTransient(ApiService);
```
