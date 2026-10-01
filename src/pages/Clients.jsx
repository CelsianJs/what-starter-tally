import { Link } from 'what-framework/router';
import { clients } from '../data/invoices.js';
import { invoiceSummaries, selectedClient } from '../state/workspace.js';

export default function Clients() {
  return (
    <section class="page-enter">
      <p class="eyebrow">Client ledger</p>
      <h1>Clients with draft context.</h1>
      <div class="client-grid">
        {clients.map((client) => {
          const count = invoiceSummaries().filter((invoice) => invoice.clientId === client.id).length;
          return (
            <article class="client-card" style={`--accent:${client.accent}`}>
              <p>{client.terms}</p>
              <h2><Link href={`/clients/${client.id}`}>{client.name}</Link></h2>
              <p>{client.notes}</p>
              <button class="button" onClick={() => selectedClient(client.id)}>Filter workspace</button>
              <span>{count} invoice draft{count === 1 ? '' : 's'}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
