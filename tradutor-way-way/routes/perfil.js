const express = require('express');
var router = express.Router();
const Usuario = require('../models/Usuario');
const Sugestao = require('../models/Sugestao');
const Solicitacao = require('../models/Solicitacao');
const VerificarAutenticacao = require('../middlewares/auth');

// GET /perfil
router.get('/', VerificarAutenticacao, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.session.usuario.id);
    if (!usuario) {
      return res.status(404).send('Usuário não encontrado');
    }

    const sugestoes = await Sugestao.find({ sugeridoPor: usuario._id })
      .sort({ dataSugestao: -1 }); // ordena da mais recente para a mais antiga

    const solicitacoes = await Solicitacao.find({ solicitadoPor: usuario._id })
      .sort({ dataSugestao: -1 }); // ordena da mais recente para a mais antiga

    res.render('perfil', {
      title: 'Perfil',
      usuario,
      sugestoes,
      solicitacoes,
      modoAtual: req.session.usuario.modoConta || usuario.tipos[0]
    });
  } catch (err) {
    console.error('Erro ao carregar perfil:', err);
    res.status(500).send('Erro ao carregar perfil');
  }
});

// Editar Perfil
router.put('/', VerificarAutenticacao, async (req, res) => {
  const { nome, email, modoConta } = req.body;

  try {
    const usuario = await Usuario.findById(req.session.usuario.id);
    if (!usuario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    }

    usuario.nome = nome;
    usuario.email = email;

    await usuario.save();

    // Atualiza a sessão
    req.session.usuario.nome = usuario.nome;
    req.session.usuario.tipos = usuario.tipos;
    // Atualiza o modo de conta apenas se for um dos tipos reais do usuário
    if (modoConta && usuario.tipos.includes(modoConta)) {
      req.session.usuario.modoConta = modoConta;
    }

    res.json({ sucesso: true, mensagem: 'Perfil atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao atualizar o perfil' });
  }
});

router.put('/alterar-senha', VerificarAutenticacao, async (req, res) => {
  const { senha, novaSenha } = req.body;

  try {
    const usuario = await Usuario.findById(req.session.usuario.id);
    if (!usuario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    }

    const senhaCorreta = await usuario.compararSenha(senha);
    if (!senhaCorreta) {
      return res.status(401).json({ sucesso: false, mensagem: 'Senha atual incorreta' });
    }

    usuario.senha = novaSenha;
    await usuario.save();

    res.json({ sucesso: true, mensagem: 'Senha alterada com sucesso' });
  } catch (err) {
    console.error('Erro ao alterar senha:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao alterar a senha' });
  }
});

router.post('/solicitar-tradutor', VerificarAutenticacao, async (req, res) => {
  try {
    const jaSolicitou = await Solicitacao.findOne({
      solicitadoPor: req.session.usuario.id,
      status: 'pendente'
    });

    if (jaSolicitou) {
      return res.status(400).json({ sucesso: false, mensagem: 'Você já possui uma solicitação pendente.' });
    }

    const novaSolicitacao = new Solicitacao({
      solicitadoPor: req.session.usuario.id
    });

    await novaSolicitacao.save();

    res.json({ sucesso: true, mensagem: 'Solicitação enviada com sucesso.' });
  } catch (err) {
    console.error("Erro ao enviar solicitação:", err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao enviar solicitação.' });
  }
});

router.delete('/excluir-conta', VerificarAutenticacao, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.session.usuario.id);

    if (!usuario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }

    // Verifica se o usuário ainda é tradutor ou admin
    if (usuario.tipos.includes('tradutor') || usuario.tipos.includes('admin')) {
      return res.status(403).json({ sucesso: false, mensagem: 'Você deve deixar de ser Tradutor/Admin antes de excluir a conta.' });
    }

    await Usuario.findByIdAndDelete(usuario._id);
    req.session.destroy();

    res.json({ sucesso: true, mensagem: 'Conta excluída com sucesso.' });
  } catch (err) {
    console.error("Erro ao excluir conta:", err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao excluir conta.' });
  }
});

router.put('/remover-tradutor', VerificarAutenticacao, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.session.usuario.id);

    if (!usuario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }

    if (usuario.tipos.includes('admin')) {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Administradores não podem se desvincular como tradutores. Você deve deixar de ser Admin antes de excluir a conta.'
      });
    }

    usuario.tipos = usuario.tipos.filter(t => t !== 'tradutor');
    await usuario.save();

    req.session.usuario.tipos = usuario.tipos;

    res.json({ sucesso: true, mensagem: 'Você não é mais um tradutor.' });
  } catch (err) {
    console.error('Erro ao remover tradutor:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar o perfil.' });
  }
});

module.exports = router;