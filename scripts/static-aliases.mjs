import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { clients, seedInvoices } from '../src/data/invoices.js';

const routes = [
  ['/', 'Tally — Freelance invoice workspace', 'Edit invoice drafts, calculate finite totals, preview receipts, and export JSON locally.'],
  ['/clients', 'Clients — Tally', 'Synthetic freelance client ledger with direct detail routes.'],
  ...clients.map((client) => [`/clients/${client.id}`, `${client.name} — Tally`, client.notes]),
  ['/drafts', 'Drafts — Tally', 'Editable invoice draft queue with local persistence.'],
  ...seedInvoices.flatMap((invoice) => [
    [`/invoices/${invoice.id}`, `${invoice.id} — Tally`, invoice.title],
    [`/receipt/${invoice.id}`, `Receipt ${invoice.id} — Tally`, 'Printable local receipt preview.'],
  ]),
  ['/build', 'How Tally is built', 'Implementation notes for agents learning What Framework.'],
];

const shellPath = join('dist', 'index.html');
if (!existsSync(shellPath)) {
  throw new Error('dist/index.html missing; run vite build first');
}
const shell = readFileSync(shellPath, 'utf8');

function writeRoute(path, title, description) {
  const out = path === '/' ? shellPath : join('dist', path.slice(1), 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  const html = shell
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`)
    .replace('<div id="app"></div>', `<div id="app"><noscript><main><h1>${title}</h1><p>${description}</p></main></noscript></div>`);
  writeFileSync(out, html);
}

for (const route of routes) writeRoute(...route);
writeRoute('/404', 'Page not found — Tally', 'Tally includes a genuine 404 artifact for Vura static hosting.');
copyFileSync(join('dist', '404', 'index.html'), join('dist', '404.html'));

const manifest = {
  pages: routes.map(([path]) => ({
    urlPattern: path,
    mode: 'static',
    config: path === '/build' ? { tags: ['tally-build'] } : { cache: 'private' },
  })),
  api: [],
};
writeFileSync(join('dist', 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`static aliases OK: ${routes.length} routes plus 404`);
