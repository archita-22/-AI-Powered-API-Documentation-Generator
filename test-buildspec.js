import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import { extractRoutesFromSource } from './src/parser.js';
import { annotateRoute } from './src/aiAnnotate.js';
import { buildOpenApiSpec } from './src/buildSpec.js';

const code = fs.readFileSync('./example-routes/menu.routes.js', 'utf-8');
const routes = extractRoutesFromSource(code, 'menu.routes.js');

console.log(`Found ${routes.length} routes. Annotating all of them...\n`);

const annotated = [];
for (const route of routes) {
  console.log(`  ${route.method} ${route.path}...`);
  const doc = await annotateRoute(route);
  annotated.push(doc);
}

const spec = buildOpenApiSpec(annotated, { title: 'REStro Menu API', version: '1.0.0' });

fs.writeFileSync('openapi.json', JSON.stringify(spec, null, 2));
console.log('\nDone! Spec written to openapi.json');
