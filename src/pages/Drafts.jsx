import { Link } from 'what-framework/router';
import { clients, currency } from '../data/invoices.js';
import { selectedClient, visibleInvoices, invoiceSummaries, resetWorkspace } from '../state/workspace.js';

export default function Drafts() {
  return (
    <section class="page-enter">
      <div class="section-head">
        <div>
          <p class="eyebrow">Draft queue</p>
          <h1>Saved drafts with clear totals.</h1>
        </div>
        <button class="button ghost" onClick={resetWorkspace}>Reset workspace</button>
      </div>
      <label class="filter-control">
        <span>Client filter</span>
        <select value={selectedClient()} onInput={(event) => selectedClient(event.target.value)} onChange={(event) => selectedClient(event.target.value)}>
          <option value="all">All clients</option>
          {clients.map((client) => <option value={client.id}>{client.name}</option>)}
        </select>
      </label>
      {visibleInvoices().length === 0 ? (
        <div class="empty-state"><h2>No drafts match this client.</h2><p>Clear the filter to see the seed workspace.</p></div>
      ) : (
        <div class="invoice-list">
          {visibleInvoices().map((invoice) => {
            const summary = invoiceSummaries().find((item) => item.id === invoice.id);
            return (
              <article class="invoice-row">
                <div>
                  <p class="row-kicker">{summary.client.name} · {invoice.status}</p>
                  <h2><Link href={`/invoices/${invoice.id}`}>{invoice.title}</Link></h2>
                  <p>{invoice.lines.length} line item{invoice.lines.length === 1 ? '' : 's'} · due {invoice.due}</p>
                </div>
                <strong>{currency(summary.totals.total)}</strong>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
