# Kanban Flex Envios

Sistema de gestão de solicitações operacionais com interface Kanban, integração de e-mail (IMAP) e rastreio via API Oficial dos Correios.

## 📂 Estrutura do Projeto

O projeto está dividido em duas pastas principais para facilitar a manutenção:

- **`/backend`**: Contém toda a inteligência do sistema, banco de dados, integrações com APIs e serviços de e-mail.
- **`/frontend`**: Contém a interface visual (HTML, CSS, JS) que o usuário acessa.

## 🚀 Como Rodar Localmente

1. Entre na pasta backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o seu arquivo `.env` baseado no `.env.example`.
4. Inicie o sistema:
   ```bash
   npm run dev
   ```
5. O sistema estará disponível em `http://localhost:3000`.

## ☁️ Deploy no Render

Este projeto está configurado para o Render reconhecer a estrutura separada:

1. **Build Command**: `npm run install-all` (ou `cd backend && npm install`)
2. **Start Command**: `npm start` (ou `cd backend && npm start`)
3. **Environment Variables**: Configure todas as variáveis (E-mail e Correios) no painel do Render.

## 📧 Padrão de E-mail

O sistema monitora e-mails com o seguinte padrão no corpo:
```text
DETALHES DA SOLICITAÇÃO:
- Nº REMESSA: 12345
- CLIENTE: Nome do Cliente
- CNPJ: 00.000.000/0000-00
- E-MAIL DO CLIENTE: cliente@email.com
- ENDEREÇO: Rua Exemplo, 123
- OBSERVAÇÃO: Urgente
- PLACA: ABC-1234
```

## 📦 Integração Correios (API Oficial)
Configure `CORREIOS_USUARIO`, `CORREIOS_SENHA`, `CORREIOS_CONTRATO`, `CORREIOS_CARTAO_POSTAGEM` e `CORREIOS_CEP_ORIGEM` para habilitar a automação total.
