"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const uri = __importStar(require("uri-js"));
exports.uriToString = uri.serialize;
exports.uriWithScheme = (scheme) => (u) => {
    if (typeof (u) == "string")
        u = uri.parse(u);
    if (u.scheme != scheme)
        return new Error(`invalid ${scheme} uri, ${u} (${u.scheme})`);
    return u;
};
exports.NpmScheme = "npm";
exports.DataScheme = "data";
exports.FileScheme = "file";
exports.NpmUri = exports.uriWithScheme(exports.NpmScheme);
exports.DataUri = exports.uriWithScheme(exports.DataScheme);
exports.FileUri = exports.uriWithScheme(exports.FileScheme);
exports.parseNpmUri = (u) => {
    var _a;
    // remove leading "/".
    const match = /^(@\w+\/\w+|\w+)(?:\/(.*))?$/.exec((_a = u.path, (_a !== null && _a !== void 0 ? _a : "")));
    if (!match)
        return new Error(`invalid npm uri ${u.path}`);
    const [, packagename = "", packagepath = ""] = match;
    return { packagename, packagepath };
};
exports.resolveNpmUri = (u) => {
    const r = exports.parseNpmUri(u);
    if (r instanceof Error)
        return r;
    const { packagename, packagepath } = r;
    return uri.parse("file://" +
        path_1.default.join(require.resolve(packagename), packagepath));
};
exports.extractDataUriData = (dataUri) => {
    var _a;
    const match = /^([^;]+)?(;base64)?,(.*)$/.exec((_a = dataUri.path, (_a !== null && _a !== void 0 ? _a : "")));
    if (!match)
        return new Error(`not a valid data uri ${dataUri}`);
    const [, , base64Component, rest] = match;
    const data = base64Component ?
        atob(rest) : rest;
    return data;
};
//# sourceMappingURL=uri.js.map