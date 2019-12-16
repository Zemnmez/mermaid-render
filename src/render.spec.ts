import { renderMermaid } from './render';
import puppeteer from 'puppeteer';

test("should render an svg from code", async () => {
    const svg = await renderMermaid(
`pie title NETFLIX
         "Time spent looking for movie" : 90
         "Time spent watching it" : 10`, {
            browser: puppeteer.launch({
                    // so it works on wsl
                    args:['--no-sandbox']
            })
        }
    );

    expect(svg).toMatch(/svg/g);
})