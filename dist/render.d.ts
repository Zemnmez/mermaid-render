import * as puppeteer from 'puppeteer';
import { FileURL, DataURI, NPMURL } from './tmpFolder';
import { MermaidAPIConfig } from './mermaid';
declare type SupportedURLTypes = FileURL | DataURI | NPMURL;
export declare type imports = {
    javascript: Array<SupportedURLTypes>;
    css: Array<SupportedURLTypes>;
};
export declare type Eventually<T> = T | Promise<T>;
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
    initParams?: Eventually<MermaidAPIConfig>;
};
export declare const baseImports: imports;
export declare function renderMermaid(code: string, { imports, browser, initParams }?: Config): Promise<string>;
export {};
//# sourceMappingURL=render.d.ts.map