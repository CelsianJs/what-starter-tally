import { Link, route } from 'what-framework/router';
import { calculateInvoice, clientById, currency } from '../data/invoices.js';
import { invoices } from '../state/workspace.js';

export default function Receipt() {
  const invoice = () => invoices().find((item) => item.id === route.params.id);
  if (!invoice()) {
    return (
      <section class="empty-state page-enter">
        <h1>Receipt not found.</h1>
        <Link class="button" href="/drafts">Back to drafts</Link>
      </section>
    );
  }
  const client = () => clientById(invoice().clientId);
  const totals = () => calculateInvoice(invoice());
  return (
    <article class="receipt page-enter">
      <Link class="text-link no-print" href={`/invoices/${invoice().id}`}>← Edit draft</Link>
      <header>
        <p class="eyebrow">Printable receipt preview</p>
        <h1>{invoice().id}</h1>
        <p>{client().name} · {client().email}</p>
      </header>
      <ul class="receipt-lines">
        {invoice().lines.map((line) => <li><span>{line.description}</span><span>{line.quantity} × {currency(line.unitPrice)}</span></li>)}
      </ul>
      <div class="receipt-total">
        <span>Subtotal {currency(totals().subtotal)}</span>
        <span>Tax {currency(totals().tax)}</span>
        <strong>Total {currency(totals().total)}</strong>
      </div>
      <button class="button primary no-print" onClick={() => window.print()}>Print receipt</button>
    </article>
  );
}
