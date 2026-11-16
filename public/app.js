let apartamentos = [];
let reservas = [];
let dataCalendario = new Date();
let reservaParaExcluir = null;

const botoes = {
  dashboard: document.getElementById('botaoDashboard'),
  nova: document.getElementById('botaoNova'),
  lista: document.getElementById('botaoLista'),
  disponibilidade: document.getElementById('botaoDisponibilidade'),
  flat: document.getElementById('botaoFlat')
};

const telas = {
  dashboard: document.getElementById('telaDashboard'),
  nova: document.getElementById('telaNova'),
  lista: document.getElementById('telaLista'),
  disponibilidade: document.getElementById('telaDisponibilidade'),
  flat: document.getElementById('telaFlat')
};

const formulario = document.getElementById('formReserva');
const mensagem = document.getElementById('mensagem');
const formFlat = document.getElementById('formFlat');
const mensagemFlat = document.getElementById('mensagemFlat');
const listaFlats = document.getElementById('listaFlats');

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

const modalEditarReserva = document.getElementById('modalEditarReserva');
const fecharEditarReserva = document.getElementById('fecharEditarReserva');
const fecharEditarReservaFundo = document.getElementById('fecharEditarReservaFundo');
const formEditarReserva = document.getElementById('formEditarReserva');
const mensagemEditarReserva = document.getElementById('mensagemEditarReserva');

const modalEditarFlat = document.getElementById('modalEditarFlat');
const fecharEditarFlat = document.getElementById('fecharEditarFlat');
const fecharEditarFlatFundo = document.getElementById('fecharEditarFlatFundo');
const formEditarFlat = document.getElementById('formEditarFlat');
const mensagemEditarFlat = document.getElementById('mensagemEditarFlat');

const modalConfirmarExclusao = document.getElementById('modalConfirmarExclusao');
const fecharExclusaoFundo = document.getElementById('fecharExclusaoFundo');
const cancelarExclusao = document.getElementById('cancelarExclusao');
const confirmarExclusao = document.getElementById('confirmarExclusao');

function mostrarTela(nome) {
  const nomes = Object.keys(telas);

  for (let i = 0; i < nomes.length; i++) {
    telas[nomes[i]].classList.add('escondida');
    botoes[nomes[i]].classList.remove('ativo');
  }

  telas[nome].classList.remove('escondida');
  botoes[nome].classList.add('ativo');

  if (nome === 'dashboard') {
    renderizarDashboard();
  }

  if (nome === 'lista') {
    carregarReservas();
  }

  if (nome === 'flat') {
    renderizarListaFlats();
  }
}

botoes.dashboard.addEventListener('click', function () { mostrarTela('dashboard'); });
botoes.nova.addEventListener('click', function () { mostrarTela('nova'); });
botoes.lista.addEventListener('click', function () { mostrarTela('lista'); });
botoes.disponibilidade.addEventListener('click', function () { mostrarTela('disponibilidade'); });
botoes.flat.addEventListener('click', function () { mostrarTela('flat'); });

document.getElementById('atalhoNovaReserva').addEventListener('click', function () {
  mostrarTela('nova');
});

document.getElementById('verTodasReservas').addEventListener('click', function () {
  mostrarTela('lista');
});

function formatarData(data) {
  const partes = data.split('-');
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function dataHojeBrasil() {
  const partes = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());

  let dia = '';
  let mes = '';
  let ano = '';

  for (let i = 0; i < partes.length; i++) {
    if (partes[i].type === 'day') dia = partes[i].value;
    if (partes[i].type === 'month') mes = partes[i].value;
    if (partes[i].type === 'year') ano = partes[i].value;
  }

  return ano + '-' + mes + '-' + dia;
}

function montarData(ano, mes, dia) {
  const mesTexto = String(mes + 1).padStart(2, '0');
  const diaTexto = String(dia).padStart(2, '0');
  return ano + '-' + mesTexto + '-' + diaTexto;
}

function adicionarUmDia(data) {
  const partes = data.split('-');
  const d = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]) + 1);
  return montarData(d.getFullYear(), d.getMonth(), d.getDate());
}

