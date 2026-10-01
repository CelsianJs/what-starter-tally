export const clients = [
  {
    id: 'northline',
    name: 'Northline Studio',
    contact: 'Mira Hale',
    email: 'mira@northline.example',
    accent: '#64d6a6',
    terms: 'Net 14',
    notes: 'Retainer design partner with recurring launch work.',
  },
  {
    id: 'copper-and-co',
    name: 'Copper & Co.',
    contact: 'Jon Bell',
    email: 'jon@copper.example',
    accent: '#9fe4cc',
    terms: 'Due on receipt',
    notes: 'Brand refresh client; wants clear milestone receipts.',
  },
  {
    id: 'rill-labs',
    name: 'Rill Labs',
    contact: 'Anya Moss',
    email: 'anya@rill.example',
    accent: '#b4f1d7',
    terms: 'Net 7',
    notes: 'Small research group with workshop-heavy invoices.',
  },
];

export const seedInvoices = [
  {
    id: 'inv-1007',
    clientId: 'northline',
    title: 'October launch system',
    status: 'draft',
    taxRate: 8.5,
    issued: '2026-10-01',
    due: '2026-10-15',
    lines: [
      { id: 'line-strategy', description: 'Messaging workshop', quantity: 1, unitPrice: 950 },
      { id: 'line-pages', description: 'Landing page production', quantity: 3, unitPrice: 680 },
      { id: 'line-review', description: 'Launch QA pass', quantity: 4, unitPrice: 120 },
    ],
  },
  {
    id: 'inv-1008',
    clientId: 'copper-and-co',
    title: 'Identity polish sprint',
    status: 'saved',
    taxRate: 6.25,
    issued: '2026-10-03',
    due: '2026-10-03',
    lines: [
      { id: 'line-logo', description: 'Logo refinement', quantity: 6, unitPrice: 140 },
      { id: 'line-guide', description: 'One-page brand guide', quantity: 1, unitPrice: 720 },
    ],
  },
  {
    id: 'inv-1009',
    clientId: 'rill-labs',
    title: 'Research demo kit',
    status: 'draft',
    taxRate: 0,
    issued: '2026-10-05',
    due: '2026-10-12',
    lines: [
      { id: 'line-demo', description: 'Interactive demo shell', quantity: 2, unitPrice: 800 },
      { id: 'line-copy', description: 'Technical copy editing', quantity: 5, unitPrice: 95 },
    ],
  },
];

export function clientById(id) {
  return clients.find((client) => client.id === id);
}

export function invoiceById(invoices, id) {
  return invoices.find((invoice) => invoice.id === id);
}

export function finiteMoney(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

export function calculateInvoice(invoice) {
  const subtotal = invoice.lines.reduce((sum, line) => sum + finiteMoney(line.quantity) * finiteMoney(line.unitPrice), 0);
  const tax = subtotal * (finiteMoney(invoice.taxRate) / 100);
  const total = subtotal + tax;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export function currency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(finiteMoney(value));
}
