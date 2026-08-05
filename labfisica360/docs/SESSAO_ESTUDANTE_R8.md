# Sessão local do estudante — R8 / v0.4.7

## Finalidade

A sessão identifica quem está utilizando a plataforma e produz uma evidência local dos laboratórios visitados. Ela não é uma conta online e não substitui autenticação de servidor.

## Dados registrados

- nome do estudante;
- turma;
- turno: manhã, tarde ou noite;
- início e atualização da sessão;
- laboratório ou página acessada;
- quantidade de acessos por rota;
- primeiro e último acesso;
- tempo ativo em cada rota;
- eventos de abertura, saída, pausa e retomada.

O cronômetro só avança enquanto a página está visível e existe uma rota ativa. A interface recebe atualização aproximadamente a cada cinco segundos.

## Ações disponíveis

- iniciar sessão;
- continuar como visitante;
- trocar estudante;
- encerrar e sair;
- exportar a sessão atual em JSON;
- exportar uma tabela CSV;
- consultar tempo ativo e laboratórios visitados.

Ao trocar ou sair, a sessão anterior é finalizada e armazenada no histórico local. O histórico é limitado às doze sessões mais recentes para evitar crescimento indefinido.

## Armazenamento e privacidade

Os dados ficam em `localStorage` no próprio navegador. Nenhuma informação é enviada automaticamente. O arquivo só é criado quando o usuário aciona um botão de exportação.

Esse mecanismo deve ser descrito como **identificação local**, e não como login seguro. Qualquer pessoa com acesso ao mesmo perfil do navegador pode alterar ou apagar os dados locais.

## Estrutura da exportação

A exportação JSON inclui:

- plataforma e versão;
- data de geração;
- perfil;
- sessão atual;
- rotas e tempos;
- totais de participação;
- histórico somente quando solicitado pela API.

O CSV gera uma linha por rota com estudante, turma, turno, título, tipo, acessos, tempo e datas.

## Arquivo principal

`js/session/student-session.js`
