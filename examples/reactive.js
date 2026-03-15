import { TuJsHtml, ELEMENT_UTIL as $, createSignal } from "../dist/frankjstein.js";

const app = new TuJsHtml(function (tags) {
    const { div, h3, p, button, span } = tags;

    // 1. Creamos el Signal con un valor inicial de 0
    const contador = createSignal(0);

    div({ style: { padding: "15px", border: "1px solid #ddd", borderRadius: "8px" } }, () => {
        h3`Prueba de Reactividad KageBunshin`;

        // 2. Pasamos el signal directamente al nodo.
        // El DOM se actualizará solo aquí cuando el valor cambie.
        p`Has hecho clic ${span({ style: { fontWeight: "bold", color: "blue" } }, contador)} veces.`;

        // 3. Mutamos el valor desde un evento
        const btnIncrementar = button`Incrementar +1`;

        btnIncrementar[$].on("click", () => {
            // El framework detecta la mutación y actualiza solo el 'span'
            contador.value = contador.value + 1;
        });
    });
});

export default app;