/**
 * this stuff is in another file
 * because I don't want to pollute the `window` namespace
 * with mermaid junk.
 */

import MermaidAPI from 'mermaid/mermaidAPI';

export type MermaidAPIConfig = MermaidAPI.Config

export const render = async (json: string): Promise<string> => {
    const { code, initParams } = JSON.parse(json) as
        { code: string, initParams: MermaidAPIConfig };
    
    return _render({code, initParams});
}


export const _render = async ({
    code, initParams
}: {
    code: string,
    initParams: MermaidAPIConfig
}) => {
    const wnd = (window as any as Window & {
        mermaidAPI: typeof MermaidAPI
    });
    wnd.mermaidAPI.initialize(initParams);
    return await new Promise<string>((ok) => wnd.mermaidAPI.render('render', code, ok))
};