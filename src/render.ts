import * as puppeteer from 'puppeteer';
import url from 'url';
import { must } from './must';


import {
    tmpFolder,
    FileURL, DataURI, NPMURL, resolveNPMURL
} from './tmpFolder';
import { MermaidAPIConfig, render } from './mermaid';




type SupportedURLTypes = FileURL | DataURI | NPMURL

type imports = {
    javascript: Array<SupportedURLTypes>,
    css: Array<SupportedURLTypes>
}

type Eventually<T> = T | Promise<T>;

const Eventually = async <T>(v: Eventually<T>): Promise<T> => 
    v instanceof Promise?
        await v: v;


export type Config = {
    /**
     * extra css and javascript assets
     * to import into the rendering page
     */
    imports?: Eventually<imports>,

    /**
     * an existing puppeteer browser to use
     */
    browser?: Eventually<puppeteer.Browser>,

    /**
     * extra params to initialize mermaid with
     */
    initParams?: Eventually<MermaidAPIConfig>
}

const u = <proto extends string>(proto: proto, u: string): url.URL & { protocol: proto } => {
    const ret = new url.URL(u);
    if (ret.protocol != proto) throw new Error(`invalid ${proto} url ${u}`)
    return ret as (url.URL & {protocol:proto});
};

export const baseImports: imports = {
    javascript: [
        u("npm","npm://mermaid/dist/mermaid.min.js")
    ],
    css: []
}

export async function renderMermaid(code: string, {
    imports = baseImports, browser = puppeteer.launch(),
    initParams = {}
}: Config = {}): Promise<string> {

    imports = await Eventually(imports);
    
    imports = imports == baseImports?
        imports: {
            javascript: [...imports.javascript, ...baseImports.javascript],
            css: [...imports.css, ...baseImports.css]
        };


    const page = await (await Eventually(browser)).newPage();

    await page.goto((await makeRenderRig(imports)).toString(), {
        waitUntil: "networkidle2"
    });

    return await page.evaluate(render, code)
}

/**
 * Builds an HTML file with the given javascript and css
 * assets. Places it in a temporary folder. Returns the
 * HTML file. Any NPM URIs are resolved to the file they
 * refer to. File and folder are destroyed on process exit.
 * @returns a FileURL of the synthetic HTML file
 */
const makeRenderRig = async ({ javascript, css }: imports):
 Promise<FileURL> => {
    const [js, style] = [javascript, css].map(
        list => list.map(
            (uri) => 
                uri.protocol != "npm"?
                    uri:
                    must(resolveNPMURL)(uri)
        )
    );

    const htmlCode =
`<!DOCTYPE HTML>
<title>mermaid renderer</title>
${style.map(url => `<link rel="stylesheet" type="text/css" href="${encodeURIComponent(`${url}`)}"/>`)}
${js.map(url => `<script src="${encodeURIComponent(`${url}`)}"></script>`).join("\n")}
<div id="render"></div>`;

    const indexHTMLName = "index.html";
    const { path: folderPath } = await tmpFolder({
        [indexHTMLName]:
            u("data", `data:text/html;base64,${atob(htmlCode)}`)
    });

    return u("file", `file://${path.join(folderPath, indexHTMLName)}`)
}
