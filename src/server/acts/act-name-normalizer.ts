/**
 * Produz uma chave de comparação. O texto informado não é alterado nem deve
 * ser usado para substituir o nome canônico ou o alias exibido.
 */
export function normalizeActName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[\u2010-\u2015\u2212-]/gu, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}
