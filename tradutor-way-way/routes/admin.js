const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const Palavra = require('../models/Palavra');
const Sugestao = require('../models/Sugestao');
const Solicitacao = require('../models/Solicitacao');
const DesvincularAdm = require('../models/DesvincularAdm');
const VerificarAutenticacao = require('../middlewares/auth');

// Middleware extra: só para admin
function verificarAdmin(req, res, next) {
  if (req.session.usuario && req.session.usuario.tipos.includes('admin')) {
    return next();
  }
  return res.status(403).send('Acesso restrito. Somente administradores.');
}

// Rota protegida GET /admin/gerenciar
router.get('/gerenciar/', VerificarAutenticacao, verificarAdmin, async (req, res) => {
  try {
    const usuarios = await Usuario.find().sort({ nome: 1 });
    const palavras = await Palavra.find().populate('criadoPor', 'nome');
    const sugestoesPendentes = await Sugestao.find({ status: 'pendente' }).populate('sugeridoPor', 'nome').sort({ dataSugestao: -1 });
    const sugestoes = await Sugestao.find().populate('sugeridoPor', 'nome').sort({ dataSugestao: -1 });
    const solicitacoesPendentes = await Solicitacao.find({ status: 'pendente' })
    .populate('solicitadoPor', 'nome')
    .sort({ dataSolicitacao: -1 });
    const solicitacoes = await Solicitacao.find()
    .populate('solicitadoPor', 'nome')
    .populate('avaliadoPor', 'nome')
    .sort({ dataSolicitacao: -1 });
    const desvinculosAdminPendentes = await DesvincularAdm.find({ status: 'pendente' })
    .populate('solicitante')
    .populate('aprovadores.admin', 'nome _id')
    .sort({ dataSolicitacao: -1 });
    const desvinculosAdmin = await DesvincularAdm.find()
    .populate('solicitante')
    .populate('aprovadores.admin', 'nome _id')
    .sort({ dataSolicitacao: -1 });
    const adminLogado = await Usuario.findById(req.session.usuario.id);

    res.render('painelAdmin', {
      title: 'Painel do Administrador',
      usuarios,
      palavras,
      sugestoesPendentes,
      sugestoes,
      solicitacoesPendentes,
      solicitacoes,
      desvinculosAdminPendentes,
      desvinculosAdmin,
      admin: adminLogado
    });
  } catch (err) {
    console.error('Erro ao carregar termos:', err);
    res.status(500).send('Erro ao carregar termos');
  }
});

router.post('/promover/:id', verificarAdmin, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).send('Usuário não encontrado');

    if (!usuario.tipos.includes('admin')) {
      usuario.tipos.push('admin');
      await usuario.save();
    }

    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao promover usuário');
  }
});

// POST /admin/solicitar-desvinculo
router.post('/solicitar-desvinculo', VerificarAutenticacao, verificarAdmin, async (req, res) => {
  const { justificativa } = req.body;

  try {
    const solicitante = await Usuario.findById(req.session.usuario.id);
    if (!solicitante || !solicitante.tipos.includes("admin")) {
      return res.status(403).json({ sucesso: false, mensagem: "Apenas administradores podem solicitar desligamento." });
    }

    const admins = await Usuario.find({ tipos: "admin", _id: { $ne: solicitante._id } });

    if (admins.length === 0) {
      return res.status(400).json({ sucesso: false, mensagem: "Você é o único administrador e não pode se desligar sem transferir os poderes." });
    }

    const novaSolicitacao = new DesvincularAdm({
      solicitante: solicitante._id,
      justificativa,
      aprovadores: admins.map(admin => ({ admin: admin._id }))
    });

    await novaSolicitacao.save();

    res.json({ sucesso: true, mensagem: "Solicitação registrada. Aguarde aprovação dos demais administradores." });
  } catch (err) {
    console.error("Erro ao registrar solicitação:", err);
    res.status(500).json({ sucesso: false, mensagem: "Erro ao registrar solicitação." });
  }
});

// POST /admin/desvinculo-aprovar/:id
router.post('/desvinculo-aprovar/:id', VerificarAutenticacao, verificarAdmin, async (req, res) => {
  const id = req.params.id;
  const userId = req.session.usuario.id;

  try {
    const desvinculo = await DesvincularAdm.findById(id);
    if (!desvinculo || desvinculo.status !== 'pendente') {
      return res.status(404).json({ sucesso: false, mensagem: 'Solicitação não encontrada ou já finalizada.' });
    }

    const aprovador = desvinculo.aprovadores.find(ap => ap.admin.toString() === userId);
    if (!aprovador) {
      return res.status(403).json({ sucesso: false, mensagem: 'Você não está autorizado a avaliar esta solicitação.' });
    }

    if (aprovador.aprovou) {
      return res.status(400).json({ sucesso: false, mensagem: 'Você já aprovou esta solicitação.' });
    }

    aprovador.aprovou = true;

    // Verificar se todos os admins já aprovaram
    const todosAprovaram = desvinculo.aprovadores.every(ap => ap.aprovou);
    if (todosAprovaram) {
      desvinculo.status = 'aprovada';

      // Remover o tipo "admin" do solicitante
      const usuario = await Usuario.findById(desvinculo.solicitante);
      if (usuario) {
        usuario.tipos = usuario.tipos.filter(t => t !== 'admin');
        await usuario.save();
      }
    }

    await desvinculo.save();
    res.json({ sucesso: true, mensagem: 'Aprovação registrada com sucesso.' });

  } catch (err) {
    console.error('Erro ao aprovar desvinculação:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao aprovar.' });
  }
});