function statusDaReserva(reserva) {
  const hoje = dataHojeBrasil();

  if (reserva.saida < hoje) return 'Finalizada';
  if (reserva.saida === hoje) return 'Check-out hoje';
  if (reserva.entrada === hoje) return 'Check-in hoje';
  if (reserva.entrada < hoje && reserva.saida > hoje) return 'Hospedado';
  return 'Próxima';
}

function classeStatus(status) {
  if (status === 'Hospedado') return 'status-hospedado';
  if (status === 'Check-in hoje') return 'status-checkin';
  if (status === 'Check-out hoje') return 'status-checkout';
  if (status === 'Finalizada') return 'status-finalizada';
  return 'status-proxima';
}

function nomeDoApartamento(apartamentoId) {
  for (let i = 0; i < apartamentos.length; i++) {
    if (apartamentos[i].id === apartamentoId) {
      return apartamentos[i].empreendimento + ' - Apto ' + apartamentos[i].numero;
    }
  }
  return '-';
}

function preencherSelectApartamentos(select, valorAtual) {
  select.innerHTML = '<option value="">Selecione</option>';

  for (let i = 0; i < apartamentos.length; i++) {
    const apartamento = apartamentos[i];
    const opcao = document.createElement('option');
    opcao.value = apartamento.id;
    opcao.textContent = apartamento.empreendimento + ' - Apto ' + apartamento.numero;
    select.appendChild(opcao);
  }

  if (valorAtual) select.value = valorAtual;
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

  if (valorAtual) apartamentoCalendario.value = valorAtual;
  if (!apartamentoCalendario.value && apartamentos.length > 0) {
    apartamentoCalendario.value = apartamentos[0].id;
  }
}

async function carregarApartamentos() {
  try {
    const resposta = await fetch('/api/apartamentos');
    apartamentos = await resposta.json();

    preencherSelectApartamentos(document.getElementById('apartamento'));
    preencherSelectApartamentos(document.getElementById('editarApartamento'));
    preencherApartamentoCalendario();
    renderizarListaFlats();
    renderizarCalendario();
    renderizarDashboard();
  } catch (erro) {
    mensagem.innerHTML = '<p class="erro">Não foi possível carregar os apartamentos.</p>';
  }
}

async function carregarReservas() {
  try {
    const resposta = await fetch('/api/reservas');
    reservas = await resposta.json();

    renderizarTabelaReservas(pesquisaHospede.value);
    renderizarCalendario();
    renderizarDashboard();
  } catch (erro) {
    document.getElementById('listaReservas').innerHTML =
      '<tr><td colspan="7">Erro ao carregar as reservas.</td></tr>';
  }
}

function renderizarDashboard() {
  const hoje = dataHojeBrasil();
  const dataLonga = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Fortaleza',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  document.getElementById('dataDashboard').textContent =
    dataLonga.charAt(0).toUpperCase() + dataLonga.slice(1);

  let checkins = 0;
  let checkouts = 0;
  let ocupados = 0;

  for (let i = 0; i < reservas.length; i++) {
    if (reservas[i].entrada === hoje) checkins++;
    if (reservas[i].saida === hoje) checkouts++;
    if (reservas[i].entrada <= hoje && reservas[i].saida > hoje) ocupados++;
  }

  document.getElementById('totalCheckinsHoje').textContent = checkins;
  document.getElementById('totalCheckoutsHoje').textContent = checkouts;
  document.getElementById('totalOcupadosHoje').textContent = ocupados;

  const proximas = reservas
    .filter(function (reserva) { return reserva.entrada >= hoje; })
    .sort(function (a, b) { return a.entrada.localeCompare(b.entrada); })
    .slice(0, 5);

  const areaCheckins = document.getElementById('proximosCheckins');

  if (proximas.length === 0) {
    areaCheckins.innerHTML = '<div class="estado-vazio"><strong>Nenhum check-in próximo</strong><span>As próximas reservas aparecerão aqui.</span></div>';
  } else {
    let html = '';

    for (let i = 0; i < proximas.length; i++) {
      html += `
        <button class="item-dashboard" type="button" onclick="mostrarDetalhesReserva(${proximas[i].id})">
          <div>
            <strong>${proximas[i].hospede}</strong>
            <span>${nomeDoApartamento(proximas[i].apartamentoId)}</span>
          </div>
          <div class="item-dashboard-data">
            <strong>${formatarData(proximas[i].entrada)}</strong>
            <span>${proximas[i].canal}</span>
          </div>
        </button>
      `;
    }

    areaCheckins.innerHTML = html;
  }

  const areaOcupacao = document.getElementById('ocupacaoHoje');

  if (apartamentos.length === 0) {
    areaOcupacao.innerHTML = '<div class="estado-vazio"><strong>Nenhum flat cadastrado</strong><span>Cadastre um flat para acompanhar a ocupação.</span></div>';
    return;
  }

  let htmlOcupacao = '';

  for (let i = 0; i < apartamentos.length; i++) {
    let reservaAtual = null;

    for (let j = 0; j < reservas.length; j++) {
      if (
        reservas[j].apartamentoId === apartamentos[i].id &&
        reservas[j].entrada <= hoje &&
        reservas[j].saida > hoje
      ) {
        reservaAtual = reservas[j];
        break;
      }
    }

    htmlOcupacao += `
      <div class="item-ocupacao">
        <div>
          <strong>${apartamentos[i].empreendimento} · ${apartamentos[i].numero}</strong>
          <span>${reservaAtual ? reservaAtual.hospede : 'Disponível hoje'}</span>
        </div>
        <span class="sinal-ocupacao ${reservaAtual ? 'ocupado' : 'livre'}">${reservaAtual ? 'Ocupado' : 'Livre'}</span>
      </div>
    `;
  }

  areaOcupacao.innerHTML = htmlOcupacao;
}

