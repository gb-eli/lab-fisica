# Relatório de Validação — Física Imersiva 360 v0.3.9

## Escopo

Recuperação estrutural da interface, navegação, inicialização, renderização 3D, fallback 2D, cache offline e tratamento de falhas.

## Aprovado automaticamente

- sintaxe JavaScript;
- motores científicos anteriores;
- rotas e histórico;
- modo 2D configurável;
- suporte estrutural a WebGL 1 e 2;
- tratamento de falhas das montagens assíncronas;
- hub simplificado com todos os laboratórios;
- objetivo e etapas por rota;
- instalação offline tolerante a falhas parciais;
- ausência de fallback HTML para arquivos de script e estilo;
- integridade dos JSONs e do ZIP.

## Não declarado como aprovado

O ambiente de execução disponível não produziu uma sessão Chromium confiável por falhas de DBus/EGL/ANGLE. Portanto, não foram declarados como concluídos:

- inspeção visual completa;
- todos os cliques em navegador real;
- gestos multitouch;
- sombras e materiais em GPUs diferentes;
- estabilidade prolongada;
- temperatura e consumo de bateria.

## Conclusão

A v0.3.9 é uma versão de estabilização. Ela elimina diversas causas globais de travamento e confusão, mas não substitui o ciclo de reprodução e correção dos defeitos visuais específicos em aparelhos reais.

## Resultados finais da execução

- suíte `npm test`: aprovada;
- referências locais do service worker: 109, nenhuma ausente;
- seletores de interface usados pelo app: 45, nenhum ID ausente;
- JSON e webmanifest: 20 válidos;
- auditoria: aproximadamente 670 KiB de JavaScript, 129 KiB de CSS e 808 KiB de GLB;
- arquivos principais servidos por HTTP: todos responderam 200.
