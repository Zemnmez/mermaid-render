# mermaid-render

This package renders [mermaid](https://www.npmjs.com/package/mermaid) diagrams outside of the browser using [puppeteer](https://www.npmjs.com/package/puppeteer). It's a stripped out and improved version of `mermaid-cli`. The typescript types are the best documentation of the API.

```javascript
import { renderMermaid } from 'mermaid-render';
const svg = await renderMermaid(
`pie title NETFLIX
        "Time spent looking for movie" : 90
        "Time spent watching it" : 10` 
);
console.log(svg);
```