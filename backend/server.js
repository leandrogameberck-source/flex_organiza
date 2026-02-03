require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');
const routes = require('./routes');
const emailService = require('./services/email.service');
const rastreioJob = require('./jobs/rastreio.job');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Arquivos estáticos - Agora apontando para a pasta frontend fora da pasta backend
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas API
app.use('/api', routes);

// Rota para o Frontend (SPA fallback)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Inicialização do Banco de Dados e Servidor
async function start() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Banco de dados sincronizado.');

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      
      emailService.listenEmails().catch(err => {
        console.error('Falha ao iniciar serviço de e-mail:', err.message);
      });

      rastreioJob.start();
      console.log('Jobs automáticos iniciados.');
    });
  } catch (error) {
    console.error('Erro ao iniciar aplicação:', error);
  }
}

start();
