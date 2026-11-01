import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, outputRoot } from './build.mjs';

const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.pdf':'application/pdf','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
export function createPreviewServer(root=outputRoot) {
  return createServer(async (request,response) => {
    if(!['GET','HEAD'].includes(request.method)) {response.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
    try {
      const pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
      let file=resolve(root, `.${pathname}`);
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
