import * as puppeteer from 'puppeteer';
import url from 'url';


import {
    tmpFolder, DirKey,
    FileURL, DataURI
} from './tmpFolder';




type SupportedURLTypes = DirKey | NPMURL

type imports = {
    javascript: SupportedURLTypes,
    css: SupportedURLTypes
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
    browser?: Eventually<puppeteer.Browser>
}

const u = <proto extends string>(proto: proto, u: string): url.URL & { protocol: proto } => {
    const ret = new url.URL(u);
    if (ret.protocol != proto) throw new Error(`invalid ${proto} url ${u}`)
    return ret as (url.URL & {protocol:proto});
};

export async function renderMermaid(code: string, {
    imports, browser = puppeteer.launch()
}: Config = {}): string {
    const page = (await Eventually(browser)).newPage();
    (await page).goto((await tmpFolder({
        "mermaid": u("npm","npm://mermaid"),
        "fontawesome": u("npm","npm://fontawesome")
    })).path);
}
