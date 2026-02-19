import type { AgentProfile, AgentConfig, AgentNeighbourhood } from "@nestiq/shared";

export type PromptBuilderInput = {
  agent: AgentProfile;
  config: AgentConfig;
  neighbourhoods: AgentNeighbourhood[];
  catalogPrompt: string; // from realestateCatalog.prompt(...)
};

export type ToolBuilderInput = {
  agent: AgentProfile;
  config: AgentConfig;
  neighbourhoods: AgentNeighbourhood[];
};

// TaxCalculatorResult and TaxCalculatorInput are defined in ./tax-calculators/types
