import type { TaxCalculator, TaxCalculatorInput, TaxCalculatorResult } from "./types";

/**
 * Alberta Land Title Transfer Fee Calculator
 *
 * Alberta does NOT have a Land Transfer Tax.
 * Instead, there is a Land Title Transfer Fee:
 *   - Base fee: $50
 *   - Plus $2 for every $5,000 of property value (or portion thereof)
 *
 * There is also a mortgage registration fee (same formula) but that is
 * separate and not included here as it depends on mortgage amount.
 *
 * There is no first-time buyer exemption for the transfer fee.
 */
export class AlbertaLttCalculator implements TaxCalculator {
  calculate(input: TaxCalculatorInput): TaxCalculatorResult {
    const { purchasePrice } = input;

    // Land Title Transfer Fee: $50 + $2 per $5,000 (or portion thereof)
    const increments = Math.ceil(purchasePrice / 5_000);
    const transferFee = 50 + increments * 2;

    const totalTax = Math.round(transferFee * 100) / 100;

    const tiers: Array<{ range: string; rate: string; amount: number }> = [
      {
        range: "Base fee",
        rate: "Flat",
        amount: 50,
      },
      {
        range: `${increments} x $5,000 increments`,
        rate: "$2 per $5,000",
        amount: increments * 2,
      },
    ];

    return {
      totalTax,
      exemption: 0,
      netTax: totalTax,
      tiers,
      regionName: "Alberta",
      taxName: "Land Title Transfer Fee",
    };
  }
}
