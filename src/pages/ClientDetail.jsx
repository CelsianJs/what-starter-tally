import { Link, route } from 'what-framework/router';
import { calculateInvoice, clientById, currency } from '../data/invoices.js';
import { invoices } from '../state/workspace.js';

export default function ClientDetail() {
  const client = clientById(route.params.id);
  if (!client) {
    return (
      <section class="empty-state page-enter">
        <p class="eyebrow">Unknown client</p>
        <h1>No client is filed under that slug.</h1>
        <Link class="button" href="/clients">Back to clients</Link>
      </section>
    );
  }
  const clientInvoices = invoices().filter((invoice) => invoice.clientId === client.id);
  const total = clientInvoices.reduce((sum, invoice) => sum + calculateInvoice(invoice).total, 0);
  return (
    <section class="page-enter client-detail" style={`--accent:${client.accent}`}>
      <Link class="text-link" href="/clients">← Clients</Link>
      <p class="eyebrow">{client.terms}</p>
      <h1>{client.name}</h1>
      <p>{client.contact} · {client.email}</p>
      <p>{client.notes}</p>
      <div class="metric-row">
        <article><span>Drafts</span><strong>{clientInvoices.length}</strong></article>
        <article><span>Draft value</span><strong>{currency(total)}</strong></article>
      </div>
      <div class="invoice-list">
        {clientInvoices.map((invoice) => (
          <article class="invoice-row">
            <div>
              <p class="row-kicker">{invoice.id}</p>
              <h2><Link href={`/invoices/${invoice.id}`}>{invoice.title}</Link></h2>
            </div>
            <strong>{currency(calculateInvoice(invoice).total)}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
