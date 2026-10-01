# Build notes for agents

Tally is intentionally small enough for agents to inspect end-to-end, but it uses the same patterns a larger What Framework SaaS app would use.

## What it demonstrates

- `signal` stores invoice drafts, selected client filter, save status, and export status.
- `computed` derives visible invoices, invoice summaries, and workspace totals.
- `effect` persists invoice snapshots to `localStorage`, records the latest save note, and falls back to session-only edits when storage writes are denied.
- `what-framework/router` supplies client, invoice, receipt, build, and genuine fallback routes.
- Static content is authored in `src/data/invoices.js`; route aliases for every concrete client, invoice, and receipt path are emitted after build for Vura-friendly static hosting.

## Why the state is module-scoped

Invoice drafts are shared by the draft list, client detail pages, invoice editor, and receipt preview. Keeping them in `src/state/workspace.js` makes the data flow visible:

```text
client/invoice fixtures -> invoice signals -> computed totals -> editor, list, receipt routes
```

The state module validates stored JSON before using it. If a browser has malformed data, Tally loads seed drafts rather than crashing. If storage writes throw, edits remain usable for the current session and the ribbon explains that they are not saved.

## Routing

Routes live in `src/routes.js` rather than a file-router so this starter is easy to copy into any Vite project. Detail routes use `/clients/:id`, `/invoices/:id`, and `/receipt/:id`; unknown routes render `NotFound`.

## Issues encountered

- Editable number inputs can briefly contain partial values, so calculations use `finiteMoney` to avoid `NaN` or negative totals.
- Static hosting needs real files for aliases, so `scripts/static-aliases.mjs` writes every bundled detail path plus `404.html` after Vite builds.
- JSON export is intentionally local. The app does not send invoices, process payments, or claim tax/compliance coverage.
- The first homepage pass looked too much like the other starters. The fix was to make `src/pages/Home.jsx` a ledger desk with invoice rows and client tabs in the first viewport.
- The printable receipt route reads from the same invoice signal as the editor, so edits made before navigation are visible without a reload.

## Problem → fix → proof

- Problem: invoice math must never leak `NaN` while a user edits a number field. Fix: `finiteMoney()` clamps non-finite and negative values before subtotal/tax/total calculations. Proof: Vitest covers finite calculations and Playwright edits a line to verify the new total.
- Problem: direct client, invoice, and receipt paths need real files on static hosting. Fix: route aliases are generated from the bundled client/invoice fixtures. Proof: `npm run build` prints `static aliases OK: 13 routes plus 404` and Playwright opens every generated detail route.
- Problem: storage may be denied. Fix: persistence catches write errors and keeps the edited draft alive for the current session. Proof: the browser suite forces storage writes to throw and still verifies edited totals.

## Verification

Expected gates:

```bash
npm ci
npm run test
npm run build
npm run test:browser
```

The browser suite checks line editing, saved drafts, JSON export, receipt routing, every direct detail route, storage-denied fallback, 404 behavior, keyboard focus, and mobile rendering.
