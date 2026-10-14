# Arquitetura

## Visão geral

- Aplicação local em Next.js, TypeScript e Tailwind CSS.
- Sem login, banco de dados ou serviço externo: os dados são arquivos no computador.
- OCR local pelo mecanismo nativo do Windows, com reconhecimento em português (Brasil).

## Persistência

- `LocalFileObjectStorage` grava os dados em `.data/`, na raiz do projeto.
- Cada upload confirmado gera um registro JSON e uma cópia do screenshot; arquivos existentes não são sobrescritos.
- A pasta `.data/` não é versionada e deve ser incluída nos backups locais.

## Fluxo do screenshot

1. O screenshot é validado e lido pelo OCR do Windows, sem sair do computador.
2. A pessoa revisa e pode corrigir os valores identificados.
3. Após a confirmação, os dados e a imagem são gravados em `.data/`.

O OCR requer o recurso de Reconhecimento óptico de caracteres em Português (Brasil) instalado no Windows.
