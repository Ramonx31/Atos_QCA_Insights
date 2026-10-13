# Status

## 2026-10-13

Plataforma simplificada: removidos login, Supabase, Postgres/Drizzle, RLS, rate limiter e auditoria. Dados agora em arquivos no Vercel Blob (um por upload confirmado). Upload de screenshot com OCR via API do Claude (preview, revisão humana editável e confirmação, em fluxo sem estado compatível com serverless). Detalhes em `ARCHITECTURE.md` e `SECURITY.md`. Pendente: instalar dependências (`npm install`), apagar arquivos obsoletos listados na entrega, configurar `BLOB_READ_WRITE_TOKEN` e `ANTHROPIC_API_KEY` na Vercel.

As entradas abaixo são o histórico anterior; as referências a banco, autenticação e RLS estão obsoletas.

## 2026-10-09

Base inicial criada: estrutura Next.js, layout demonstrativo, mocks tipados, funções de cálculo e esquema Drizzle. O modelo organizacional usa relações N:N para gestores, células e centros de custo; a estrutura de importação XLSX preserva `Nome` como candidato sujeito a validação de negócio. OCR e integrações permanecem fora do escopo desta etapa. A validação automatizada depende da conclusão da instalação de pacotes local, que não finalizou neste ambiente.

Catálogo de atos criado com aliases, busca, ordenação, normalização de comparação e resolução de nomes desconhecidos como `pending_mapping`.

Fluxo de screenshot criado com validação de arquivo, hash, armazenamento privado abstrato, provider de extração, preview e confirmação explícita antes da persistência.

Dashboard de atos criado com consultas de resultados aprovados persistidos, filtros globais, KPIs, ECharts e TanStack Table. Sem `DATABASE_URL`, o painel mostra estado vazio e não usa mocks.

Motor determinístico de insights criado com thresholds configuráveis, ranking, participações, comparação ponderada com a média e evolução opcional entre períodos.

Exportação do dashboard criada para HTML autônomo e impressão A4 em PDF, sempre a partir do snapshot filtrado atual.

Revisão de segurança adicionou autenticação/autorizações de servidor, RLS, bucket privado, URLs assinadas, controles de upload, rate limiting, auditoria e documentação de riscos residuais.

Suíte de QA ampliada com cenários positivos, negativos, exceções e regressão para upload, extração, dashboard, filtros, exportação, aliases e duplicidade.
