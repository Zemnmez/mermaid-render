/// <reference types="node" />
import { dir } from 'tmp-promise';
import url from 'url';
/**
 * used by tmpFolder; represents a file to be linked
 * @example new URL("file://index.html")
 */
export declare type FileURL = url.URL & {
    protocol: "file";
};
/**
 * used by tmpFolder; represents a file
 * to be created with given content
 */
export declare type DataURI = url.URL & {
    protocol: "data";
};
export declare type NPMURL = url.URL & {
    protocol: "npm";
};
export declare const parseNPMURL: (u: NPMURL) => Error | {
    packagename: string;
    packagepath: string;
};
export declare const resolveNPMURL: (u: NPMURL) => Error | FileURL;
/**
 * Used by tmpFolder; represents
 * a dir.
 */
export declare type Dir = {
    /**
     * values can be a Dir object,
     * or a data: or file:// uri string
     */
    [name: string]: Dir | DataURI | FileURL | NPMURL;
};
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
export declare function tmpFolder(filesystem: Dir): ReturnType<typeof dir>;
//# sourceMappingURL=tmpFolder.d.ts.map