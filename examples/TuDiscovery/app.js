/**
 * LA APP (Main Thread)
 *
 * Interfaz de usuario para interactuar con el Hub y el Worker.
 */

// USO DE ALIAS (Solo funciona en el Main Thread gracias al Import Map)
import { PI as ALIAS_PI } from "#/math";
import { ELEMENT_UTIL as $, createSignal, TuJsHtml } from "../../dist/frankjstein.js";
import { Hub } from "./hub.js";
import { DiscoveryWorker } from "./worker.js";

const app = new TuJsHtml((tags) => {
    const {
        div,
        h1,
        p,
        "button[style=padding: 10px; cursor: pointer; margin-right: 10px;]": button,
        pre,
        hr
    } = tags;

    const output = createSignal("Esperando interacción...");
    const loading = createSignal(false);

    div({ "@attrs": { style: "max-width: 600px; margin: auto; padding: 20px;" } }, () => {
        h1`TuDiscovery Example`;
        p`Este ejemplo demuestra cómo centralizar dependencias para que funcionen tanto en el Main Thread como en Workers sin usar Import Map Aliases.`;

        hr();

        // 1. Uso en el Main Thread (Callback mode)
        button(
            {
                onclick: () => {
                    Hub.math((m) => {
                        output.value = `[Hub Discovery] Resolvió PI como: ${m.PI}`;
                    });
                }
            },
            "Probar vía Hub"
        );

        // Botón usando el Alias directo
        button(
            {
                style: { background: "#e2e8f0;" },
                onclick: () => {
                    output.value = `[Direct Alias] Resolvió PI como: ${ALIAS_PI}\n(Esto fallaría en un Worker)`;
                }
            },
            "Probar vía Alias (#/)"
        );

        // 2. Uso en el Worker (Bridge Pattern)
        button(
            {
                style: {
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px;"
                },
                onclick: async () => {
                    loading.value = true;
                    output.value = "Conectando al Worker y calculando...";

                    try {
                        const worker = await DiscoveryWorker.connect();
                        const data = await worker.doWork(1000000);
                        output.value = `[Worker] Resultado: ${data.result.toFixed(2)}\nMessage: ${data.message}`;
                    } catch (e) {
                        output.value = `Error: ${e.message}`;
                    } finally {
                        loading.value = false;
                    }
                }
            },
            "Probar Hub (via Worker)"
        );

        hr();

        p`Salida:`;
        pre(
            {
                "@attrs": {
                    style: "background: #eee; padding: 10px; border-radius: 4px; min-height: 50px; white-space: pre-wrap;"
                }
            },
            output
        );

        button(
            {
                "@attrs": { style: "margin-top: 20px; font-size: 0.8em;" },
                onclick: async () => {
                    output.value = "Verificando grafo de dependencias...";
                    await Hub.$verify();
                    output.value += "\n¡Grafo verificado! Mira la consola del navegador.";
                }
            },
            "Validar Grafo (Hub.$verify)"
        );
    });
});

document.body.append(app);