document.getElementById('botaoBuscaGlobal').addEventListener('click', function () {
  const texto = document.getElementById('buscaGlobal').value.trim();

  if (!texto) return;

  pesquisaHospede.value = texto;
  mostrarTela('lista');
  renderizarTabelaReservas(texto);
  renderizarSugestoesHospede(texto);
});

document.getElementById('buscaGlobal').addEventListener('keydown', function (evento) {
  if (evento.key === 'Enter') {
    evento.preventDefault();
    document.getElementById('botaoBuscaGlobal').click();
  }
});

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
  if (!calendario || apartamentos.length === 0) return;

  const apartamentoId = Number(apartamentoCalendario.value);
  const ano = dataCalendario.getFullYear();
  const mes = dataCalendario.getMonth();
  const hoje = dataHojeBrasil();

  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  tituloMesCalendario.textContent = nomesMeses[mes] + ' de ' + ano;
  calendario.innerHTML = '';

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  for (let i = 0; i < diasSemana.length; i++) {
    calendario.innerHTML += '<div class="dia-semana">' + diasSemana[i] + '</div>';
  }

  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const quantidadeDias = new Date(ano, mes + 1, 0).getDate();

  for (let i = 0; i < primeiroDiaSemana; i++) {
    calendario.innerHTML += '<div class="dia-calendario fora-mes"></div>';
  }

  for (let dia = 1; dia <= quantidadeDias; dia++) {
    const data = montarData(ano, mes, dia);

    if (data < hoje) {
      calendario.innerHTML += `
        <div class="dia-calendario passada">
          <span class="numero-dia">${dia}</span>
        </div>
      `;
      continue;
    }

    const reserva = procurarReservaDoDia(data, apartamentoId);

    if (!reserva) {
      calendario.innerHTML += `
        <button type="button" class="dia-calendario livre clicavel-dia-livre${data === hoje ? ' hoje' : ''}"
          onclick="prepararReservaDia('${data}', ${apartamentoId})">
          <span class="numero-dia">${dia}</span>
          ${data === hoje ? '<span class="marca-hoje">Hoje</span>' : ''}
          <span class="estado-dia">Livre</span>
        </button>
      `;
      continue;
    }

    let siglaCanal = '';
    if (reserva.canal === 'WhatsApp') siglaCanal = 'W';
    if (reserva.canal === 'Instagram') siglaCanal = 'I';
    if (reserva.canal === 'Booking') siglaCanal = 'B';
    if (reserva.canal === 'Airbnb') siglaCanal = 'A';

    calendario.innerHTML += `
      <button type="button" class="dia-calendario ocupado clicavel${data === hoje ? ' hoje' : ''}"
        onclick="mostrarDetalhesReserva(${reserva.id})">
        <span class="numero-dia">${dia}</span>
        ${data === hoje ? '<span class="marca-hoje">Hoje</span>' : ''}
        <span class="sigla-canal" title="${reserva.canal}">${siglaCanal}</span>
        <span class="estado-dia">Reservado</span>
        <small>${reserva.hospede}</small>
      </button>
    `;
  }

  const totalCelulas = primeiroDiaSemana + quantidadeDias;
  const faltando = totalCelulas % 7 === 0 ? 0 : 7 - (totalCelulas % 7);

  for (let i = 0; i < faltando; i++) {
    calendario.innerHTML += '<div class="dia-calendario fora-mes"></div>';
  }
}

