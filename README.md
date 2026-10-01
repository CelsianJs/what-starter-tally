# Tally

Tally is a complete What Framework starter for a freelance invoice workspace. It demonstrates client records, editable invoice lines, finite tax/total calculations, saved drafts, printable receipt previews, local JSON export, routeable detail pages, storage fallbacks, and a Vura-ready static build.

## Prerequisites

- Node.js 22.x
- npm 10+ (bundled with current Node 22 releases)
- Vura Platform credentials for deployment

## Run it

```bash
npm ci
npm run dev
```

Open the printed Vite URL and try:

- Open `/drafts`, edit a quantity or unit price, and watch totals update.
- Save a draft, open its `/receipt/:id` view, and use the print button.
- Export JSON from an invoice detail page.
- Visit `/clients/:id` directly to test static detail aliases.
- Visit `/build` for the agent-readable implementation notes.

## Build and test

```bash
npm run test
npm run build
npm run test:browser
```

`npm run verify` runs all three. Browser tests save screenshots under `test-results/screenshots`.

## Reset local state

Tally stores draft edits and the active client filter in this browser key:

```js
localStorage.removeItem('what-starter-tally-v1')
```

The Drafts page also has a reset button.

## Deploy on Vura

Deployment requires Vura credentials configured in your environment. The starter is prepared for:

```bash
npm ci
npx vura-platform login
npx vura-platform projects
npm run deploy:vura
```

Use `npm run deploy:vura:prod` for a production upload. The deploy scripts call the pinned local `vura-platform` package installed by `npm ci`.

Planned public repo: `CelsianJs/what-starter-tally`.

## Source map for agents

- `src/state/workspace.js` — global signals, computed invoice totals, export helper, schema validation, and guarded local persistence.
- `src/data/invoices.js` — synthetic clients, seed invoices, finite money math, and currency formatting.
- `src/routes.js` — route table and route metadata.
- `src/pages/Build.jsx` — public implementation notes.
- `scripts/static-aliases.mjs` — generated client, invoice, receipt aliases, route-specific titles, 404, and Vura manifest proof.

See [BUILD.md](./BUILD.md) and `/build` for the longer implementation guide.
