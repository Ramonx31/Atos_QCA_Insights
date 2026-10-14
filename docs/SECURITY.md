# Segurança

A plataforma foi desenhada para uso local. Ela não tem login: quem tiver acesso ao computador e à aplicação poderá usar o painel.

## Controles implementados

- Uploads aceitam somente PNG, JPEG e WEBP, com validação de extensão, MIME, assinatura binária e limite de 4 MiB.
- O hash SHA-256 evita reenvio duplicado; cada registro aprovado é imutável.
- O OCR é executado pelo Windows na própria máquina. A imagem não é enviada a serviços externos.
- A leitura é sempre revisada por uma pessoa antes de ser salva; valores aceitos são validados e os totais e percentuais são recalculados.
- Dados e screenshots ficam em `.data/`, pasta ignorada pelo Git.

## Cuidados operacionais

- Não exponha a aplicação na rede sem adicionar autenticação e controles de acesso.
- Restrinja o acesso à pasta do projeto pelo sistema operacional e mantenha backup de `.data/`.
- Não há exclusão pela interface. Para remover um envio incorreto, apague manualmente os arquivos correspondentes em `.data/`.
