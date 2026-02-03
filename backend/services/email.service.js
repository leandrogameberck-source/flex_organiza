const nodemailer = require('nodemailer');
const Imap = require('node-imap');
const { simpleParser } = require('mailparser');
const mailConfig = require('../config/mail');
const { Solicitacao, Anexo, Historico } = require('../models');
const path = require('path');
const fs = require('fs');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport(mailConfig.smtp);
  }

  async sendTrackingEmail(solicitacao) {
    const mailOptions = {
      from: mailConfig.from,
      to: solicitacao.cliente_email,
      subject: `Envio realizado – código de rastreio ${solicitacao.codigo_rastreio}`,
      html: `
        <h1>Olá, ${solicitacao.cliente_nome}!</h1>
        <p>Sua solicitação (Remessa: ${solicitacao.numero_remessa}) foi enviada.</p>
        <p><strong>Código de Rastreio:</strong> ${solicitacao.codigo_rastreio}</p>
        <p>Você pode acompanhar o status pelo link oficial dos Correios:</p>
        <p><a href="https://rastreamento.correios.com.br/app/index.php?codigo=${solicitacao.codigo_rastreio}">Rastrear nos Correios</a></p>
        <p>Dúvidas? Fale conosco pelo WhatsApp:</p>
        <p><a href="https://wa.me/${mailConfig.whatsapp}">Chamar no WhatsApp</a></p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      await Historico.create({
        descricao: `E-mail de rastreio enviado para ${solicitacao.cliente_email}`,
        tipo: 'sistema',
        solicitacao_id: solicitacao.id
      });
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
    }
  }

  async listenEmails() {
    const imap = new Imap(mailConfig.imap);

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) throw err;
        
        imap.on('mail', (numNewMsgs) => {
          this.processNewEmails(imap);
        });
        
        // Processa e-mails já existentes (não lidos) ao iniciar
        this.processNewEmails(imap);
      });
    });

    imap.once('error', (err) => {
      console.error('Erro IMAP:', err);
    });

    imap.connect();
  }

  processNewEmails(imap) {
    imap.search(['UNSEEN'], (err, results) => {
      if (err || !results.length) return;

      const f = imap.fetch(results, { bodies: '', markSeen: true });
      f.on('message', (msg, seqno) => {
        msg.on('body', (stream, info) => {
          simpleParser(stream, async (err, parsed) => {
            if (err) return;
            await this.createSolicitacaoFromEmail(parsed);
          });
        });
      });
    });
  }

  async createSolicitacaoFromEmail(parsed) {
    const body = parsed.text || '';
    const data = this.parseEmailBody(body);
    
    try {
      const solicitacao = await Solicitacao.create({
        numero_remessa: data.numero_remessa,
        cliente_nome: data.cliente,
        cliente_cnpj: data.cnpj,
        cliente_email: data.email_cliente,
        endereco: data.endereco,
        observacao: data.observacao,
        placa: data.placa,
        assunto_email: parsed.subject,
        corpo_email: body,
        status: 'Recebido'
      });

      await Historico.create({
        descricao: 'Solicitação criada automaticamente via e-mail',
        tipo: 'sistema',
        solicitacao_id: solicitacao.id
      });

      // Salvar anexos
      if (parsed.attachments && parsed.attachments.length > 0) {
        for (const attachment of parsed.attachments) {
          const fileName = `${Date.now()}-${attachment.filename}`;
          const filePath = path.join(__dirname, '..', 'uploads', 'anexos', fileName);
          fs.writeFileSync(filePath, attachment.content);

          await Anexo.create({
            nome_original: attachment.filename,
            nome_sistema: fileName,
            caminho: `/uploads/anexos/${fileName}`,
            tipo: 'anexo',
            solicitacao_id: solicitacao.id
          });
        }
      }
    } catch (error) {
      console.error('Erro ao criar solicitação via e-mail:', error);
    }
  }

  parseEmailBody(body) {
    const data = {
      numero_remessa: '',
      cliente: '',
      cnpj: '',
      email_cliente: '',
      endereco: '',
      observacao: '',
      placa: ''
    };

    const lines = body.split('\n');
    lines.forEach(line => {
      if (line.includes('Nº REMESSA:')) data.numero_remessa = line.split(':')[1].trim();
      if (line.includes('CLIENTE:')) data.cliente = line.split(':')[1].trim();
      if (line.includes('CNPJ:')) data.cnpj = line.split(':')[1].trim();
      if (line.includes('E-MAIL DO CLIENTE:')) data.email_cliente = line.split(':')[1].trim();
      if (line.includes('ENDEREÇO:')) data.endereco = line.split(':')[1].trim();
      if (line.includes('OBSERVAÇÃO:')) data.observacao = line.split(':')[1].trim();
      if (line.includes('PLACA:')) data.placa = line.split(':')[1].trim();
    });

    return data;
  }
}

module.exports = new EmailService();
