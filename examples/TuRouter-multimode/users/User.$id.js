import { userList } from "./_emulate_db.js";
import { TuLazyInject, ITuRouterWeb } from "../libs.js";

/**
 * Página de perfil de usuario utilizando manipulación nativa de nodos DOM.
 * Muestra el uso de TuLazyInject con contexto para preservar scopes.
 */
export default function UserDetail({ params }) {
    // Usamos el 'veneno' (link) que viene en params para encontrar el scope correcto
    const router = TuLazyInject(ITuRouterWeb, { context: params });

    const _currentUser = userList.find((u) => u.id == params.id) ?? {
        id: 0,
        name: "[Unknown]"
    };

    return boxPage(
        createEl("h2", "👤 Perfil de Usuario <b>" + _currentUser.name + "</b>"),
        boxCard(
            createEl(
                "p",
                `Viendo los detalles "${_currentUser.name}" para el ID: <code>${_currentUser.id}</code>`
            ),
            createEl("button", "⬅️ Volver", null, () => router.navigate("/usuarios"))
        )
    );
}

/**
 * Helper para estructurar la página.
 * @param {Node[]} childs
 */
function boxPage(...childs) {
    const div = document.createElement("div");
    div.className = "page";
    for (const el of childs) {
        div.appendChild(el);
    }
    return div;
}

/**
 * Helper para estructurar las tarjetas.
 * @param {Node[]} childs
 */
function boxCard(...childs) {
    const div = document.createElement("div");
    div.className = "card";
    for (const el of childs) {
        div.appendChild(el);
    }
    return div;
}

/**
 * Helper para crear elementos del DOM.
 */
function createEl(tagName, innerHtml, className = null, onclick = null) {
    const el = document.createElement(tagName);
    el.innerHTML = innerHtml;
    if (className) el.className = className;
    if (onclick) el.onclick = onclick;
    return el;
}
