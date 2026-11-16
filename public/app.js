let apartamentos = [];
let reservas = [];

let dataCalendario = new Date();

const botaoNova = document.getElementById('botaoNova');
const botaoLista = document.getElementById('botaoLista');
const botaoFluxo = document.getElementById('botaoFluxo');
const telaNova = document.getElementById('telaNova');
const telaLista = document.getElementById('telaLista');
const telaFluxo = document.getElementById('telaFluxo');
const formulario = document.getElementById('formReserva');
const mensagem = document.getElementById('mensagem');

const apartamentoCalendario = document.getElementById('apartamentoCalendario');
const calendario = document.getElementById('calendario');
const tituloMesCalendario = document.getElementById('tituloMesCalendario');
const mesAnterior = document.getElementById('mesAnterior');
const mesSeguinte = document.getElementById('mesSeguinte');

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

function montarData(ano, mes, dia) {
  const mesTexto = String(mes + 1).padStart(2, '0');
  const diaTexto = String(dia).padStart(2, '0');

  return ano + '-' + mesTexto + '-' + diaTexto;
}

function preencherApartamentoCalendario() {
  const valorAtual = apartamentoCalendario.value;

  apartamentoCalendario.innerHTML = '';

  for (let i = 0; i < apartamentos.length; i++) {
    const apartamento = apartamentos[i];
    const opcao = document.createElement('option');

    opcao.value = apartamento.id;
    opcao.textContent = apartamento.empreendimento + ' - Apto ' + apartamento.numero;
    apartamentoCalendario.appendChild(opcao);
  }

  if (valorAtual) {
    apartamentoCalendario.value = valorAtual;
  }

  if (!apartamentoCalendario.value && apartamentos.length > 0) {
    apartamentoCalendario.value = apartamentos[0].id;
  }
}

function procurarReservaDoDia(data, apartamentoId) {
  for (let i = 0; i < reservas.length; i++) {
    const reserva = reservas[i];

    if (
      reserva.apartamentoId === apartamentoId &&
      data >= reserva.entrada &&
      data < reserva.saida
    ) {
      return reserva;
    }
  }

  return null;
}

function renderizarCalendario() {
  if (!calendario || apartamentos.length === 0) {
    return;
  }

  const apartamentoId = Number(apartamentoCalendario.value);
  const ano = dataCalendario.getFullYear();
  const mes = dataCalendario.getMonth();

  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  tituloMesCalendario.textContent = nomesMeses[mes] + ' de ' + ano;

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  calendario.innerHTML = '';

  for (let i = 0; i < diasSemana.length; i++) {
    calendario.innerHTML += '<div class="dia-semana">' + diasSemana[i] + '</div>';
  }

  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const quantidadeDias = new Date(ano, mes + 1, 0).getDate();

  for (let i = 0; i < primeiroDiaSemana; i++) {
    calendario.innerHTML += '<div class="dia-calendario fora-mes"></div>';
  }

  const agora = new Date();
  const hoje = montarData(agora.getFullYear(), agora.getMonth(), agora.getDate());

  for (let dia = 1; dia <= quantidadeDias; dia++) {
    const data = montarData(ano, mes, dia);
    const reserva = procurarReservaDoDia(data, apartamentoId);

    let classe = 'livre';
    let estado = 'Livre';
    let detalhe = '';

    let siglaCanal = '';

    if (reserva) {
      classe = 'ocupado';
      estado = 'Reservado';
      detalhe = reserva.hospede;

      if (reserva.canal === 'WhatsApp') {
        siglaCanal = 'W';
      }

      if (reserva.canal === 'Instagram') {
        siglaCanal = 'I';
      }

      if (reserva.canal === 'Booking') {
        siglaCanal = 'B';
      }

      if (reserva.canal === 'Airbnb') {
        siglaCanal = 'A';
      }
    }

    let classeHoje = '';

    if (data === hoje) {
      classeHoje = ' hoje';
    }

    calendario.innerHTML += `
      <div class="dia-calendario ${classe}${classeHoje}" title="${detalhe}">
        <span class="numero-dia">${dia}</span>
        ${siglaCanal ? '<span class="sigla-canal" title="' + reserva.canal + '">' + siglaCanal + '</span>' : ''}
        <span class="estado-dia">${estado}</span>
        ${detalhe ? '<small>' + detalhe + '</small>' : ''}
      </div>
    `;
  }

  const totalCelulas = primeiroDiaSemana + quantidadeDias;
  const faltando = totalCelulas % 7 === 0 ? 0 : 7 - (totalCelulas % 7);

  for (let i = 0; i < faltando; i++) {
    calendario.innerHTML += '<div class="dia-calendario fora-mes"></div>';
  }
}

apartamentoCalendario.addEventListener('change', function () {
  renderizarCalendario();
});

mesAnterior.addEventListener('click', function () {
  dataCalendario = new Date(
    dataCalendario.getFullYear(),
    dataCalendario.getMonth() - 1,
    1
  );

  renderizarCalendario();
});

mesSeguinte.addEventListener('click', function () {
  dataCalendario = new Date(
    dataCalendario.getFullYear(),
    dataCalendario.getMonth() + 1,
    1
  );

  renderizarCalendario();
});

async function carregarApartamentos() {
  const select = document.getElementById('apartamento');

  try {
    const resposta = await fetch('/api/apartamentos');
    apartamentos = await resposta.json();

    select.innerHTML = '<option value="">Selecione</option>';

    for (let i = 0; i < apartamentos.length; i++) {
      const apartamento = apartamentos[i];
      const opcao = document.createElement('option');

      opcao.value = apartamento.id;
      opcao.textContent = apartamento.empreendimento + ' - Apto ' + apartamento.numero;
      select.appendChild(opcao);
    }

    preencherApartamentoCalendario();
    renderizarCalendario();
  } catch (erro) {
    select.innerHTML = '<option value="">Erro ao carregar</option>';
    apartamentoCalendario.innerHTML = '<option value="">Erro ao carregar</option>';
    mensagem.innerHTML = '<p class="erro">Não foi possível carregar os apartamentos. Execute o projeto com npm start.</p>';
  }
}

async function carregarReservas() {
  const corpoTabela = document.getElementById('listaReservas');

  try {
    const resposta = await fetch('/api/reservas');
    reservas = await resposta.json();

    corpoTabela.innerHTML = '';

    if (reservas.length === 0) {
      corpoTabela.innerHTML = '<tr><td colspan="7">Nenhuma reserva cadastrada.</td></tr>';
      renderizarCalendario();
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
          <td>${reserva.hospede}</td>
          <td>${reserva.canal}</td>
          <td>${formatarData(reserva.entrada)}</td>
          <td>${formatarData(reserva.saida)}</td>
          <td>${nomeApartamento}</td>
          <td><a href="hospedagem.html?id=${reserva.id}" target="_blank">Abrir</a></td>
          <td><button class="excluir" onclick="excluirReserva(${reserva.id})">Excluir</button></td>
        </tr>
      `;
    }

    renderizarCalendario();
  } catch (erro) {
    corpoTabela.innerHTML = '<tr><td colspan="7">Erro ao carregar as reservas.</td></tr>';
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
