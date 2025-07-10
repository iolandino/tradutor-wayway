async function translate() {
  const input = document.getElementById("translateInput").value.trim().toLowerCase();
  const resultDiv = document.getElementById("translationResult");
  const messageDiv = document.getElementById("message");

  resultDiv.textContent = "";
  messageDiv.textContent = "";

  if (input === "") {
    messageDiv.textContent = "Digite uma palavra para traduzir.";
    return;
  }

  try {
    const resposta = await fetch(`/palavras/buscar?termo=${encodeURIComponent(input)}`);
    const dados = await resposta.json();

    if (dados.sucesso) {
      resultDiv.innerHTML = `<strong>Tradução:</strong> ${dados.traducao}`;
      if (dados.descricao) {
        resultDiv.innerHTML += `<br><em>${dados.descricao}</em>`;
      }
    } else {
      resultDiv.textContent = dados.mensagem || "Palavra não encontrada.";
    }
  } catch (erro) {
    console.error('Erro ao buscar tradução:', erro);
    messageDiv.textContent = 'Erro ao buscar tradução.';
  }
}

// Mostrar/ocultar formulários
function mostrarFormularioSugestao() {
  const messageDiv = document.getElementById('messageNaoLogado');
  messageDiv.textContent = ''; // limpa mensagem anterior
  fetch('/verificar-login')
    .then(res => res.json())
    .then(dados => {
      if (dados.logado) {
        document.getElementById("i-traduzir").hidden = true;
        document.getElementById("i-sugerir").hidden = false;
        document.getElementById("translateInput").value = '';
        document.getElementById("translationResult").textContent = '';
        document.getElementById("message").textContent = "";
      } else {
        messageDiv.textContent = 'Você precisa estar logado para sugerir um termo.';
      }
    })
    .catch(err => {
      console.error('Erro ao verificar login:', err);
      alert('Erro ao verificar login. Tente novamente mais tarde.');
    });
}

function voltarParaTradutor() {
  document.getElementById("i-sugerir").hidden = true;
  document.getElementById("i-traduzir").hidden = false;
  document.getElementById('suggestPt').value = "";
  document.getElementById('suggestWai').value = "";
  document.getElementById('suggestDescricao').value = "";
  document.getElementById('messageSuggestion').textContent = "";
}

function mostrarFormularioCadastroTermo() {
  document.getElementById("i-traduzir").hidden = true;
  document.getElementById("i-cadastrar").hidden = false;
  document.getElementById("translateInput").value = '';
  document.getElementById("translationResult").textContent = '';
  document.getElementById("message").textContent = "";
}

function retornarParaTradutor() {
  document.getElementById("i-cadastrar").hidden = true;
  document.getElementById("i-traduzir").hidden = false;
  document.getElementById('cadastrarPt').value = "";
  document.getElementById('cadastrarWai').value = "";
  document.getElementById('cadastrarDescricao').value = "";
  document.getElementById('messageCadastrado').textContent = "";
}

// Enviar sugestão
async function submitSuggestion() {
  const portugues = document.getElementById('suggestPt').value.trim();
  const waiwai = document.getElementById('suggestWai').value.trim();
  const descricao = document.getElementById('suggestDescricao').value.trim();
  const messageDiv = document.getElementById('messageSuggestion');

  messageDiv.textContent = "";

  if (!portugues || !waiwai) {
    messageDiv.textContent = "Preencha os campos obrigatórios.";
    return;
  }

  try {
    const resposta = await fetch('/palavras/sugestoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portugues, waiwai, descricao })
    });

    const dados = await resposta.json();
    messageDiv.textContent = dados.mensagem;
    document.getElementById('suggestPt').value = '';
    document.getElementById('suggestWai').value = '';
    document.getElementById('suggestDescricao').value = '';
  } catch (erro) {
    console.error('Erro ao sugerir termo:', erro);
    messageDiv.textContent = "Erro ao enviar sugestão.";
  }
}


// Cadastrar novo termo
async function cadastrarTermo() {
  const portugues = document.getElementById('cadastrarPt').value.trim();
  const waiwai = document.getElementById('cadastrarWai').value.trim();
  const descricao = document.getElementById('cadastrarDescricao').value.trim();

  if (!portugues || !waiwai) {
    document.getElementById('messageCadastrado').innerText = 'Preencha os campos obrigatórios!';
    return;
  }

  try {
    const resposta = await fetch('/palavras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portugues, waiwai, descricao })
    });

    const dados = await resposta.json();
    document.getElementById('messageCadastrado').innerText = dados.mensagem;
    document.getElementById('cadastrarPt').value = '';
    document.getElementById('cadastrarWai').value = '';
    document.getElementById('cadastrarDescricao').value = '';
  } catch (erro) {
    console.error('Erro ao cadastrar termo:', erro);
    document.getElementById('messageCadastrado').innerText = 'Erro ao cadastrar o termo.';
  }
}

// Espera o DOM carregar para conectar os eventos
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("btnTraduzir").addEventListener("click", translate);
});