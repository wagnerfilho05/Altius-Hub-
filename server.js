const http = require('http');
const fs = require('fs');
const path = require('path');

const porta = 3000;
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

    callback(JSON.parse(corpo));
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

    if (nomeArquivo.endsWith('.css')) {
      tipo = 'text/css';
    }

    if (nomeArquivo.endsWith('.js')) {
      tipo = 'application/javascript';
    }

    res.writeHead(200, { 'Content-Type': tipo + '; charset=utf-8' });
    res.end(arquivo);
  });
}

const servidor = http.createServer(function (req, res) {
  const endereco = new URL(req.url, 'http://localhost:' + porta);
  const rota = endereco.pathname;

  if (rota === '/api/apartamentos' && req.method === 'GET') {
    const banco = lerBanco();
    responderJson(res, 200, banco.apartamentos);
    return;
  }

  if (rota === '/api/reservas' && req.method === 'GET') {
    const banco = lerBanco();
    responderJson(res, 200, banco.reservas);
    return;
  }

  if (rota === '/api/reservas' && req.method === 'POST') {
    lerCorpo(req, function (novaReserva) {
      if (!novaReserva.hospede || !novaReserva.canal || !novaReserva.entrada || !novaReserva.saida || !novaReserva.apartamentoId) {
        responderJson(res, 400, { erro: 'Preencha todos os campos.' });
        return;
      }

      if (novaReserva.entrada >= novaReserva.saida) {
        responderJson(res, 400, { erro: 'O check-out precisa ser depois do check-in.' });
        return;
      }

      const banco = lerBanco();
      const apartamentoId = Number(novaReserva.apartamentoId);

      for (let i = 0; i < banco.reservas.length; i++) {
        const reserva = banco.reservas[i];

        if (reserva.apartamentoId === apartamentoId) {
          const conflito = novaReserva.entrada < reserva.saida && novaReserva.saida > reserva.entrada;

          if (conflito) {
            responderJson(res, 409, { erro: 'Esse apartamento já está reservado nesse período.' });
            return;
          }
        }
      }

      let novoId = 1;

      if (banco.reservas.length > 0) {
        novoId = banco.reservas[banco.reservas.length - 1].id + 1;
      }

      const reservaSalva = {
        id: novoId,
        hospede: novaReserva.hospede,
        canal: novaReserva.canal,
        entrada: novaReserva.entrada,
        saida: novaReserva.saida,
        apartamentoId: apartamentoId,
        status: 'Confirmada'
      };

      banco.reservas.push(reservaSalva);
      salvarBanco(banco);
      responderJson(res, 201, reservaSalva);
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
      }
    }

    if (!reservaEncontrada) {
      responderJson(res, 404, { erro: 'Reserva não encontrada.' });
      return;
    }

    for (let i = 0; i < banco.apartamentos.length; i++) {
      if (banco.apartamentos[i].id === reservaEncontrada.apartamentoId) {
        apartamentoEncontrado = banco.apartamentos[i];
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
    const novasReservas = [];

    for (let i = 0; i < banco.reservas.length; i++) {
      if (banco.reservas[i].id !== id) {
        novasReservas.push(banco.reservas[i]);
      }
    }

    banco.reservas = novasReservas;
    salvarBanco(banco);
    responderJson(res, 200, { mensagem: 'Reserva excluída.' });
    return;
  }

  if (rota === '/') {
    enviarArquivo(res, 'index.html');
    return;
  }

  if (rota === '/index.html') {
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

  res.writeHead(404);
  res.end('Página não encontrada');
});

servidor.listen(porta, function () {
  console.log('Projeto rodando em http://localhost:' + porta);
});
