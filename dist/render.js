"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = __importStar(require("puppeteer"));
const url_1 = __importDefault(require("url"));
const must_1 = require("./must");
const path_1 = __importDefault(require("path"));
const tmpFolder_1 = require("./tmpFolder");
const mermaid_1 = require("./mermaid");
const Eventually = async (v) => v instanceof Promise ?
    await v : v;
const u = (proto, u) => {
    const ret = new url_1.default.URL(u);
    if (ret.protocol != proto)
        throw new Error(`invalid ${proto} url ${u}`);
    return ret;
};
exports.baseImports = {
    javascript: [
        u("npm", "npm://mermaid/dist/mermaid.min.js")
    ],
    css: []
};
async function renderMermaid(code, { imports = exports.baseImports, browser = puppeteer.launch(), initParams = {} } = {}) {
    imports = await Eventually(imports);
    imports = imports == exports.baseImports ?
        imports : {
        javascript: [...imports.javascript, ...exports.baseImports.javascript],
        css: [...imports.css, ...exports.baseImports.css]
    };
    const page = await (await Eventually(browser)).newPage();
    await page.goto((await makeRenderRig(imports)).toString(), {
        waitUntil: "networkidle2"
    });
    initParams = await Eventually(initParams);
    return await page.evaluate(mermaid_1.render, JSON.stringify({
        code, initParams
    }));
}
exports.renderMermaid = renderMermaid;
/**
 * Builds an HTML file with the given javascript and css
 * assets. Places it in a temporary folder. Returns the
 * HTML file. Any NPM URIs are resolved to the file they
 * refer to. File and folder are destroyed on process exit.
 * @returns a FileURL of the synthetic HTML file
 */
const makeRenderRig = async ({ javascript, css }) => {
    const [js, style] = [javascript, css].map(list => list.map((uri) => uri.protocol != "npm" ?
        uri :
        must_1.must(tmpFolder_1.resolveNPMURL)(uri)));
    const htmlCode = `<!DOCTYPE HTML>
<title>mermaid renderer</title>
${style.map(url => `<link rel="stylesheet" type="text/css" href="${encodeURIComponent(`${url}`)}"/>`)}
${js.map(url => `<script src="${encodeURIComponent(`${url}`)}"></script>`).join("\n")}
<div id="render"></div>`;
    const indexHTMLName = "index.html";
    const { path: folderPath } = await tmpFolder_1.tmpFolder({
        [indexHTMLName]: u("data", `data:text/html;base64,${atob(htmlCode)}`)
    });
    return u("file", `file://${path_1.default.join(folderPath, indexHTMLName)}`);
};
//# sourceMappingURL=render.js.map