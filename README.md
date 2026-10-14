# ATOS QCA Insights

Painel local para analisar atos manuais e automatizados a partir de PDFs.

## Como executar

1. Instale as dependências com `npm install`.
2. Execute `npm run dev`.
3. Abra `http://localhost:3000`.

Envie o PDF exportado pelo painel operacional: a plataforma lê sua camada textual localmente e extrai a primeira tabela de detalhamento dos atos. Arquivos de imagem não são aceitos.

O painel, os PDFs e os dados são processados no próprio computador. Nada é enviado a serviços externos. Os resultados aprovados ficam em `.data/`, pasta ignorada pelo Git; faça backup dela para preservar o histórico.

O OCR utiliza o reconhecimento de texto nativo do Windows em português (Brasil). Se ele não estiver disponível, instale o recurso opcional **Reconhecimento óptico de caracteres** para **Português (Brasil)** nas configurações de Idioma do Windows.

## Comandos úteis

- `npm run dev`: inicia o painel local em desenvolvimento.
- `npm run build`: gera a versão otimizada.
- `npm start`: inicia localmente a versão otimizada após o build.
- `npm test`: executa os testes unitários.
- `npm run typecheck`: confere os tipos TypeScript.