apartamentoCalendario.addEventListener('change', renderizarCalendario);

mesAnterior.addEventListener('click', function () {
  dataCalendario = new Date(dataCalendario.getFullYear(), dataCalendario.getMonth() - 1, 1);
  renderizarCalendario();
});

mesSeguinte.addEventListener('click', function () {
  dataCalendario = new Date(dataCalendario.getFullYear(), dataCalendario.getMonth() + 1, 1);
  renderizarCalendario();
});

function prepararReservaDia(data, apartamentoId) {
  document.getElementById('entrada').value = data;
  document.getElementById('saida').value = adicionarUmDia(data);
  document.getElementById('apartamento').value = apartamentoId;
  mostrarTela('nova');
  document.getElementById('hospede').focus();
}

function iniciarReservaComDados(apartamentoId, entrada, saida) {
  document.getElementById('entrada').value = entrada;
  document.getElementById('saida').value = saida;
  document.getElementById('apartamento').value = apartamentoId;
  mostrarTela('nova');
  document.getElementById('hospede').focus();
}

function renderizarTabelaReservas(filtro) {
  const corpoTabela = document.getElementById('listaReservas');
  const textoPesquisa = normalizarTexto((filtro || '').trim());
  const filtradas = [];

  for (let i = 0; i < reservas.length; i++) {
    if (
      textoPesquisa === '' ||
      normalizarTexto(reservas[i].hospede).includes(textoPesquisa)
    ) {
      filtradas.push(reservas[i]);
    }
  }

  filtradas.sort(function (a, b) {
    return b.entrada.localeCompare(a.entrada);
  });

  corpoTabela.innerHTML = '';

  if (filtradas.length === 0) {
    corpoTabela.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="estado-vazio tabela-vazia">
            <strong>Nenhuma reserva encontrada</strong>
            <span>Cadastre uma nova reserva ou altere a pesquisa.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  for (let i = 0; i < filtradas.length; i++) {
    const reserva = filtradas[i];
    const status = statusDaReserva(reserva);

    corpoTabela.innerHTML += `
      <tr>
        <td><strong>${reserva.hospede}</strong></td>
        <td><span class="status-reserva ${classeStatus(status)}">${status}</span></td>
        <td>${reserva.canal}</td>
        <td>${formatarData(reserva.entrada)}</td>
        <td>${formatarData(reserva.saida)}</td>
        <td>${nomeDoApartamento(reserva.apartamentoId)}</td>
        <td>
          <div class="acoes-tabela">
            <button type="button" class="acao-link" onclick="mostrarDetalhesReserva(${reserva.id})">Ver</button>
            <button type="button" class="acao-link" onclick="abrirEditarReserva(${reserva.id})">Editar</button>
            <button type="button" class="excluir" onclick="pedirExclusaoReserva(${reserva.id})">Excluir</button>
          </div>
        </td>
      </tr>
    `;
  }
}

function normalizarTexto(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function obterNomesHospedes() {
  const nomes = [];

  for (let i = 0; i < reservas.length; i++) {
    if (!nomes.includes(reservas[i].hospede)) {
      nomes.push(reservas[i].hospede);
    }
  }

  return nomes;
}

function renderizarSugestoesHospede(texto) {
  const termo = normalizarTexto((texto || '').trim());

  if (!termo) {
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

  comeco.sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });
  contem.sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });

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
  const reservasDoHospede = reservas
    .filter(function (reserva) {
      return normalizarTexto(reserva.hospede) === normalizarTexto(nome);
    })
    .sort(function (a, b) {
      return b.entrada.localeCompare(a.entrada);
    });

  if (reservasDoHospede.length === 0) {
    resultadoPesquisaHospede.innerHTML = '';
    return;
  }

  let html = `
    <div class="resultado-hospede-topo">
      <div>
        <span class="subtitulo">Histórico do hóspede</span>
        <h3>Reservas de ${nome}</h3>
      </div>
      <strong>${reservasDoHospede.length} reserva(s)</strong>
    </div>
    <div class="reservas-hospede-grid">
  `;

  for (let i = 0; i < reservasDoHospede.length; i++) {
    const reserva = reservasDoHospede[i];
    const status = statusDaReserva(reserva);

    html += `
      <div class="reserva-hospede-card">
        <div class="reserva-hospede-card-topo">
          <div class="reserva-hospede-datas">
            <strong>${formatarData(reserva.entrada)}</strong>
            <span>até ${formatarData(reserva.saida)}</span>
          </div>
          <span class="status-reserva ${classeStatus(status)}">${status}</span>
        </div>
        <p><strong>${nomeDoApartamento(reserva.apartamentoId)}</strong></p>
        <p>Canal: ${reserva.canal}</p>
        <div class="acoes-card">
          ${status !== 'Finalizada' ? '<button type="button" onclick="irParaReservaNoCalendario(' + reserva.id + ')">Ver no calendário</button>' : ''}
          <button type="button" onclick="mostrarDetalhesReserva(${reserva.id})">Detalhes</button>
        </div>
      </div>
    `;
  }

  html += '</div>';
  resultadoPesquisaHospede.innerHTML = html;
}

