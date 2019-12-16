import { dir } from 'tmp-promise';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import url from 'url';
import { must } from './must';

/**
 * used by tmpFolder; represents a file to be linked
 * @example new URL("file://index.html")
 */
export type FileURL = url.URL & { protocol: "file" };

/**
 * used by tmpFolder; represents a file
 * to be created with given content
 */
export type DataURI = url.URL & { protocol: "data" };

export type NPMURL = url.URL & { protocol: "npm" };

    
export const parseNPMURL = (u: NPMURL) => {
    const match = /^(@\w+\/\w+|\w+)(?:\/(.*))?/.exec(u.pathname);
    if (!match) return new Error("invalid npm url");
    const [ packagename, packagepath ] = match;
    return { packagename, packagepath }
}

export const resolveNPMURL = (u: NPMURL) => {
    const r = parseNPMURL(u);
    if (r instanceof Error) return r;
    const { packagename, packagepath } = r;
    return new url.URL(
        "file://" +
        path.join(require.resolve(packagename), packagepath)
    ) as FileURL
}

/**
 * Used by tmpFolder; represents
 * a dir.
 */
 export type Dir = {
     /**
      * values can be a Dir object,
      * or a data: or file:// uri string
      */
     [name: string]: Dir | DataURI | FileURL | NPMURL
 }

const extractDataURIData = (dataURI: DataURI) => {
    const component = dataURI.href.slice(dataURI.protocol.length);
    const match = /^(base64;)?(.*)$/.exec(component);
    if (!match) return new Error("not a valid data uri");

    const [base64Component, rest] = match;
    const data = base64Component?
        atob(rest): rest;

    return data;
}

/**
 * tmpFolder creates a folder structure based on the input object.
 * Values of the recursive input object may be file:// strings,
 * in which case a symlink is made, or data: strings in which case
 * a new file is created.
 * 
 * The folder will automatically be destroyed on process exit.
 * @param filesystem a deep object representing
 * the filesystem
 * @example tmpFolder({
 *  src: { "index.html": "file:///usr/home/thomas/index.html" },
 * })
 * @returns a Promise representing a file structure of the given
 * shape
 */
export function tmpFolder(
    filesystem: Dir
): ReturnType<typeof dir>


export async function tmpFolder(filesystem: Readonly<Dir>) {
    const ret = await dir({ unsafeCleanup: true});

    /**
     * a recursive function to unroll a recursive object
     * defining a file structure into one with
     * symlinks pointing to any files, and 
     * dirs for any directories.
     * @param root folder to make stuff in
     * @param folder description of the folder contents
     * @param depth depth of recursion (for debugging)
     */
    const writeTmpFolder = async (
        root: Readonly<string>, folder: Dir, depth: number = 0
    ) =>
        await Promise.all(Object.entries(folder).map(
            async ([filename, source]): Promise<undefined> => {
                const destination = path.join(
                    root, filename
                );

                // (source is dir)
                if (!(source instanceof url.URL)) { 
                    await promisify(fs.mkdir)(destination);
                    return void await writeTmpFolder(
                        destination,
                        source,
                        depth + 1
                    );
                }

                switch (source.protocol) {
                case "data": 
                    return void await promisify(fs.writeFile)
                        (destination,
                            must(extractDataURIData)(source) as string);
                case "npm":
                    return void await promisify(fs.link)
                        (must(resolveNPMURL)(source).pathname, destination);
                case "file":
                    return void await promisify(fs.link)
                        (source.pathname, destination);
                }
            }
        ));

    await writeTmpFolder(ret.path, filesystem)

    return ret;
}
