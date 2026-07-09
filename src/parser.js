export function extractRoutesFromSource(sourceCode, filePath) {
  const routes = [];

  const routeRegex = /\b(router|app)\.(get|post|put|patch|delete)\s*\(\s*(['"`])([^'"`]+)\3/g;
  
  let match;
  while ((match = routeRegex.exec(sourceCode)) !== null) {
    const [, receiver, method, , routePath] = match;
    const matchStart = match.index;
  

  const openParenIdx = sourceCode.indexOf('(', matchStart);
    let depth = 0;
    let endIdx = -1;

    for (let i = openParenIdx; i < sourceCode.length; i++) {
      const ch = sourceCode[i];
      if (ch === '(') depth++;
      if (ch === ')') {
        depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
    }

    if (endIdx === -1) continue; // couldn't find a matching close, skip this one safely

    const code = sourceCode.slice(matchStart, endIdx + 1);

    routes.push({
      method: method.toUpperCase(),
      path: routePath,
      file: filePath,
      receiver,
      code,
    }); 

}
 
  return routes;
}
