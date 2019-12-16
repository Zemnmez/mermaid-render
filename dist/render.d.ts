import puppeteer from 'puppeteer';
import { FileUri, DataUri, NpmUri } from './uri';
import MermaidAPI from 'mermaid/mermaidAPI';
declare type SupportedURLTypes = FileUri | DataUri | NpmUri;
export declare type imports = {
    javascript: Array<SupportedURLTypes>;
    css: Array<SupportedURLTypes>;
};
export declare type Eventually<T> = T | Promise<T>;
/**
 * Config represents configuration prameters destructured by
 * `renderMermaid`
 */
export declare type Config = {
    /**
     * extra css and javascript assets
     * to import into the rendering page
     */
    imports?: Eventually<imports>;
    /**
     * an existing puppeteer browser to use
     */
    browser?: Eventually<puppeteer.Browser>;
    /**
     * extra params to initialize mermaid with
     */
    initParams?: Eventually<MermaidAPI.Config>;
};
export declare const baseImports: imports;
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
export declare function renderMermaid(code: string, { imports, browser, initParams }?: Config): Promise<string>;
export {};
//# sourceMappingURL=render.d.ts.map