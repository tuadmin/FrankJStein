export default function Home() {
    return `
<div class="page">
    <h2>🏠 Bienvenido a la Home</h2>
    <p>Este ejemplo demuestra cómo modularizar una aplicación FrankJStein usando el nuevo TuRouter.</p>
    <div class="card">
        <p>Cambiá el modo de enrutamiento arriba y mirá cómo reacciona la URL sin recargar la página.</p>
    </div>
</div>
`;
}

/**
 * Plantilla sincrónica alternativa usando TuJsHtml.
 * @param {import("../libs.js").TuJsHtml.Types.Tags} html
 */
export function HomeTpl({ "div.page": boxPage, h2, p, "div[class=card]": Card }) {
    boxPage(
        h2`🏠 Bienvenido a la Home`,
        p`Este ejemplo demuestra cómo modularizar una aplicación FrankJStein usando el nuevo TuRouter.`,
        Card(
            p`Cambiá el modo de enrutamiento arriba y mirá cómo reacciona la URL sin recargar la página.`
        )
    );
}
