import path from 'path';
import * as uri from 'uri-js'

export const uriToString = uri.serialize;


export type Uri = ReturnType<typeof uri.parse>

export type UriWithScheme<scheme extends string> = Uri & { scheme: scheme };

export const uriWithScheme =
    <scheme extends string>(scheme: scheme) =>
        (u: Uri | string): (UriWithScheme<scheme> | Error) =>
        {
            if (typeof(u) == "string") u = uri.parse(u);
            if (u.scheme != scheme)
                return new Error(`invalid ${scheme} uri, ${u} (${u.scheme})`);
            return u as UriWithScheme<scheme>;
        };



export const NpmScheme = "npm";
export const DataScheme = "data";
export const FileScheme = "file";
export type FileUri = UriWithScheme<typeof FileScheme>
export type DataUri = UriWithScheme<typeof DataScheme>
export type NpmUri = UriWithScheme<typeof NpmScheme>
export const NpmUri = uriWithScheme(NpmScheme);
export const DataUri = uriWithScheme(DataScheme);
export const FileUri = uriWithScheme(FileScheme);


    
export const parseNpmUri = (u: NpmUri) => {
    // remove leading "/".
    const match = /^(@\w+\/\w+|\w+)(?:\/(.*))?$/.exec(u.path??"");
    if (!match) return new Error(`invalid npm uri ${u.path}`);
    const [ , packagename, packagepath ] = match;
    return { packagename, packagepath }
}

export const resolveNpmUri = (u: NpmUri) => {
    const r = parseNpmUri(u);
    if (r instanceof Error) return r;
    const { packagename, packagepath } = r;
    return uri.parse(
        "file://" +
        path.join(require.resolve(packagename), packagepath)
    ) as FileUri
}

export const extractDataUriData = (dataUri: DataUri) => {
    const match = /^([^;]+)?(;base64)?,(.*)$/.exec(dataUri.path??"");
    if (!match) return new Error(`not a valid data uri ${dataUri}`);

    const [ , , base64Component, rest] = match;
    const data = base64Component?
        atob(rest): rest;

    return data;
}
