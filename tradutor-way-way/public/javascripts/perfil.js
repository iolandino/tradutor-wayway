// Mostrar/ocultar formulários
function editarPerfil() {
  document.getElementById('dados-perfil').hidden = true;
  document.getElementById('form-perfil').hidden = false;
}

function cancelarEdicao() {
  document.getElementById('form-perfil').hidden = true;
  document.getElementById('dados-perfil').hidden = false;
}

function configurarConta() {
  document.getElementById('dados-perfil').hidden = true;
  document.getElementById('configurar-conta').hidden = false;
}

function fecharConfiguracoes() {
  document.getElementById('configurar-conta').hidden = true;
  document.getElementById('dados-perfil').hidden = false;
}

function alterarSenha() {
  document.getElementById('configurar-conta').hidden = true;
  document.getElementById('form-senha').hidden = false;
}

function cancelarSenha() {
  document.getElementById('form-senha').hidden = true;
  document.getElementById('configurar-conta').hidden = false;
  document.getElementById('senhaAtual').value = "";
  document.getElementById('novaSenha').value = "";
  document.getElementById('confirmarNovaSenha').value = "";
}

document.getElementById('formEditarPerfil').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('editarNome').value.trim();
  const email = document.getElementById('editarEmail').value.trim();
  const modoConta = document.getElementById("modoConta").value;

  try {
    const resposta = await fetch('/perfil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, modoConta})
    });

    const dados = await resposta.json();
    alert(dados.mensagem);
    if (dados.sucesso) {
      location.reload(); // recarrega a página após salvar
    }
  } catch (erro) {
    console.error('Erro ao editar perfil:', erro);
    alert('Erro ao atualizar o perfil');
  }
});

document.getElementById('formEditarSenha').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const senha = document.getElementById('senhaAtual').value.trim();
  const novaSenha = document.getElementById('novaSenha').value.trim();
  const confirmarNovaSenha = document.getElementById("confirmarNovaSenha").value.trim();
  
  if (!senha || !novaSenha || !confirmarNovaSenha) {
    alert("Preencha todos os campos.");
    return;
  }

  if (novaSenha.length < 8) {
    alert("A nova senha deve ter no mínimo 8 caracteres.");
    return;
  }

  if (novaSenha !== confirmarNovaSenha) {
    alert("A nova senha e a confirmação não coincidem.");
    return;
  }
  
  try {
    const res = await fetch("/perfil/alterar-senha", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha, novaSenha })
    });

    const data = await res.json();
    alert(data.mensagem);
    
    if (data.sucesso) {
      // limpa o formulário e oculta
      document.getElementById('formEditarSenha').reset();
      document.getElementById('form-senha').hidden = true;
      document.getElementById('configurar-conta').hidden = false;
    }

  } catch (err) {
    console.error("Erro ao alterar senha:", err);
    alert("Erro ao alterar a senha");
  }
});

async function solicitarTradutor() {
  if (!confirm("Tem certeza que deseja solicitar para se tornar um Tradutor?")) return;

  try {
    const resposta = await fetch("/perfil/solicitar-tradutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const dados = await resposta.json();

    alert(dados.mensagem);

    if (dados.sucesso) location.reload();
  } catch (erro) {
    console.error("Erro ao solicitar tradutor:", erro);
    alert("Erro ao enviar solicitação.");
  }
}

async function excluirConta() {
  const confirmacao = confirm("Tem certeza que deseja excluir sua conta? Essa ação é irreversível!");

  if (!confirmacao) return;

  try {
    const resposta = await fetch("/perfil/excluir-conta", {
      method: "DELETE",
    });

    const dados = await resposta.json();

    alert(dados.mensagem);

    if (dados.sucesso) {
      window.location.href = "/login"; // Redireciona para a página inicial ou login
    }
  } catch (erro) {
    console.error("Erro ao excluir conta:", erro);
    alert("Erro ao tentar excluir sua conta.");
  }
}

async function desvincularTradutor() {
  const confirmar = confirm("Tem certeza que deseja deixar de ser Tradutor?");
  if (!confirmar) return;

  try {
    const resposta = await fetch("/perfil/remover-tradutor", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });

    const dados = await resposta.json();

    alert(dados.mensagem);

    if (dados.sucesso) {
      window.location.reload();
    }
  } catch (erro) {
    console.error("Erro ao desvincular tradutor:", erro);
    alert("Erro ao tentar atualizar tipo de conta.");
  }
}

function mostrarFormDesvincularAdmin() {
  document.getElementById("desvincular-adm").hidden = false;
  document.getElementById('configurar-conta').hidden = true;
}

function cancelarDesvinculoAdm() {
  document.getElementById("desvincular-adm").hidden = true;
  document.getElementById('configurar-conta').hidden = false;
  document.getElementById('justificativaDesvinculo').value.trim() = '';
}

document.getElementById("formDesvinculoAdm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const justificativa = document.getElementById("justificativaDesvinculo").value.trim();
  if (justificativa.length < 10) {
    alert("A justificativa deve conter no mínimo 10 caracteres.");
    return;
  }

  try {
    const res = await fetch("/admin/solicitar-desvinculo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ justificativa })
    });

    const data = await res.json();
    alert(data.mensagem);

    if (data.sucesso) {
      location.reload();
    }
  } catch (err) {
    console.error("Erro ao solicitar desligamento:", err);
    alert("Erro ao enviar solicitação.");
  }
});