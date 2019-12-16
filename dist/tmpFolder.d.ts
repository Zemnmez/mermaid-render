import { dir } from 'tmp-promise';
import { DataUri, FileUri, NpmUri } from './uri';
/**
 * Used by tmpFolder; represents
 * a dir.
 */
export declare type Dir = {
    /**
     * values can be a Dir object,
     * or a data: or file:// uri string
     */
    [name: string]: Dir | DataUri | FileUri | NpmUri;
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