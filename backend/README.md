# Kanban Flex Envios

Sistema de gestão de solicitações operacionais com interface Kanban, integração de e-mail (IMAP) para criação automática de cards e rastreio de envios via Correios.

## 🚀 Funcionalidades

- **Kanban Completo**: Gestão visual com drag-and-drop.
- **Integração de E-mail**: Criação automática de solicitações ao receber e-mails em formato específico.
- **Gestão de Envios**: Geração/Upload de etiquetas e inserção de código de rastreio.
- **Rastreio Automático**: Job periódico que consulta o status EXCLUSIVAMENTE via API Oficial dos Correios.
- **Notificações**: Envio automático de e-mail ao cliente quando o status muda para "Enviado".
- **Histórico**: Registro completo de todas as alterações e comentários em cada card.

## 🛠️ Stack Técnica

- **Backend**: Node.js, Express, Sequelize (ORM).
- **Banco de Dados**: SQLite (ideal para deploy rápido e persistência simples).
- **Frontend**: HTML5, CSS3, JavaScript Puro (Vanilla JS).
- **Automação**: node-cron para jobs de rastreio.

## 📦 Como Rodar Localmente

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o arquivo `.env` (use o `.env.example` como base).
4. Inicie o servidor:
   ```bash
   npm run dev
   ```
5. Acesse `http://localhost:3000`.

## ☁️ Deploy no Render

Este projeto foi padronizado para o **Render**:

1. Crie um novo **Web Service** no Render.
2. Conecte seu repositório GitHub.
3. Configure os comandos:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Adicione as **Environment Variables** conforme o `.env.example`.
5. O banco SQLite será criado automaticamente na raiz do projeto.

## 📦 Integração Correios (API Oficial)

O sistema está preparado para a API oficial. Configure as seguintes variáveis no Render:

- `CORREIOS_USUARIO`
- `CORREIOS_SENHA`
- `CORREIOS_CONTRATO`
- `CORREIOS_CARTAO_POSTAGEM`
- `CORREIOS_CEP_ORIGEM`

### Fallback Controlado
Caso as credenciais não sejam fornecidas, o sistema entra em **Modo Manual**, permitindo:
- Inserção manual de códigos de rastreio.
- Upload manual de etiquetas em PDF.
- O sistema exibirá um aviso visual indicando que a API não está configurada.

## 📧 Padrão de E-mail para Solicitações

O sistema lê e-mails que contenham no corpo:

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

## 📄 Licença

Este projeto é de uso operacional interno.
