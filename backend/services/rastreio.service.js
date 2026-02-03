const correiosService = require('./correios.service');
const { Historico } = require('../models');

class RastreioService {
  async atualizarStatus(solicitacao) {
    if (!solicitacao.codigo_rastreio) return;

    const info = await correiosService.consultarRastreio(solicitacao.codigo_rastreio);
    if (!info) return;

    let novoStatus = solicitacao.status;
    
    // Regras automáticas baseadas na API Oficial
    if (info.status === 'Objeto entregue ao destinatário') {
      novoStatus = 'Entregue';
    } else if (
      info.status.includes('Devolução') || 
      info.status.includes('Endereço inválido') || 
      info.status.includes('Objeto em retorno')
    ) {
      novoStatus = 'Retornos';
    }

    if (novoStatus !== solicitacao.status) {
      const statusAnterior = solicitacao.status;
      solicitacao.status = novoStatus;
      solicitacao.ultima_atualizacao_rastreio = new Date();
      await solicitacao.save();

      await Historico.create({
        descricao: `Status atualizado via API Correios: ${info.status} (de ${statusAnterior} para ${novoStatus})`,
        tipo: 'rastreio',
        solicitacao_id: solicitacao.id
      });

      // Se houver histórico detalhado, podemos salvar como comentários/histórico do card
      for (const evento of info.historico) {
          // Poderíamos verificar se o evento já existe para não duplicar
          // Mas para manter simples, registramos apenas a mudança de status principal
      }
    }
  }
}

module.exports = new RastreioService();
