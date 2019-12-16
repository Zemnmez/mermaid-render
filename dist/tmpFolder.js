"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tmp_promise_1 = require("tmp-promise");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const must_1 = require("./must");
const uri_1 = require("./uri");
async function tmpFolder(filesystem) {
    const ret = await tmp_promise_1.dir({ unsafeCleanup: true });
    /**
     * a recursive function to unroll a recursive object
     * defining a file structure into one with
     * symlinks pointing to any files, and
     * dirs for any directories.
     * @param root folder to make stuff in
     * @param folder description of the folder contents
     * @param depth depth of recursion (for debugging)
     */
    const writeTmpFolder = async (root, folder, depth = 0) => await Promise.all(Object.entries(folder).map(async ([filename, source]) => {
        const destination = path_1.default.join(root, filename);
        const handleSource = async (source) => {
            switch (source.scheme) {
                case "data":
                    return void await util_1.promisify(fs_1.default.writeFile)(destination, must_1.must(uri_1.extractDataUriData)(source));
                case "npm":
                    return handleSource(must_1.must(uri_1.resolveNpmUri)(source));
                case "file":
                    if (!source.path)
                        throw new Error(`cannot link ${source};` +
                            `path "${source.path}" is blank`);
                    return void await util_1.promisify(fs_1.default.link)(source.path, destination);
                // (source is dir)
                default:
                    await util_1.promisify(fs_1.default.mkdir)(destination);
                    return void await writeTmpFolder(destination, source, depth + 1);
            }
        };
        return handleSource(source);
    }));
    await writeTmpFolder(ret.path, filesystem);
    return ret;
}
exports.tmpFolder = tmpFolder;
//# sourceMappingURL=tmpFolder.js.map