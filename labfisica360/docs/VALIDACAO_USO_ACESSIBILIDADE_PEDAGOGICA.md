# Validação de Uso e Acessibilidade Pedagógica

Implementação funcional: **v0.3.8 — Fase Visual 15**.

## Objetivo

Adicionar uma camada pedagógica compartilhada sem transformar os laboratórios 3D em páginas carregadas de texto. O ambiente permanece como elemento principal; objetivos, checkpoints e relatórios ficam em um HUD compacto e em um diálogo aberto somente quando necessário.

## Arquivos principais

- `js/pedagogy/guided-learning.js`;
- `js/pedagogy/usage-validation.js`;
- `css/pedagogy.css`;
- `assets/pedagogy-standard.json`;
- `tests/pedagogy-accessibility.test.mjs`.

## Roteiro compartilhado

Cada um dos dez setores possui:

1. objetivo científico completo;
2. versão do objetivo em linguagem simplificada;
3. exploração da cena;
4. alteração de parâmetro;
5. análise ou validação;
6. conclusão escrita;
7. tempo ativo;
8. tutorial da primeira visita;
9. salvamento e retomada local;
10. exportação de evidência em JSON.

Os quatro checkpoints comuns são:

- exploração da cena ou ambiente;
- modificação de um parâmetro científico;
- comparação, medição ou validação;
- conclusão escrita com evidência.

O Hall e o roteiro de módulos adaptam os dois primeiros checkpoints para navegação e orientação.

## Detecção de atividade

A camada pedagógica observa apenas interações locais da interface:

- gesto ou clique em canvas, palco, viewport ou cena;
- alteração de `input` ou `select`;
- abertura de portal ou setor;
- ações de validar, comparar, medir, salvar ou exportar;
- conclusão escrita.

Não são capturados nomes, escola, turma, localização ou conteúdo externo.

## Acessibilidade

As configurações incluem:

- tutorial automático opcional;
- instruções simplificadas;
- alvos de toque ampliados;
- foco forte para navegação por teclado;
- rótulos de apoio persistentes;
- compatibilidade com alto contraste;
- compatibilidade com redução de movimento;
- leitura do objetivo por voz somente após ação do usuário.

A leitura por voz usa `speechSynthesis` quando disponível e não é requisito para completar a atividade.

## Proteção da experiência 3D

- o HUD é compacto e fica na borda;
- o painel completo permanece fechado durante a exploração normal;
- o centro e a parte inferior da cena permanecem livres;
- o tutorial destaca um elemento por etapa;
- a câmera continua bloqueada somente quando um diálogo está aberto;
- em celular, os painéis se reorganizam em uma coluna.

## Matriz de validação de uso

A matriz cruza oito laboratórios com quatro perfis gráficos:

- Econômico;
- Médio;
- Alto;
- Ultra.

Critérios registrados:

- visual 3D/360°;
- toque e câmera;
- legibilidade;
- acessibilidade;
- desempenho;
- coerência entre cálculo, gráfico e animação.

Estados:

- pendente;
- aprovado;
- ressalva;
- falhou.

A matriz é salva localmente e exportada em JSON ou CSV.

## Recuperação

O progresso é retomado após fechar ou recarregar a página. O estudante pode reiniciar somente o roteiro pedagógico do laboratório sem apagar a configuração científica da experiência. A limpeza geral nas configurações continua removendo todos os dados locais.

## Privacidade

Tudo permanece em `localStorage`. Não existe envio para servidor, telemetria ou cadastro obrigatório.

## Limitação externa

A ferramenta está pronta para uso em aparelhos reais, porém a versão não contém resultados físicos de celulares, tablets, Chromebooks ou computadores que não foram fornecidos. Aquecimento, bateria, conforto tátil e qualidade visual percebida continuam pendentes de coleta real.
