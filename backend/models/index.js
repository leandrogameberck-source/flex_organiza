const Solicitacao = require('./Solicitacao');
const Anexo = require('./Anexo');
const Historico = require('./Historico');

// Associações
Solicitacao.hasMany(Anexo, { as: 'anexos', foreignKey: 'solicitacao_id' });
Anexo.belongsTo(Solicitacao, { foreignKey: 'solicitacao_id' });

Solicitacao.hasMany(Historico, { as: 'historicos', foreignKey: 'solicitacao_id' });
Historico.belongsTo(Solicitacao, { foreignKey: 'solicitacao_id' });

module.exports = {
  Solicitacao,
  Anexo,
  Historico
};
