export function sumPointLedgers(ledgers: Array<{ points: number }>) {
  return ledgers.reduce((sum, ledger) => sum + ledger.points, 0);
}
