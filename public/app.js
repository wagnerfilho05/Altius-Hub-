let apartamentos = [];
let reservas = [];

let dataCalendario = new Date();

const botaoNova = document.getElementById('botaoNova');
const botaoLista = document.getElementById('botaoLista');
const botaoDisponibilidade = document.getElementById('botaoDisponibilidade');
const botaoFluxo = document.getElementById('botaoFluxo');
const telaNova = document.getElementById('telaNova');
const telaLista = document.getElementById('telaLista');
const telaDisponibilidade = document.getElementById('telaDisponibilidade');
const telaFluxo = document.getElementById('telaFluxo');
const formulario = document.getElementById('formReserva');
const mensagem = document.getElementById('mensagem');

const apartamentoCalendario = document.getElementById('apartamentoCalendario');
const calendario = document.getElementById('calendario');
const tituloMesCalendario = document.getElementById('tituloMesCalendario');
const mesAnterior = document.getElementById('mesAnterior');
const mesSeguinte = document.getElementById('mesSeguinte');
const pesquisaHospede = document.getElementById('pesquisaHospede');
const sugestoesHospede = document.getElementById('sugestoesHospede');
const resultadoPesquisaHospede = document.getElementById('resultadoPesquisaHospede');

const formDisponibilidade = document.getElementById('formDisponibilidade');
const consultaEntrada = document.getElementById('consultaEntrada');
const consultaSaida = document.getElementById('consultaSaida');
const resultadoDisponibilidade = document.getElementById('resultadoDisponibilidade');

const modalReserva = document.getElementById('modalReserva');
const fecharModalReserva = document.getElementById('fecharModalReserva');
const fecharModalFundo = document.getElementById('fecharModalFundo');