function irParaReservaNoCalendario(id) {
  const reserva = reservas.find(function (item) { return item.id === id; });
  if (!reserva) return;

  apartamentoCalendario.value = reserva.apartamentoId;
  const partes = reserva.entrada.split('-');
  dataCalendario = new Date(Number(partes[0]), Number(partes[1]) - 1, 1);
  renderizarCalendario();

  setTimeout(function () {
    calendario.scrollIntoView({ behavior: 'smooth', block: 'center' });
    mostrarDetalhesReserva(id);
  }, 100);
}

pesquisaHospede.addEventListener('input', function () {
  renderizarTabelaReservas(pesquisaHospede.value);
  renderizarSugestoesHospede(pesquisaHospede.value);
  resultadoPesquisaHospede.innerHTML = '';
});

pesquisaHospede.addEventListener('focus', function () {
  if (pesquisaHospede.value.trim()) {
    renderizarSugestoesHospede(pesquisaHospede.value);
  }
});

document.addEventListener('click', function (evento) {
  if (evento.target !== pesquisaHospede && !sugestoesHospede.contains(evento.target)) {
    sugestoesHospede.classList.remove('aberto');
  }
});

function mostrarDetalhesReserva(id) {
  const reserva = reservas.find(function (item) { return item.id === id; });
  if (!reserva) return;

  document.getElementById('modalHospede').textContent = reserva.hospede;
  document.getElementById('modalStatus').textContent = statusDaReserva(reserva);
  document.getElementById('modalCanal').textContent = reserva.canal;
  document.getElementById('modalApartamento').textContent = nomeDoApartamento(reserva.apartamentoId);
  document.getElementById('modalEntrada').textContent = formatarData(reserva.entrada);
  document.getElementById('modalSaida').textContent = formatarData(reserva.saida);
  document.getElementById('modalLinkHospedagem').href = 'hospedagem.html?id=' + reserva.id;
  modalReserva.classList.add('aberto');
}

function fecharDetalhesReserva() {
  modalReserva.classList.remove('aberto');
}

fecharModalReserva.addEventListener('click', fecharDetalhesReserva);
fecharModalFundo.addEventListener('click', fecharDetalhesReserva);

function abrirEditarReserva(id) {
  const reserva = reservas.find(function (item) { return item.id === id; });
  if (!reserva) return;

  preencherSelectApartamentos(document.getElementById('editarApartamento'), reserva.apartamentoId);
  document.getElementById('editarReservaId').value = reserva.id;
  document.getElementById('editarHospede').value = reserva.hospede;
  document.getElementById('editarCanal').value = reserva.canal;
  document.getElementById('editarEntrada').value = reserva.entrada;
  document.getElementById('editarSaida').value = reserva.saida;
  mensagemEditarReserva.innerHTML = '';
  modalEditarReserva.classList.add('aberto');
}

