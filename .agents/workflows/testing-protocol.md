# Protocolo de Testing Soberano (FrankJStein)

Este documento define el estándar determinístico para la creación de pruebas de integración en FrankJStein. Tanto humanos como agentes de IA deben seguir estas reglas para garantizar la estabilidad del framework y la veracidad de la documentación.

## 1. Mandatos Principales

- **Lenguaje Obligatorio**: Todos los tests deben escribirse en **TypeScript (`.ts`)**. Esto garantiza que el framework es compatible con el autocompletado y valida el archivo `dist/frankjstein.d.ts`.
- **Tipado Fuerte**: Se prohíbe el uso de `any`. Los tests deben servir como ejemplo de cómo tipar correctamente el uso del framework.
- **Documentación Interna**: Cada `test()` o `describe()` debe estar comentado explicando **qué** está validando y **por qué** es importante para el contrato del framework.

## 2. Estructura y Organización

Los tests deben organizarse de forma modular, reflejando la estructura de las **Skills**:

```text
tests/
├── setup.ts             # Configuración de Happy-DOM y entorno global
├── tujshtml.test.ts     # Pruebas de construcción de UI y Templates
├── kagebunshin.test.ts  # Pruebas de Reactividad y Signals
├── tucontainer.test.ts  # Pruebas de Inyección de Dependencias
└── utils.test.ts        # Pruebas de utilidades (TUtils/TuWebUtils)
```

### Fraccionamiento de Tests Grandes
Si un archivo de test supera las 300 líneas o se vuelve complejo de leer:
1. Crear una subcarpeta con el nombre del módulo (ej: `tests/tujshtml/`).
2. Dividir en sub-archivos lógicos (ej: `attributes.test.ts`, `nesting.test.ts`).
3. Importar las utilidades comunes si es necesario.

## 3. Patrón de Implementación

Cada test debe seguir el patrón **AAA** (Arrange, Act, Assert) y estar alineado con los ejemplos de `docs/`.

```typescript
import { expect, test, describe } from "bun:test";
import { TUtils } from "../dist/frankjstein.js";

describe("Módulo de Utilidades", () => {
    /**
     * @description Verifica que cachedAsync previene la ejecución múltiple de una promesa.
     * @rationale Vital para el rendimiento de componentes asíncronos ($f).
     */
    test("Debe cachear el resultado de una función asíncrona", async () => {
        // Arrange
        let count = 0;
        const fn = TUtils.cachedAsync(async () => { count++; return "ok"; });

        // Act
        await fn();
        const result = await fn();

        // Assert
        expect(result).toBe("ok");
        expect(count).toBe(1); // La prueba de que solo corrió una vez
    });
});
```

## 4. Limitaciones Conocidas

- **Web Workers**: Debido a que el entorno de test corre en Bun/Happy-DOM, las pruebas de `RemoteModule` y Workers no son posibles de forma nativa en esta suite. Estos módulos se validan mediante **Pruebas Manuales** o ejemplos en la carpeta `examples/`.
- **IntersectionObserver / requestIdleCallback**: Happy-DOM tiene soporte limitado para estos. Si el test falla por falta de implementación en el entorno de pruebas, debe marcarse como `test.todo()` o saltarse con una explicación.

## 5. Validación de la IA (Protocolo para Agentes)

Antes de dar un test por válido, el agente debe:
1. Ejecutar `bun test tests/` y verificar que el código no tiene errores de sintaxis TS.
2. Asegurarse de que el test no deja procesos colgados (ej: timers no limpiados).
3. Verificar que el test apunta al archivo `dist/frankjstein.js` y no a archivos locales inexistentes.
