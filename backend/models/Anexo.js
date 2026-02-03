const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Anexo = sequelize.define('Anexo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome_original: DataTypes.STRING,
  nome_sistema: DataTypes.STRING,
  caminho: DataTypes.STRING,
  tipo: DataTypes.STRING, // 'anexo' ou 'etiqueta'
  solicitacao_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'solicitacaos',
      key: 'id'
    }
  }
});

module.exports = Anexo;
