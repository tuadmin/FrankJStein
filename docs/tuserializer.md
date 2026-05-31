# TuSerializer: Motor de Serialización Transversal

El `TuSerializer` de FrankJStein no es simplemente un envoltorio sobre `JSON.stringify`. Es un **motor de Empaquetado y Rehidratación de Alto Rendimiento** diseñado específicamente para resolver problemas complejos de persistencia de estado, transferencia de datos hacia Web Workers (vía `RemoteModule`), y la comunicación agnóstica entre diferentes lenguajes de programación en el backend (PHP, C#, Go, Rust, etc.).

Piensa en `TuSerializer` como una **alternativa ligera y sin dependencias a Protobuf o FlatBuffers**, utilizando puro JSON pero manteniendo la semántica orientada a objetos.

## 🚀 Características Principales

1. **Rehidratación de Prototipos**: Cuando deserializas, no obtienes un objeto plano de JavaScript (POJO). Obtienes la instancia de la clase original con todos sus métodos listos para usarse.
2. **Soporte Nativo Ampliado**: Serializa y restaura correctamente `Date` y `Set` (que JSON nativo corrompe o ignora).
3. **Control de Privacidad**: Automáticamente excluye de la serialización cualquier propiedad que empiece con guion bajo (`_`) y cualquier función o método, manteniendo los payloads limpios.
4. **Validación por Manifiesto (Fail-Fast)**: Genera un manifiesto con la versión de las clases utilizadas. Si un JSON viejo intenta rehidratarse en una clase que evolucionó (o si falta una clase en el registro), lanza un error preventivo para evitar corromper la memoria del sistema.

## 🛠 Modos de Uso

TuSerializer está diseñado para trabajar en dos modalidades según tus necesidades de Developer Experience (DX) y arquitectura.

### Modo 1: Instancia Heredada (Mejor DX y Autocompletado)

Si tu clase puede heredar de `TuSerializer`, obtienes integración nativa con `JSON.stringify` y autocompletado automático al deserializar, ya que el archivo `.d.ts` sabe exactamente qué tipo va a retornar `fromJSON`.

```javascript
import { TuSerializer } from "frankjstein";

class PerfilUsuario extends TuSerializer {
    static VERSION = 1; // Obligatorio para evitar corrupciones de estado

    constructor(nombre, rol) {
        super();
        this.nombre = nombre;
        this.rol = rol;
        this.permisos = new Set(["leer", "escribir"]);
        this.ultimoAcceso = new Date();
        this._tokenInterno = "secreto-123"; // No será serializado (prefijo _)
    }

    saludar() { return `Hola, soy ${this.nombre}`; }
}

const usuario = new PerfilUsuario("Alice", "Admin");

// 1. Empaquetar: TuSerializer inyecta toJSON(), así que stringify funciona directo
const jsonStr = JSON.stringify(usuario);

// 2. Desempaquetar: Usamos fromJSON desde la clase. (Devuelve tipo 'PerfilUsuario' para el IDE)
// La clase raíz ('PerfilUsuario') es implícitamente conocida por el motor.
// El segundo argumento es para Clases Anidadas no-nativas (ej: { Rol, Departamento }).
const usuarioRestaurado = PerfilUsuario.fromJSON(jsonStr, {});

console.log(usuarioRestaurado.saludar()); // "Hola, soy Alice"
```

### Modo 2: Motor Estático Universal

Para estructuras de datos crudas, Arrays, o clases externas que no puedes (o no quieres) obligar a heredar de `TuSerializer`. 
Si las clases externas no tienen una propiedad estática `VERSION`, el motor les asigna automáticamente la versión `1`.

```javascript
import { TuSerializer } from "frankjstein";

class ClaseExterna {
    // Si no pones VERSION, asume 1
    constructor(data) { this.data = data; }
}

const dataArbitraria = [ new ClaseExterna("A"), new ClaseExterna("B") ];

// 1. Empaquetar: Usamos pack() estático
const jsonStr = TuSerializer.pack(dataArbitraria, 2);

// 2. Desempaquetar: Usamos unpack() estático
// Aquí el IDE no puede adivinar el tipo, por lo que el desarrollador debe castearlo explícitamente si usa TS/JSDoc
const restaurado = TuSerializer.unpack(jsonStr, { ClaseExterna });

console.log(restaurado[0] instanceof ClaseExterna); // true
```

## 🌍 Intención Cross-Language (Interop)

La estructura del JSON emitido por `TuSerializer` no es casualidad. Está pensada para poder ser implementada de manera trivial en cualquier lenguaje de Backend utilizando reflexión o mapeo manual.

La anatomía del documento siempre será:
```json
{
  "manifest": {
    "TuClase": 1
  },
  "payload": {
    "@": "TuClase",
    "propiedad": "valor"
  }
}
```

- El **`manifest`** permite que tu servidor PHP o C# sepa de antemano si comprende la versión de los objetos que el Frontend le está enviando, abortando la petición HTTP con un `400 Bad Request` antes de procesar un payload potencialmente malicioso o desactualizado.
- El atributo **`@`** actúa como discriminador de tipos polimórficos, indicando exactamente a qué clase DTO (Data Transfer Object) debe instanciarse ese objeto en memoria en el servidor.
- Para tipos nativos de JS incompatibles o extraños como el `Set`, el atributo `@` también se usa: `{"@": "Set", "v": [...]}`. Esto permite a los parsers en otros lenguajes traducir ese bloque en su propia estructura (ej. un `HashSet` en Java).

## ⚠️ Reglas y Anti-Patrones

> [!CAUTION]
> **El Diccionario de Clases (Registry) es innegociable.**
> Para reconstruir la cadena de prototipos, el motor *necesita* saber qué clases están permitidas. **Nunca utilices `eval()` ni resolución global dinámica de clases** para intentar rehidratar objetos, ya que eso abriría una vulnerabilidad crítica de seguridad (RCE / Prototype Pollution).
> Si llamas a `TuSerializer.unpack(str, { ClaseA })`, el sistema solo instanciará objetos de `ClaseA`, rechazando cualquier otro tipo inyectado en el payload.

> [!WARNING]
> **No olvides el `static VERSION = X`.**
> Si cambias la estructura de tu clase (añadiendo propiedades requeridas o cambiando lógica crítica), **debes** incrementar el `VERSION`. Si lees datos de `localStorage` que tenían la versión 1, el `unpack` fallará proactivamente obligándote a manejar una ruta de migración o limpiar la caché, evitando que la aplicación actúe de manera errática con datos huérfanos.
