# Consolidação pedagógica, acesso aberto e adaptação gráfica — v0.5.0

## Propósito
A Física Imersiva 360 é um laboratório escolar aberto para transformar explicações de sala em experiências investigativas. O aluno observa, altera uma variável, compara resultados e registra evidências quando solicitado.

## Formas de acesso
### Visitante
- acesso integral aos oito laboratórios;
- Modo Livre e Modo Guiado disponíveis;
- nenhum nome, turma, tempo ou ação é persistido;
- indicado para exploração espontânea.

### Estudante identificado
- nome, turma, turno e PIN numérico local;
- registro local de laboratórios, acessos, tempo ativo, etapas guiadas e interações relevantes;
- exportação JSON e CSV;
- indicado quando o professor solicitar evidência.

O PIN é apenas uma separação básica de sessão no mesmo aparelho. Seu hash é armazenado localmente; não existe servidor, recuperação de senha ou autenticação institucional.

## Registro de ações
Durante uma sessão identificada, o sistema registra cliques e alterações em controles científicos, sem capturar senhas ou textos pessoais. Os eventos são limitados para evitar crescimento excessivo do armazenamento.

## Adaptação gráfica
O perfil Automático considera núcleos, memória disponível, resolução, densidade de pixels, tela de toque, economia de dados, velocidade de conexão e redução de movimento. A adaptação modifica efeitos, resolução interna, sombras, partículas, pós-processamento e detalhes — nunca as fórmulas ou medições científicas.

## Arquitetura
O portal inicial continua leve. Laboratórios, CSS especializado, Three.js, GLBs, mentores e cenas entram apenas após a escolha. Ao sair, loops, listeners, canvases e recursos gráficos ativos são descartados.

## Fluxo didático
1. Observar o cenário e identificar as grandezas.
2. Experimentar alterando uma variável por vez.
3. Comparar instrumentos, vetores, gráficos e resultados.
4. Registrar ou exportar a sessão quando necessário.
