import { For } from 'what-framework';
import { Link, route } from 'what-framework/router';
import { calculateInvoice, clientById, currency } from '../data/invoices.js';
import { addLine, exportInvoice, invoices, markSaved, updateLine } from '../state/workspace.js';

export default function InvoiceDetail() {
  const invoice = () => invoices().find((item) => item.id === route.params.id);
  if (!invoice()) {
    return (
      <section class="empty-state page-enter">
        <p class="eyebrow">Unknown invoice</p>
        <h1>This draft does not exist.</h1>
        <Link class="button" href="/drafts">Back to drafts</Link>
      </section>
    );
  }
  const client = () => clientById(invoice().clientId);
  const totals = () => calculateInvoice(invoice());
  function downloadJson() {
    const blob = new Blob([exportInvoice(invoice())], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${invoice().id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section class="page-enter invoice-detail">
      <Link class="text-link" href="/drafts">← Drafts</Link>
      <div class="section-head">
        <div>
          <p class="eyebrow">{client().name} · {invoice().id}</p>
          <h1>{invoice().title}</h1>
          <p>No payments, compliance workflow, or external billing system is connected.</p>
        </div>
        <div class="action-row">
          <Link class="button primary" href={`/receipt/${invoice().id}`}>Receipt view</Link>
          <button class="button" onClick={() => markSaved(invoice().id)}>Save draft</button>
          <button class="button" onClick={downloadJson}>Export JSON</button>
        </div>
      </div>
      <div class="line-editor" aria-label="Invoice lines">
        <div class="line-row line-header" aria-hidden="true">
          <span>Description</span>
          <span>Qty</span>
          <span>Unit price</span>
          <span>Line total</span>
        </div>
        <For each={() => invoice().lines} key={(line) => line.id}>
          {(line) => (
            <article class="line-row">
              <label>
                <span class="sr-only">Description</span>
                <input value={line().description} onInput={(event) => updateLine(invoice().id, line().id, { description: event.target.value })} />
              </label>
              <label>
                <span class="sr-only">Qty</span>
                <input aria-label={`${line().description} quantity`} type="number" min="0" step="0.25" value={line().quantity} onInput={(event) => updateLine(invoice().id, line().id, { quantity: event.target.value })} />
              </label>
              <label>
                <span class="sr-only">Unit price</span>
              <input aria-label={`${line().description} unit price`} type="number" min="0" step="1" value={line().unitPrice} onInput={(event) => updateLine(invoice().id, line().id, { unitPrice: event.target.value })} />
            </label>
            <strong><span class="sr-only">Line total</span>{() => currency(Number(line().quantity) * Number(line().unitPrice))}</strong>
          </article>
          )}
        </For>
      </div>
      <button class="button ghost" onClick={() => addLine(invoice().id)}>Add line</button>
      <aside class="totals-card" aria-label="Invoice totals">
        <span>Subtotal {currency(totals().subtotal)}</span>
        <span>Tax {invoice().taxRate}% · {currency(totals().tax)}</span>
        <strong>Total {currency(totals().total)}</strong>
      </aside>
    </section>
  );
}