function fecharModalEdicaoReserva() {
  modalEditarReserva.classList.remove('aberto');
}

fecharEditarReserva.addEventListener('click', fecharModalEdicaoReserva);
fecharEditarReservaFundo.addEventListener('click', fecharModalEdicaoReserva);

formEditarReserva.addEventListener('submit', async function (evento) {
  evento.preventDefault();

  const id = Number(document.getElementById('editarReservaId').value);
  const dados = {
    hospede: document.getElementById('editarHospede').value.trim(),
    canal: document.getElementById('editarCanal').value,
    entrada: document.getElementById('editarEntrada').value,
    saida: document.getElementById('editarSaida').value,
    apartamentoId: Number(document.getElementById('editarApartamento').value)
  };

  const resposta = await fetch('/api/reservas/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    mensagemEditarReserva.innerHTML = '<p class="erro">' + resultado.erro + '</p>';
    return;
  }

  fecharModalEdicaoReserva();
  await carregarReservas();
});

function pedirExclusaoReserva(id) {
  const reserva = reservas.find(function (item) { return item.id === id; });
  if (!reserva) return;

  reservaParaExcluir = id;
  document.getElementById('textoConfirmacaoExclusao').textContent =
    'Reserva de ' + reserva.hospede + ', de ' + formatarData(reserva.entrada) +
    ' até ' + formatarData(reserva.saida) + '.';
  modalConfirmarExclusao.classList.add('aberto');
}

function fecharConfirmacaoExclusao() {
  reservaParaExcluir = null;
  modalConfirmarExclusao.classList.remove('aberto');
}

cancelarExclusao.addEventListener('click', fecharConfirmacaoExclusao);
fecharExclusaoFundo.addEventListener('click', fecharConfirmacaoExclusao);

