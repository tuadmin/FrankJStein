// @since 0.1.1-alpha
import {
    ELEMENT_UTIL as $,
    createComputedSignal,
    createSignal,
    TuJsHtml
} from "../../dist/frankjstein.js";
import { MathService } from "./worker.js";

const app = new TuJsHtml((tags) => {
    const { div, h2, p, button, input, hr } = tags;

    // Estado reactivo de la UI
    const fibResult = createSignal("Esperando acción...");
    const logs = createSignal("Iniciando...");

    // Inicialización asíncrona usando $f (Suspense) para esperar al Worker
    tags.$f(
        async ({ div, button }) => {
            logs.value += "\nConectando al Worker...";

            // Magia: Conectamos al worker llamando a .connect() sobre la misma clase importada.
            // FrankJStein levanta el script import.meta detectado en register() y nos devuelve un PROXY.
            // Cualquier método que llamemos a `workerProxy` se ejecutará de verdad en el hilo paralelo.
            const workerProxy = await MathService.connect({ name: "MathWorkerInstance" });
            console.log(workerProxy);
            logs.value += "\n¡Worker Conectado Exitosamente!";

            div(() => {
                h2`Prueba de Estrés (Sucesión de Fibonacci)`;
                p`Si calculáramos Fibonacci(35) directo en el hilo principal (browser), tu scroll y tus botones se clavarían. Probá seleccionando texto mientras calcula: vas a ver que el navegador sigue vivo.`;

                //const numInput = input({ type: "number", value: 35, style: "margin-right: 10px; padding: 5px;" });
                const numInput = input({ type: "number", value: 35 });
                // TuJsHtml te da libertad pero no tanta, pero se amolda a tu estilo
                numInput.setAttribute("style", "margin-right: 10px; padding: 5px;");
                const btnCalc = button(
                    {
                        style: { padding: "5px 10px", cursor: "pointer" }
                    },
                    "Calcular Pesado"
                );

                p({ style: { color: "green", fontWeight: "bold" } }, fibResult);

                btnCalc[$].on("click", async () => {
                    const val = Number(numInput.value);
                    fibResult.value = `Calculando Fibonacci(${val}) en el worker... ¡Probá seleccionar texto, no se congela!`;

                    const start = performance.now();

                    // Llamamos al método del worker como si estuviera acá de forma nativa.
                    // RemoteModule empaqueta, manda el postMessage y resuelve la Promesa devuelta.
                    const result = await workerProxy.calculateFibonacci(val);
                    console.log(result);
                    const end = performance.now();
                    fibResult.value = `Resultado: ${result} (Tomó ${Math.round(end - start)}ms)`;
                });

                hr();

                const btnAsync = button`Procesar Imagen (Mock Asíncrono 2s)`;
                btnAsync.setAttribute("style", "padding: 5px 10px; cursor: pointer;");
                btnAsync[$].on("click", async () => {
                    logs.value += "\nMandando a procesar imagen al worker...";
                    const res = await workerProxy.processImageMock();
                    logs.value += `\nImagen procesada: ${JSON.stringify(res)}`;
                });
            });
        },
        function fallback({ p }) {
            // Esto se pinta mientras el Worker está "booteando" y conectándose
            p`Iniciando el puente de Web Worker...`;
        }
    );

    // Consola de Logs Reactiva, consumiendo el Signal y formateando los saltos de línea a BRs
    // no está implementado aún @innerHTML
    // div({ class: "log-box", "@innerHTML": createSignal(() => logs.value.replace(/\n/g, '<br>')) });
    div({ className: "log-box" }, (_tags, refDiv) => {
        createComputedSignal(logs, (value) => {
            refDiv.innerHTML = value.replace(/\n/g, "<br>");
        });
    });
});

document.getElementById("app").appendChild(app);
