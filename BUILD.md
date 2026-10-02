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

## Vura static deployment notes

Tally is a pure Vite/What client app, so it relies on concrete HTML aliases and Vura's static manifest synthesis instead of writing a manual `dist/manifest.json`.

The config is intentionally small: no unsupported top-level `rewrites`, no Vura server runtime dependency, and header sources use `(.*)` rather than glob `*`. Those rules come from Vura Platform's shared config parser in `vura-platform/packages/shared/src/config/vura-config.ts` and matcher validation in `routing-rules.ts`.

After removing the unused `@celsian/vura-core` path, the Vura CLI archive check packs Tally at about 22.0 KiB while preserving every generated detail route.

## Issues encountered

- Editable number inputs can briefly contain partial values, so calculations use `finiteMoney` to avoid `NaN` or negative totals.
- Static hosting needs real files for aliases, so `scripts/static-aliases.mjs` writes every bundled detail path plus `404.html` after Vite builds.
- JSON export is intentionally local. The app does not send invoices, process payments, or claim tax/compliance coverage.
- The first homepage pass looked too much like the other starters. The fix was to make `src/pages/Home.jsx` a ledger desk with invoice rows and client tabs in the first viewport.
- The printable receipt route reads from the same invoice signal as the editor, so edits made before navigation are visible without a reload.
- A design review caught misleading tax copy and scattered invoice actions. The ledger now separates subtotal, tax, and total-including-tax; invoice detail actions use one right-aligned row in receipt/save/export order.
- The line editor now has a single column header row and screen-reader-only per-row labels. That keeps the desk compact while preserving labelled native inputs for assistive tech and browser tests.
- Continuous keyboard editing exposed a list identity trap: `updateLine()` intentionally replaces a line object immutably, so raw row maps can replace the focused input while the user types. The editor now uses keyed `<For>` accessor rows so the row DOM is preserved while `line().quantity`, `line().unitPrice`, and `line().description` update.

## Problem → fix → proof

- Problem: invoice math must never leak `NaN` while a user edits a number field. Fix: `finiteMoney()` clamps non-finite and negative values before subtotal/tax/total calculations. Proof: Vitest covers finite calculations and Playwright edits a line to verify the new total.
- Problem: direct client, invoice, and receipt paths need real files on static hosting. Fix: route aliases are generated from the bundled client/invoice fixtures. Proof: `npm run build` prints `static aliases OK: 13 routes plus 404` and Playwright opens every generated detail route.
- Problem: storage may be denied. Fix: persistence catches write errors and keeps the edited draft alive for the current session. Proof: the browser suite forces storage writes to throw and still verifies edited totals.
- Problem: the homepage labeled the total as if it were the tax line, and the detail editor repeated labels in every row. Fix: split subtotal/tax/total labels and add a fixed editor header with hidden per-input labels. Proof: Playwright asserts the explicit tax/total text and the "Line total" header before editing.
- Problem: manual static manifests and invalid config fields can push a client-only starter down the wrong Vura upload path. Fix: omit manual manifests, keep valid `(.*)` matchers, and let Vura synthesize static routing from files. Proof: `parseVuraJson()` accepts the config, no `dist/manifest.json` remains after build, and the Vura CLI archive is about 22.0 KiB.
- Problem: quantity, unit price, and description edits must support select-all/backspace/type without dropping focus. Fix: `src/pages/InvoiceDetail.jsx` renders invoice lines with keyed `<For>` accessors instead of raw line objects, which lets immutable store updates refresh the accessor without replacing the row node. Proof: Playwright marks the focused DOM node, clears and types into quantity, description, unit price, and a newly added line, then asserts the same node remains `document.activeElement` and totals update.

## Verification

Expected gates:

```bash
npm ci
npm run test
npm run build
npm run test:browser
```

The browser suite checks line editing, saved drafts, JSON export, receipt routing, every direct detail route, storage-denied fallback, 404 behavior, keyboard focus, and mobile rendering.
