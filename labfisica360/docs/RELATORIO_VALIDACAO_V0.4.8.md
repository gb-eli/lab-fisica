# Relatório de Validação — Física Imersiva 360 v0.4.8

## Escopo

Validação da Fase R9.1: Modo Livre, carregamento sob demanda dos mentores, seleção de mentor, destaque dos alvos, progressão, persistência, sessão do estudante, acessibilidade e responsividade.

## Resultado funcional

- três mentores cadastrados;
- nove roteiros;
- 41 etapas;
- 41 de 41 seletores encontrados no DOM real dos laboratórios;
- avanço por clique, input, change e checkpoint manual;
- retomada local;
- exportação de evidência;
- Modo Livre restaurado corretamente;
- nenhum recurso de mentor carregado no shell inicial.

## Playtest Chromium

Perfis testados:

- desktop 1365 × 768;
- celular 390 × 844.

Nos dois perfis:

- zero requisições de mentor no carregamento inicial;
- CSS e cinco módulos JavaScript carregados apenas após a escolha do modo;
- quatro alvos consecutivos do roteiro Newton/Mecânica destacados e acionados;
- roteiro concluído;
- eventos registrados na sessão;
- retorno ao Modo Livre ocultou o HUD;
- nenhum overflow horizontal;
- nenhum erro de console.

## Defeito encontrado e corrigido

No celular, o HUD podia ocupar a mesma região do botão que estava orientando. O painel passou a detectar a posição do alvo, mover-se para o lado oposto e permitir passagem de clique pelas áreas não interativas.

## Regressão

- suíte científica e estrutural completa aprovada;
- modularização R8 preservada;
- shell inicial permanece sem Three.js, GLB, módulos de laboratório ou mentores;
- carregamento e cleanup de Eletrostática e Eletricidade preservados;
- sintaxe de todos os módulos JavaScript aprovada;
- arquivos JSON e webmanifest válidos;
- referências do shell offline sem ausências.

## Orçamento

- aproximadamente 845 KiB de JavaScript no projeto completo;
- aproximadamente 186 KiB de CSS;
- aproximadamente 808 KiB de GLB;
- grafo inicial: 133.531 bytes de JavaScript e 70.688 bytes de CSS;
- nenhum recurso 3D ou de mentor no shell inicial.

## Limitações

- apenas Einstein, Newton e Faraday estão implementados;
- apenas Mecânica, Eletrostática e Eletricidade possuem roteiros R9.1;
- os mentores são narrativas pedagógicas inspiradas historicamente, não chatbots nem reconstituições pessoais;
- a sessão permanece local, sem autenticação de servidor;
- validação de GPU física, toque prolongado e Three.js totalmente local permanece pendente.
