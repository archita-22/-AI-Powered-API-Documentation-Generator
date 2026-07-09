import { extractRoutesFromSource } from './src/parser.js';
import fs from 'fs';

const code = fs.readFileSync('./example-routes/menu.routes.js', 'utf-8');
const routes = extractRoutesFromSource(code, 'menu.routes.js');

console.log(`Found ${routes.length} routes:\n`);
routes.forEach((r) => {
  console.log(`${r.method} ${r.path}`);
  console.log(r.code);
  console.log('---');
});