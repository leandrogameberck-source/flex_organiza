const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Historico = sequelize.define('Historico', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  descricao: DataTypes.TEXT,
  tipo: DataTypes.STRING, // 'status', 'comentario', 'rastreio', 'sistema'
  solicitacao_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'solicitacaos',
      key: 'id'
    }
  }
});

module.exports = Historico;
