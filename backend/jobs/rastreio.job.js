const { CronJob } = require('cron');
const { Solicitacao } = require('../models');
const rastreioService = require('../services/rastreio.service');
const { Op } = require('sequelize');

const rastreioJob = new CronJob('0 */30 * * * *', async () => {
  console.log('Iniciando job de consulta de rastreio...');
  
  try {
    // Busca solicitações em status que precisam de rastreio e que tenham código
    const solicitacoes = await Solicitacao.findAll({
      where: {
        status: {
          [Op.in]: ['Enviado', 'Retornos']
        },
        codigo_rastreio: {
          [Op.ne]: null
        }
      }
    });

    for (const solicitacao of solicitacoes) {
      await rastreioService.atualizarStatus(solicitacao);
    }
    
    console.log(`Job finalizado. ${solicitacoes.length} solicitações verificadas.`);
  } catch (error) {
    console.error('Erro no job de rastreio:', error);
  }
});

module.exports = rastreioJob;
