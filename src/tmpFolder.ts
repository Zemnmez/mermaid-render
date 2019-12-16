import { dir } from 'tmp-promise';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { must } from './must';
import { DataUri, FileUri, NpmUri,
    resolveNpmUri, extractDataUriData } from './uri';


/**
 * Used by tmpFolder; represents
 * a dir.
 */
 export type Dir = {
     /**
      * values can be a Dir object,
      * or a data: or file:// uri string
      */
     [name: string]: Dir | DataUri | FileUri | NpmUri
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

                type sourceT = typeof source;

                const handleSource = async (source: sourceT): Promise<undefined> => {
                    switch (source.scheme) {
                    case "data": 
                        return void await promisify(fs.writeFile)
                            (destination, <string>
                                 must(extractDataUriData)(source));
                    case "npm":
                        return handleSource(
                            <FileUri> must(resolveNpmUri)
                                (<NpmUri> source));

                    case "file":
                        if (!source.path)
                            throw new Error(`cannot link ${source};`+
                                `path "${source.path}" is blank`);

                        return void await promisify(fs.link)
                            (source.path, destination);

                    // (source is dir)
                    default:
                        await promisify(fs.mkdir)(destination);
                        return void await writeTmpFolder(
                            destination,
                            <Dir> source,
                            depth + 1
                        );
                    }
                }

                return handleSource(source);
            }
        ));

    await writeTmpFolder(ret.path, filesystem)

    return ret;
}
