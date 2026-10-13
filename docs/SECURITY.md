# Segurança

A plataforma é aberta (sem login): quem tem o link vê o painel e pode enviar screenshots.

## Controles implementados

- Uploads aceitam somente PNG, JPEG e WEBP, validam extensão, MIME, assinatura binária e limite de 4 MiB (limite de corpo das funções serverless).
- Hash SHA-256 evita reenvio duplicado; o registro de cada upload é imutável (`results/<hash>.json`).
- A leitura do screenshot é sempre revisada por uma pessoa antes de salvar; os valores aceitos são validados por zod e total e percentuais são recalculados.
- Erros públicos não expõem stack trace, caminhos nem mensagens de fornecedores.
- `ANTHROPIC_API_KEY` e `BLOB_READ_WRITE_TOKEN` são lidos apenas em módulos `server-only` e nunca usam `NEXT_PUBLIC_*`.

## Riscos residuais

- **Acesso aberto:** qualquer pessoa com o link pode enviar screenshots (consumindo a API de OCR) e adicionar dados. Proteja a implantação com a Deployment Protection da Vercel, VPN ou restrição por IP.
- **Blob público por URL não listável:** os arquivos do Vercel Blob são acessíveis por URL; os caminhos contêm o SHA-256 da imagem (não adivinhável), mas quem obtiver a URL lê o arquivo. Não envie prints com dados pessoais de clientes.
- **Terceiros:** o screenshot é enviado à API da Anthropic para leitura; confirme retenção e política de dados do escritório.
- Não há exclusão de uploads pela interface; um envio incorreto precisa ser removido diretamente no painel do Vercel Blob.
