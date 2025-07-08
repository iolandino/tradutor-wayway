async function editarTermo(id) {
  try {
    const res = await fetch(`/palavras/${id}`);
    const termo = await res.json();

    document.getElementById("editarTermoId").value = termo._id;
    document.getElementById("editarTermoPt").value = termo.portugues;
    document.getElementById("editarTermoWai").value = termo.waiwai;
    document.getElementById("editarTermoDescricao").value = termo.descricao || "";

    document.getElementById("editarTermos").hidden = false;
  } catch (err) {
    console.error("Erro ao carregar termo:", err);
    alert("Erro ao carregar termo para edição.");
  }
}

document.getElementById("formEditarTermo").addEventListener("submit", async function (e) {
  e.preventDefault();
  const id = document.getElementById("editarTermoId").value;
  const portugues = document.getElementById("editarTermoPt").value.trim();
  const waiwai = document.getElementById("editarTermoWai").value.trim();
  const descricao = document.getElementById("editarTermoDescricao").value.trim();

  if (!portugues || !waiwai) {
    alert("Os campos Português e Wai Wai são obrigatórios.");
    return;
  }

  const res = await fetch(`/tradutor/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portugues, waiwai, descricao })
  });

  const data = await res.json();
  alert(data.mensagem);
  if (data.sucesso) location.reload();
});

function cancelarEdicaoTermo() {
  document.getElementById("editarTermos").hidden = true;
}

async function removerTermo(id) {
  if (!confirm("Tem certeza que deseja remover este termo?")) return;

  const res = await fetch(`/tradutor/${id}`, {
    method: 'DELETE'
  });

  const data = await res.json();
  alert(data.mensagem);
  if (data.sucesso) location.reload();
}

// Abrir Modal de Aprovação de Solicitacão
function aprovarSolicitacao(id) {
  document.getElementById("solicitacaoIdAprovar").value = id;
  document.getElementById("mensagemAprovarSolicitacao").value = "";
  document.getElementById("aprovar-solicitacao").hidden = false;
}

// Abrir Modal de Rejeição de Solicitacão
function rejeitarSolicitacao(id) {
  document.getElementById("solicitacaoIdRejeitar").value = id;
  document.getElementById("mensagemRejeitarSolicitacao").value = "";
  document.getElementById("rejeitar-solicitacao").hidden = false;
}

// Abrir Modal de Aprovação de Sugestão
function aprovarSugestao(id) {
  document.getElementById("sugestaoIdAprovar").value = id;
  document.getElementById("mensagemAprovar").value = "";
  document.getElementById("aprovar-sugestao").hidden = false;
}

// Abrir Modal de Rejeição de Sugestão
function rejeitarSugestao(id) {
  document.getElementById("sugestaoIdRejeitar").value = id;
  document.getElementById("mensagemRejeitar").value = "";
  document.getElementById("rejeitar-sugestao").hidden = false;
}

// Confirmar Solicitação
async function confirmarSolicitacao() {
  const id = document.getElementById("solicitacaoIdAprovar").value;
  const mensagem = document.getElementById("mensagemAprovarSolicitacao").value;

  try {
    const res = await fetch(`/admin/${id}/aprovar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagem })
    });

    const data = await res.json();
    alert(data.mensagem);
    if (data.sucesso) {
      fecharModal('aprovar-solicitacao');
      location.reload();
    }
  } catch (err) {
    console.error("Erro ao aprovar solicitação:", err);
    alert("Erro ao processar a solicitação. Tente novamente.");
  }
}

// Rejeitar Solicitação
async function recusarSolicitacao() {
  const id = document.getElementById("solicitacaoIdRejeitar").value;
  const mensagem = document.getElementById("mensagemRejeitarSolicitacao").value;
  
  try {
    const res = await fetch(`/admin/${id}/rejeitar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagem })
    });

    const data = await res.json();
    alert(data.mensagem);
    if (data.sucesso) {
      fecharModal('rejeitar-solicitacao');
      location.reload();
    }
  } catch (err) {
    console.error("Erro ao rejeitar solicitação:", err);
    alert("Erro ao rejeitar a solicitação. Tente novamente.");
  }
}

// Confirmar aprovação
async function confirmarAprovacao() {
  const id = document.getElementById("sugestaoIdAprovar").value;
  const mensagem = document.getElementById("mensagemAprovar").value;

  const res = await fetch(`/tradutor/${id}/aprovar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensagem })
  });

  const data = await res.json();
  alert(data.mensagem);
  if (data.sucesso) location.reload();
}

// Confirmar rejeição
async function confirmarRejeicao() {
  const id = document.getElementById("sugestaoIdRejeitar").value;
  const mensagem = document.getElementById("mensagemRejeitar").value;

  const res = await fetch(`/tradutor/${id}/rejeitar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensagem })
  });

  const data = await res.json();
  alert(data.mensagem);
  if (data.sucesso) location.reload();
}

// Fechar modal de aprovação/rejeição de sugestões
function fecharModal(idModal) {
  document.getElementById(idModal).hidden = true;
}

async function aprovarDesvinculoAdmin(id) {
  if (!confirm("Você confirma que deseja aprovar o desligamento deste administrador?")) return;

  try {
    const res = await fetch(`/admin/desvinculo-aprovar/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();
    alert(data.mensagem);

    if (data.sucesso) {
      location.reload();
    }

  } catch (err) {
    console.error("Erro ao aprovar desligamento:", err);
    alert("Erro ao processar a solicitação. Tente novamente.");
  }
}