confirmarExclusao.addEventListener('click', async function () {
  if (!reservaParaExcluir) return;

  await fetch('/api/reservas/' + reservaParaExcluir, { method: 'DELETE' });
  fecharConfirmacaoExclusao();
  await carregarReservas();
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

  await carregarReservas();

  const disponiveis = apartamentos.filter(function (apartamento) {
    return apartamentoEstaLivre(apartamento.id, entrada, saida);
  });

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
        <button type="button" class="reservar-flat" onclick="iniciarReservaComDados(${disponiveis[i].id}, '${entrada}', '${saida}')">
          Reservar este flat
        </button>
      </div>
    `;
  }

  html += '</div>';
  resultadoDisponibilidade.innerHTML = html;
});

formulario.addEventListener('submit', async function (evento) {
  evento.preventDefault();
  mensagem.innerHTML = '';

  const dados = {
    hospede: document.getElementById('hospede').value.trim(),
    canal: document.getElementById('canal').value,
    entrada: document.getElementById('entrada').value,
    saida: document.getElementById('saida').value,
    apartamentoId: Number(document.getElementById('apartamento').value)
  };

  const resposta = await fetch('/api/reservas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    mensagem.innerHTML = '<p class="erro">' + resultado.erro + '</p>';
    return;
  }

  mensagem.innerHTML = `
    <div class="sucesso sucesso-detalhado">
      <strong>Reserva cadastrada com sucesso.</strong>
      <span>${dados.hospede} · ${nomeDoApartamento(dados.apartamentoId)} · ${formatarData(dados.entrada)} a ${formatarData(dados.saida)}</span>
      <button type="button" onclick="mostrarReservaRecemCriada(${resultado.id})">Ver no calendário</button>
    </div>
  `;

  formulario.reset();
  await carregarReservas();
});

function mostrarReservaRecemCriada(id) {
  mostrarTela('lista');
  irParaReservaNoCalendario(id);
}

formFlat.addEventListener('submit', async function (evento) {
  evento.preventDefault();
  mensagemFlat.innerHTML = '';

  const dados = {
    empreendimento: document.getElementById('flatEmpreendimento').value.trim(),
    numero: document.getElementById('flatNumero').value.trim(),
    localizacao: document.getElementById('flatLocalizacao').value.trim(),
    checkin: document.getElementById('flatCheckin').value,
    checkout: document.getElementById('flatCheckout').value
  };

  const resposta = await fetch('/api/apartamentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    mensagemFlat.innerHTML = '<p class="erro">' + resultado.erro + '</p>';
    return;
  }

  mensagemFlat.innerHTML = '<p class="sucesso">Flat cadastrado com sucesso.</p>';
  formFlat.reset();
  document.getElementById('flatCheckin').value = '14:00';
  document.getElementById('flatCheckout').value = '11:00';
  await carregarApartamentos();
});

function renderizarListaFlats() {
  if (!listaFlats) return;

  if (apartamentos.length === 0) {
    listaFlats.innerHTML = '<div class="estado-vazio"><strong>Nenhum flat cadastrado</strong><span>Use o formulário acima para cadastrar o primeiro.</span></div>';
    return;
  }

  let html = '';

  for (let i = 0; i < apartamentos.length; i++) {
    const apartamento = apartamentos[i];

    html += `
      <div class="flat-card">
        <div class="flat-card-topo">
          <div>
            <span class="subtitulo">Apartamento ${apartamento.numero}</span>
            <h4>${apartamento.empreendimento}</h4>
          </div>
          <button type="button" class="acao-link" onclick="abrirEditarFlat(${apartamento.id})">Editar</button>
        </div>
        <p>${apartamento.localizacao}</p>
        <div class="flat-horarios">
          <span>Check-in <strong>${apartamento.checkin}</strong></span>
          <span>Check-out <strong>${apartamento.checkout}</strong></span>
        </div>
      </div>
    `;
  }

  listaFlats.innerHTML = html;
}

function abrirEditarFlat(id) {
  const apartamento = apartamentos.find(function (item) { return item.id === id; });
  if (!apartamento) return;

  document.getElementById('editarFlatId').value = apartamento.id;
  document.getElementById('editarFlatEmpreendimento').value = apartamento.empreendimento;
  document.getElementById('editarFlatNumero').value = apartamento.numero;
  document.getElementById('editarFlatLocalizacao').value = apartamento.localizacao;
  document.getElementById('editarFlatCheckin').value = apartamento.checkin;
  document.getElementById('editarFlatCheckout').value = apartamento.checkout;
  mensagemEditarFlat.innerHTML = '';
  modalEditarFlat.classList.add('aberto');
}

function fecharModalEdicaoFlat() {
  modalEditarFlat.classList.remove('aberto');
}

fecharEditarFlat.addEventListener('click', fecharModalEdicaoFlat);
fecharEditarFlatFundo.addEventListener('click', fecharModalEdicaoFlat);

formEditarFlat.addEventListener('submit', async function (evento) {
  evento.preventDefault();

  const id = Number(document.getElementById('editarFlatId').value);
  const dados = {
    empreendimento: document.getElementById('editarFlatEmpreendimento').value.trim(),
    numero: document.getElementById('editarFlatNumero').value.trim(),
    localizacao: document.getElementById('editarFlatLocalizacao').value.trim(),
    checkin: document.getElementById('editarFlatCheckin').value,
    checkout: document.getElementById('editarFlatCheckout').value
  };

  const resposta = await fetch('/api/apartamentos/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    mensagemEditarFlat.innerHTML = '<p class="erro">' + resultado.erro + '</p>';
    return;
  }

  fecharModalEdicaoFlat();
  await carregarApartamentos();
});

document.addEventListener('keydown', function (evento) {
  if (evento.key === 'Escape') {
    fecharDetalhesReserva();
    fecharModalEdicaoReserva();
    fecharModalEdicaoFlat();
    fecharConfirmacaoExclusao();
  }
});

window.mostrarDetalhesReserva = mostrarDetalhesReserva;
window.irParaReservaNoCalendario = irParaReservaNoCalendario;
window.prepararReservaDia = prepararReservaDia;
window.iniciarReservaComDados = iniciarReservaComDados;
window.abrirEditarReserva = abrirEditarReserva;
window.pedirExclusaoReserva = pedirExclusaoReserva;
window.mostrarReservaRecemCriada = mostrarReservaRecemCriada;
window.abrirEditarFlat = abrirEditarFlat;

async function iniciar() {
  await carregarApartamentos();
  await carregarReservas();
  renderizarDashboard();
}

iniciar();
