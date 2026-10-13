/** Não há imagem versionada; esta fixture representa o contrato do print de referência. */
export const referenceDashboardExtractionFixture = {
  acts: [
    { act: "Distribuição", manual: "6.338", automated: "1.742", total: "8.080", manualPercentage: "78,44%", automatedPercentage: "21,56%", totalPercentage: "100,00%" },
    { act: "Publicação", manual: "100", automated: "300", total: "400", manualPercentage: "25,00%", automatedPercentage: "75,00%", totalPercentage: "100,00%" },
  ],
  total: { act: "Total", manual: "6.438", automated: "2.042", total: "8.480", manualPercentage: "75,92%", automatedPercentage: "24,08%", totalPercentage: "100,00%" },
} as const;
