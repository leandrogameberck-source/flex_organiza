const { Solicitacao, Anexo, Historico } = require('../models');
const emailService = require('../services/email.service');
const etiquetaService = require('../services/etiqueta.service');
const correiosService = require('../services/correios.service');

class SolicitacaoController {
  async index(req, res) {
    try {
      const solicitacoes = await Solicitacao.findAll({
        include: [
          { model: Anexo, as: 'anexos' },
          { model: Historico, as: 'historicos' }
        ],
        order: [['createdAt', 'DESC']]
      });
      return res.json({
        solicitacoes,
        correios_configurado: correiosService.isConfigured()
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const solicitacao = await Solicitacao.findByPk(req.params.id, {
        include: [
          { model: Anexo, as: 'anexos' },
          { model: Historico, as: 'historicos' }
        ]
      });
      if (!solicitacao) return res.status(404).json({ error: 'Solicitação não encontrada' });
      return res.json(solicitacao);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, codigo_rastreio } = req.body;
      
      const solicitacao = await Solicitacao.findByPk(id);
      if (!solicitacao) return res.status(404).json({ error: 'Solicitação não encontrada' });

      if (status === 'Enviado' && !codigo_rastreio && !solicitacao.codigo_rastreio) {
        return res.status(400).json({ error: 'Código de rastreio é obrigatório para o status Enviado' });
      }

      const statusAnterior = solicitacao.status;
      solicitacao.status = status;
      
      if (codigo_rastreio) {
        solicitacao.codigo_rastreio = codigo_rastreio;
        solicitacao.data_envio = new Date();
      }

      await solicitacao.save();

      await Historico.create({
        descricao: `Status alterado de ${statusAnterior} para ${status}`,
        tipo: 'status',
        solicitacao_id: id
      });

      if (status === 'Enviado') {
        await emailService.sendTrackingEmail(solicitacao);
      }

      return res.json(solicitacao);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async gerarPrePostagem(req, res) {
    try {
      const { id } = req.params;
      const solicitacao = await Solicitacao.findByPk(id);
      
      if (!correiosService.isConfigured()) {
        return res.status(400).json({ error: 'Integração Correios não configurada' });
      }

      const result = await correiosService.criarPrePostagem(solicitacao);
      
      solicitacao.codigo_rastreio = result.codigo_rastreio;
      await solicitacao.save();

      const etiqueta = await correiosService.gerarEtiqueta(result.id_postagem);
      
      await Anexo.create({
        ...etiqueta,
        tipo: 'etiqueta',
        solicitacao_id: id
      });

      await Historico.create({
        descricao: `Pré-postagem criada via API. Código: ${result.codigo_rastreio}`,
        tipo: 'sistema',
        solicitacao_id: id
      });

      return res.json({ success: true, codigo_rastreio: result.codigo_rastreio });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async uploadEtiqueta(req, res) {
    try {
      const { id } = req.params;
      if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

      const anexo = await etiquetaService.salvarEtiquetaManual(id, req.file);
      
      await Historico.create({
        descricao: `Etiqueta enviada manualmente: ${anexo.nome_original}`,
        tipo: 'sistema',
        solicitacao_id: id
      });

      return res.json(anexo);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async addComentario(req, res) {
    try {
      const { id } = req.params;
      const { comentario } = req.body;

      const historico = await Historico.create({
        descricao: comentario,
        tipo: 'comentario',
        solicitacao_id: id
      });

      return res.json(historico);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SolicitacaoController();
