const mongoose = require('mongoose');

const DesvincularAdmSchema = new mongoose.Schema({
  solicitante: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  justificativa: { type: String, required: true },
  aprovadores: [{
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    aprovou: { type: Boolean, default: false }
  }],
  status: { type: String, enum: ['pendente', 'aprovada', 'rejeitada'], default: 'pendente' },
  dataSolicitacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DesvincularAdm', DesvincularAdmSchema);
