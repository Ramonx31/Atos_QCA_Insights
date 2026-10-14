const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim().toLocaleLowerCase("pt-BR");

const names = [
  "PA'S Preenchidas - Outras",
  "Audiências Realizadas",
  "Encaminhados para Negociação",
  "Encerramentos",
  "Garantias Cadastradas",
  "Obrigações Comprovadas",
  "Obrigações Notificadas",
  "PA de Procedência",
  "Orientações Enviadas",
];

const nonAutomatedActs = new Set(names.map(normalize));
const excludedFromManualAttention = new Set([
  "Encerramentos",
  "Audiências Realizadas",
  "Orientações Enviadas",
  "Encaminhados para Negociação",
].map(normalize));

/** Atos mapeados pela operação como sem automação disponível. */
export const isNonAutomatedAct = (name: string) => nonAutomatedActs.has(normalize(name));

/** Atos tratados somente no quadro de indisponibilidade de automação. */
export const isExcludedFromManualAttention = (name: string) => excludedFromManualAttention.has(normalize(name));
