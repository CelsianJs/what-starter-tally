# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-10-08
- Primary product surfaces: overview, client ledger, client detail, draft queue, invoice editor, receipt preview, build notes
- Evidence reviewed: What Framework routing/state examples, current getting-started guidance, and the Vura deploy script pattern used by these starters

## Brand
- Personality: restrained, precise, calm, freelancer-friendly
- Trust signals: finite totals, explicit local persistence, no payment/compliance overclaiming, visible reset/export controls
- Avoid: banking cosplay, real billing promises, legal/tax advice, dashboards with fake production integrations

## Product goals
- Goals: show editable form state, derived totals, local persistence, routeable client/invoice/receipt details, JSON export, and a printable view in a complete starter
- Non-goals: payment processing, accounting compliance, authentication, database sync, real client email
- Success signals: users can edit invoice lines, see totals update, save/reset local drafts, export JSON, preview a receipt, and inspect how What patterns fit together

## Personas and jobs
- Primary personas: agents building SaaS productivity apps; developers evaluating What Framework patterns
- User jobs: draft a simple invoice, review client context, export a local payload, understand state/routing organization
- Key contexts of use: desktop editing, mobile review, print preview, agent reference reading

## Information architecture
- Primary navigation: Home, Clients, Drafts, Build Notes
- Core routes/screens: `/`, `/clients`, `/clients/:id`, `/drafts`, `/invoices/:id`, `/receipt/:id`, `/build`, `404`
- Content hierarchy: summary metrics, client ledger, editable draft rows, totals card, receipt view, implementation guide

## Design principles
- Principle 1: Make every calculated number legible and explainable.
- Principle 2: Keep invoice actions local and honest.
- Tradeoffs: no remote accounts or real billing; JSON export is local so the starter remains portable.

## Visual language
- Color: graphite surfaces, mint actions, cool off-white panels
- Typography: Avenir Next/Segoe UI sans with bounded32px page headings and 24px subsection headings
- Spacing/layout rhythm: the homepage is a compact working desk, not a landing page: invoice rows, explicit subtotal/tax/total math, and client ledger context appear immediately above the fold
- Shape/radius/elevation: ledger sheets, squared panels, tabular rows, no decorative shadows, crisp borders; avoid repeating the same rounded hero composition as other starters
- Motion: short page entrance and quiet hover feedback with reduced-motion fallback
- Imagery/iconography: no external images; visual identity comes from tables, totals, status stamps, and accent rule work

## Components
- Existing components to reuse: standalone starter
- New/changed components: shell, metric cards, client cards, invoice rows, fixed-column line editor, totals card, receipt view
- Variants and states: empty filters, saved draft, storage denied, unknown client/invoice, export prepared, mobile stack
- Token/component ownership: `src/styles.css` owns tokens; route pages own product-specific layout

## Accessibility
- Target standard: WCAG 2.1 AA-minded implementation
- Keyboard/focus behavior: visible focus rings, native inputs/selects/buttons, keyboard-reachable editor and reset/export controls
- Keyboard editing contract: invoice line inputs must keep the same focused DOM node through select-all/backspace/type edits, including after a new line is added
- Contrast/readability: dark graphite on off-white, mint focus treatment with text contrast
- Screen-reader semantics: one `h1` per route, labelled quantity/unit inputs, visible column headers with screen-reader-only row labels, named totals region
- Responsive editor labels: desktop uses one header row; mobile hides that header and makes each row's Description, Qty, Unit price, and Line total labels visible in normal flow
- Reduced motion and sensory considerations: `prefers-reduced-motion` disables animations and transitions

## Responsive behavior
- Supported breakpoints/devices: 360px mobile through large desktop
- Layout adaptations: nav wraps, metrics stack, line editor collapses to one column, receipt remains readable
- Touch/hover differences: hover affordances have focus equivalents; 14px controls with at least44px tap targets

## Interaction states
- Loading: not applicable for static local data
- Empty: filtered draft queue has explicit copy
- Error: malformed stored JSON resets to seed drafts; storage denied displays session-only status
- Success: save/export status and totals update immediately
- Disabled: no disabled controls are needed; invalid or negative money operands are treated as zero in both line and invoice totals. An empty draft can always add a line.
- Offline/slow network: app is static and local once loaded

## Content voice
- Tone: precise, plainspoken, professional
- Terminology: "draft", "receipt preview", "workspace value", "client ledger"
- Microcopy rules: always say exports and receipts are local; do not imply invoices are sent or payable

## Implementation constraints
- Framework/styling system: What Framework 0.13.10, what-compiler 0.13.10, Vite 6.4.3, plain CSS
- Design-token constraints: CSS custom properties in `src/styles.css`
- Performance constraints: small static data, computed totals, no external assets or runtime network
- State/list constraints: invoice line updates are immutable, so editable line rows use keyed What `<For>` accessors to preserve input DOM identity while row data changes
- Layout constraints: invoice editor rows use a fixed line-total track so currency width does not shift quantity or unit-price columns between rows
- Compatibility constraints: modern browsers supported by Vite output and What router
- Test/screenshot expectations: Vitest calculation tests plus Playwright desktop/mobile flows, direct routes, storage-denied behavior, export, 404, and screenshots

## Operational refinement

Invoice detail shows issued date, due date, and local draft status. Remove line works on the same immutable invoice state as editing; removing the last line reveals an empty state and finite zero totals, and Add line starts again. The total element still fills its fixed-width track, so removal controls do not reintroduce drifting currency columns. Keyed For accessors continue to preserve focused editor nodes.

Validation contract: Browser coverage adds/removes an accidental row, removes all rows, requires zero totals, then adds a fresh row; existing focus, desktop column alignment, mobile labels, export, receipt, denied storage, and route tests remain.

## Open questions

- [ ] Choose the final Vura subdomain during deployment.


## Modern interface consistency

The primary workspace, detail views and build guide share a bounded sans-serif hierarchy, natural-case 14px chrome, 44px targets and quiet surfaces. Do not reintroduce poster headings, decorative background grids, heavy shadows or pill-shaped navigation. Brand accents and functional visualizations remain distinct; operational information takes precedence over decoration.
