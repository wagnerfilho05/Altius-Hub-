# Entrega - Semana 1 e Semana 2

## Semana 1

Na primeira semana foi criada a estrutura inicial do projeto Altius Hub. O objetivo é organizar as reservas dos apartamentos e deixar as informações mais centralizadas.

Foram feitas as telas de nova reserva, reservas cadastradas e informações da hospedagem. Também foi criada a estrutura inicial do servidor e do arquivo utilizado para salvar os dados.

Tecnologias escolhidas:

- HTML;
- CSS;
- JavaScript;
- Node.js;
- JSON para salvar os dados do protótipo.

A escolha dessas tecnologias foi feita para deixar o projeto mais simples nesta primeira versão.

## Semana 2

Na segunda semana foi implementado o fluxo principal da reserva.

O usuário informa o nome do hóspede, o canal da reserva, as datas e o apartamento. Antes de salvar, o sistema verifica se já existe uma reserva para o mesmo apartamento naquele período.

Se o apartamento estiver disponível, a reserva é cadastrada. Depois ela aparece na lista de reservas e é possível abrir uma página com as informações da hospedagem.

### Fluxo testado

1. Cadastrar uma nova reserva;
2. Selecionar o apartamento;
3. Verificar a disponibilidade;
4. Salvar a reserva;
5. Consultar a reserva cadastrada;
6. Abrir as informações da hospedagem.

Também foi testada uma situação em que o mesmo apartamento é reservado nas mesmas datas. Nesse caso, o sistema mostra uma mensagem de que o apartamento já está reservado.

## O que pode ser melhorado depois

- Usar PostgreSQL ou MySQL;
- Criar um calendário visual;
- Criar login;
- Cadastrar apartamentos pelo próprio sistema;
- Fazer integração com Airbnb e Booking.
