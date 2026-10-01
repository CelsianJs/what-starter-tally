import AppShell from './components/AppShell.jsx';
import Build from './pages/Build.jsx';
import ClientDetail from './pages/ClientDetail.jsx';
import Clients from './pages/Clients.jsx';
import Drafts from './pages/Drafts.jsx';
import Home from './pages/Home.jsx';
import InvoiceDetail from './pages/InvoiceDetail.jsx';
import NotFound from './pages/NotFound.jsx';
import Receipt from './pages/Receipt.jsx';

const withShell = (path, component) => ({ path, component, layout: AppShell });

export const routes = [
  withShell('/', Home),
  withShell('/clients', Clients),
  withShell('/clients/:id', ClientDetail),
  withShell('/drafts', Drafts),
  withShell('/invoices/:id', InvoiceDetail),
  withShell('/receipt/:id', Receipt),
  withShell('/build', Build),
  withShell('/404', NotFound),
  withShell('/*', NotFound),
];

export const routeMeta = {
  '/': 'Tally invoice workspace',
  '/clients': 'Client ledger',
  '/drafts': 'Invoice drafts',
  '/build': 'How it is built',
};
