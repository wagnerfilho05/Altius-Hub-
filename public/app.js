let apartamentos = [];
let reservas = [];

const botaoNova = document.getElementById('botaoNova');
const botaoLista = document.getElementById('botaoLista');
const botaoFluxo = document.getElementById('botaoFluxo');
const telaNova = document.getElementById('telaNova');
const telaLista = document.getElementById('telaLista');
const telaFluxo = document.getElementById('telaFluxo');
const formulario = document.getElementById('formReserva');
const mensagem = document.getElementById('mensagem');

function mostrarTela(tela) {
  telaNova.classList.add('escondida');
  telaLista.classList.add('escondida');
  telaFluxo.classList.add('escondida');

  botaoNova.classList.remove('ativo');
  botaoLista.classList.remove('ativo');
  botaoFluxo.classList.remove('ativo');

  if (tela === 'nova') {
    telaNova.classList.remove('escondida');
    botaoNova.classList.add('ativo');
  }

  if (tela === 'lista') {
    telaLista.classList.remove('escondida');
    botaoLista.classList.add('ativo');
  }

  if (tela === 'fluxo') {
    telaFluxo.classList.remove('escondida');
    botaoFluxo.classList.add('ativo');
  }
}

botaoNova.addEventListener('click', function () {
  mostrarTela('nova');
});

botaoLista.addEventListener('click', function () {
  mostrarTela('lista');
  carregarReservas();
});

botaoFluxo.addEventListener('click', function () {
  mostrarTela('fluxo');
});

function formatarData(data) {
  const partes = data.split('-');
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function atualizarResumo() {
  document.getElementById('totalReservas').textContent = reservas.length;
  document.getElementById('totalApartamentos').textContent = apartamentos.length;

  const empreendimentos = [];

  for (let i = 0; i < apartamentos.length; i++) {
    const nome = apartamentos[i].empreendimento;

    if (!empreendimentos.includes(nome)) {
      empreendimentos.push(nome);
    }
  }

  document.getElementById('totalEmpreendimentos').textContent = empreendimentos.length;
}

async function carregarApartamentos() {
  const select = document.getElementById('apartamento');

  try {
    const resposta = await fetch('/api/apartamentos');
    apartamentos = await resposta.json();

    select.innerHTML = '<option value="">Selecione o apartamento</option>';

    const empreendimentos = [];

    for (let i = 0; i < apartamentos.length; i++) {
      if (!empreendimentos.includes(apartamentos[i].empreendimento)) {
        empreendimentos.push(apartamentos[i].empreendimento);
      }
    }

    for (let i = 0; i < empreendimentos.length; i++) {
      const grupo = document.createElement('optgroup');
      grupo.label = empreendimentos[i];

      for (let j = 0; j < apartamentos.length; j++) {
        const apartamento = apartamentos[j];

        if (apartamento.empreendimento === empreendimentos[i]) {
          const opcao = document.createElement('option');
          opcao.value = apartamento.id;
          opcao.textContent = 'Apartamento ' + apartamento.numero;
          grupo.appendChild(opcao);
        }
      }

      select.appendChild(grupo);
    }

    atualizarResumo();
  } catch (erro) {
    select.innerHTML = '<option value="">Erro ao carregar</option>';
    mensagem.innerHTML = '<p class="erro">Não foi possível carregar os apartamentos. Execute o projeto com npm start.</p>';
  }
}

async function carregarReservas() {
  const corpoTabela = document.getElementById('listaReservas');

  try {
    const resposta = await fetch('/api/reservas');
    reservas = await resposta.json();

    corpoTabela.innerHTML = '';
    atualizarResumo();

    if (reservas.length === 0) {
      corpoTabela.innerHTML = '<tr><td colspan="8" class="sem-dados">Nenhuma reserva cadastrada até o momento.</td></tr>';
      return;
    }

    for (let i = 0; i < reservas.length; i++) {
      const reserva = reservas[i];
      let nomeApartamento = '-';

      for (let j = 0; j < apartamentos.length; j++) {
        if (apartamentos[j].id === reserva.apartamentoId) {
          nomeApartamento = apartamentos[j].empreendimento + ' - Apto ' + apartamentos[j].numero;
        }
      }

      corpoTabela.innerHTML += `
        <tr>
          <td><strong>${reserva.hospede}</strong></td>
          <td>${reserva.canal}</td>
          <td>${formatarData(reserva.entrada)}</td>
          <td>${formatarData(reserva.saida)}</td>
          <td>${nomeApartamento}</td>
          <td><span class="status">${reserva.status}</span></td>
          <td><a href="hospedagem.html?id=${reserva.id}" target="_blank">Abrir</a></td>
          <td><button class="excluir" onclick="excluirReserva(${reserva.id})">Excluir</button></td>
        </tr>
      `;
    }
  } catch (erro) {
    corpoTabela.innerHTML = '<tr><td colspan="8" class="sem-dados">Erro ao carregar as reservas.</td></tr>';
  }
}

formulario.addEventListener('submit', async function (evento) {
  evento.preventDefault();
  mensagem.innerHTML = '';

  const dados = {
    hospede: document.getElementById('hospede').value,
    canal: document.getElementById('canal').value,
    entrada: document.getElementById('entrada').value,
    saida: document.getElementById('saida').value,
    apartamentoId: Number(document.getElementById('apartamento').value)
  };

  const resposta = await fetch('/api/reservas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    mensagem.innerHTML = '<p class="erro">' + resultado.erro + '</p>';
    return;
  }

  mensagem.innerHTML = '<p class="sucesso">Reserva cadastrada com sucesso.</p>';
  formulario.reset();
  carregarReservas();
});

async function excluirReserva(id) {
  const confirmar = confirm('Deseja excluir esta reserva?');

  if (!confirmar) {
    return;
  }

  await fetch('/api/reservas/' + id, {
    method: 'DELETE'
  });

  carregarReservas();
}

window.excluirReserva = excluirReserva;

carregarApartamentos();
carregarReservas();
