# RELATÓRIO DE VALIDAÇÃO — v0.3.0

## Escopo

Fase Visual 8A — Eletromagnetismo e Máquinas Premium 360.

## Resultado geral

**Aprovado nos testes científicos, estruturais e de publicação estática.**

A validação visual automatizada em Chromium não foi concluída por falhas de DBus e do subsistema gráfico do ambiente. A inspeção em celular, tablet e computador reais continua obrigatória.

## Testes científicos aprovados

- campo magnético de dipolo;
- relação entre campo axial e equatorial;
- direção do campo;
- campo de solenoide;
- dependência com corrente;
- indutância e dependência com espiras;
- fluxo magnético;
- fem de Faraday;
- sinal da Lei de Lenz;
- força de Lorentz;
- força em condutor;
- torque de motor;
- tensão de pico de gerador;
- tensão, corrente, potência e perdas de transformador;
- estados compostos de eletroímã, motor e gerador.

## Contratos visuais e funcionais aprovados

- seis modos: ímãs, solenoide, indução, motor, gerador e transformador;
- núcleo compartilhado de renderização;
- câmera orbital e zoom;
- materiais PBR;
- linhas de campo;
- limalha virtual;
- bússolas e sonda;
- bobinas e partículas;
- formas de onda;
- aquecimento visual;
- práticas guiadas;
- persistência local;
- exportação JSON;
- interface mobile;
- fallback 2D;
- acesso pelo dock e pelo Hall.

## Regressão aprovada

A suíte `npm test` aprovou:

- eletrostática;
- instrumentação elétrica;
- redes resistivas;
- Física Avançada;
- Design System;
- núcleo gráfico;
- pipeline de assets;
- Hall Premium;
- interação universal;
- Eletricidade Premium;
- Eletromagnetismo científico;
- Eletromagnetismo Premium;
- integridade estática.

## Publicação estática

- 77 referências do cache PWA encontradas;
- 17 arquivos JSON válidos;
- módulos JavaScript aprovados por `node --check`;
- imports dos módulos novos aprovados;
- arquivos principais responderam HTTP 200;
- 36 GLBs elétricos anteriores preservados;
- ZIP testado internamente sem arquivos corrompidos.

## Pacote

- arquivo: `fisica-imersiva-360-v0.3.0.zip`;
- arquivos no ZIP: 184;
- tamanho aproximado: 1,22 MiB;
- SHA-256 registrado no arquivo externo `fisica-imersiva-360-v0.3.0.sha256.txt`.

## Limitações

- Chromium headless não produziu DOM ou captura utilizável;
- equipamentos eletromagnéticos ainda são procedurais;
- não há desmontagem manual completa;
- solenoide, transformador e máquinas utilizam aproximações educacionais;
- saturação, histerese, correntes parasitas e harmônicos não são resolvidos integralmente;
- desempenho e toque devem ser verificados em aparelhos reais.
