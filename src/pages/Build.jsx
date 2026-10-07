export default function Build() {
  return (
    <article class="build-notes page-enter">
      <p class="eyebrow">Agent reference</p>
      <h1>How Tally is built.</h1>
      <section>
        <h2>Local draft recovery</h2>
        <p>Issued/due/status context sits beside actions. Removing a line updates the same immutable invoice state, returns the invoice to draft, and can safely leave zero rows. The keyed For fallback explains the empty draft; Add line restores an editable row. Existing focus and fixed-column tests protect the editor.</p>
        <pre>{"lines: invoice.lines.filter((line) => line.id !== lineId),"}</pre>
      </section>
      <section>
        <h2>Signals</h2>
        <p><code>src/state/workspace.js</code> keeps invoice drafts, client filters, save status, and export status in module-scoped signals.</p>
      </section>
      <section>
        <h2>Computed values</h2>
        <p><code>visibleInvoices</code>, <code>invoiceSummaries</code>, and <code>workspaceTotals</code> derive filtered drafts and finite currency totals without duplicating state.</p>
      </section>
      <section>
        <h2>Effects and persistence</h2>
        <p>A single <code>effect</code> writes invoice snapshots into localStorage and updates the saved status. Malformed or denied storage falls back to safe in-memory session edits.</p>
      </section>
      <section>
        <h2>Routing</h2>
        <p><code>src/routes.js</code> defines explicit What router routes including <code>/clients/:id</code>, <code>/invoices/:id</code>, <code>/receipt/:id</code>, and a catch-all 404 route. The build script emits concrete aliases for every bundled client, invoice, and receipt plus <code>404.html</code>.</p>
      </section>
      <section>
        <h2>Vura static packaging</h2>
        <p>Tally stays on Vura's static path: generated HTML aliases plus <code>404.html</code>, no manual manifest, no unused Vura server runtime dependency, no unsupported <code>rewrites</code>, and header catch-alls written as <code>(.*)</code>.</p>
      </section>
      <section>
        <h2>Build journal</h2>
        <p>Line editing originally risked non-finite totals, so calculations route through <code>finiteMoney</code>. Static hosting also needed generated detail aliases instead of only index shells.</p>
        <p>A later keyboard regression showed that immutable line replacement can remount raw mapped rows while someone is typing. The invoice editor now renders lines with keyed <code>{'<For>'}</code> accessors, so <code>line().quantity</code> and friends update without replacing the focused input.</p>
        <p>The line editor also needed a fixed total track. Currency widths made independent row grids drift on desktop, and the mobile cards needed their own visible labels instead of relying on a detached header.</p>
      </section>
      <section>
        <h2>Problem → fix → proof</h2>
        <p><strong>Finite totals:</strong> <code>calculateInvoice()</code> uses <code>finiteMoney()</code> before subtotal, tax, and total math. Unit tests and browser line edits verify the displayed total.</p>
        <p><strong>Matching operands:</strong> line amounts also clamp each operand before multiplication. Two negative edits must not display a positive line amount while the invoice subtotal treats them as zero; a browser regression pins that boundary.</p>
        <p><strong>Ledger labeling:</strong> a review caught "Tax included in preview total" showing the invoice total. The home ledger now renders subtotal, tax, and total-including-tax as separate rows so the math is inspectable.</p>
        <p><strong>Editor density:</strong> the line editor uses one column header and screen-reader-only per-input labels. That keeps fixed columns aligned without removing native labelled controls.</p>
        <p><strong>List identity:</strong> continuous edit tests mark the active quantity, description, unit price, and new-line inputs, then use select-all/backspace/type. The same DOM node must stay focused while totals recalculate.</p>
        <p><strong>Responsive labels:</strong> desktop browser tests measure every row's quantity, unit price, and total columns at 1440px. Mobile tests hide the header and require Description, Qty, Unit price, and Line total labels inside the row card.</p>
        <p><strong>Routeable records:</strong> client, invoice, and receipt URLs are generated from <code>src/data/invoices.js</code>, then checked by Playwright as direct page loads.</p>
        <p><strong>Visual direction:</strong> the homepage was changed from a rounded hero into a working ledger sheet plus client ledger, so the invoice rows appear before generic explanation.</p>
        <p><strong>Upload size:</strong> the Vura CLI pack check now produces an archive around 22.0 KiB because static synthesis reads files instead of a hand-written manifest.</p>
      </section>
    </article>
  );
}
