const axios = require('axios');
const fs = require('fs');
const path = require('path');

class CorreiosService {
  constructor() {
    this.baseUrl = 'https://api.correios.com.br';
    this.usuario = process.env.CORREIOS_USUARIO;
    this.senha = process.env.CORREIOS_SENHA;
    this.contrato = process.env.CORREIOS_CONTRATO;
    this.cartaoPostagem = process.env.CORREIOS_CARTAO_POSTAGEM;
    this.cepOrigem = process.env.CORREIOS_CEP_ORIGEM;
    this.token = null;
    this.tokenExpires = null;
  }

  isConfigured() {
    return !!(this.usuario && this.senha && this.contrato && this.cartaoPostagem);
  }

  async authenticate() {
    if (this.token && this.tokenExpires > new Date()) return this.token;

    try {
      const auth = Buffer.from(`${this.usuario}:${this.senha}`).toString('base64');
      const response = await axios.post(`${this.baseUrl}/token/v1/autentica/cartaopostagem`, {
        numero: this.cartaoPostagem
      }, {
        headers: { 'Authorization': `Basic ${auth}` }
      });

      this.token = response.data.token;
      this.tokenExpires = new Date(response.data.expiraEm);
      return this.token;
    } catch (error) {
      console.error('Erro na autenticação Correios:', error.response?.data || error.message);
      throw new Error('Falha na autenticação com a API dos Correios');
    }
  }

  async criarPrePostagem(solicitacao) {
    if (!this.isConfigured()) throw new Error('API Correios não configurada');

    const token = await this.authenticate();
    try {
      // Exemplo de payload simplificado para a API de pré-postagem
      const payload = {
        contrato: this.contrato,
        cartaoPostagem: this.cartaoPostagem,
        remetente: {
          nome: "Kanban Flex Envios",
          cep: this.cepOrigem
          // Outros dados viriam de config ou env
        },
        destinatario: {
          nome: solicitacao.cliente_nome,
          cep: solicitacao.endereco.match(/\d{5}-?\d{3}/)?.[0] || "",
          logradouro: solicitacao.endereco
        },
        servico: "03220", // Exemplo: SEDEX
        objeto: {
          peso: 1000, // 1kg padrão
          comprimento: 20,
          largura: 15,
          altura: 10
        }
      };

      const response = await axios.post(`${this.baseUrl}/prepostagem/v1/prepostagens`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      return {
        codigo_rastreio: response.data.numeroEtiqueta,
        id_postagem: response.data.id
      };
    } catch (error) {
      console.error('Erro na pré-postagem Correios:', error.response?.data || error.message);
      throw error;
    }
  }

  async gerarEtiqueta(idPostagem) {
    const token = await this.authenticate();
    try {
      const response = await axios.get(`${this.baseUrl}/prepostagem/v1/prepostagens/${idPostagem}/etiqueta`, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'arraybuffer'
      });

      const fileName = `etiqueta-${idPostagem}-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '..', 'uploads', 'etiquetas', fileName);
      fs.writeFileSync(filePath, response.data);

      return {
        nome_original: fileName,
        nome_sistema: fileName,
        caminho: `/uploads/etiquetas/${fileName}`
      };
    } catch (error) {
      console.error('Erro ao gerar etiqueta Correios:', error.response?.data || error.message);
      throw error;
    }
  }

  async consultarRastreio(codigo) {
    if (!this.isConfigured()) return null;

    const token = await this.authenticate();
    try {
      const response = await axios.get(`${this.baseUrl}/rastreamento/v1/objetos/${codigo}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const objeto = response.data.objetos[0];
      const eventos = objeto.eventos || [];
      const ultimoEvento = eventos[0] || {};

      return {
        status: ultimoEvento.descricao,
        historico: eventos.map(e => ({
          data: e.dtHrCriado,
          local: `${e.unidade.nome} - ${e.unidade.endereco.cidade}/${e.unidade.endereco.uf}`,
          descricao: e.descricao
        }))
      };
    } catch (error) {
      console.error('Erro ao consultar rastreio Correios:', error.response?.data || error.message);
      return null;
    }
  }
}

module.exports = new CorreiosService();
