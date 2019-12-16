/**
 * this stuff is in another file
 * because I don't want to pollute the `window` namespace
 * with mermaid junk.
 */

import MermaidAPI from 'mermaid/mermaidAPI';
import mermaidAPI from 'mermaid/mermaidAPI';

export type MermaidAPIConfig = MermaidAPI.Config

export const render = async (code: string) =>
    await new Promise<string>((ok) => mermaidAPI.render('render', code, ok));