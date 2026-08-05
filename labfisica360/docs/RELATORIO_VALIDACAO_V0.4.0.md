# Relatório de Validação — v0.4.0

## Escopo

Reorganização de UX/UI e lógica de uso, sem adicionar novos laboratórios.

## Aprovado automaticamente

- todos os motores científicos anteriores;
- pipeline de assets e 36 GLBs;
- Hall e oito rotas de laboratório;
- catálogo único com oito laboratórios;
- ordem e metadados únicos;
- cinco visualizações do workspace;
- três modos de experiência;
- modo guiado padrão;
- tutorial automático desativado por padrão;
- cenário principal sincronizado aos controles existentes;
- resumo vivo de resultados;
- layout mobile cena-primeiro;
- cache offline com 114 referências e nenhum arquivo ausente;
- auditoria UX reproduzível;
- sintaxe JavaScript;
- 21 arquivos JSON/webmanifest válidos;
- arquivos principais responderam HTTP 200;
- 234 arquivos de projeto antes da compactação.

## Auditoria estrutural

- 94 botões nos templates;
- 154 entradas;
- 20 seletores;
- 45 cartões;
- 687 KiB de JavaScript;
- 146 KiB de CSS;
- 808 KiB de GLB.

## Não aprovado visualmente no ambiente

A navegação automatizada foi bloqueada com `ERR_BLOCKED_BY_ADMINISTRATOR`. Portanto, não houve captura confiável para certificar:

- composição das cenas;
- sombras;
- escala dos objetos;
- sobreposições;
- gestos de toque;
- legibilidade física dos instrumentos;
- estabilidade prolongada.

## Conclusão

A versão elimina duplicação de metadados e estabelece uma experiência comum e progressiva. Ela é uma base melhor para a reconstrução laboratório por laboratório, mas não é declarada como revisão artística final.
