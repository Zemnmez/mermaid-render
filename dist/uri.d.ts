import * as uri from 'uri-js';
export declare const uriToString: typeof uri.serialize;
export declare type Uri = ReturnType<typeof uri.parse>;
export declare type UriWithScheme<scheme extends string> = Uri & {
    scheme: scheme;
};
export declare const uriWithScheme: <scheme extends string>(scheme: scheme) => (u: string | uri.URIComponents) => Error | UriWithScheme<scheme>;
export declare const NpmScheme = "npm";
export declare const DataScheme = "data";
export declare const FileScheme = "file";
export declare type FileUri = UriWithScheme<typeof FileScheme>;
export declare type DataUri = UriWithScheme<typeof DataScheme>;
export declare type NpmUri = UriWithScheme<typeof NpmScheme>;
export declare const NpmUri: (u: string | uri.URIComponents) => Error | UriWithScheme<"npm">;
export declare const DataUri: (u: string | uri.URIComponents) => Error | UriWithScheme<"data">;
export declare const FileUri: (u: string | uri.URIComponents) => Error | UriWithScheme<"file">;
export declare const parseNpmUri: (u: UriWithScheme<"npm">) => Error | {
    packagename: string;
    packagepath: string;
};
export declare const resolveNpmUri: (u: UriWithScheme<"npm">) => Error | UriWithScheme<"file">;
export declare const extractDataUriData: (dataUri: UriWithScheme<"data">) => string | Error;
//# sourceMappingURL=uri.d.ts.map