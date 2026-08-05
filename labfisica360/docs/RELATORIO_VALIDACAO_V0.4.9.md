# Relatório de Validação — Física Imersiva 360 v0.5.0

## Escopo

Validação da Fase R9.2: seis mentores, expansão aos oito laboratórios, modularização dos roteiros, cobertura dos alvos, progressão, sessão, responsividade e preservação do carregamento sob demanda.

## Resultados funcionais

- 6 mentores cadastrados;
- 33 roteiros;
- 138 etapas;
- 138 de 138 alvos encontrados;
- Marie Curie/Termofluidos concluído em desktop;
- Nikola Tesla/Eletromagnetismo concluído em celular;
- seis cartões e cinco laboratórios por trilha apresentados corretamente;
- eventos registrados na sessão;
- retorno ao Modo Livre aprovado;
- nenhum erro ou aviso de console nos fluxos R9.2;
- nenhum overflow horizontal nos perfis testados.

## Regressão

A suíte completa `npm test` foi aprovada. Permaneceram válidos os motores de Eletrostática, Eletricidade, Eletromagnetismo, Energia, Mecânica, Ondas, Termofluidos e Física Avançada, além das fases de modularização, sessão, recuperação e WebGL anteriores.

## Carregamento inicial

- 15 módulos iniciais;
- aproximadamente 130,4 KiB de JavaScript;
- aproximadamente 69,0 KiB de CSS;
- nenhum módulo de mentor;
- nenhum laboratório;
- nenhum GLB;
- nenhum Three.js;
- nenhuma cena WebGL.

## Projeto completo

- aproximadamente 872 KiB de JavaScript;
- aproximadamente 187 KiB de CSS;
- aproximadamente 808 KiB de GLB;
- 36 modelos GLB preservados;
- 332 arquivos no projeto;
- 121 arquivos JavaScript/MJS com sintaxe aprovada;
- 37 arquivos JSON/webmanifest válidos.

## Limites

- playtest escolar com estudantes ainda pendente;
- leitura por voz depende do navegador e das vozes instaladas;
- os mentores são guias históricos inspirados, não personagens biográficos simulados;
- Three.js totalmente local e testes prolongados em GPUs físicas continuam pendentes;
- os checkpoints avaliam ações e observações estruturadas, não substituem avaliação docente aberta.
