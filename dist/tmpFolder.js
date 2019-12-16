"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tmp_promise_1 = require("tmp-promise");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const url_1 = __importDefault(require("url"));
const must_1 = require("./must");
exports.parseNPMURL = (u) => {
    const match = /^(@\w+\/\w+|\w+)(?:\/(.*))?/.exec(u.pathname);
    if (!match)
        return new Error("invalid npm url");
    const [packagename, packagepath] = match;
    return { packagename, packagepath };
};
exports.resolveNPMURL = (u) => {
    const r = exports.parseNPMURL(u);
    if (r instanceof Error)
        return r;
    const { packagename, packagepath } = r;
    return new url_1.default.URL("file://" +
        path_1.default.join(require.resolve(packagename), packagepath));
};
const extractDataURIData = (dataURI) => {
    const component = dataURI.href.slice(dataURI.protocol.length);
    const match = /^(base64;)?(.*)$/.exec(component);
    if (!match)
        return new Error("not a valid data uri");
    const [base64Component, rest] = match;
    const data = base64Component ?
        atob(rest) : rest;
    return data;
};
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
        // (source is dir)
        if (!(source instanceof url_1.default.URL)) {
            await util_1.promisify(fs_1.default.mkdir)(destination);
            return void await writeTmpFolder(destination, source, depth + 1);
        }
        switch (source.protocol) {
            case "data":
                return void await util_1.promisify(fs_1.default.writeFile)(destination, must_1.must(extractDataURIData)(source));
            case "npm":
                return void await util_1.promisify(fs_1.default.link)(must_1.must(exports.resolveNPMURL)(source).pathname, destination);
            case "file":
                return void await util_1.promisify(fs_1.default.link)(source.pathname, destination);
        }
    }));
    await writeTmpFolder(ret.path, filesystem);
    return ret;
}
exports.tmpFolder = tmpFolder;
//# sourceMappingURL=tmpFolder.js.map