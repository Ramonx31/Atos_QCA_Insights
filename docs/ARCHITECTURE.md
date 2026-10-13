# Arquitetura

## Visão geral

- Aplicação web em Next.js (App Router), TypeScript e Tailwind CSS, pensada para rodar na Vercel.
- Sem login e sem banco de dados: o painel é aberto e os dados vêm de arquivos JSON no Vercel Blob.
- Cálculo centralizado: `total = manual + automated`; os percentuais são sempre recalculados a partir dos valores absolutos.

## Persistência

- `src/server/storage/object-storage.ts`: interface `ObjectStorage` com `VercelBlobObjectStorage` (produção, `BLOB_READ_WRITE_TOKEN`) e `LocalFileObjectStorage` (desenvolvimento, pasta `.data/`).
- `src/server/results/result-store.ts`: cada upload confirmado vira `results/<sha256>.json` e `screenshots/<sha256>.<ext>`. Os arquivos nunca são sobrescritos, então não há leitura-modificação-gravação nem conflito entre usuários simultâneos; o hash também impede duplicidade.
- `src/server/results/build-facts.ts`: converte os uploads em `DashboardFact[]`, unificando nomes de atos equivalentes (acentos, caixa, espaços) pelo primeiro nome enviado.

## Fluxo de screenshot (sem estado)

1. `POST /api/uploads/preview`: recebe a imagem, valida, rejeita duplicados, extrai com `ClaudeExtractionProvider` (API do Claude com visão, saída estruturada por tool use) e devolve valores e divergências matemáticas. Nada é persistido.
2. A pessoa revisa e pode corrigir manual/automatizado.
3. `POST /api/uploads/confirm`: recebe a imagem novamente, a competência, etiquetas opcionais (diretoria, centro de custo, célula, gestor) e os valores revisados, e então persiste.

O dashboard, filtros, gráficos (ECharts), tabela (TanStack Table), insights determinísticos e exportação consomem `DashboardFact[]` e não conhecem a origem dos dados.

## Insights determinísticos

`src/server/insights` calcula métricas e mensagens a partir dos agregados filtrados. A média manual é ponderada pelo volume. Evolução positiva significa queda da taxa manual; negativa, aumento. Os thresholds são configuráveis e nenhuma mensagem atribui causas.

## Exportação

`src/components/dashboard/export` gera HTML autônomo com SVGs estáticos e PDF pela impressão do navegador, sempre a partir do snapshot filtrado atual.

## Módulos mantidos sem uso no fluxo atual

`src/server/acts` (catálogo de atos/aliases) e `src/server/organization` (importação de planilha organizacional) continuam como lógica pura com testes, mas hoje não têm persistência nem são chamados pela interface.
