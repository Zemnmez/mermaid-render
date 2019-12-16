"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.must = (fn) => (a1) => {
    const resp = fn(a1);
    if (resp instanceof Error)
        throw resp;
    return resp;
};
//# sourceMappingURL=must.js.map