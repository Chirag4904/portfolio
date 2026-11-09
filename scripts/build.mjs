import { mkdir, rm, cp, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages } from '../src/pages.mjs';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
export const outputRoot = resolve(projectRoot, 'dist');

export async function build() {
  await rm(outputRoot, {recursive:true, force:true});
  await mkdir(outputRoot, {recursive:true});
  for (const [path, render] of pages) {
    const file = resolve(outputRoot, path);
    await mkdir(dirname(file), {recursive:true});
    await writeFile(file, render());
  }
  await cp(resolve(projectRoot,'assets'), resolve(outputRoot,'assets'), {recursive:true, filter:path => !path.endsWith('.png')});
  await cp(resolve(projectRoot,'src/styles.css'), resolve(outputRoot,'styles.css'));
  await cp(resolve(projectRoot,'src/client.js'), resolve(outputRoot,'client.js'));
  await cp(resolve(projectRoot,'src/experience.css'), resolve(outputRoot,'experience.css'));
  for (const file of ['match-demo.js','matching.js','field-guide.js','field-guide.css','guide-notes.js','guide-stream.js']) await cp(resolve(projectRoot,'src',file),resolve(outputRoot,file));
  await writeFile(resolve(outputRoot,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: https://chiragaggarwal.cloud/sitemap.xml\n');
  const urls=[...pages.keys()].filter(path=>path.endsWith('index.html')).map(path=>`<url><loc>https://chiragaggarwal.cloud/${path.replace('index.html','')}</loc></url>`).join('');
  await writeFile(resolve(outputRoot,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  console.log(`Built ${pages.size} pages in dist/`);
}

if(process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
