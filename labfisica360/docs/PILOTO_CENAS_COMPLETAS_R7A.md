# Fase R7A — Infraestrutura local e piloto das cenas completas

Versão: 0.4.6

## Objetivo

Preparar Hall, Eletrostática e Eletricidade para um piloto 3D completo sem permitir que dependências externas ou telas pretas sejam tratadas como sucesso.

## Implementado

- carregador do Three.js com prioridade local e relatório da origem;
- opção para proibir carregamento remoto;
- inspeção dos módulos locais antes da inicialização;
- manifesto reprodutível do vendor;
- ferramenta para obter e verificar os módulos oficiais fixados;
- piloto automatizado das três rotas prioritárias em desktop e mobile;
- critérios para primeiro quadro, interação, GLB, console e fallback;
- registro explícito de bloqueio quando os binários ou a navegação não estão disponíveis.

## Estado atual

A infraestrutura está funcional, mas os arquivos `three.module.min.js` e `three.core.min.js` ainda não puderam ser incorporados ao pacote neste ambiente. A resolução externa de rede está bloqueada e o navegador automatizado impede a navegação para o servidor local. Por isso, as seis combinações de cena completa permanecem pendentes.

## Critério de conclusão da R7B

A fase completa somente poderá ser aprovada quando:

1. os dois módulos estiverem fisicamente em `vendor/three/`;
2. o modo somente local iniciar sem rede;
3. Hall, Eletrostática e Eletricidade produzirem primeiro quadro;
4. câmera, zoom, seleção e cenários responderem;
5. os GLBs da bancada carregarem;
6. não houver erros de console;
7. desktop e mobile produzirem capturas válidas.
