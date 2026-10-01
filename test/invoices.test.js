import { describe, expect, it } from 'vitest';
import { calculateInvoice, finiteMoney, seedInvoices } from '../src/data/invoices.js';

describe('invoice calculations', () => {
  it('calculates subtotal, tax, and total from finite line values', () => {
    expect(calculateInvoice(seedInvoices[0])).toEqual({
      subtotal: 3470,
      tax: 294.95,
      total: 3764.95,
    });
  });

  it('guards invalid money values', () => {
    expect(finiteMoney('bad')).toBe(0);
    expect(finiteMoney(-12)).toBe(0);
    expect(finiteMoney('12.5')).toBe(12.5);
  });
});
