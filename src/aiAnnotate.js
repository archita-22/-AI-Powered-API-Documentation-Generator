import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';

const RouteDocSchema = z.object({
  summary: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  pathParams: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      description: z.string(),
    })
  ),
  queryParams: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      description: z.string(),
    })
  ),
  requestBody: z
    .object({
      description: z.string(),
      exampleJson: z.string(),
    })
    .nullable(),
  responses: z.array(
    z.object({
      status: z.number(),
      description: z.string(),
    })
  ),
});

let modelInstance = null;
function getModel() {
  if (!modelInstance) {
    modelInstance = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash',
      temperature: 0.2,
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }
  return modelInstance;
}

export async function annotateRoute(route) {
  const structuredModel = getModel().withStructuredOutput(RouteDocSchema);

  const prompt = `You are documenting a REST API endpoint for OpenAPI docs.

Method: ${route.method}
Path: ${route.path}
File: ${route.file}

Handler code:
\`\`\`javascript
${route.code}
\`\`\`

Infer the summary, description, parameters, request body shape, and likely
response status codes STRICTLY from what this code actually does. Do not
invent fields, params, or behavior that isn't implied by the code.`;

  const doc = await structuredModel.invoke(prompt);
  return { ...route, doc };
}
