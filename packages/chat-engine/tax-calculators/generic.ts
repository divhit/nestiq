import type { TaxCalculator, TaxCalculatorInput, TaxCalculatorResult } from "./types";

/**
 * Generic / Fallback Transfer Tax Calculator
 *
 * Estimates transfer tax as 1.5% of the purchase price.
 * Used when no region-specific calculator is configured.
 */
export class GenericCalculator implements TaxCalculator {
  calculate(input: TaxCalculatorInput): TaxCalculatorResult {
    const { purchasePrice } = input;

    const totalTax = Math.round(purchasePrice * 0.015 * 100) / 100;

    const tiers: Array<{ range: string; rate: string; amount: number }> = [
      {
        range: "Full purchase price",
        rate: "1.5% (estimated)",
        amount: totalTax,
      },
    ];

    return {
      totalTax,
      exemption: 0,
      netTax: totalTax,
      tiers,
      regionName: "General",
      taxName: "Estimated Transfer Tax",
    };
  }
}
