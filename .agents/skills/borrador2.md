Nombrar correctamente estos "borradores" o "skills" (habilidades para la IA o
guías para tu equipo) es vital para que el ecosistema de tu framework crezca de
forma ordenada.

Lo que estás haciendo es separar la **Sintaxis** de la **Arquitectura**.

- `frankjstein-tujshtml` te enseña _cómo_ escribir las etiquetas (sintaxis).
- Este nuevo documento te enseña _dónde_ poner el código y _cómo_ conectarlo
  (arquitectura y patrones).

Aquí tienes las mejores opciones de nomenclatura basadas en estándares de la
industria para documentación y prompts de IA, junto con una sugerencia de cómo
estructurarlo.

### Sugerencias de Nombres para el Archivo/Skill

**Opción 1: El enfoque de Arquitectura (Recomendado)**

- **Nombre:** `frankjstein-architecture-patterns` (o
  `frankjstein-patrones-arquitectura`)
- **Por qué funciona:** Es claro y directo. Le dice a la IA o al humano que aquí
  no va a aprender cómo hacer un `div`, sino cómo estructurar una página
  completa usando el framework.

**Opción 2: El enfoque de Componentes**

- **Nombre:** `frankjstein-component-design` (o
  `frankjstein-diseno-componentes`)
- **Por qué funciona:** En el mundo frontend (React, Vue, Angular), este patrón
  de separar la vista de la lógica se conoce como _Design Components_. Es un
  término que cualquier IA ya entiende muy bien.

**Opción 3: El enfoque de la Regla de Negocio**

- **Nombre:** `frankjstein-ioc-templates` (Inversion of Control Templates)
- **Por qué funciona:** Es el nombre más técnico y exacto de lo que hicimos
  (Inversión de Control). Le indica a la IA que el núcleo de esta habilidad es
  inyectar callbacks (magia) a plantillas tontas.

---

### ¿Cómo deberías estructurar este archivo "Skill" base?

Para que este borrador sea una "habilidad" letal cuando se la pases a una IA en
el futuro, divídelo en estas 4 secciones claras (puedes usar formato Markdown
`.md`):

#### 1. Contexto y Propósito

> **Rol:** Eres un desarrollador Senior experto en el framework `frankjstein`.
> **Objetivo:** Tu objetivo es crear vistas modulares, altamente escalables y
> agnósticas a la lógica de negocio utilizando Vanilla JS, JSDoc y el motor
> `TuJsHtml`.

#### 2. Los 3 Mandamientos (Principios Core)

Aquí pegas el resumen de lo que hicimos:

1. **Contratos Estrictos:** Toda vista DEBE tener una interfaz en un archivo
   `.d.ts` (ej. `IDeudasTemplate`).
2. **Plantillas "Tontas":** Las plantillas (ej. `DeudasTableTemplate.js`) NUNCA
   manejan lógica de negocio, datasets de estado, ni `EventListeners` complejos.
   Solo renderizan UI. Deben usar `@type` para heredar el tipado del contrato.
3. **Inversión de Control (Decoradores):** Si un elemento del DOM (como un
   checkbox o botón) necesita lógica específica, el template debe recibir una
   función decoradora por parámetro (`bindSelectionLogic`) y envolver el
   elemento en ella.

#### 3. Anti-Patrones (Lo que la IA NUNCA debe hacer)

- _❌ NUNCA uses `@implements` en objetos planos, usa `@type` para mantener el
  autocompletado._
- _❌ NUNCA inyectes variables de estado directamente en los atributos HTML del
  template si estas pertenecen al flujo del controlador._
- _❌ NUNCA uses rutas relativas largas (`../../../`), usa los alias del
  Deno/Import Map como `#types/`._

#### 4. Código de Referencia (El "Golden Standard")

Aquí pegas los bloques de código más limpios que logramos hoy:

- Un ejemplo corto del archivo `ui.d.ts`.
- Un ejemplo corto de la plantilla usando `bindSelection(checkbox(), deuda)`.
- Un ejemplo corto del controlador inyectando la función mágica.

### Conclusión

Llamar a tu skill base de TuJsHtml `frankjstein-tujshtml` está perfecto. Para
este nuevo documento, mi voto definitivo es que lo nombres
**`frankjstein-architecture-patterns.md`**.

De esta forma, cuando uses una IA, puedes decirle: _"Créame la vista de
Usuarios. Usa el skill `frankjstein-tujshtml` para la sintaxis visual y aplica
las reglas del skill `frankjstein-architecture-patterns` para la estructura del
código"_. ¡La IA te generará código de nivel Senior a la primera!
