"use strict";
/**
 * this stuff is in another file
 * because I don't want to pollute the `window` namespace
 * with mermaid junk.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = async (json) => {
    const { code, initParams } = JSON.parse(json);
    return exports._render({ code, initParams });
};
exports._render = async ({ code, initParams }) => {
    const wnd = window;
    wnd.mermaidAPI.initialize(initParams);
    return await new Promise((ok) => wnd.mermaidAPI.render('render', code, ok));
};
//# sourceMappingURL=mermaid.js.map