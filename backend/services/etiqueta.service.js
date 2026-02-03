const fs = require('fs');
const path = require('path');
const { Anexo } = require('../models');

class EtiquetaService {
  async salvarEtiquetaManual(solicitacaoId, file) {
    const fileName = `${Date.now()}-etiqueta-${file.originalname}`;
    const filePath = path.join(__dirname, '..', 'uploads', 'etiquetas', fileName);
    
    fs.renameSync(file.path, filePath);

    return await Anexo.create({
      nome_original: file.originalname,
      nome_sistema: fileName,
      caminho: `/uploads/etiquetas/${fileName}`,
      tipo: 'etiqueta',
      solicitacao_id: solicitacaoId
    });
  }
}

module.exports = new EtiquetaService();
