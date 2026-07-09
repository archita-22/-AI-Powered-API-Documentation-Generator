import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { extractRoutesFromSource } from './parser.js';
import { annotateRoute } from './aiAnnotate.js';
import { buildOpenApiSpec } from './buildSpec.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/generate', upload.single('file'), async (req, res) => {
  let code;
  let sourceName;

  if (req.file) {
    code = req.file.buffer.toString('utf-8');
    sourceName = req.file.originalname;
  } else if (req.body.code) {
    code = req.body.code;
    sourceName = 'pasted-code.js';
  } else {
    return res.status(400).json({ error: 'No code provided. Paste code or upload a file.' });
  }

  try {
    const routes = extractRoutesFromSource(code, sourceName);

    if (routes.length === 0) {
      return res.json({ routeCount: 0, spec: null, message: 'No Express routes were found in this code.' });
    }

    const annotated = [];
    for (const route of routes) {
      try {
        const doc = await annotateRoute(route);
        annotated.push(doc);
      } catch (err) {
        console.error(`Failed to annotate ${route.method} ${route.path}:`, err.message);
      }
    }

    const spec = buildOpenApiSpec(annotated, { title: 'Generated API Docs', version: '1.0.0' });
    res.json({ routeCount: routes.length, spec });
  } catch (err) {
    console.error('Generation error:', err);
    res.status(500).json({ error: 'Something went wrong while generating docs.' });
  }
});

app.listen(port, () => {
  console.log(`Web server running at http://localhost:${port}`);
});