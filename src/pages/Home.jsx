import { Link } from 'what-framework/router';
import { clients, currency } from '../data/invoices.js';
import { invoiceSummaries, workspaceTotals } from '../state/workspace.js';

export default function Home() {
  const currentInvoice = () => invoiceSummaries()[0];
  return (
    <section class="invoice-desk page-enter">
      <div class="desk-brief">
        <p class="eyebrow">Local invoice workspace</p>
        <h1>Draft, total, and print from one ledger.</h1>
        <p>Tally puts the working invoice on screen first: line rows, client context, finite totals, local JSON export, and a printable receipt preview.</p>
        <div class="hero-actions">
          <Link class="button primary" href={`/invoices/${currentInvoice().id}`}>Edit current invoice</Link>
          <Link class="button" href={`/receipt/${currentInvoice().id}`}>Receipt view</Link>
        </div>
      </div>
      <article class="ledger-sheet" aria-label="Current invoice rows">
        <div class="ledger-title">
          <div>
            <p class="eyebrow">{currentInvoice().client.name}</p>
            <h2>{currentInvoice().title}</h2>
          </div>
          <strong>{currency(currentInvoice().totals.total)}</strong>
        </div>
        {currentInvoice().lines.map((line) => (
          <div class="ledger-line">
            <span>{line.description}</span>
            <span>{line.quantity} × {currency(line.unitPrice)}</span>
            <strong>{currency(Number(line.quantity) * Number(line.unitPrice))}</strong>
          </div>
        ))}
        <div class="ledger-total">
          <span>Subtotal</span>
          <strong>{currency(currentInvoice().totals.subtotal)}</strong>
          <span>Tax {currentInvoice().taxRate}%</span>
          <strong>{currency(currentInvoice().totals.tax)}</strong>
          <span>Total incl. {currentInvoice().taxRate}% tax</span>
          <strong>{currency(currentInvoice().totals.total)}</strong>
        </div>
      </article>
      <aside class="client-ledger" aria-label="Client ledger">
        <p class="eyebrow">Client ledger</p>
        {clients.map((client) => (
          <Link class="client-tab" href={`/clients/${client.id}`} style={`--accent:${client.accent}`}>
            <span>{client.terms}</span>
            <strong>{client.name}</strong>
          </Link>
        ))}
        <div class="workspace-stamp">
          <span>{workspaceTotals().drafts} drafts</span>
          <span>{workspaceTotals().saved} saved</span>
          <strong>{currency(workspaceTotals().outstanding)}</strong>
        </div>
      </aside>
    </section>
  );
}
