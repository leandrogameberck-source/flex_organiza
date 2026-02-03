const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Solicitacao = sequelize.define('Solicitacao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_remessa: DataTypes.STRING,
  cliente_nome: DataTypes.STRING,
  cliente_cnpj: DataTypes.STRING,
  cliente_email: DataTypes.STRING,
  endereco: DataTypes.TEXT,
  observacao: DataTypes.TEXT,
  placa: DataTypes.STRING,
  assunto_email: DataTypes.STRING,
  corpo_email: DataTypes.TEXT,
  status: {
    type: DataTypes.ENUM(
      'Recebido', 
      'Em andamento', 
      'Aguardando envio', 
      'Enviado', 
      'Retornos', 
      'Entregue', 
      'Encerrado'
    ),
    defaultValue: 'Recebido'
  },
  responsavel: DataTypes.STRING,
  prazo: DataTypes.DATE,
  codigo_rastreio: DataTypes.STRING,
  data_envio: DataTypes.DATE,
  ultima_atualizacao_rastreio: DataTypes.DATE
});

module.exports = Solicitacao;
