import type { TaxCalculator, TaxCalculatorInput, TaxCalculatorResult } from "./types";

/**
 * Ontario Land Transfer Tax Calculator
 *
 * Provincial LTT rates (applied on cumulative thresholds):
 *   - 0.5% on the first $55,000
 *   - 1.0% on $55,001 to $250,000
 *   - 1.5% on $250,001 to $400,000
 *   - 2.0% on $400,001 to $2,000,000
 *   - 2.5% on amounts above $2,000,000
 *
 * First-Time Home Buyer Rebate:
 *   - Maximum rebate of $4,000
 *   - Full rebate on homes up to $368,000 (LTT at $368K = $4,000)
 *   - Partial rebate (capped at $4,000) on homes above $368,000
 *
 * Note: Toronto has an additional Municipal LTT with the same tier structure.
 * This calculator covers the provincial LTT only. For Toronto properties,
 * the municipal LTT would need to be calculated separately and added.
 */
export class OntarioLttCalculator implements TaxCalculator {
  calculate(input: TaxCalculatorInput): TaxCalculatorResult {
    const { purchasePrice, isFirstTimeBuyer } = input;

    const tiers: Array<{ range: string; rate: string; amount: number }> = [];
    let totalTax = 0;

    // Tier 1: 0.5% on first $55K
    const tier1Base = Math.min(purchasePrice, 55_000);
    const tier1Amount = tier1Base * 0.005;
    if (tier1Base > 0) {
      tiers.push({
        range: "$0 - $55,000",
        rate: "0.5%",
        amount: Math.round(tier1Amount * 100) / 100,
      });
      totalTax += tier1Amount;
    }

    // Tier 2: 1.0% on $55,001 - $250,000
    const tier2Base = Math.min(Math.max(purchasePrice - 55_000, 0), 195_000);
    const tier2Amount = tier2Base * 0.01;
    if (tier2Base > 0) {
      tiers.push({
        range: "$55,001 - $250,000",
        rate: "1%",
        amount: Math.round(tier2Amount * 100) / 100,
      });
      totalTax += tier2Amount;
    }

    // Tier 3: 1.5% on $250,001 - $400,000
    const tier3Base = Math.min(Math.max(purchasePrice - 250_000, 0), 150_000);
    const tier3Amount = tier3Base * 0.015;
    if (tier3Base > 0) {
      tiers.push({
        range: "$250,001 - $400,000",
        rate: "1.5%",
        amount: Math.round(tier3Amount * 100) / 100,
      });
      totalTax += tier3Amount;
    }

    // Tier 4: 2.0% on $400,001 - $2,000,000
    const tier4Base = Math.min(Math.max(purchasePrice - 400_000, 0), 1_600_000);
    const tier4Amount = tier4Base * 0.02;
    if (tier4Base > 0) {
      tiers.push({
        range: "$400,001 - $2,000,000",
        rate: "2%",
        amount: Math.round(tier4Amount * 100) / 100,
      });
      totalTax += tier4Amount;
    }

    // Tier 5: 2.5% above $2,000,000
    const tier5Base = Math.max(purchasePrice - 2_000_000, 0);
    const tier5Amount = tier5Base * 0.025;
    if (tier5Base > 0) {
      tiers.push({
        range: "Above $2,000,000",
        rate: "2.5%",
        amount: Math.round(tier5Amount * 100) / 100,
      });
      totalTax += tier5Amount;
    }

    totalTax = Math.round(totalTax * 100) / 100;

    // First-time buyer rebate: max $4,000
    let exemption = 0;
    if (isFirstTimeBuyer) {
      // The full rebate covers LTT up to $368,000 (which equals $4,000).
      // Above $368K, the rebate is capped at $4,000.
      exemption = Math.min(totalTax, 4_000);
    }

    const netTax = Math.round((totalTax - exemption) * 100) / 100;

    return {
      totalTax,
      exemption,
      netTax,
      tiers,
      regionName: "Ontario",
      taxName: "Land Transfer Tax (LTT)",
    };
  }
}
