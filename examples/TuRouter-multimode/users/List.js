import { TuJsHtml, ITuRouterWeb, TuLazyInject, TuContainer } from "../libs.js";
import { URL_USER_DETAIL } from "../routes.js";
import { userList } from "./_emulate_db.js";
/**
 * @param {TuJsHtml.Types.Tags} tags
 * @param {object} params - Objeto envenenado con el contexto del scope
 */
export default function UsersTpl(tags, params) {
    const router = TuLazyInject(ITuRouterWeb, { context: params });
    //const router = TuContainer.resolve(ITuRouterWeb);

    tags.div(
        { className: "page" },
        tags.h2("👥 Lista de Usuarios"),
        tags.ul({ className: "user-list" }, ({ li, span, button }) => {
            for (const u of userList) {
                li(
                    span(u.name),
                    button(
                        {
                            onclick: () => {
                                //debugger;
                                console.log(router.navigate);
                                return router.navigate(URL_USER_DETAIL({ id: u.id }));
                            }
                        },
                        "Ver Perfil"
                    )
                );
            }
        })
    );
}
