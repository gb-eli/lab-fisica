# Matriz de Validação em Dispositivos

## Finalidade

Registrar testes reais da Física Imersiva 360 em diferentes aparelhos sem coletar dados pessoais ou enviar informações para servidores.

## Diagnóstico automático

A plataforma verifica:

- tamanho do viewport;
- densidade de pixels;
- suporte a WebGL 2 ou WebGL 1;
- quantidade de controles abaixo de 40 px;
- armazenamento local;
- tela cheia;
- suporte a Service Worker;
- última métrica disponível da cena 3D.

## Checklist manual

O avaliador deve classificar cada item como aprovado, ressalva ou falha:

1. sombras, materiais e iluminação;
2. toque, pinça e precisão;
3. legibilidade de textos, gráficos e displays;
4. retrato, paisagem e áreas seguras;
5. aquecimento após uso prolongado;
6. consumo de bateria.

## Roteiro recomendado

1. abrir a plataforma em conexão normal;
2. instalar ou recarregar a PWA;
3. abrir Hall, Eletricidade, Mecânica e Física Avançada;
4. testar órbita, pinça, dois dedos, toque duplo e barra da câmera;
5. alternar entre Econômico, Médio, Alto e Automático;
6. permanecer pelo menos 15 minutos em uma cena pesada;
7. observar temperatura e bateria do aparelho;
8. preencher os seis itens manuais;
9. salvar o aparelho;
10. exportar JSON e CSV.

## Perfis prioritários

| Perfil | Viewport aproximado | Entrada | Objetivo |
|---|---:|---|---|
| Celular compacto | 320–360 px | toque | verificar sobreposição e tamanho dos controles |
| Celular comum | 390–430 px | toque | experiência principal mobile |
| Tablet | 768–1024 px | toque/teclado | painéis, paisagem e multitarefa |
| Chromebook | 1366×768 | touchpad/teclado | laboratório escolar |
| Notebook/desktop | 1920×1080 | mouse/teclado | perfil Alto/Ultra |

## Privacidade

- resultados ficam no `localStorage`;
- o nome do aparelho é um rótulo livre;
- não informar nome de aluno, escola, turma, endereço ou localização;
- exportações são geradas localmente.

## Critério de encerramento

A validação real só pode ser declarada concluída quando existir ao menos um relatório salvo para celular, tablet ou Chromebook e computador, com os itens manuais preenchidos.
