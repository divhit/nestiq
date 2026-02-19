import type { TaxCalculator, TaxCalculatorInput, TaxCalculatorResult } from "./types";

/**
 * BC Property Transfer Tax Calculator
 *
 * Rates (applied on cumulative thresholds):
 *   - 1% on the first $200,000
 *   - 2% on $200,001 to $2,000,000
 *   - 3% on amounts above $2,000,000
 *
 * First-Time Home Buyer Exemption (resale):
 *   - Full exemption on properties up to $835,000
 *   - Partial exemption (linear fade-out) from $835,001 to $860,000
 *   - No exemption above $860,000
 *
 * First-Time Home Buyer Exemption (newly built):
 *   - Full exemption on properties up to $1,100,000
 *   - Partial exemption (linear fade-out) from $1,100,001 to $1,150,000
 *   - No exemption above $1,150,000
 */
export class BcPttCalculator implements TaxCalculator {
  calculate(input: TaxCalculatorInput): TaxCalculatorResult {
    const { purchasePrice, isFirstTimeBuyer, isNewlyBuilt } = input;

    const tiers: Array<{ range: string; rate: string; amount: number }> = [];
    let totalTax = 0;

    // Tier 1: 1% on first $200K
    const tier1Base = Math.min(purchasePrice, 200_000);
    const tier1Amount = tier1Base * 0.01;
    if (tier1Base > 0) {
      tiers.push({
        range: "$0 - $200,000",
        rate: "1%",
        amount: Math.round(tier1Amount * 100) / 100,
      });
      totalTax += tier1Amount;
    }

    // Tier 2: 2% on $200K - $2M
    const tier2Base = Math.min(Math.max(purchasePrice - 200_000, 0), 1_800_000);
    const tier2Amount = tier2Base * 0.02;
    if (tier2Base > 0) {
      tiers.push({
        range: "$200,001 - $2,000,000",
        rate: "2%",
        amount: Math.round(tier2Amount * 100) / 100,
      });
      totalTax += tier2Amount;
    }

    // Tier 3: 3% above $2M
    const tier3Base = Math.max(purchasePrice - 2_000_000, 0);
    const tier3Amount = tier3Base * 0.03;
    if (tier3Base > 0) {
      tiers.push({
        range: "Above $2,000,000",
        rate: "3%",
        amount: Math.round(tier3Amount * 100) / 100,
      });
      totalTax += tier3Amount;
    }

    totalTax = Math.round(totalTax * 100) / 100;

    // Calculate first-time buyer exemption
    let exemption = 0;
    if (isFirstTimeBuyer) {
      if (isNewlyBuilt) {
        // Newly built: full exemption up to $1.1M, fade-out to $1.15M
        if (purchasePrice <= 1_100_000) {
          exemption = totalTax;
        } else if (purchasePrice < 1_150_000) {
          // Linear fade-out: exemption decreases proportionally
          const fullExemptionTax = this.calculateRawTax(1_100_000);
          const ratio = (1_150_000 - purchasePrice) / (1_150_000 - 1_100_000);
          exemption = Math.round(fullExemptionTax * ratio * 100) / 100;
        }
        // Above $1.15M: no exemption (exemption stays 0)
      } else {
        // Resale: full exemption up to $835K, fade-out to $860K
        if (purchasePrice <= 835_000) {
          exemption = totalTax;
        } else if (purchasePrice < 860_000) {
          // Linear fade-out
          const fullExemptionTax = this.calculateRawTax(835_000);
          const ratio = (860_000 - purchasePrice) / (860_000 - 835_000);
          exemption = Math.round(fullExemptionTax * ratio * 100) / 100;
        }
        // Above $860K: no exemption
      }
    }

    const netTax = Math.round((totalTax - exemption) * 100) / 100;

    return {
      totalTax,
      exemption,
      netTax,
      tiers,
      regionName: "British Columbia",
      taxName: "Property Transfer Tax (PTT)",
    };
  }

  /**
   * Calculate raw tax without any exemptions (used for fade-out calculation).
   */
  private calculateRawTax(price: number): number {
    let tax = 0;
    tax += Math.min(price, 200_000) * 0.01;
    tax += Math.min(Math.max(price - 200_000, 0), 1_800_000) * 0.02;
    tax += Math.max(price - 2_000_000, 0) * 0.03;
    return Math.round(tax * 100) / 100;
  }
}
