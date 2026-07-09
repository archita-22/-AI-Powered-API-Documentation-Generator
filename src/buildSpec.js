function safeJsonParse(str) {
  if (!str) return undefined;
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}
export function buildOpenApiSpec(annotatedRoutes, { title = 'API Docs', version = '1.0.0' } = {}) {
  const paths = {};

  for (const route of annotatedRoutes) {
    if (!route.doc) continue;

    const openApiPath = route.path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
    const method = route.method.toLowerCase();

    if (!paths[openApiPath]) paths[openApiPath] = {};

    const parameters = [
      ...route.doc.pathParams.map((p) => ({
        name: p.name,
        in: 'path',
        required: true,
        description: p.description,
        schema: { type: p.type || 'string' },
      })),
      ...route.doc.queryParams.map((p) => ({
        name: p.name,
        in: 'query',
        required: !!p.required,
        description: p.description,
        schema: { type: p.type || 'string' },
      })),
    ];

    const operation = {
      summary: route.doc.summary,
      description: route.doc.description,
      tags: route.doc.tags?.length ? route.doc.tags : ['default'],
      parameters,
      responses: Object.fromEntries(
        (route.doc.responses.length ? route.doc.responses : [{ status: 200, description: 'Success' }]).map(
          (r) => [String(r.status), { description: r.description }]
        )
      ),
    };

    if (
      route.doc.requestBody &&
      route.doc.requestBody.exampleJson &&
      route.doc.requestBody.exampleJson !== '{}'
    ) {
      operation.requestBody = {
        description: route.doc.requestBody.description,
        content: {
          'application/json': {
            example: safeJsonParse(route.doc.requestBody.exampleJson),
          },
        },
      };
    }

    paths[openApiPath][method] = operation;
  }

  return {
    openapi: '3.0.3',
    info: { title, version },
    paths,
  };
}