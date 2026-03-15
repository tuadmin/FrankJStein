import { TuJsHtml } from "../dist/frankjstein.js";

// Lazy loading
export default () => new TuJsHtml(function (tags) {
    const { div, section, h2 } = tags;
    // Los estilos de esqueleto (Skeleton UI) son cortesía de skeleton-screen-css 
    // por nullilac (MIT License).
    document.head.appendChild(
        tags.link({ href: './skeleton.css', rel: "stylesheet" })
    );

    section({ className: "product-grid", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" } }, () => {

        // Creamos 4 bloques de suspense para simular una carga de lista
        [1, 2, 3, 4].forEach(id => {
            tags.$f(async ({ div, img, p, b }) => {
                // Simulamos carga asíncrona variable
                await new Promise(r => setTimeout(r, 1000 + (id * 500)));

                div({ className: "product-card" }, () => {
                    img({ src: `https://picsum.photos/200/150?random=${id}`, style: { borderRadius: "5px", width: "100%" } });
                    b(`Producto #${id}`);
                    p({ style: { color: "green" } }, `$${(id * 15.5).toFixed(2)}`);
                });
            },
                // FALLBACK: Esqueleto de tarjeta de producto
                function loading({ div }) {
                    div({ className: "ssc ssc-card ssc-wrapper" }, () => {
                        div({ className: "ssc-square mb", style: { minWidth: "200px", minHeight: "150px" } }); // Espacio para la imagen
                        div({ className: "ssc-line w-70 mb" }); // Espacio para el título
                        div({ className: "ssc-line w-30" });    // Espacio para el precio
                    });
                });
        });
    });
});
