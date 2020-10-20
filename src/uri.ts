import path from 'path';
import atob from 'atob';

export type Uri = {
    scheme: string,
    path: string
};

export const uriToString:
    (u: Uri) => string
=
    ({ scheme, path }) => [ scheme, path ].join(":")
;

// this is shit, but it's better than what I had before
export const parseUri:
    (s: string) => Uri
=
    s => {
        const colonPos = s.indexOf(":")
        const [ scheme, path ] = [ s.slice(0, colonPos), s.slice(colonPos+1) ]
        return { scheme, path }
    }
;

export type UriWithScheme<scheme extends string> = Uri & { scheme: scheme };

export const uriWithScheme =
    <scheme extends string>(scheme: scheme) =>
        (u: Uri | string): (UriWithScheme<scheme> | Error) =>
        {

            if (typeof(u) == "string") u = parseUri(u);

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
    const [ , packagename = "", packagepath = "" ] = match;
    return { packagename, packagepath }
}

export const resolveNpmUri = (u: NpmUri) => {
    const r = parseNpmUri(u);
    if (r instanceof Error) return r;
    const { packagename, packagepath } = r;
    return parseUri(
        "file:" +
        // since 
        path.join(require.resolve(packagename), path.normalize(packagepath))
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
