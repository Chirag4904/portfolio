import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { POST as postChat } from '../api/chat.mjs';
import { build, outputRoot } from './build.mjs';

const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.pdf':'application/pdf','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
const chatLimit = 8192;

async function chatRequest(request, response) {
  if (request.method !== 'POST') {
    response.writeHead(405, { Allow: 'POST' }).end();
    return;
  }
  if (Number(request.headers['content-length']) > chatLimit) {
    response.writeHead(413, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'Please enter a shorter question.' }));
    return;
  }
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > chatLimit) {
      response.writeHead(413, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'Please enter a shorter question.' }));
      return;
    }
    chunks.push(chunk);
  }
  const controller = new AbortController();
  response.once('close', () => controller.abort());
  const result = await postChat(new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: request.headers,
    body: Buffer.concat(chunks),
    signal: controller.signal,
  }));
  response.writeHead(result.status, Object.fromEntries(result.headers));
  if (!result.body) {
    response.end();
    return;
  }
  await pipeline(Readable.fromWeb(result.body), response);
}

export function createPreviewServer(root=outputRoot) {
  return createServer(async (request,response) => {
    try {
      const pathname = new URL(request.url, 'http://localhost').pathname;
      if (pathname === '/api/chat') {
        try { await chatRequest(request, response); } catch {
          if (response.headersSent || response.destroyed) response.destroy();
          else response.writeHead(500).end();
        }
        return;
      }
      if(!['GET','HEAD'].includes(request.method)) {response.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
      const decodedPathname = decodeURIComponent(pathname);
      let file=resolve(root, `.${decodedPathname}`);
      if(file !== root && !file.startsWith(root+sep)) {response.writeHead(403).end();return;}
      let status=200;
      try {
        if((await stat(file)).isDirectory()) file=resolve(file,'index.html');
        await stat(file);
      } catch {file=resolve(root,'404.html');status=404;}
      const content=await readFile(file);
      response.writeHead(status,{'Content-Type':types[extname(file)] || 'application/octet-stream','Content-Length':content.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
      response.end(request.method==='HEAD'?undefined:content);
    } catch {response.writeHead(400).end('Bad request');}
  });
}
if(process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await build();
  const port=Number(process.env.PORT || 4173);
  const server=createPreviewServer();
  server.on('error',error=>{console.error(error.message);process.exitCode=1;});
  server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
}
