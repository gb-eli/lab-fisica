# Auditoria de Recuperação Estrutural — v0.3.9

## Motivo da fase

A plataforma cresceu mais rápido do que sua validação de uso. Os testes anteriores confirmavam fórmulas, arquivos e contratos textuais, mas não demonstravam que a inicialização, a navegação, os controles e as cenas funcionavam de forma clara para o usuário.

## Falhas confirmadas na auditoria

1. Dock inferior com excesso de áreas concorrentes.
2. Dependência do Three.js remoto sem recuperação suficientemente clara.
3. Exigência desnecessária de WebGL 2.
4. Promessas de montagem 3D sem tratamento consistente de rejeição.
5. Objetivos, tutoriais, controles e painéis duplicados sobre a cena.
6. Roteador sem proteção completa contra resolução tardia e histórico do navegador.
7. Service worker capaz de responder `index.html` a uma solicitação de JavaScript ou CSS.
8. Instalação offline cancelada quando apenas um arquivo falhava.
9. Inicialização sem tela segura de recuperação.
10. Testes predominantemente estruturais, insuficientes para comprovar a experiência real.

## Correções aplicadas

- navegação principal reduzida;
- hub de laboratórios com objetivo e etapas;
- Hall simplificado;
- resumo compacto em cada rota;
- modo 2D forçado;
- WebGL 1 e 2;
- carregador Three.js com múltiplas fontes e timeout;
- erros de renderização convertidos em fallback recuperável;
- descarte de montagens tardias;
- central local de diagnóstico;
- roteamento assíncrono seguro;
- cache offline por arquivo e resposta correta por tipo de requisição;
- teste específico de recuperação estrutural.

## Pendências reais

- testes visuais e de toque em hardware real;
- correções específicas de cada cenário após reprodução visual;
- inclusão do Three.js completo no próprio repositório;
- revisão individual de sobreposição e escala em cada resolução;
- validação prolongada de temperatura, bateria e memória.
