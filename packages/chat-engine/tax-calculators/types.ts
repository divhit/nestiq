export type TaxCalculatorInput = {
  purchasePrice: number;
  isFirstTimeBuyer: boolean;
  isNewlyBuilt?: boolean;
};

export type TaxCalculatorResult = {
  totalTax: number;
  exemption: number;
  netTax: number;
  tiers: Array<{ range: string; rate: string; amount: number }>;
  regionName: string;
  taxName: string;
};

export interface TaxCalculator {
  calculate(input: TaxCalculatorInput): TaxCalculatorResult;
}
