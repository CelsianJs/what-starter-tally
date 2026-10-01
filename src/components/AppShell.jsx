import { Link } from 'what-framework/router';
import { currency } from '../data/invoices.js';
import { saveStatus, workspaceTotals } from '../state/workspace.js';

const nav = [
  ['/', 'Home'],
  ['/clients', 'Clients'],
  ['/drafts', 'Drafts'],
  ['/build', 'Build Notes'],
];

export default function AppShell({ children }) {
  return (
    <div class="site-shell">
      <a class="skip-link" href="#content">Skip to content</a>
      <header class="masthead">
        <div>
          <p class="eyebrow">Freelance desk</p>
          <Link class="brand" href="/" aria-label="Tally home">Tally</Link>
        </div>
        <nav class="nav" aria-label="Primary">
          {nav.map(([href, label]) => (
            <Link href={href} activeClass="active" exactActiveClass="active">{label}</Link>
          ))}
        </nav>
      </header>
      <aside class="ribbon" aria-label="Workspace status">
        <span>{workspaceTotals().drafts} draft{workspaceTotals().drafts === 1 ? '' : 's'}</span>
        <span>{currency(workspaceTotals().outstanding)} workspace value</span>
        <span>{saveStatus()}</span>
      </aside>
      <main id="content" class="content">
        {children}
      </main>
      <footer class="footer">
        <p>Tally uses synthetic local data. It does not process payments, send invoices, or provide tax/compliance advice.</p>
      </footer>
    </div>
  );
}
