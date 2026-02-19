import type { TaxCalculator } from "./types";
import { BcPttCalculator } from "./bc-ptt";
import { OntarioLttCalculator } from "./on-ltt";
import { AlbertaLttCalculator } from "./ab-ltt";
import { GenericCalculator } from "./generic";

export function getTaxCalculator(type: string): TaxCalculator {
  switch (type) {
    case "bc_ptt":
      return new BcPttCalculator();
    case "on_ltt":
      return new OntarioLttCalculator();
    case "ab_ltt":
      return new AlbertaLttCalculator();
    default:
      return new GenericCalculator();
  }
}

export * from "./types";
