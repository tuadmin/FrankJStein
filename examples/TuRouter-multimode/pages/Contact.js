import { TuJsHtml } from "../libs.js";

/**
 * Plantilla sincrónica para el formulario de contacto utilizando TuJsHtml.
 */
export default () =>
    new TuJsHtml((tags) => {
        tags["div.page"](
            tags.h2`📞 Contacto`,
            tags.form(
                {
                    onsubmit: (e) => {
                        e.preventDefault();
                        alert("¡Mensaje enviado!");
                    }
                },
                (childs) => {
                    childs.div(
                        childs.label`Mensaje: `,
                        childs.input({ type: "text", placeholder: "Escribí algo..." })
                    );

                    // Botón para hacer submit
                    childs.button`Enviar`.type = "submit";
                }
            )
        );
    });
