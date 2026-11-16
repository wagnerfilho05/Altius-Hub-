const http = require('http');
const fs = require('fs');
const path = require('path');

const porta = process.env.PORT || 3000;
const pastaPublica = path.join(__dirname, 'public');
const arquivoBanco = path.join(__dirname, 'data', 'db.json');

function lerBanco() {
  const texto = fs.readFileSync(arquivoBanco, 'utf8');
  return JSON.parse(texto);
}

function salvarBanco(banco) {
  fs.writeFileSync(arquivoBanco, JSON.stringify(banco, null, 2));
}

function responderJson(res, status, dados) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(dados));
}

function lerCorpo(req, callback) {
  let corpo = '';

  req.on('data', function (parte) {
    corpo += parte;
  });

  req.on('end', function () {
    if (corpo === '') {
      callback({});
      return;
    }

    try {
      callback(JSON.parse(corpo));
    } catch (erro) {
      callback({});
    }
  });
}

function enviarArquivo(res, nomeArquivo) {
  const caminho = path.join(pastaPublica, nomeArquivo);

  fs.readFile(caminho, function (erro, arquivo) {
    if (erro) {
      res.writeHead(404);
      res.end('Arquivo não encontrado');
      return;
    }

    let tipo = 'text/html';

    if (nomeArquivo.endsWith('.css')) tipo = 'text/css';
    if (nomeArquivo.endsWith('.js')) tipo = 'application/javascript';
    if (nomeArquivo.endsWith('.svg')) tipo = 'image/svg+xml';

    res.writeHead(200, {
      'Content-Type': tipo + '; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.end(arquivo);
  });
}

function proximoId(lista) {
  let maior = 0;

  for (let i = 0; i < lista.length; i++) {
    if (lista[i].id > maior) maior = lista[i].id;
  }

  return maior + 1;
}

function validarApartamento(banco, dados, ignorarId) {
  const empreendimento = String(dados.empreendimento || '').trim();
  const numero = String(dados.numero || '').trim();

  if (!empreendimento || !numero || !dados.localizacao || !dados.checkin || !dados.checkout) {
    return { erro: 'Preencha todos os campos do flat.' };
  }

  for (let i = 0; i < banco.apartamentos.length; i++) {
    const apartamento = banco.apartamentos[i];

    if (
      apartamento.id !== ignorarId &&
      apartamento.empreendimento.toLowerCase() === empreendimento.toLowerCase() &&
      String(apartamento.numero).toLowerCase() === numero.toLowerCase()
    ) {
      return { erro: 'Esse flat já está cadastrado nesse empreendimento.' };
    }
  }

  return {
    empreendimento: empreendimento,
    numero: numero,
    localizacao: String(dados.localizacao).trim(),
    checkin: dados.checkin,
    checkout: dados.checkout
  };
}

function validarReserva(banco, dados, ignorarId) {
  if (!dados.hospede || !dados.canal || !dados.entrada || !dados.saida || !dados.apartamentoId) {
    return { erro: 'Preencha todos os campos.' };
  }

  if (dados.entrada >= dados.saida) {
    return { erro: 'O check-out precisa ser depois do check-in.' };
  }

  const apartamentoId = Number(dados.apartamentoId);
  let existeApartamento = false;

  for (let i = 0; i < banco.apartamentos.length; i++) {
    if (banco.apartamentos[i].id === apartamentoId) {
      existeApartamento = true;
      break;
    }
  }

  if (!existeApartamento) {
    return { erro: 'Apartamento não encontrado.' };
  }

  for (let i = 0; i < banco.reservas.length; i++) {
    const reserva = banco.reservas[i];

    if (
      reserva.id !== ignorarId &&
      reserva.apartamentoId === apartamentoId &&
      dados.entrada < reserva.saida &&
      dados.saida > reserva.entrada
    ) {
      return { erro: 'Esse apartamento já está reservado nesse período.' };
    }
  }

  return {
    hospede: String(dados.hospede).trim(),
    canal: dados.canal,
    entrada: dados.entrada,
    saida: dados.saida,
    apartamentoId: apartamentoId
  };
}

const servidor = http.createServer(function (req, res) {
  const endereco = new URL(req.url, 'http://localhost:' + porta);
  const rota = endereco.pathname;

  if (rota === '/api/apartamentos' && req.method === 'GET') {
    const banco = lerBanco();
    responderJson(res, 200, banco.apartamentos);
    return;
  }

  if (rota === '/api/apartamentos' && req.method === 'POST') {
    lerCorpo(req, function (dados) {
      const banco = lerBanco();
      const validacao = validarApartamento(banco, dados, null);

      if (validacao.erro) {
        responderJson(res, 400, validacao);
        return;
      }

      const apartamento = {
        id: proximoId(banco.apartamentos),
        empreendimento: validacao.empreendimento,
        numero: validacao.numero,
        nome: validacao.empreendimento + ' — Apto ' + validacao.numero,
        localizacao: validacao.localizacao,
        checkin: validacao.checkin,
        checkout: validacao.checkout
      };

      banco.apartamentos.push(apartamento);
      salvarBanco(banco);
      responderJson(res, 201, apartamento);
    });
    return;
  }

  if (rota.startsWith('/api/apartamentos/') && req.method === 'PUT') {
    const id = Number(rota.split('/')[3]);

    lerCorpo(req, function (dados) {
      const banco = lerBanco();
      const validacao = validarApartamento(banco, dados, id);

      if (validacao.erro) {
        responderJson(res, 400, validacao);
        return;
      }

      let encontrado = false;

      for (let i = 0; i < banco.apartamentos.length; i++) {
        if (banco.apartamentos[i].id === id) {
          banco.apartamentos[i].empreendimento = validacao.empreendimento;
          banco.apartamentos[i].numero = validacao.numero;
          banco.apartamentos[i].nome = validacao.empreendimento + ' — Apto ' + validacao.numero;
          banco.apartamentos[i].localizacao = validacao.localizacao;
          banco.apartamentos[i].checkin = validacao.checkin;
          banco.apartamentos[i].checkout = validacao.checkout;
          encontrado = true;
          break;
        }
      }

      if (!encontrado) {
        responderJson(res, 404, { erro: 'Flat não encontrado.' });
        return;
      }

      salvarBanco(banco);
      responderJson(res, 200, { mensagem: 'Flat atualizado.' });
    });
    return;
  }

  if (rota.startsWith('/api/apartamentos/') && req.method === 'DELETE') {
    const id = Number(rota.split('/')[3]);
    const banco = lerBanco();

    let apartamentoExiste = false;

    for (let i = 0; i < banco.apartamentos.length; i++) {
      if (banco.apartamentos[i].id === id) {
        apartamentoExiste = true;
        break;
      }
    }

    if (!apartamentoExiste) {
      responderJson(res, 404, { erro: 'Flat não encontrado.' });
      return;
    }

    for (let i = 0; i < banco.reservas.length; i++) {
      if (banco.reservas[i].apartamentoId === id) {
        responderJson(res, 409, {
          erro: 'Esse flat possui reservas vinculadas e não pode ser removido enquanto houver histórico associado.'
        });
        return;
      }
    }

    banco.apartamentos = banco.apartamentos.filter(function (apartamento) {
      return apartamento.id !== id;
    });

    salvarBanco(banco);
    responderJson(res, 200, { mensagem: 'Flat removido com sucesso.' });
    return;
  }

  if (rota === '/api/reservas' && req.method === 'GET') {
    const banco = lerBanco();
    responderJson(res, 200, banco.reservas);
    return;
  }

  if (rota === '/api/reservas' && req.method === 'POST') {
    lerCorpo(req, function (dados) {
      const banco = lerBanco();
      const validacao = validarReserva(banco, dados, null);

      if (validacao.erro) {
        responderJson(res, 409, validacao);
        return;
      }

      const reserva = {
        id: proximoId(banco.reservas),
        hospede: validacao.hospede,
        canal: validacao.canal,
        entrada: validacao.entrada,
        saida: validacao.saida,
        apartamentoId: validacao.apartamentoId,
        status: 'Confirmada'
      };

      banco.reservas.push(reserva);
      salvarBanco(banco);
      responderJson(res, 201, reserva);
    });
    return;
  }

  if (rota.startsWith('/api/reservas/') && req.method === 'PUT') {
    const id = Number(rota.split('/')[3]);

    lerCorpo(req, function (dados) {
      const banco = lerBanco();
      const validacao = validarReserva(banco, dados, id);

      if (validacao.erro) {
        responderJson(res, 409, validacao);
        return;
      }

      let encontrado = false;

      for (let i = 0; i < banco.reservas.length; i++) {
        if (banco.reservas[i].id === id) {
          banco.reservas[i].hospede = validacao.hospede;
          banco.reservas[i].canal = validacao.canal;
          banco.reservas[i].entrada = validacao.entrada;
          banco.reservas[i].saida = validacao.saida;
          banco.reservas[i].apartamentoId = validacao.apartamentoId;
          encontrado = true;
          break;
        }
      }

      if (!encontrado) {
        responderJson(res, 404, { erro: 'Reserva não encontrada.' });
        return;
      }

      salvarBanco(banco);
      responderJson(res, 200, { mensagem: 'Reserva atualizada.' });
    });
    return;
  }

  if (rota.startsWith('/api/reservas/') && req.method === 'GET') {
    const id = Number(rota.split('/')[3]);
    const banco = lerBanco();
    let reservaEncontrada = null;
    let apartamentoEncontrado = null;

    for (let i = 0; i < banco.reservas.length; i++) {
      if (banco.reservas[i].id === id) {
        reservaEncontrada = banco.reservas[i];
        break;
      }
    }

    if (!reservaEncontrada) {
      responderJson(res, 404, { erro: 'Reserva não encontrada.' });
      return;
    }

    for (let i = 0; i < banco.apartamentos.length; i++) {
      if (banco.apartamentos[i].id === reservaEncontrada.apartamentoId) {
        apartamentoEncontrado = banco.apartamentos[i];
        break;
      }
    }

    responderJson(res, 200, {
      id: reservaEncontrada.id,
      hospede: reservaEncontrada.hospede,
      canal: reservaEncontrada.canal,
      entrada: reservaEncontrada.entrada,
      saida: reservaEncontrada.saida,
      apartamentoId: reservaEncontrada.apartamentoId,
      status: reservaEncontrada.status,
      apartamento: apartamentoEncontrado
    });
    return;
  }

  if (rota.startsWith('/api/reservas/') && req.method === 'DELETE') {
    const id = Number(rota.split('/')[3]);
    const banco = lerBanco();
    const novasReservas = banco.reservas.filter(function (reserva) {
      return reserva.id !== id;
    });

    if (novasReservas.length === banco.reservas.length) {
      responderJson(res, 404, { erro: 'Reserva não encontrada.' });
      return;
    }

    banco.reservas = novasReservas;
    salvarBanco(banco);
    responderJson(res, 200, { mensagem: 'Reserva excluída.' });
    return;
  }

  if (rota === '/' || rota === '/index.html') {
    enviarArquivo(res, 'index.html');
    return;
  }

  if (rota === '/style.css') {
    enviarArquivo(res, 'style.css');
    return;
  }

  if (rota === '/app.js') {
    enviarArquivo(res, 'app.js');
    return;
  }

  if (rota === '/hospedagem.html') {
    enviarArquivo(res, 'hospedagem.html');
    return;
  }

  if (rota === '/altius-wordmark.svg') {
    enviarArquivo(res, 'altius-wordmark.svg');
    return;
  }

  res.writeHead(404);
  res.end('Página não encontrada');
});

servidor.listen(porta, '0.0.0.0', function () {
  console.log('Projeto rodando na porta ' + porta);
});
