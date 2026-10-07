import { computed, effect, signal } from 'what-framework';
import { calculateInvoice, clientById, seedInvoices } from '../data/invoices.js';

export const STORAGE_KEY = 'what-starter-tally-v1';

function cloneSeed() {
  return seedInvoices.map((invoice) => ({
    ...invoice,
    lines: invoice.lines.map((line) => ({ ...line })),
  }));
}

function validLine(line) {
  return line && typeof line.description === 'string' && Number.isFinite(Number(line.quantity)) && Number.isFinite(Number(line.unitPrice));
}

function validInvoice(invoice) {
  return invoice
    && typeof invoice.id === 'string'
    && clientById(invoice.clientId)
    && Array.isArray(invoice.lines)
    && invoice.lines.every(validLine);
}

function safeLoad() {
  if (typeof localStorage === 'undefined') return { invoices: cloneSeed(), selectedClient: 'all', status: 'Session only.' };
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!parsed || !Array.isArray(parsed.invoices) || !parsed.invoices.every(validInvoice)) {
      return { invoices: cloneSeed(), selectedClient: 'all', status: 'Loaded seed drafts.' };
    }
    return {
      invoices: parsed.invoices,
      selectedClient: parsed.selectedClient || 'all',
      status: 'Drafts restored from this browser.',
    };
  } catch {
    return { invoices: cloneSeed(), selectedClient: 'all', status: 'Stored drafts were invalid, so seed drafts loaded.' };
  }
}

const initial = safeLoad();

export const invoices = signal(initial.invoices, 'tally.invoices');
export const selectedClient = signal(initial.selectedClient, 'tally.selectedClient');
export const saveStatus = signal(initial.status, 'tally.saveStatus');
export const exportStatus = signal('JSON export is generated locally.', 'tally.exportStatus');

export const visibleInvoices = computed(() => {
  const clientId = selectedClient();
  return invoices().filter((invoice) => clientId === 'all' || invoice.clientId === clientId);
});

export const invoiceSummaries = computed(() => invoices().map((invoice) => ({
  ...invoice,
  client: clientById(invoice.clientId),
  totals: calculateInvoice(invoice),
})));

export const workspaceTotals = computed(() => invoiceSummaries().reduce((totals, invoice) => ({
  drafts: totals.drafts + (invoice.status === 'draft' ? 1 : 0),
  saved: totals.saved + (invoice.status === 'saved' ? 1 : 0),
  outstanding: Math.round((totals.outstanding + invoice.totals.total) * 100) / 100,
}), { drafts: 0, saved: 0, outstanding: 0 }));

function replaceInvoice(id, update) {
  invoices((items) => items.map((invoice) => (invoice.id === id ? update(invoice) : invoice)));
}

export function updateLine(invoiceId, lineId, patch) {
  replaceInvoice(invoiceId, (invoice) => ({
    ...invoice,
    lines: invoice.lines.map((line) => (line.id === lineId ? { ...line, ...patch } : line)),
    status: 'draft',
  }));
}

export function addLine(invoiceId) {
  replaceInvoice(invoiceId, (invoice) => ({
    ...invoice,
    lines: [
      ...invoice.lines,
      { id: `line-${Date.now().toString(36)}`, description: 'New service', quantity: 1, unitPrice: 125 },
    ],
    status: 'draft',
  }));
}

export function removeLine(invoiceId, lineId) {
  replaceInvoice(invoiceId, (invoice) => ({
    ...invoice,
    lines: invoice.lines.filter((line) => line.id !== lineId),
    status: 'draft',
  }));
}

export function markSaved(invoiceId) {
  replaceInvoice(invoiceId, (invoice) => ({ ...invoice, status: 'saved' }));
}

export function resetWorkspace() {
  invoices(cloneSeed());
  selectedClient('all');
  saveStatus('Workspace reset to seed drafts.');
}

export function exportInvoice(invoice) {
  const payload = {
    ...invoice,
    client: clientById(invoice.clientId),
    totals: calculateInvoice(invoice),
    exportedAt: new Date().toISOString(),
    note: 'Local JSON export only. This starter does not send bills or process payments.',
  };
  exportStatus(`Prepared JSON export for ${invoice.id}.`);
  return JSON.stringify(payload, null, 2);
}

function persistSnapshot(snapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    saveStatus(`Saved ${snapshot.invoices.length} draft${snapshot.invoices.length === 1 ? '' : 's'} in this browser.`);
  } catch {
    saveStatus('Changes are not saved in this browser. Invoice edits will last for this session only.');
  }
}

effect(() => {
  if (typeof localStorage === 'undefined') return;
  persistSnapshot({ invoices: invoices(), selectedClient: selectedClient() });
});
