export type ExtractRouteParams<T extends string> =
    T extends `${string}{${infer Param}}${infer Rest}`
        ? { [K in Param | keyof ExtractRouteParams<Rest>]: string }
        : {};

type MergeParams<Prefix extends string, SubRoute> = SubRoute extends string
    ? ExtractRouteParams<Prefix> & ExtractRouteParams<SubRoute>
    : SubRoute extends (params: infer P) => any
      ? ExtractRouteParams<Prefix> & (P extends undefined ? {} : P)
      : ExtractRouteParams<Prefix>;

type Simplify<T> = { [K in keyof T]: T[K] };

type ParamsArg<Prefix extends string, SubRoute> =
    {} extends Simplify<MergeParams<Prefix, SubRoute>>
        ? [params?: Simplify<MergeParams<Prefix, SubRoute>>]
        : [params: Simplify<MergeParams<Prefix, SubRoute>>];

export class GroupUrl {
    prefix: string;
    subRoutes: Record<string, string | ((params: any) => string)>;
    constructor(prefix: string, subRoutes: Record<string, string | ((params: any) => string)>);
    toString(): string;
    [key: string]: any;
}

export function createGroupUrl<
    const Prefix extends string,
    const T extends Record<string, string | ((params: any) => string)>
>(
    prefix: Prefix,
    subRoutes: T
): GroupUrl & {
    [K in keyof T]: (...args: ParamsArg<Prefix, T[K]>) => string;
};
