// Shared manual-payment constants/helpers — used by Checkout.tsx and the
// cadet PaymentDueModal. There's no automated recurring-billing gateway in
// this app; all payments (one-time or monthly) are reconciled manually by
// admin against a bKash transaction.

export const BKASH_NUMBER = "01894734002";

// Used to advance a cadet enrollment's payment_due_date by one billing cycle.
export function addOneMonth(from: Date = new Date()): string {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}
