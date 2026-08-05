# Relatório de Validação — v0.4.6

## Resultado

**R7A aprovada como infraestrutura parcial. R7B não aprovada.**

## Aprovado

- carregador local-first;
- configuração de bloqueio da rede;
- diagnóstico da origem do Three.js;
- manifesto e verificador do vendor;
- watchdog e fallback 2D preservados;
- suíte científica e estrutural;
- sintaxe JavaScript;
- integridade de JSON e cache;
- relatório de piloto determinístico.

## Bloqueios encontrados

- ausência física de `vendor/three/three.module.min.js`;
- ausência física de `vendor/three/three.core.min.js`;
- DNS externo indisponível no ambiente de construção;
- navegação automatizada para localhost bloqueada pela política do navegador.

## Interpretação

Esses bloqueios impedem afirmar que Hall, Eletrostática e Eletricidade foram aprovados em cenas Three.js completas e offline. O comportamento correto da versão é informar o bloqueio e manter o conteúdo em 2D.
