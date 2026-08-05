# Matriz de compatibilidade WebGL

## Automatizado nesta versão

| Perfil | Viewport | Contexto | Desenho | Resize | Perda/restauração | Resultado |
|---|---:|---|---|---|---|---|
| Desktop virtual | 1365×768 | WebGL 2 / SwiftShader | aprovado | aprovado | aprovada | aprovado com limite de software |
| Mobile virtual | 390×844 | WebGL 2 / SwiftShader | aprovado | aprovado | aprovada | aprovado com limite de software |

## A preencher em hardware real

Registrar para cada aparelho: modelo, navegador, WebGL 1/2, perfil gráfico, primeiro quadro, FPS após 30 segundos, estabilidade por 30 minutos, temperatura, bateria, toque, pinça, sombras, transparências e observações por Hall, Eletrostática e Eletricidade.

## Critérios

- **Aprovado:** primeiro quadro em até 7 s e sem fallback inesperado.
- **Com ressalvas:** funciona somente em modo 3D seguro ou perfil Econômico.
- **Reprovado:** contexto não desenha, perde-se repetidamente ou impede a atividade.
