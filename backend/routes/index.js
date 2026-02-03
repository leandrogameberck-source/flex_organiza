const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const SolicitacaoController = require('../controllers/SolicitacaoController');

const upload = multer({ dest: 'uploads/temp/' });

router.get('/solicitacoes', SolicitacaoController.index);
router.get('/solicitacoes/:id', SolicitacaoController.show);
router.patch('/solicitacoes/:id/status', SolicitacaoController.updateStatus);
router.post('/solicitacoes/:id/pre-postagem', SolicitacaoController.gerarPrePostagem);
router.post('/solicitacoes/:id/etiqueta', upload.single('etiqueta'), SolicitacaoController.uploadEtiqueta);
router.post('/solicitacoes/:id/comentarios', SolicitacaoController.addComentario);

module.exports = router;
