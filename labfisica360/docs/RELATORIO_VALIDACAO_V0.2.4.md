# RELATÓRIO DE VALIDAÇÃO — v0.2.4

## Testes executados

- sintaxe de todos os módulos JavaScript;
- testes de eletrostática;
- contratos da Física Avançada;
- separação de Química;
- Design System Científico;
- núcleo compartilhado de renderização;
- integridade estática, rotas, versões e manifestos;
- existência de todos os arquivos do cache PWA;
- validação dos arquivos JSON;
- resposta do servidor HTTP local.

## Resultado

Todos os testes automatizados executados foram aprovados.

## Verificação estrutural

- Hall e Física Avançada importam `createRenderRuntime`;
- nenhum deles cria `THREE.WebGLRenderer` diretamente;
- nenhum deles contém URL de CDN própria;
- o carregamento do Three.js está centralizado;
- métricas e resolução dinâmica pertencem ao runtime;
- pós-processamento pertence ao runtime;
- descarte pertence ao runtime.

## Limitação de validação visual

O Chromium headless disponível no ambiente não conseguiu inicializar corretamente seu subsistema de navegador/GPU e não produziu uma captura utilizável. Portanto, não foi registrada aprovação visual em aparelhos reais.

A validação visual obrigatória permanece para:

- Android intermediário;
- iPhone/Safari;
- tablet;
- Chromebook;
- notebook com GPU integrada;
- perfis Econômico, Médio, Alto, Ultra e Científico.
