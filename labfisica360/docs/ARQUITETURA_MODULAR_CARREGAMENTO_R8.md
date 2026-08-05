# Arquitetura modular e carregamento sob demanda — R8 / v0.4.7

## Objetivo

A página inicial não deve funcionar como um laboratório 3D oculto. Ela deve ser um portal leve que apresente os conteúdos e só carregue um ambiente científico depois da escolha do estudante.

A versão 0.4.7 separa a plataforma em quatro camadas:

1. **Portal inicial leve:** identidade visual, animação Canvas 2D, catálogo e sessão.
2. **Registro de rotas:** informa qual módulo e quais estilos pertencem a cada laboratório.
3. **Gerenciador de recursos:** carrega e desmonta a rota selecionada.
4. **Cache progressivo:** guarda apenas os laboratórios que já foram solicitados.

## O que não é carregado na página inicial

- Three.js;
- cenas WebGL;
- arquivos GLB;
- shaders dos laboratórios;
- bancadas elétricas;
- módulos científicos de Hall, Eletrostática, Eletricidade, Eletromagnetismo, Energia, Mecânica, Ondas, Termofluidos ou Física Avançada;
- estilos específicos desses laboratórios.

A animação de fundo do portal usa Canvas 2D e é interrompida quando a página fica oculta. Ela também respeita a preferência de redução de movimento.

## Ciclo de abertura de um laboratório

1. O estudante escolhe o laboratório.
2. O portal exibe uma tela de preparação.
3. Apenas os estilos declarados pela rota são adicionados ao documento.
4. O módulo JavaScript científico é obtido por `import()` dinâmico.
5. O módulo monta controles, cálculos e cena.
6. Assets 3D são solicitados somente quando o laboratório precisa deles.
7. O evento `fisica:route-load-complete` registra duração, estilos e runtimes ativos.

O contrato está centralizado em:

- `js/labs/route-registry.js`;
- `js/labs/route-resource-manager.js`;
- `assets/module-manifest.json`.

## Ciclo de saída

Ao mudar de laboratório, a plataforma:

- executa a função de limpeza devolvida pelo módulo;
- encerra loops de animação;
- remove listeners e observers pertencentes à rota;
- libera renderers, geometrias, materiais e texturas gerenciados pelo runtime;
- limpa o DOM da experiência;
- remove os arquivos CSS exclusivos da rota;
- espera dois quadros para concluir o descarte;
- verifica se ainda existe algum runtime ativo;
- registra um alerta quando uma cena não foi liberada corretamente.

### Memória e cache não são a mesma coisa

A saída do laboratório libera os objetos ativos da memória gráfica e remove referências da interface. Entretanto, navegadores mantêm módulos JavaScript importados na própria memória de módulos até a página ser recarregada. Não existe API segura para “desimportar” um módulo ES.

Os arquivos baixados também permanecem no cache progressivo para que o laboratório reabra mais rápido e possa funcionar offline depois do primeiro uso. O estudante ou professor pode usar **Limpar arquivos baixados dos laboratórios** nas configurações quando desejar apagar esse cache.

## Estratégia do service worker

O service worker possui dois caches independentes:

- **shell:** portal, sessão, catálogo e arquivos essenciais;
- **labs:** módulos, CSS, modelos e demais recursos obtidos sob demanda.

Durante a instalação, somente o shell é pré-armazenado. A falha de um laboratório não impede a instalação do portal. Arquivos JavaScript e CSS nunca recebem `index.html` como fallback.

## Medição do carregamento inicial

Auditoria estática da versão 0.4.7:

- 15 módulos no grafo JavaScript inicial;
- 127.762 bytes de JavaScript, aproximadamente 124,8 KiB;
- 6 arquivos CSS iniciais;
- 68.712 bytes de CSS, aproximadamente 67,1 KiB;
- 0 arquivos GLB;
- 0 módulos Three.js;
- 0 módulos de laboratórios;
- aproximadamente 15,43% de todo o JavaScript do projeto no grafo inicial.

Esses valores são bytes estáticos sem compressão de transporte. Um servidor com Brotli ou gzip deve reduzir a transferência real.

## Validação em navegador

O teste em Chromium utiliza os módulos ES reais por um domínio virtual interceptado, porque a política do ambiente bloqueia localhost. Foram aprovados os perfis 1365 × 768 e 390 × 844.

Em ambos:

- 21 requisições leves na abertura;
- nenhum módulo de laboratório no início;
- nenhum GLB ou Three.js no início;
- nenhum canvas WebGL no início;
- Eletrostática carregada somente após a escolha;
- Eletricidade carregada somente após a escolha;
- zero estilos de rota depois de voltar ao portal;
- zero canvases depois de voltar ao portal;
- zero runtimes ativos após a limpeza;
- nenhum erro de console;
- nenhum overflow horizontal indevido.

O relatório técnico está em `validation/r8-modular-browser.json`.

## Qualidade preservada

A modularização não reduz materiais, modelos, ferramentas, cálculos ou opções dos laboratórios. Ela altera apenas **quando** os arquivos são carregados e **como** os recursos ativos são descartados.

## Limitações atuais

- o pacote local completo do Three.js continua pendente da R7B;
- a primeira abertura de uma cena Three.js pode depender da fonte remota quando essa opção estiver permitida;
- módulos ES já importados só saem da memória de módulos após recarregar a página;
- GPU física, toque real, aquecimento e bateria continuam dependendo dos aparelhos da escola.
