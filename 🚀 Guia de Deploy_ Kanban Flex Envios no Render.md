# 🚀 Guia de Deploy: Kanban Flex Envios no Render

Este guia explica como colocar seu sistema online no **Render** utilizando a estrutura de pastas que criamos.

---

## 1. Preparação do Repositório (GitHub)

Antes de ir para o Render, certifique-se de que seu código está no GitHub:
1. Crie um novo repositório privado ou público no seu GitHub.
2. Suba a pasta raiz do projeto (aquela que contém as pastas `backend`, `frontend` e o arquivo `package.json` mestre).

---

## 2. Configuração no Render (Web Service)

No Render, utilizaremos o modelo de **Web Service**, pois ele permite rodar o Node.js e manter o banco de dados SQLite no mesmo ambiente.

1. Acesse o [Dashboard do Render](https://dashboard.render.com/).
2. Clique em **New +** e selecione **Web Service**.
3. Conecte seu repositório do GitHub.
4. Configure os campos principais:
   - **Name**: `kanban-flex-envios` (ou o nome que preferir).
   - **Environment**: `Node`.
   - **Region**: Selecione a mais próxima de você (ex: `Ohio` ou `Frankfurt`).
   - **Branch**: `main`.

---

## 3. Comandos de Build e Start

Esta é a parte mais importante para que o Render entenda sua estrutura de pastas:

- **Build Command**: 
  ```bash
  npm run install-all
  ```
  *(Este comando, configurado no seu package.json raiz, entrará na pasta backend e instalará todas as dependências automaticamente).*

- **Start Command**:
  ```bash
  npm start
  ```
  *(Este comando iniciará o servidor Node.js que já está configurado para servir o frontend da pasta `/frontend`).*

---

## 4. Variáveis de Ambiente (Environment Variables)

Clique na aba **Env Vars** no Render e adicione as seguintes chaves (baseadas no seu `.env.example`):

### 📧 E-mail (Obrigatório para o Kanban funcionar)
- `MAIL_HOST`: (ex: smtp.gmail.com)
- `MAIL_PORT`: 465
- `MAIL_USER`: Seu e-mail
- `MAIL_PASS`: Sua senha de app (não é a senha normal do e-mail)
- `IMAP_HOST`: (ex: imap.gmail.com)
- `IMAP_PORT`: 993

### 📦 Correios (Obrigatório para automação da API)
- `CORREIOS_USUARIO`: Seu usuário oficial
- `CORREIOS_SENHA`: Sua senha oficial
- `CORREIOS_CONTRATO`: Seu número de contrato
- `CORREIOS_CARTAO_POSTAGEM`: Seu cartão de postagem
- `CORREIOS_CEP_ORIGEM`: Seu CEP de postagem

---

## 5. Banco de Dados (SQLite)

O seu projeto utiliza **SQLite**, que salva os dados em um arquivo chamado `database.sqlite` dentro da pasta `backend`.

**⚠️ Nota Importante sobre o Plano Gratuito:**
No plano gratuito do Render, o disco é "efêmero". Isso significa que se o servidor reiniciar, os dados do banco SQLite serão resetados.
- **Para uso em produção**: Recomenda-se adicionar um **Disk** (Persistent Storage) no Render apontando para a pasta do banco de dados, ou fazer o upgrade para um banco de dados gerenciado (PostgreSQL) no futuro.
- **Para testes**: O plano gratuito funciona perfeitamente para validar todas as funcionalidades.

---

## 6. Finalizando

1. Clique em **Create Web Service**.
2. Aguarde o log mostrar `Servidor rodando na porta XXXX`.
3. O Render fornecerá uma URL (ex: `https://kanban-flex-envios.onrender.com`).
4. **Pronto!** Seu sistema está online e integrado.
