# Altius Hub

Projeto acadêmico do curso de Sistemas de Informação.

## Objetivo

O Altius Hub foi criado para ajudar na organização de reservas de apartamentos em um único lugar.

A ideia surgiu porque as reservas podem chegar por canais diferentes, como WhatsApp, Instagram, Airbnb e Booking. Com isso, fica mais difícil acompanhar datas e disponibilidade dos apartamentos.

Nesta versão do MVP é possível cadastrar uma reserva, verificar conflito de datas, consultar as reservas cadastradas e visualizar informações da hospedagem.

## Aplicação publicada

A versão atual do MVP está publicada no Render:

https://altius-hub.onrender.com

## Tecnologias usadas

- HTML
- CSS
- JavaScript
- Node.js
- Arquivo JSON para salvar os dados

A escolha dessas tecnologias foi feita para manter o projeto simples e compatível com o que foi estudado nesta fase do curso.

## Funcionalidades

- Cadastro de reservas;
- Seleção do canal de origem da reserva;
- Seleção do apartamento;
- Validação de campos obrigatórios;
- Validação das datas de check-in e check-out;
- Verificação de conflito de datas para o mesmo apartamento;
- Listagem das reservas cadastradas;
- Exclusão de reservas;
- Página com informações da hospedagem.

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

## Validações do sistema

Antes de cadastrar uma reserva, o sistema verifica:

- Se todos os campos foram preenchidos;
- Se o check-out acontece depois do check-in;
- Se já existe outra reserva para o mesmo apartamento no período informado.

Caso exista conflito, o cadastro não é realizado e o sistema mostra uma mensagem para o usuário.

## Validação com usuários

Após a publicação do MVP, o sistema foi disponibilizado para 7 pessoas realizarem um teste de uso.

Os participantes testaram o cadastro de reserva, consulta das informações e a validação de conflito de datas. Depois do teste, responderam um formulário de avaliação.

### Resultados

- 100% conseguiram entender facilmente como cadastrar uma reserva;
- 100% consideraram fácil identificar o apartamento e as datas da hospedagem;
- 100% consideraram clara a mensagem de conflito de datas;
- 100% responderam que o sistema facilita a organização das reservas em diferentes canais;
- Todos os 7 participantes deram nota 5 de 5 para a facilidade de utilização;
- 6 dos 7 participantes (85,7%) responderam que utilizariam uma ferramenta desse tipo para organizar reservas.

## Formulário de avaliação

O formulário utilizado na validação está disponível em:

https://forms.gle/zkT9gW6SrQqhaWUu8

## Sugestões recebidas

Entre as sugestões dos participantes apareceram:

- Criar um calendário mostrando os dias ocupados e disponíveis;
- Adicionar filtros por apartamento e por data;
- Criar uma busca pelo nome do hóspede;
- Organizar as reservas por data;
- Diferenciar visualmente reservas atuais, futuras e encerradas;
- Continuar evoluindo a centralização das reservas.

Essas sugestões podem ser utilizadas em versões futuras do projeto.

## Como executar

Abra o terminal dentro da pasta do projeto e execute:

```bash
npm start
```

No navegador, acesse:

```text
http://localhost:3000
```

## Teste simples para apresentação

1. Cadastre uma reserva;
2. Abra a tela de reservas cadastradas;
3. Abra as informações da hospedagem;
4. Tente cadastrar outra reserva no mesmo apartamento e em datas que tenham conflito;
5. O sistema deve impedir o cadastro e informar que o apartamento já está reservado no período.

## Melhorias futuras

- Utilizar um banco de dados;
- Criar calendário de reservas;
- Adicionar filtros e pesquisa;
- Criar tela de cadastro de apartamentos;
- Criar sistema de login;
- Permitir edição das reservas;
- Organizar reservas por status e data;
- Integrar com Airbnb e Booking.

## Observação

Esta versão foi desenvolvida como um MVP acadêmico. O objetivo principal foi validar o fluxo de cadastro e controle básico das reservas antes de adicionar funcionalidades mais avançadas.
