"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const must_1 = require("./must");
const path_1 = __importDefault(require("path"));
const tmpFolder_1 = require("./tmpFolder");
const uri_1 = require("./uri");
const Eventually = async (v) => v instanceof Promise ?
    await v : v;
exports.baseImports = {
    javascript: [
        must_1.must(uri_1.NpmUri)("npm:mermaid/../mermaid.min.js")
    ],
    css: []
};
/**
 * renderMermaid will render the given mermaid `code`
 * to an SVG.
 *
 * This happens by launching a headless browser, so if you're rendering
 * lots of diagrams it's recommended you maintain a `browser`
 * instance between calls.
 *
 * @param code mermaid code to render
 * @param imports extra imports to load into the HTML page
 * @param browser existing browser to use
 * @param initParams extra parameters to pass to the mermaidAPI
 * @returns svg code
 * @example
 * const svg = await renderMermaid(
 * `pie title NETFLIX
 *      "Time spent looking for movie" : 90
 *      "Time spent watching it" : 10`
 * );
 * console.log(svg);
 */
async function renderMermaid(code, { imports = exports.baseImports, browser = puppeteer_1.default.launch({
    // for wsl support
    args: ["--no-sandbox"]
}), initParams = {} } = {}) {
    imports = await Eventually(imports);
    imports = imports == exports.baseImports ?
        imports : {
        javascript: [...imports.javascript, ...exports.baseImports.javascript],
        css: [...imports.css, ...exports.baseImports.css]
    };
    const page = await (await Eventually(browser)).newPage();
    page.on("pageerror", err => console.error("browser error: ", err));
    page.on("error", err => console.error("browser error: ", err));
    const indexURL = uri_1.uriToString(await makeRenderRig(imports));
    try {
        await page.goto(indexURL, {
            waitUntil: "networkidle2"
        });
        initParams = await Eventually(initParams);
        return await page.evaluate(async (d) => {
            // gotta override the window here
            // because it's being executed in a totally
            // different environment.
            const wnd = window;
            const { initParams, code } = JSON.parse(d);
            wnd.mermaid.mermaidAPI.initialize(initParams);
            return await new Promise((ok) => wnd.mermaid.mermaidAPI.render('render', code, ok));
        }, JSON.stringify({
            code, initParams
        }));
    }
    catch (e) {
        throw new Error(`${indexURL}: ${e}`);
    }
}
exports.renderMermaid = renderMermaid;
/**
 * Builds an HTML file with the given javascript and css
 * assets. Places it in a temporary folder. Returns the
 * HTML file. Any NPM URIs are resolved to the file they
 * refer to. File and folder are destroyed on process exit.
 * @returns a FileUri of the synthetic HTML file
 */
const makeRenderRig = async ({ javascript, css }) => {
    const [js, style] = [javascript, css].map(list => list.map((uri) => uri.scheme != "npm" ?
        uri :
        must_1.must(uri_1.resolveNpmUri)(uri)));
    const htmlCode = `<!DOCTYPE HTML>
<title>mermaid renderer</title>
<div id="render"></div>
${style.map(uri => `<link rel="stylesheet" type="text/css" href="${uri_1.uriToString(uri)}"/>`)}
${js.map(uri => `<script src="${uri_1.uriToString(uri)}"></script>`).join("\n")}
`;
    const indexHTMLName = "index.html";
    const { path: folderPath } = await tmpFolder_1.tmpFolder({
        [indexHTMLName]: must_1.must(uri_1.DataUri)(`data:text/html;base64,${btoa(htmlCode)}`)
    });
    return must_1.must(uri_1.FileUri)(`file://${path_1.default.join(folderPath, indexHTMLName)}`);
};
//# sourceMappingURL=render.js.map