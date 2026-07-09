import express from 'express';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';

const specPath = process.argv[2] || 'openapi.json';

const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));

const app = express();
const port = 4000;

app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

app.listen(port, () => {
  console.log(`Docs running at http://localhost:${port}/docs`);
});