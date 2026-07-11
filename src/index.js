import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { extractRoutesFromSource } from './parser.js';
import { annotateRoute } from './aiAnnotate.js';
import { buildOpenApiSpec } from './buildSpec.js';

dotenv.config();

function walkJsFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...walkJsFiles(fullPath));
    } else if (entry.name.endsWith('.js')) {
      results.push(fullPath);
    }
  }

  return results;
}

async function main() {
  const targetDir = process.argv[2];
  const outFile = process.argv[3] || 'openapi.json';

  if (!targetDir) {
    console.error('Usage: node src/index.js <routes-folder> [output-file]');
    process.exit(1);
  }

  if (!process.env.GOOGLE_API_KEY) {
    console.error('Missing GOOGLE_API_KEY — add it to your .env file.');
    process.exit(1);
  }

  const files = walkJsFiles(targetDir);
  console.log(`Scanning ${files.length} file(s) in ${targetDir}...`);

  let allRoutes = [];
  for (const file of files) {
    const code = fs.readFileSync(file, 'utf-8');
    allRoutes.push(...extractRoutesFromSource(code, file));
  }

  if (allRoutes.length === 0) {
    console.log('No routes found. Nothing to document.');
    return;
  }
  console.log(`Found ${allRoutes.length} route(s). Annotating with AI...`);

  const annotated = [];
  for (const route of allRoutes) {
    process.stdout.write(`  ${route.method} ${route.path} ... `);
    try {
      const doc = await annotateRoute(route);
      annotated.push(doc);
      console.log('done');
    } catch (err) {
      console.log('FAILED');
      console.error(`    ${err.message}`);
    }
  }

  const spec = buildOpenApiSpec(annotated, { title: 'API Docs', version: '1.0.0' });
  fs.writeFileSync(outFile, JSON.stringify(spec, null, 2));
  console.log(`\nOpenAPI spec written to ${outFile}`);
  console.log(`Run "node src/serve.js ${outFile}" to view it.`);
}

main();
   
