import { TuJsHtml } from "./libs.js";
export type IPageTpl = (
    html: TuJsHtml.Types.Tags,
    params: Record<string, string> & { signal?: AbortSignal }
) => void;
export type IPage = (options: {
    params: Record<string, string> & { signal?: AbortSignal };
}) => Node | string;
export type IAsyncPageTpl = (
    html: TuJsHtml.Types.Tags,
    params: Record<string, string> & { signal: AbortSignal }
) => Promise<void> | void;
