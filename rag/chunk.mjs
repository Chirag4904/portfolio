import { readFileSync } from 'node:fs';

const anchors = {
  1: 'problem',
  2: 'problem',
  3: 'architecture',
  '3.1': 'matching',
  '3.2': 'routing',
  '3.3': 'scoring',
  '3.4': 'reliability',
  '3.5': 'architecture',
  '3.6': 'reliability',
  '3.7': 'reliability',
  '3.8': 'reliability',
  4: 'reliability',
  5: 'architecture',
  6: 'reliability',
};

const maxLength = 2000;
const overlap = 200;
const document = process.argv[3] ?? 'letzgo';
const labels = { letzgo: 'LetzGo case study', popin: 'Popin case study', resume: 'Chirag Aggarwal résumé' };
if (!Object.hasOwn(labels, document)) throw new Error('Use letzgo, popin, or resume as the document name.');
const source = readFileSync(process.argv[2] ?? 0, 'utf8')
  .replace(/\r\n/g, '\n')
  .replace(/\[([^\]\n]*)\]\(file:\/\/[^)\n]+\)/gi, '$1');
const headings = [];
const records = [];
let lines = [];
let fence = '';

for (const line of source.split('\n')) {
  const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
  if (fence) {
    if (marker && marker[1].startsWith(fence) && !marker[2].trim()) fence = '';
  } else if (marker) {
    fence = marker[1];
  } else {
    const heading = line.match(/^ {0,3}(#{1,6})[ \t]+(.+)/);
    if (heading) {
      saveSection();
      const level = heading[1].length;
      while (headings.at(-1)?.level >= level) headings.pop();
      headings.push({ level, title: heading[2].trim() });
      continue;
    }
  }
  lines.push(line);
}
saveSection();

if (!records.length) throw new Error('The source document has no indexable text.');
console.log(JSON.stringify(records));

function saveSection() {
  const body = lines.join('\n').trim();
  lines = [];
  if (!body) return;

  const title = headings.at(-1)?.title ?? labels[document];
  const section = headings.findLast(heading => heading.level >= 2
    && heading.level <= 3 && /^\d/.test(heading.title));
  const number = section?.title.match(/^\d+(?:\.\d+)*/)?.[0];
  const resumeAnchors = { SUMMARY: 'profile', EXPERIENCE: 'experience', PROJECTS: 'projects', 'TECHNICAL SKILLS': 'skills', EDUCATION: 'education' };
  const resumeSection = headings.find(heading => heading.level === 2)?.title;
  let anchor = 'main';
  if (document === 'letzgo') anchor = anchors[number] ?? anchors[number?.split('.')[0]] ?? anchor;
  if (document === 'resume') anchor = resumeAnchors[resumeSection] ?? anchor;
  const context = headings.map(heading => heading.title).join(' / ');

  for (let start = 0; start < body.length;) {
    const window = body.slice(start, start + maxLength);
    let length = window.length;
    if (start + length < body.length) {
      const paragraph = window.lastIndexOf('\n\n');
      const space = window.search(/\s+\S*$/u);
      if (paragraph >= maxLength * 0.75) length = paragraph;
      else if (space > overlap) length = space;
    }

    const end = start + length;
    records.push({
      id: `${document}-doc-${records.length + 1}`,
      data: [context, body.slice(start, end).trim()].filter(Boolean).join('\n\n'),
      metadata: { title, anchor, document },
    });
    if (end === body.length) break;

    const tail = body.slice(end - overlap, end);
    const boundary = tail.search(/\s/u);
    start = end - overlap + (boundary === -1 ? 0 : boundary + 1);
  }
}
