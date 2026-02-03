const axios = require('axios');
const fs = require('fs');
const path = require('path');

class CorreiosService {
  constructor() {
    // URL de Homologação conforme Manual 2025
    this.baseUrl = 'https://apphomologacao.correios.com.br/logisticaReversaWS/logisticaReversaService/logisticaReversaWS?wsdl';
    
    // Credenciais Oficiais de Homologação (Manual Jan/2025)
    this.usuario = process.env.CORREIOS_USUARIO || 'empresacws';
    this.senha = process.env.CORREIOS_SENHA || '123456';
    this.codAdministrativo = process.env.CORREIOS_COD_ADMINISTRATIVO || '17000190';
    this.contrato = process.env.CORREIOS_CONTRATO || '9992157880';
    this.cartaoPostagem = process.env.CORREIOS_CARTAO_POSTAGEM || '0011111111';
    this.servicoCodigo = process.env.CORREIOS_SERVICO_CODIGO || '04170'; // SEDEX
  }

  isConfigured() {
    return !!(this.usuario && this.senha && this.contrato);
  }

  async criarPrePostagem(solicitacao) {
    // Método renomeado internamente para manter compatibilidade com o Controller
    return this.solicitarPostagemReversa(solicitacao);
  }

  async solicitarPostagemReversa(solicitacao) {
    const xml = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://cliente.bean.master.sigep.bsbios.com.br/">
         <soapenv:Header/>
         <soapenv:Body>
            <ser:solicitarPostagemReversa>
               <codAdministrativo>${this.codAdministrativo}</codAdministrativo>
               <codigo_servico>${this.servicoCodigo}</codigo_servico>
               <cartao>${this.cartaoPostagem}</cartao>
               <destinatario>
                  <nome>Kanban Flex Envios</nome>
                  <logradouro>Endereço da Empresa</logradouro>
                  <numero>123</numero>
                  <cidade>São Paulo</cidade>
                  <uf>SP</uf>
                  <cep>01001000</cep>
                  <email>empresa@email.com</email>
               </destinatario>
               <coletas_solicitadas>
                  <tipo>A</tipo>
                  <id_cliente>${solicitacao.id}</id_cliente>
                  <valor_declarado>0.00</valor_declarado>
                  <obj_col>
                     <item>01</item>
                     <desc>Objeto de retorno</desc>
                  </obj_col>
               </coletas_solicitadas>
               <remetente>
                  <nome>${solicitacao.cliente_nome}</nome>
                  <logradouro>${solicitacao.endereco}</logradouro>
                  <numero>S/N</numero>
                  <cidade>Cidade</cidade>
                  <uf>UF</uf>
                  <cep>${solicitacao.endereco.match(/\d{5}-?\d{3}/)?.[0] || ""}</cep>
                  <email>${solicitacao.cliente_email}</email>
               </remetente>
            </ser:solicitarPostagemReversa>
         </soapenv:Body>
      </soapenv:Envelope>
    `;

    try {
      const response = await axios.post(this.baseUrl, xml, {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': '',
          'Authorization': 'Basic ' + Buffer.from(`${this.usuario}:${this.senha}`).toString('base64')
        }
      });

      const eTicketMatch = response.data.match(/<numero_pedido>(.*?)<\/numero_pedido>/);
      const eTicket = eTicketMatch ? eTicketMatch[1] : null;

      if (!eTicket) {
        throw new Error('Não foi possível obter o e-ticket da resposta dos Correios');
      }

      return {
        codigo_rastreio: eTicket,
        id_postagem: eTicket
      };
    } catch (error) {
      console.error('Erro na solicitação SOAP Correios:', error.response?.data || error.message);
      throw new Error('Falha na comunicação com o Web Service de Logística Reversa');
    }
  }

  async consultarRastreio(codigo) {
    // Mock para manter o fluxo funcional, em produção usaria acompanharPedido do SOAP
    return {
      status: 'Solicitação de Logística Reversa Recebida',
      historico: [{ data: new Date(), local: 'Sistema', descricao: 'E-Ticket Gerado' }]
    };
  }

  async gerarEtiqueta(idPostagem) {
    const fileName = `e-ticket-${idPostagem}.txt`;
    const filePath = path.join(__dirname, '..', 'uploads', 'etiquetas', fileName);
    fs.writeFileSync(filePath, `CÓDIGO DE AUTORIZAÇÃO DE POSTAGEM (E-TICKET): ${idPostagem}\nEste código deve ser apresentado em uma agência dos Correios.`);

    return {
      nome_original: `E-Ticket ${idPostagem}`,
      nome_sistema: fileName,
      caminho: `/uploads/etiquetas/${fileName}`
    };
  }
}

module.exports = new CorreiosService();
