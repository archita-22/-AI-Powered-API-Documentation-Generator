import dotenv from 'dotenv';
dotenv.config();

import { extractRoutesFromSource } from './src/parser.js';
import { annotateRoute } from './src/aiAnnotate.js';
import fs from 'fs';

const code = fs.readFileSync('./example-routes/menu.routes.js', 'utf-8');
const routes = extractRoutesFromSource(code, 'menu.routes.js');

const firstRoute = routes[0];
console.log(`Annotating: ${firstRoute.method} ${firstRoute.path}...\n`);

const annotated = await annotateRoute(firstRoute);
console.log(JSON.stringify(annotated.doc, null, 2));
