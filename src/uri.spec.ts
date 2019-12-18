import { parseNpmUri, NpmUri, DataUri, extractDataUriData } from "./uri";
import { must as regularMust } from "./must";
import btoa from 'btoa';

const must = <T1, R1>(
    f: (arg1: T1) => R1 | Error
): ((arg1:T1) => R1) =>
    (a1: T1) => {
        let o: R1 | undefined = void 0;
        expect(() => o = regularMust(f)(a1)).not.toThrow();
        return o as any as R1;
    };

describe.each([
    ["mermaid", "dist/mermaid.min.js"],
    ["@zemnmez/mermaid", "dist/mermaid.min.js"]
])('NpmUrl npm:%s/%s', (packagename: string, packagepath: string) => {
    const uri = `npm:${packagename}/${packagepath}`
    test('parse correctly', () =>
        expect(must(parseNpmUri)(must(NpmUri)(uri))).toEqual({
            packagename,
            packagepath
        })
    )
})


describe.each([
    ["text/html;base64", "ok"]
])('Base64 %s %s', (pre:string, data: string) => {
    const uri = `data:${pre},${btoa(data)}`;
    test('parse correctly', () =>
        expect(
            must(extractDataUriData)(must(DataUri)(uri))
        ).toEqual(data)
    )
});