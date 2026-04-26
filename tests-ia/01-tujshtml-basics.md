# Examen 01: TuJsHtml Basics & DOM Construction

**Objetivo**: Validar que el agente IA sabe construir un DOM estático básico y
gestionar Fragments Asíncronos (`$f`) respetando las Reglas de Oro documentadas
en las Skills.

## Requerimientos

Deberás generar un archivo `01-tujshtml-basics.test.ts` implementando una suite
de pruebas con `bun:test` (`test`, `expect`).

### 1. **Construcción Html Con signal**

genera el siguiente HTML usando "TuJsHtml" y "createSignal" el resultado deberia
ser legible e incluso entedible y mas simplificado que escribiendo HTML

```html
<main class="card">
   <h1>Contador</h1>
   <p>Usa los botones para incrementar o decrementar el valor.</p>

   <div id="valor" class="value">0</div>

   <div class="actions">
      <button class="btn btn-primary decremento" id="btn-decremento">
         Decremento
      </button>
      <button class="btn btn-primary incremento" id="btn-incremento">
         Incremento
      </button>
   </div>
</main>
```
