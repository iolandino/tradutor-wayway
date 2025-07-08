const express = require('express');
const router = express.Router();
const Palavra = require('../models/Palavra');
const Sugestao = require('../models/Sugestao');
const VerificarAutenticacao = require('../middlewares/auth');

// POST /palavras - Apenas para tradutores autenticados
router.post('/', VerificarAutenticacao, async (req, res) => {
  const { portugues, waiwai, descricao } = req.body;

  // Verifica se usuário logado é tradutor
  if (!req.session.usuario.tipos.includes('tradutor')) {
    return res.status(403).json({ sucesso: false, mensagem: 'Apenas tradutores podem cadastrar termos.' });
  }

  if (!portugues || !waiwai) {
    return res.status(400).json({ sucesso: false, mensagem: 'Campos obrigatórios não preenchidos.' });
  }

  try {
    const novaPalavra = new Palavra({
      portugues,
      waiwai,
      descricao,
      criadoPor: req.session.usuario.id,
      aprovado: true
    });

    await novaPalavra.save();

    res.json({ sucesso: true, mensagem: 'Termo cadastrado com sucesso.' });
  } catch (err) {
    console.error('Erro ao cadastrar termo:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao cadastrar termo.' });
  }
});

// GET /palavras/dicionario → lista todas as palavras aprovadas
router.get('/dicionario', async (req, res) => {
  try {
    const palavras = await Palavra.find({ aprovado: true }).sort({ portugues: 1 }); // ordena por português

    res.render('dicionario', {
      title: 'Dicionário Wai Wai',
      palavras
    });
  } catch (err) {
    console.error('Erro ao carregar dicionário:', err);
    res.status(500).send('Erro ao carregar dicionário');
  }
});

// GET /palavras/buscar?termo=termo buscado em português
router.get('/buscar', async (req, res) => {
  const termo = req.query.termo?.trim().toLowerCase();

  if (!termo) {
    return res.status(400).json({ sucesso: false, mensagem: 'Termo não informado' });
  }

  try {
    const palavra = await Palavra.findOne({
      portugues: { $regex: `^${termo}$`, $options: 'i' }, // busca exata, case-insensitive
      aprovado: true // só mostra palavras aprovadas
    });

    if (!palavra) {
      return res.status(404).json({ sucesso: false, mensagem: 'Palavra não encontrada' });
    }

    res.json({ sucesso: true, traducao: palavra.waiwai, descricao: palavra.descricao });
  } catch (err) {
    console.error('Erro ao buscar palavra:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar palavra.' });
  }
});

// POST /palavras/sugestoes - Tradutores e usuários logados podem sugerir
router.post('/sugestoes', VerificarAutenticacao, async (req, res) => {
  const { portugues, waiwai, descricao } = req.body;

  if (!portugues || !waiwai) {
    return res.status(400).json({ sucesso: false, mensagem: 'Campos obrigatórios não preenchidos.' });
  }

  try {
    const novaSugestao = new Sugestao({
      portugues,
      waiwai,
      descricao,
      sugeridoPor: req.session.usuario.id
    });

    await novaSugestao.save();

    res.json({ sucesso: true, mensagem: 'Sugestão enviada para avaliação.' });
  } catch (err) {
    console.error('Erro ao salvar sugestão:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar sugestão.' });
  }
});

// GET /palavras/:id → Retorna um termo específico pelo ID
router.get('/:id', async (req, res) => {
  try {
    const termo = await Palavra.findById(req.params.id).populate('criadoPor', 'nome');

    if (!termo) {
      return res.status(404).json({ sucesso: false, mensagem: 'Termo não encontrado' });
    }

    res.json(termo);
  } catch (err) {
    console.error('Erro ao buscar termo por ID:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao buscar o termo.' });
  }
});

module.exports = router;