function mostrarTela(tela) {
  telaNova.classList.add('escondida');
  telaLista.classList.add('escondida');
  telaDisponibilidade.classList.add('escondida');
  telaFluxo.classList.add('escondida');

  botaoNova.classList.remove('ativo');
  botaoLista.classList.remove('ativo');
  botaoDisponibilidade.classList.remove('ativo');
  botaoFluxo.classList.remove('ativo');

  if (tela === 'nova') {
    telaNova.classList.remove('escondida');
    botaoNova.classList.add('ativo');
  }

  if (tela === 'lista') {
    telaLista.classList.remove('escondida');
    botaoLista.classList.add('ativo');
  }

  if (tela === 'disponibilidade') {
    telaDisponibilidade.classList.remove('escondida');
    botaoDisponibilidade.classList.add('ativo');
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

botaoDisponibilidade.addEventListener('click', function () {
  mostrarTela('disponibilidade');
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

    let classeClique = '';
    let acaoClique = '';

    if (reserva) {
      classeClique = ' clicavel';
      acaoClique = ' onclick="mostrarDetalhesReserva(' + reserva.id + ')"';
    }

    calendario.innerHTML += `
      <div class="dia-calendario ${classe}${classeHoje}${classeClique}"${acaoClique} title="${detalhe}">
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

function nomeDoApartamento(apartamentoId) {
  for (let i = 0; i < apartamentos.length; i++) {
    if (apartamentos[i].id === apartamentoId) {
      return apartamentos[i].empreendimento + ' - Apto ' + apartamentos[i].numero;
    }
  }

  return '-';
}

function renderizarTabelaReservas(filtro) {
  const corpoTabela = document.getElementById('listaReservas');
  const textoPesquisa = (filtro || '').trim().toLowerCase();
  const reservasFiltradas = [];

  for (let i = 0; i < reservas.length; i++) {
    if (
      textoPesquisa === '' ||
      reservas[i].hospede.toLowerCase().includes(textoPesquisa)
    ) {
      reservasFiltradas.push(reservas[i]);
    }
  }

  corpoTabela.innerHTML = '';

  if (reservasFiltradas.length === 0) {
    corpoTabela.innerHTML = '<tr><td colspan="7">Nenhuma reserva encontrada.</td></tr>';
    return;
  }

  for (let i = 0; i < reservasFiltradas.length; i++) {
    const reserva = reservasFiltradas[i];

    corpoTabela.innerHTML += `
      <tr>
        <td>${reserva.hospede}</td>
        <td>${reserva.canal}</td>
        <td>${formatarData(reserva.entrada)}</td>
        <td>${formatarData(reserva.saida)}</td>
        <td>${nomeDoApartamento(reserva.apartamentoId)}</td>
        <td><a href="hospedagem.html?id=${reserva.id}" target="_blank">Abrir</a></td>
        <td><button class="excluir" onclick="excluirReserva(${reserva.id})">Excluir</button></td>
      </tr>
    `;
  }
}

async function carregarReservas() {
  const corpoTabela = document.getElementById('listaReservas');

  try {
    const resposta = await fetch('/api/reservas');
    reservas = await resposta.json();

    renderizarTabelaReservas(pesquisaHospede.value);
    renderizarCalendario();
  } catch (erro) {
    corpoTabela.innerHTML = '<tr><td colspan="7">Erro ao carregar as reservas.</td></tr>';
  }
}

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function obterNomesHospedes() {
  const nomes = [];

  for (let i = 0; i < reservas.length; i++) {
    const nome = reservas[i].hospede;

    if (!nomes.includes(nome)) {
      nomes.push(nome);
    }
  }

  return nomes;
}

function renderizarSugestoesHospede(texto) {
  const termo = normalizarTexto((texto || '').trim());

  if (termo === '') {
    sugestoesHospede.innerHTML = '';
    sugestoesHospede.classList.remove('aberto');
    return;
  }

  const nomes = obterNomesHospedes();
  const comeco = [];
  const contem = [];

  for (let i = 0; i < nomes.length; i++) {
    const nomeNormalizado = normalizarTexto(nomes[i]);

    if (nomeNormalizado.startsWith(termo)) {
      comeco.push(nomes[i]);
    } else if (nomeNormalizado.includes(termo)) {
      contem.push(nomes[i]);
    }
  }

  comeco.sort(function (a, b) {
    return a.localeCompare(b, 'pt-BR');
  });

  contem.sort(function (a, b) {
    return a.localeCompare(b, 'pt-BR');
  });

  const resultados = comeco.concat(contem).slice(0, 6);

  if (resultados.length === 0) {
    sugestoesHospede.innerHTML = '<div class="sugestao-vazia">Nenhum hóspede encontrado</div>';
    sugestoesHospede.classList.add('aberto');
    return;
  }

  sugestoesHospede.innerHTML = '';

  for (let i = 0; i < resultados.length; i++) {
    const nome = resultados[i];
    const botao = document.createElement('button');

    botao.type = 'button';
    botao.className = 'sugestao-hospede';
    botao.textContent = nome;

    botao.addEventListener('click', function () {
      pesquisaHospede.value = nome;
      renderizarTabelaReservas(nome);
      renderizarReservasHospede(nome);
      sugestoesHospede.innerHTML = '';
      sugestoesHospede.classList.remove('aberto');
    });

    sugestoesHospede.appendChild(botao);
  }

  sugestoesHospede.classList.add('aberto');
}

function renderizarReservasHospede(nome) {
  const reservasDoHospede = [];

  for (let i = 0; i < reservas.length; i++) {
    if (normalizarTexto(reservas[i].hospede) === normalizarTexto(nome)) {
      reservasDoHospede.push(reservas[i]);
    }
  }

  reservasDoHospede.sort(function (a, b) {
    return a.entrada.localeCompare(b.entrada);
  });

  if (reservasDoHospede.length === 0) {
    resultadoPesquisaHospede.innerHTML = '';
    return;
  }

  let html = `
    <div class="resultado-hospede-topo">
      <div>
        <span class="subtitulo">Resultado da pesquisa</span>
        <h3>Reservas de ${nome}</h3>
      </div>
      <strong>${reservasDoHospede.length} reserva(s)</strong>
    </div>

    <div class="reservas-hospede-grid">
  `;

  for (let i = 0; i < reservasDoHospede.length; i++) {
    const reserva = reservasDoHospede[i];

    html += `
      <div class="reserva-hospede-card">
        <div class="reserva-hospede-datas">
          <strong>${formatarData(reserva.entrada)}</strong>
          <span>até ${formatarData(reserva.saida)}</span>
        </div>

        <p><strong>${nomeDoApartamento(reserva.apartamentoId)}</strong></p>
        <p>Canal: ${reserva.canal}</p>

        <button type="button" onclick="irParaReservaNoCalendario(${reserva.id})">
          Ver no calendário
        </button>
      </div>
    `;
  }

  html += '</div>';
  resultadoPesquisaHospede.innerHTML = html;
}

function irParaReservaNoCalendario(id) {
  let reservaSelecionada = null;

  for (let i = 0; i < reservas.length; i++) {
    if (reservas[i].id === id) {
      reservaSelecionada = reservas[i];
      break;
    }
  }

  if (!reservaSelecionada) {
    return;
  }

  apartamentoCalendario.value = reservaSelecionada.apartamentoId;

  const partesData = reservaSelecionada.entrada.split('-');
  const anoReserva = Number(partesData[0]);
  const mesReserva = Number(partesData[1]) - 1;

  dataCalendario = new Date(anoReserva, mesReserva, 1);
  renderizarCalendario();

  setTimeout(function () {
    calendario.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    mostrarDetalhesReserva(reservaSelecionada.id);
  }, 100);
}

pesquisaHospede.addEventListener('input', function () {
  renderizarTabelaReservas(pesquisaHospede.value);
  renderizarSugestoesHospede(pesquisaHospede.value);
  resultadoPesquisaHospede.innerHTML = '';
});

pesquisaHospede.addEventListener('focus', function () {
  if (pesquisaHospede.value.trim() !== '') {
    renderizarSugestoesHospede(pesquisaHospede.value);
  }
});

document.addEventListener('click', function (evento) {
  if (
    evento.target !== pesquisaHospede &&
    !sugestoesHospede.contains(evento.target)
  ) {
    sugestoesHospede.classList.remove('aberto');
  }
});

function mostrarDetalhesReserva(id) {
  let reservaEncontrada = null;

  for (let i = 0; i < reservas.length; i++) {
    if (reservas[i].id === id) {
      reservaEncontrada = reservas[i];
    }
  }

  if (!reservaEncontrada) {
    return;
  }

  document.getElementById('modalHospede').textContent = reservaEncontrada.hospede;
  document.getElementById('modalCanal').textContent = reservaEncontrada.canal;
  document.getElementById('modalApartamento').textContent = nomeDoApartamento(reservaEncontrada.apartamentoId);
  document.getElementById('modalEntrada').textContent = formatarData(reservaEncontrada.entrada);
  document.getElementById('modalSaida').textContent = formatarData(reservaEncontrada.saida);
  document.getElementById('modalLinkHospedagem').href = 'hospedagem.html?id=' + reservaEncontrada.id;

  modalReserva.classList.add('aberto');
}

function fecharDetalhesReserva() {
  modalReserva.classList.remove('aberto');
}

fecharModalReserva.addEventListener('click', fecharDetalhesReserva);
fecharModalFundo.addEventListener('click', fecharDetalhesReserva);

document.addEventListener('keydown', function (evento) {
  if (evento.key === 'Escape') {
    fecharDetalhesReserva();
  }
});

function apartamentoEstaLivre(apartamentoId, entrada, saida) {
  for (let i = 0; i < reservas.length; i++) {
    const reserva = reservas[i];

    if (
      reserva.apartamentoId === apartamentoId &&
      entrada < reserva.saida &&
      saida > reserva.entrada
    ) {
      return false;
    }
  }

  return true;
}

formDisponibilidade.addEventListener('submit', async function (evento) {
  evento.preventDefault();

  const entrada = consultaEntrada.value;
  const saida = consultaSaida.value;

  if (!entrada || !saida) {
    resultadoDisponibilidade.innerHTML = '<p class="resultado-erro">Preencha as duas datas.</p>';
    return;
  }

  if (entrada >= saida) {
    resultadoDisponibilidade.innerHTML = '<p class="resultado-erro">O check-out precisa ser depois do check-in.</p>';
    return;
  }

  try {
    const resposta = await fetch('/api/reservas');
    reservas = await resposta.json();

    const disponiveis = [];

    for (let i = 0; i < apartamentos.length; i++) {
      const apartamento = apartamentos[i];

      if (apartamentoEstaLivre(apartamento.id, entrada, saida)) {
        disponiveis.push(apartamento);
      }
    }

    if (disponiveis.length === 0) {
      resultadoDisponibilidade.innerHTML = `
        <div class="sem-disponibilidade">
          <strong>Nenhum apartamento disponível</strong>
          <p>Não existe vaga entre ${formatarData(entrada)} e ${formatarData(saida)}.</p>
        </div>
      `;
      return;
    }

    let html = `
      <div class="resultado-titulo">
        <strong>${disponiveis.length} apartamento(s) disponível(is)</strong>
        <span>Período: ${formatarData(entrada)} até ${formatarData(saida)}</span>
      </div>
      <div class="apartamentos-disponiveis">
    `;

    for (let i = 0; i < disponiveis.length; i++) {
      html += `
        <div class="apartamento-disponivel">
          <span>Livre no período</span>
          <strong>${disponiveis[i].empreendimento}</strong>
          <p>Apartamento ${disponiveis[i].numero}</p>
        </div>
      `;
    }

    html += '</div>';
    resultadoDisponibilidade.innerHTML = html;
  } catch (erro) {
    resultadoDisponibilidade.innerHTML = '<p class="resultado-erro">Não foi possível consultar a disponibilidade.</p>';
  }
});

window.mostrarDetalhesReserva = mostrarDetalhesReserva;
window.irParaReservaNoCalendario = irParaReservaNoCalendario;

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
