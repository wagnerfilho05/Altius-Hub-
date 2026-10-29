# Altius Hub

Projeto acadêmico do curso de Sistemas de Informação.

## Objetivo

O projeto foi criado para organizar reservas de apartamentos em um único lugar. Nesta primeira versão é possível cadastrar uma reserva, verificar se o apartamento está disponível e consultar as informações da hospedagem.

## Tecnologias usadas

- HTML
- CSS
- JavaScript
- Node.js
- Arquivo JSON para salvar os dados

A escolha foi feita para manter o projeto simples nesta fase da disciplina.

## O que foi feito na Semana 1

- Tela de nova reserva;
- Tela com as reservas cadastradas;
- Página com informações da hospedagem;
- Organização inicial do projeto;
- Rotas básicas do sistema.

## O que foi feito na Semana 2

- Cadastro de reservas funcionando;
- Verificação de conflito de datas;
- Associação da reserva ao apartamento;
- Salvamento das reservas em arquivo JSON;
- Página de informações do hóspede.

## Apartamentos cadastrados

### Boulevard Plaza
- 301
- 302
- 604

### Residencial Sirius
- 107
- 206
- 207
- 403

## Como executar

Abra o terminal dentro da pasta do projeto e execute:

```bash
npm start
```

No navegador, acesse:

```text
http://localhost:3000
```

## Teste simples para a apresentação

1. Cadastre uma reserva;
2. Abra a tela de reservas cadastradas;
3. Abra as informações da hospedagem;
4. Tente cadastrar outra reserva no mesmo apartamento e nas mesmas datas;
5. O sistema deve informar que o apartamento já está reservado.

## Melhorias futuras

- Banco de dados de verdade;
- Tela para cadastrar apartamentos;
- Calendário de reservas;
- Login;
- Integração com Airbnb e Booking.
