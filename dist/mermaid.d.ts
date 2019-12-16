/**
 * this stuff is in another file
 * because I don't want to pollute the `window` namespace
 * with mermaid junk.
 */
import MermaidAPI from 'mermaid/mermaidAPI';
export declare type MermaidAPIConfig = MermaidAPI.Config;
export declare const render: (json: string) => Promise<string>;
export declare const _render: ({ code, initParams }: {
    code: string;
    initParams: MermaidAPI.Config;
}) => Promise<string>;
//# sourceMappingURL=mermaid.d.ts.map