// POST /admin/:id/aprovar
router.post('/:id/aprovar', VerificarAutenticacao, verificarAdmin, async (req, res) => {
  try {
    const solicitacao = await Solicitacao.findById(req.params.id).populate('solicitadoPor');

    if (!solicitacao) {
      return res.status(404).json({ sucesso: false, mensagem: 'Solicitação não encontrada' });
    }
    
    if (!solicitacao.solicitadoPor) {
      return res.status(400).json({ sucesso: false, mensagem: 'Usuário solicitante não encontrado' });
    }

    if (solicitacao.status !== 'pendente') {
      return res.status(400).json({ sucesso: false, mensagem: 'Solicitação já foi avaliada' });
    }

    solicitacao.status = 'aprovada';
    solicitacao.mensagemAdmin = req.body.mensagem || '';
    solicitacao.avaliadoPor = req.session.usuario.id;
    solicitacao.dataAvaliacao = new Date();

    await solicitacao.save();

    // Torna o usuário um tradutor
    const usuario = await Usuario.findById(solicitacao.solicitadoPor._id);
    if (!usuario.tipos.includes('tradutor')) {
      usuario.tipos.push('tradutor');
      await usuario.save();
    }

    res.json({ sucesso: true, mensagem: 'Solicitação aprovada com sucesso' });
  } catch (err) {
    console.error('Erro ao aprovar solicitação:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao aprovar solicitação' });
  }
});

// POST /admin/:id/rejeitar
router.post('/:id/rejeitar', VerificarAutenticacao, verificarAdmin, async (req, res) => {
  try {
    const solicitacao = await Solicitacao.findById(req.params.id).populate('solicitadoPor');

    if (!solicitacao) {
      return res.status(404).json({ sucesso: false, mensagem: 'Solicitação não encontrada' });
    }

    if (solicitacao.status !== 'pendente') {
      return res.status(400).json({ sucesso: false, mensagem: 'Solicitação já foi avaliada' });
    }

    solicitacao.status = 'rejeitada';
    solicitacao.mensagemAdmin = req.body.mensagem || '';
    solicitacao.avaliadoPor = req.session.usuario.id;
    solicitacao.dataAvaliacao = new Date();

    await solicitacao.save();

    res.json({ sucesso: true, mensagem: 'Solicitação rejeitada com sucesso' });
  } catch (err) {
    console.error('Erro ao rejeitar solicitação:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao rejeitar solicitação' });
  }
});

router.post('/promover-tradutor/:id', VerificarAutenticacao, verificarAdmin, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).send('Usuário não encontrado');

    if (!usuario.tipos.includes('tradutor')) {
      usuario.tipos.push('tradutor');
      await usuario.save();
    }

    res.redirect('/admin/gerenciar');
  } catch (err) {
    console.error('Erro ao promover tradutor:', err);
    res.status(500).send('Erro interno');
  }
});

router.post('/rebaixar-tradutor/:id', VerificarAutenticacao, verificarAdmin, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).send('Usuário não encontrado');

    usuario.tipos = usuario.tipos.filter(tipo => tipo !== 'tradutor');
    await usuario.save();

    res.redirect('/admin/gerenciar');
  } catch (err) {
    console.error('Erro ao rebaixar tradutor:', err);
    res.status(500).send('Erro interno');
  }
});

router.post('/promover-admin/:id', VerificarAutenticacao, verificarAdmin, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).send('Usuário não encontrado');

    if (!usuario.tipos.includes('admin')) {
      usuario.tipos.push('admin');
      await usuario.save();
    }

    res.redirect('/admin/gerenciar');
  } catch (err) {
    console.error('Erro ao promover para admin:', err);
    res.status(500).send('Erro interno ao promover usuário');
  }
});


router.post('/rebaixar-admin/:id', VerificarAutenticacao, verificarAdmin, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).send('Usuário não encontrado');

    // Remover tipo 'admin'
    usuario.tipos = usuario.tipos.filter(tipo => tipo !== 'admin');
    await usuario.save();

    res.redirect('/admin/gerenciar');
  } catch (err) {
    console.error('Erro ao rebaixar admin:', err);
    res.status(500).send('Erro interno ao rebaixar usuário');
  }
});


module.exports = router;