import puppeteer from 'puppeteer';
import { must } from './must';
import path from 'path';


import { tmpFolder, } from './tmpFolder';
import { FileUri, DataUri, NpmUri, resolveNpmUri, uriToString } from './uri';
import MermaidAPI from 'mermaid/mermaidAPI';

type SupportedURLTypes = FileUri | DataUri | NpmUri

export type imports = {
    javascript: Array<SupportedURLTypes>,
    css: Array<SupportedURLTypes>
}

export type Eventually<T> = T | Promise<T>;

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
    initParams?: Eventually<MermaidAPI.Config>
}

export const baseImports: imports = {
    javascript: [
        must(NpmUri)("npm:mermaid/../mermaid.min.js")
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

    page.on("pageerror", err => console.error("browser error: ", err));
    page.on("error", err => console.error("browser error: ", err));

    const indexURL = uriToString(await makeRenderRig(imports));

    try {
        await page.goto(indexURL, {
            waitUntil: "networkidle2"
        });

        initParams = await Eventually(initParams);

        return await page.evaluate(async (d: string) => {
            // gotta override the window here
            // because it's being executed in a totally
            // different environment.
            const wnd = (window as any as Window & {
                mermaid: { mermaidAPI: typeof MermaidAPI }
            });

            const { initParams, code } = JSON.parse(
                d
            ) as {initParams: MermaidAPI.Config, code: string};

            wnd.mermaid.mermaidAPI.initialize(initParams);

            return await new Promise<string>((ok) =>
                    wnd.mermaid.mermaidAPI.render('render', code, ok));
        }, JSON.stringify({
            code, initParams
        }))
    } catch (e) {
        throw new Error(`${indexURL}: ${e}`);
    }
}

/**
 * Builds an HTML file with the given javascript and css
 * assets. Places it in a temporary folder. Returns the
 * HTML file. Any NPM URIs are resolved to the file they
 * refer to. File and folder are destroyed on process exit.
 * @returns a FileUri of the synthetic HTML file
 */
const makeRenderRig = async ({ javascript, css }: imports):
 Promise<FileUri> => {
    const [js, style] = [javascript, css].map(
        list => list.map(
            (uri) => 
                uri.scheme != "npm"?
                    uri:
                    must(resolveNpmUri)(uri)
        )
    );

    const htmlCode =
`<!DOCTYPE HTML>
<title>mermaid renderer</title>
<div id="render"></div>
${style.map(uri => `<link rel="stylesheet" type="text/css" href="${uriToString(uri)}"/>`)}
${js.map(uri => `<script src="${uriToString(uri)}"></script>`).join("\n")}
`;

    const indexHTMLName = "index.html";
    const { path: folderPath } = await tmpFolder({
        [indexHTMLName]:
            must(DataUri)(`data:text/html;base64,${btoa(htmlCode)}`)
    });

    return must(FileUri)
        (`file://${path.join(folderPath, indexHTMLName)}`);
}
