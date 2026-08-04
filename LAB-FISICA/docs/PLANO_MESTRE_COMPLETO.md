# Atualização v0.4.5 — Piloto WebGL

A versão atual é 0.4.5. A reconstrução R1–R5 foi preservada e a R6 adicionou pré-teste WebGL, classificação de capacidade, teste de shaders/desenho, perda/restauração, watchdog do primeiro quadro, fallback 2D e piloto por software. Não declarar GPU física ou 3D totalmente offline como validados. O pacote local completo do Three.js permanece pendente.

# Atualização v0.4.4 — Fechamento da reconstrução R5

A reconstrução R1–R5 foi encerrada no nível estrutural. A versão inclui smoke test real de navegador, correções de navegação e UX/UI e uma separação explícita entre aprovação do fallback 2D e validação WebGL em dispositivos reais.

# Atualização v0.4.3 — Reconstrução R4

A versão 0.4.3 organiza cenários, controles, resultados e limites científicos em Ondas, Termofluidos e Física Avançada. Nenhum laboratório novo foi criado.

# Atualização v0.4.2 — Reconstrução R3

A plataforma permanece em ciclo de reconstrução e não de expansão. A v0.4.2 padroniza cenários de referência, perguntas investigativas, reinício e leituras nos laboratórios de Eletromagnetismo, Energia e Mecânica.


Hall, Eletrostática e Eletricidade foram reconstruídos com foco em clareza, funcionamento e cena 3D/360°. A próxima etapa é R3. Consulte `RECONSTRUCAO_R2_HALL_ELETROSTATICA_ELETRICIDADE.md`.

# Atualização v0.4.0 — Reconstrução UX/UI e lógica

A expansão fica suspensa. A sequência vigente é R1 estrutura comum, R2 Hall/Eletrostática/Eletricidade, R3 Eletromagnetismo/Energia/Mecânica, R4 Ondas/Termofluidos/Avançada e R5 playtest final. Consulte `PLANO_RECONSTRUCAO_LABORATORIOS.md`.

# FÍSICA IMERSIVA 360
# Atualização executiva — v0.4.4

### Fechamento da reconstrução R5

- dez rotas exercitadas em Chromium desktop e mobile;
- 80 trocas de visualização aprovadas;
- 14 alterações de cenário e 13 reinícios visíveis;
- erros reais de cleanup corrigidos;
- áreas de clique e catálogo responsivo corrigidos;
- fallback 2D aprovado sem erros de console ou rota;
- WebGL em hardware real permanece como requisito para o piloto.

## Plano Mestre Consolidado — Fases 1 a 13

**Versão do documento:** 0.4.4  
**Data de consolidação:** 04/08/2026  
**Formato de publicação:** front-end estático para GitHub Pages  
**Estado:** reconstrução estrutural R1–R5 concluída; fallback 2D aprovado em playtest desktop/mobile; validação WebGL em hardware real ainda pendente.

---

## Atualização executiva — v0.3.3

### Ondas, Som e Óptica Premium 360

- nova rota `#waves`;
- acesso pelo dock e pelo Hall;
- motor científico independente em `js/science/waves-optics.js`;
- tanque de ondas com interferência e difração;
- ressonância em cordas e tubos;
- acústica, eco, reverberação e áudio seguro;
- efeito Doppler;
- lentes, espelhos, Snell e reflexão interna;
- prisma, espectro, fibra e dupla fenda;
- câmera 360°, zoom, câmera lenta, gráficos e evidência JSON;
- próxima prioridade: Termologia, Calor, Gases e Fluidos Premium 360.

---

## Atualização executiva — v0.3.2

### Mecânica, Gravidade e Dinâmica Premium 360

- nova rota `#mechanics`;
- acesso pelo dock e pelo Hall;
- motor científico independente em `js/science/mechanics.js`;
- rampa, atrito estático/cinético e vetores;
- lançamentos com trajetória, vetores e arrasto comparativo;
- colisões 1D com restituição, momento e energia;
- pêndulo e massa-mola amortecidos;
- queda livre em diferentes corpos celestes;
- órbita circular conceitual;
- câmera 360°, zoom, câmera lenta, gráficos e evidência JSON;
- próxima prioridade: Ondas, Som e Óptica Premium 360.

---

## Histórico executivo anterior

## Atualização executiva — v0.3.0

### Atualização v0.3.0 — Eletromagnetismo e Máquinas Premium 360

- nova rota `#magnetism`;
- laboratório 3D/360° com seis experiências;
- motor científico separado em `js/science/electromagnetism.js`;
- ímãs, limalha, bússolas e sonda;
- solenoide e eletroímã;
- indução, Faraday e Lenz;
- motor, gerador e transformador;
- partículas, formas de onda e aquecimento ligados ao cálculo;
- práticas guiadas, salvamento e exportação;
- acesso pelo Hall e dock;
- próxima prioridade: Energia, Casa Elétrica e Rede Premium 360.


A Fase Visual 7 foi concluída com a evolução da bancada para um Laboratório Piloto de Eletricidade Premium. A plataforma agora resolve circuitos resistivos em série, paralelo e misto por um motor nodal independente, representa três resistores e cabos em 3D, calcula tensão, corrente e potência por ramo, oferece modos ideal/realista/experimental, práticas guiadas e exportação de evidências. A próxima prioridade é Eletromagnetismo e Energia Premium 360.

# 1. Visão do projeto

O **Física Imersiva 360** é uma plataforma educacional de Física e Matemática aplicada, construída para navegadores e organizada como um conjunto modular de laboratórios virtuais. A proposta é permitir que estudantes observem, manipulem, meçam e comparem fenômenos físicos em ambientes realistas, tridimensionais e responsivos.

O sistema deverá funcionar em:

- celulares Android;
- iPhones;
- tablets e iPads;
- Chromebooks;
- notebooks e computadores;
- navegadores modernos compatíveis com recursos gráficos necessários.

O projeto não deverá ser uma coleção de animações prontas. Cada fenômeno deverá ser governado por um **estado científico calculado**, usado simultaneamente por:

- representação visual;
- instrumentos;
- fórmulas;
- gráficos;
- tabelas;
- explicações;
- desafios;
- exportações.

## 1.1 Regra científica principal

> O cenário representa o resultado do modelo científico. O renderizador não inventa os resultados.

## 1.2 Regra de qualidade

Qualidade será priorizada sobre quantidade. Um laboratório somente será considerado concluído quando possuir:

- modelo científico documentado;
- limites e aproximações explícitos;
- instrumentos coerentes;
- interface responsiva;
- acessibilidade básica;
- testes científicos automatizados;
- testes visuais e de experiência;
- tratamento de desempenho;
- privacidade.

---

# 2. Privacidade e anonimização

A plataforma não deverá exigir nem incorporar automaticamente:

- nome de professor;
- nome de estudante;
- turma;
- escola;
- horários;
- datas escolares;
- endereço;
- localização;
- e-mail;
- telefone;
- dados biométricos;
- consumo residencial real;
- contas reais de energia.

Será possível utilizar perfis locais anônimos com:

- apelido opcional;
- avatar;
- preferências;
- progresso;
- experiências salvas.

O usuário deverá poder:

- exportar os dados locais;
- apagar uma experiência;
- apagar progresso;
- apagar perfil;
- restaurar configurações;
- apagar todos os dados da plataforma.

---

# 3. Arquitetura técnica consolidada

## 3.1 Aplicação

- HTML semântico;
- CSS responsivo;
- JavaScript ou TypeScript modular;
- publicação estática no GitHub Pages;
- PWA opcional;
- armazenamento local anônimo;
- carregamento modular;
- ausência de backend obrigatório.

## 3.2 Renderização

Arquitetura final recomendada:

- Three.js para a experiência 3D;
- WebGL 2 como base;
- WebGPU somente como melhoria opcional;
- GLB ou glTF para modelos;
- texturas comprimidas;
- níveis de detalhe;
- descarregamento de ambientes não utilizados;
- DOM para HUD, menus e conteúdo textual.

A versão 0.2.8 utiliza núcleo compartilhado, pipeline GLB, Hall Científico 360 Premium, Sistema Universal de Interação e Instrumentação Elétrica Realista. O pacote elétrico contém doze assets e trinta e seis GLBs: bancada, fonte, multímetro, amperímetro, voltímetro, fusível, resistor, reostato, interruptor, lâmpada, diodo e LED, todos com três LODs, texturas PBR, colisores e fallback. O Hall possui sete salas, corredores, passarela, elevador central, prévias científicas, mapa holográfico, passeio guiado, áudio local e alternativa 2D. Os laboratórios científicos continuam desacoplados do renderizador.

## 3.3 Física mecânica e colisões

- mundo físico separado do renderizador;
- passo de simulação controlado;
- possibilidade de integração futura com Rapier;
- colisores simplificados;
- tratamento de perda de contexto gráfico;
- recuperação de estado.

## 3.4 Motor científico

Módulos separados para:

- unidades e conversões;
- vetores;
- eletrostática;
- circuitos;
- energia;
- magnetismo;
- indução;
- mecânica;
- ondas;
- óptica;
- termologia futura;
- incerteza e calibração;
- gráficos e registros.

## 3.5 Estrutura recomendada

```text
src/
├── app/
├── core/
├── simulation/
│   ├── electrostatics/
│   ├── circuits/
│   ├── energy/
│   ├── magnetism/
│   ├── mechanics/
│   ├── waves/
│   └── optics/
├── render/
├── physics/
├── instruments/
├── labs/
├── ui/
├── storage/
├── assets/
└── diagnostics/
```

---

# 4. Padrão de experiência pedagógica

Cada laboratório deverá seguir, quando aplicável:

1. contextualização;
2. previsão;
3. montagem;
4. execução;
5. medição;
6. representação matemática;
7. explicação;
8. aplicação real;
9. desafio opcional;
10. síntese e registro.

## 4.1 Modos globais

- Exploração;
- Guiado;
- Experimento;
- Investigação;
- Desafio;
- Demonstração;
- Comparação;
- Revisão;
- Simplificado;
- Científico;
- Ideal;
- Experimental.

## 4.2 Tempo científico

Controles possíveis:

- pausa;
- reinício;
- quadro a quadro;
- 0,01×;
- 0,05×;
- 0,1×;
- 0,25×;
- 0,5×;
- 1×;
- 2×;
- 5×, quando seguro.

O FPS gráfico não poderá alterar o resultado científico.

---

# 5. Sistema visual e UX

## 5.1 Direção visual

- futurista e científica;
- sofisticada;
- materiais metálicos, vidro e cerâmica;
- iluminação funcional;
- hologramas usados como instrumentos, não decoração vazia;
- sem aparência infantil;
- baixa poluição visual;
- HUD recolhível;
- centro da tela livre para o laboratório.

## 5.2 Perfis de qualidade

### Automático

Executa diagnóstico e escolhe configuração inicial.

### Econômico

- resolução dinâmica;
- menos partículas;
- menos linhas de campo;
- sombras reduzidas;
- reflexos desativados;
- menor distância de renderização.

### Médio

Equilíbrio entre qualidade e desempenho.

### Alto

- mais sombras;
- maior densidade visual;
- materiais completos;
- reflexos simplificados.

### Ultra

- texturas superiores;
- maior densidade de efeitos;
- iluminação avançada;
- pós-processamento opcional.

### Científico

Prioriza:

- vetores;
- instrumentos;
- gráficos;
- legibilidade;
- estabilidade;
- precisão visual.

## 5.3 Navegação

### Desktop

- WASD ou setas;
- mouse;
- zoom;
- atalhos configuráveis;
- câmera livre, orbital e bancada.

### Mobile

- joystick opcional;
- área de câmera;
- teletransporte;
- câmera orbital;
- interação contextual;
- painéis inferiores;
- modo paisagem recomendado, sem bloquear o retrato.

---

# 6. Fase 1 — Núcleo técnico e protótipo vertical

## Objetivo

Construir a fundação permanente do projeto.

## Entregas

- estrutura modular;
- roteamento;
- estado global;
- eventos;
- armazenamento;
- configurações;
- diagnóstico de desempenho;
- perfis gráficos;
- PWA;
- tratamento de erro;
- primeiro laboratório demonstrável.

## Requisitos principais

- simulação fora do renderizador;
- UI em DOM;
- assets por manifesto;
- modelos serializáveis;
- nenhum dado real embutido;
- fallback para dispositivos frágeis;
- tratamento de perda do contexto gráfico.

## Critério central

A plataforma deverá provar a integração entre:

**simulação + visualização + instrumentos + fórmulas + gráficos + mobile.**

---

# 7. Fase 2 — Hall Científico 360

## Objetivo

Criar o ambiente central de navegação e apresentação.

## Estrutura

- recepção;
- núcleo holográfico;
- seis portais;
- mapa;
- tutorial;
- mochila científica;
- qualidade gráfica;
- acessibilidade;
- aplicações;
- profissões;
- demonstração rápida.

## Portais

1. Eletrostática;
2. Circuitos;
3. Energia;
4. Magnetismo;
5. Mecânica;
6. Matemática aplicada.

## Câmeras

- livre;
- orbital;
- teletransporte;
- apresentação;
- bancada.

## Estados da aplicação

```text
Inicialização
→ diagnóstico
→ entrada
→ Hall
→ portal
→ carregamento do laboratório
→ laboratório
→ salvamento
→ retorno ao Hall
```

## Critérios

- Hall navegável;
- mobile utilizável;
- tutorial opcional;
- mapa funcional;
- retorno sem recarregar tudo;
- estado preservado;
- painéis não obstruindo o ambiente.

---

# 8. Fase 3 — Coulomb, campo e potencial elétrico

## Conteúdos

- cargas positivas e negativas;
- atração e repulsão;
- Lei de Coulomb;
- forças vetoriais;
- campo elétrico;
- potencial;
- energia potencial;
- superposição;
- eletrização;
- condutores e isolantes.

## Fórmulas


gravidade opcional e separada do fenômeno principal:


a força elétrica:

\[
F=k\frac{|q_1q_2|}{r^2}
\]

forma vetorial:

\[
\vec F_{12}=k\frac{q_1q_2}{|\vec r_{12}|^3}\vec r_{12}
\]

campo:

\[
\vec E=k\frac{q}{r^2}\hat r
\]

potencial:

\[
V=k\frac{q}{r}
\]

energia potencial:

\[
U=k\frac{q_1q_2}{r}
\]

## Ambientes

- Arena de Coulomb;
- Câmara de Campo;
- Plataforma de Potencial;
- Bancada de Eletrização;
- Central Matemática;
- Galeria de Aplicações.

## Ferramentas

- régua 3D;
- cronômetro;
- sonda de campo;
- sonda de potencial;
- sonda de força;
- calculadora;
- gravador;
- gráficos.

## Experiências

- sinais iguais e opostos;
- influência das cargas;
- relação inversa ao quadrado;
- dipolo;
- três cargas;
- ponto de campo nulo;
- carga escondida;
- trajetória de carga;
- eletrização por atrito, contato e indução;
- eletroscópio.

## Aplicações

- pintura eletrostática;
- impressão;
- precipitadores;
- sensores capacitivos;
- descarga eletrostática;
- separação de materiais.

## Testes essenciais

- forças de mesmo módulo e sentidos opostos;
- duplicar distância reduz força a um quarto;
- campo aponta para fora de positiva e para negativa;
- superposição vetorial correta;
- carga nula não produz campo no modelo.

---

# 9. Fase 4 — Corrente, resistência e Lei de Ohm

## Conteúdos

- corrente;
- tensão;
- resistência;
- Lei de Ohm;
- resistividade;
- potência;
- energia;
- efeito Joule;
- instrumentos;
- componentes ideais e reais.

## Fórmulas

\[
I=\frac{\Delta Q}{\Delta t}
\]

\[
U=RI
\]

\[
R=\rho\frac{L}{A}
\]

\[
P=UI=RI^2=\frac{U^2}{R}
\]

\[
E=P\Delta t
\]

## Bancada

- fonte regulável;
- pilhas e baterias;
- fios;
- interruptores;
- resistores;
- lâmpadas;
- LEDs;
- fusíveis;
- amperímetro;
- voltímetro;
- multímetro;
- câmera térmica.

## Estados

- aberto;
- fechado;
- funcional;
- curto;
- sobrecarga;
- fonte limitada;
- instrumento incorreto;
- componente rompido.

## Visualizações

- realista;
- microscópica;
- esquemática;
- térmica;
- matemática;
- diagnóstico.

## Experiências

- circuito simples;
- verificação da Lei de Ohm;
- mudança de resistência;
- medição correta;
- resistência do fio;
- efeito Joule;
- resistor, lâmpada e LED;
- falhas e diagnóstico.

---

# 10. Fase 5 — Associação de resistores

## Conteúdos

- série;
- paralelo;
- associação mista;
- nós;
- ramos;
- resistência equivalente;
- divisão de tensão;
- divisão de corrente;
- potência por componente;
- simplificação progressiva.

## Fórmulas

série:

\[
R_{eq}=R_1+R_2+\cdots+R_n
\]

paralelo:

\[
\frac1{R_{eq}}=\frac1{R_1}+\frac1{R_2}+\cdots
\]

divisor de tensão:

\[
U_s=U_e\frac{R_2}{R_1+R_2}
\]

conservação no nó:

\[
\sum I_{entrada}=\sum I_{saída}
\]

## Recursos

- reconhecimento automático de topologia;
- mesa holográfica de simplificação;
- circuito original e equivalente;
- parede de potencial;
- comparação sincronizada;
- potenciômetro;
- falhas;
- sandbox.

## Experiências

- corrente em série;
- divisão de tensão;
- tensão nos ramos;
- divisão de corrente;
- equivalente;
- associação mista;
- lâmpadas em série e paralelo;
- divisor de tensão;
- diagnóstico.

---

# 11. Fase 6 — Casa Elétrica 360

## Objetivo

Aplicar circuitos, potência e energia a uma residência fictícia.

## Ambientes

- sala;
- cozinha;
- quartos;
- banheiro;
- lavanderia;
- escritório;
- garagem;
- área externa;
- quadro de distribuição;
- medidor;
- centro de controle.

## Modos

- residencial;
- técnico;
- esquemático;
- energético;
- térmico;
- segurança;
- temporal.

## Fórmulas

\[
P=UI
\]

\[
E_{kWh}=P_{kW}t_h
\]

\[
Custo=Consumo\times Tarifa
\]

A tarifa será fictícia e configurável.

## Recursos

- aparelhos com estados;
- ciclos de geladeira e climatização;
- consumo de espera;
- rotina diária;
- aceleração de dias e meses;
- potência por cômodo;
- sobrecarga;
- curto;
- dispositivos de proteção;
- aterramento conceitual;
- extensões;
- eficiência;
- solar e armazenamento didáticos.

## Segurança

O módulo não fornecerá dimensionamento real nem instruções de manutenção de rede energizada.

---

# 12. Fase 7 — Fontes de energia e cidade sustentável

## Ambientes

- Centro de Controle;
- cidade;
- hidrelétrica;
- parque solar;
- parque eólico;
- termelétrica;
- biomassa;
- centro nuclear educacional;
- armazenamento;
- transmissão;
- distribuição;
- laboratório de impactos.

## Balanço

\[
Geração+Descarga+Importação
=
Consumo+Carga+Perdas+Exportação
\]

## Modelos principais

hidrelétrica:

\[
P=\eta\rho gQH
\]

solar:

\[
P=GA\eta
\]

eólica:

\[
P=\frac12\rho Av^3C_p\eta
\]

perdas:

\[
P_{perda}=I^2R
\]

## Recursos

- curva de demanda;
- setores consumidores;
- matriz elétrica;
- despacho didático;
- clima simulado;
- reserva;
- bateria;
- importação e exportação;
- apagões rastreáveis;
- restauração;
- microredes;
- comparação multicritério;
- ciclo de vida;
- eficiência urbana.

## Eventos

- seca;
- falta de vento;
- queda solar;
- pico de consumo;
- linha indisponível;
- bateria descarregada;
- manutenção;
- crescimento urbano.

---

# 13. Fase 8 — Magnetismo e eletroímãs

## Conteúdos

- ímãs;
- polos;
- campo magnético;
- bússolas;
- materiais;
- domínios;
- magnetização;
- histerese introdutória;
- campo terrestre;
- magnetosfera;
- campo de corrente;
- fio;
- espira;
- solenoide;
- eletroímã;
- força magnética.

## Fórmulas

fio idealizado:

\[
B=\frac{\mu I}{2\pi r}
\]

solenoide ideal:

\[
B=\mu nI
\]

força sobre carga:

\[
\vec F=q\vec v\times\vec B
\]

\[
F=|q|vB\sin\theta
\]

raio:

\[
r=\frac{mv}{|q|B}
\]

força sobre condutor:

\[
\vec F=I\vec L\times\vec B
\]

torque:

\[
\tau=NIAB\sin\theta
\]

## Ambientes e aplicações

- Mesa dos Ímãs;
- Câmara de Campo;
- materiais e domínios;
- Terra e magnetosfera;
- fios e bobinas;
- guindaste;
- relé;
- campainha;
- fechadura;
- partículas;
- sensores e motores.

---

# 14. Fase 9 — Indução e máquinas elétricas

## Conteúdos

- fluxo magnético;
- Faraday;
- Lenz;
- bobinas;
- geradores;
- motores;
- corrente alternada;
- frequência;
- transformadores;
- correntes parasitas;
- freios magnéticos;
- carregamento por indução;
- eficiência.

## Fórmulas

fluxo:

\[
\Phi_B=BA\cos\theta
\]

Faraday:

\[
\mathcal E=-N\frac{\Delta\Phi_B}{\Delta t}
\]

torque:

\[
\tau=NIAB\sin\theta
\]

potência mecânica:

\[
P=\tau\omega
\]

transformador ideal:

\[
\frac{U_s}{U_p}=\frac{N_s}{N_p}
\]

\[
\frac{I_s}{I_p}=\frac{N_p}{N_s}
\]

## Experiências

- ímã e bobina;
- movimento rápido e lento;
- inversão de polo;
- número de espiras;
- gerador manual;
- motor CC didático;
- carga mecânica;
- contraeletromotriz;
- transformador;
- núcleo laminado;
- tubo condutor;
- freio sem contato;
- carregamento sem fio.

---

# 15. Fase 10 — Mecânica, gravidade e energia

## Conteúdos

- referenciais;
- posição;
- deslocamento;
- velocidade;
- aceleração;
- queda livre;
- massa e peso;
- Leis de Newton;
- forças;
- atrito;
- planos inclinados;
- polias;
- projéteis;
- molas;
- pêndulos;
- colisões;
- impulso;
- quantidade de movimento;
- trabalho;
- potência;
- energia.

## Fórmulas principais

\[
x=x_0+vt
\]

\[
v=v_0+at
\]

\[
x=x_0+v_0t+\frac12at^2
\]

\[
\vec F=m\vec a
\]

\[
P=mg
\]

\[
F_{at,max}=\mu_sN
\]

\[
F_{at}=\mu_kN
\]

\[
E_c=\frac12mv^2
\]

\[
E_p=mgh
\]

\[
F=-kx
\]

\[
E_{el}=\frac12kx^2
\]

\[
\vec p=m\vec v
\]

\[
\vec J=\Delta\vec p
\]

## Ambientes

- Pista de Cinemática;
- Torre de Queda;
- Câmara de Gravidade;
- Arena de Newton;
- Atrito;
- Rampas;
- Polias;
- Campo de Lançamentos;
- Molas;
- Pêndulos;
- Colisões;
- Energia e montanha-russa.

## Planetas

- Terra;
- Lua;
- Marte;
- outros cenários didáticos;
- gravidade personalizada;
- gravidade zero.

---

# 16. Fase 11 — Ondas, som e óptica

## Conteúdos de ondas

- pulsos;
- ondas transversais e longitudinais;
- frequência;
- período;
- comprimento;
- velocidade;
- fase;
- superposição;
- reflexão;
- refração;
- difração;
- interferência;
- ondas estacionárias;
- harmônicos;
- ressonância.

## Fórmulas

\[
v=\lambda f
\]

\[
T=\frac1f
\]

corda:

\[
v=\sqrt{\frac{F_T}{\mu}}
\]

harmônicos:

\[
f_n=\frac{nv}{2L}
\]

## Som

- compressão e rarefação;
- altura;
- intensidade;
- nível sonoro;
- velocidade;
- eco;
- reverberação;
- acústica;
- Doppler;
- instrumentos;
- timbre;
- espectro.

\[
I=\frac PA
\]

\[
\beta=10\log_{10}\left(\frac I{I_0}\right)
\]

## Óptica

- reflexão;
- espelhos;
- refração;
- lentes;
- raios;
- imagens;
- olho e câmera didáticos;
- prismas;
- dispersão;
- cores;
- reflexão interna;
- fibra;
- dupla fenda;
- polarização introdutória.

\[
\theta_i=\theta_r
\]

\[
n_1\sin\theta_1=n_2\sin\theta_2
\]

\[
n=\frac cv
\]

\[
\frac1f=\frac1p+\frac1{p'}
\]

## Segurança sonora e visual

- volume moderado por padrão;
- limites contra picos;
- modo sem som;
- modo sem flashes;
- equivalentes visuais e textuais.

---

# 17. Fase 12 prevista — Termologia, gases e fluidos

Esta fase ainda não foi detalhada integralmente, mas deverá contemplar:

- temperatura;
- equilíbrio térmico;
- escalas;
- dilatação;
- calor sensível;
- calor latente;
- mudanças de estado;
- condução;
- convecção;
- radiação;
- capacidade térmica;
- gases;
- pressão e volume;
- transformações gasosas;
- densidade;
- pressão hidrostática;
- empuxo;
- vazão;
- Bernoulli;
- viscosidade;
- aplicações domésticas, ambientais e industriais.

---

# 17A. Fase 13 — Fronteira Científica 360

Esta ala será opcional e carregada sob demanda, preservando o foco principal nos conteúdos do Ensino Médio. Ela oferecerá percursos de graduação, pós-graduação e exploração científica.

## Fundação funcional iniciada na versão 0.2.1 e padronizada visualmente na 0.2.3

- rota e aba próprias;
- portal ativo no Hall tridimensional;
- observatório Three.js responsivo;
- órbita por mouse e toque;
- zoom por roda e pinça;
- câmera automática;
- restauração de visão;
- modo imersivo;
- intensidade visual;
- velocidade temporal;
- ativação de partículas;
- fallback 2D;
- cinco prévias visuais de Física com limitações declaradas.

## 13.1 Física Quântica

Conteúdos futuros:

- dualidade onda-partícula;
- função de onda;
- densidade de probabilidade;
- poço infinito;
- barreira e tunelamento;
- oscilador harmônico quântico;
- spin e Stern-Gerlach;
- interferência de partículas;
- orbitais atômicos;
- emaranhamento em nível conceitual;
- decoerência;
- computação quântica introdutória.

Regras científicas:

- elétrons não devem ser apresentados como pequenos planetas;
- a nuvem representa probabilidade, não matéria nebulosa clássica;
- qualquer solver deverá declarar Hamiltoniano, potencial, condições de contorno, discretização e tolerância;
- uma amostragem probabilística não deve ser chamada de trajetória real do elétron.

## 13.2 Matéria Escura e Cosmologia

Conteúdos futuros:

- curvas de rotação;
- lentes gravitacionais;
- aglomerados;
- halos;
- formação de estruturas;
- radiação cósmica de fundo em nível educacional;
- expansão do Universo;
- energia escura;
- modelos cosmológicos comparativos.

Regras científicas:

- matéria escura possui evidências gravitacionais, mas composição microscópica desconhecida;
- qualquer halo visível é metáfora gráfica;
- modelos alternativos e incertezas deverão ser apresentados quando pedagogicamente relevantes;
- não usar mapas atuais sem fonte e atualização explícitas.

## 13.3 Relatividade

Conteúdos futuros:

- postulados da relatividade especial;
- simultaneidade;
- dilatação temporal;
- contração de comprimento;
- transformação de Lorentz;
- intervalo;
- equivalência massa-energia;
- princípio da equivalência;
- geodésicas;
- desvio gravitacional;
- ondas gravitacionais.

A grade deformada permanecerá identificada como analogia, nunca como representação literal do espaço-tempo.

## 13.4 Buracos Negros

Conteúdos futuros:

- raio de Schwarzschild;
- horizonte;
- órbitas;
- disco de acreção;
- lente gravitacional;
- anel de fótons;
- buracos negros em rotação;
- marés;
- fusões e ondas gravitacionais;
- informação e termodinâmica em nível avançado.

A evolução de alta fidelidade deverá utilizar integração de geodésicas ou ray tracing relativístico, separada dos efeitos artísticos.

## 13.5 Tempo, causalidade e viagem temporal

Conteúdos futuros:

- cones de luz;
- causalidade;
- tempo próprio;
- paradoxo dos gêmeos;
- curvas temporais fechadas;
- buracos de minhoca;
- condições de energia;
- proteção cronológica;
- paradoxos lógicos.

A plataforma deverá declarar que viagem ao passado não é uma tecnologia demonstrada e que muitos cenários dependem de condições hipotéticas ou desconhecidas.

## 13.6 Padrão gráfico avançado

- cenas procedurais e GLB de alto detalhe;
- LOD;
- KTX2;
- partículas em GPU;
- zoom macro e micro;
- câmeras orbital, livre, análise, corte e comparação;
- pós-processamento opcional;
- ray marching ou shaders apenas quando houver necessidade científica;
- perfis Econômico, Médio, Alto, Ultra e Científico;
- cálculos preservados em todos os perfis.

---

# 17B. Plataformas futuras independentes — fora do escopo deste repositório

A Física Imersiva 360 não deverá misturar Química ou outras áreas dentro do mesmo Hall, roadmap ou pacote de execução.

Possibilidades futuras serão criadas como plataformas independentes:

- Laboratório de Química e Química Avançada;
- Laboratório de História e Patrimônio;
- Laboratório de Matemática Financeira;
- Laboratório de Enfermagem;
- Laboratório de Segurança do Trabalho;
- outros laboratórios temáticos.

Cada projeto terá repositório, identidade, documentação, assets, requisitos de segurança e motores próprios.

A relação entre disciplinas poderá ocorrer por links ou por uma futura Central de Laboratórios, sem incorporar os módulos ao pacote de Física.

---


# 18. Instrumentos permanentes

A mochila científica poderá conter:

- régua 3D;
- transferidor;
- cronômetro;
- calculadora científica;
- multímetro;
- amperímetro;
- voltímetro;
- wattímetro;
- termômetro;
- câmera térmica;
- dinamômetro;
- balança;
- magnetômetro;
- sonda de campo elétrico;
- sonda de campo magnético;
- sonda de potencial;
- microfone virtual;
- osciloscópio;
- analisador de espectro;
- fotodetector;
- registrador;
- construtor de gráficos;
- bloco de laboratório.

---

# 19. Sistema matemático vivo

O painel matemático deverá:

- destacar a variável alterada;
- mostrar significado;
- mostrar unidade;
- converter unidades;
- substituir valores;
- apresentar resultado;
- fazer análise dimensional;
- isolar variáveis;
- comparar cálculo, simulação e medição;
- apresentar erro percentual;
- apresentar incerteza;
- ocultar etapas já dominadas.

## Conteúdos matemáticos integrados

- razão e proporção;
- porcentagens;
- notação científica;
- conversão;
- funções;
- gráficos;
- vetores;
- trigonometria;
- Pitágoras;
- áreas e volumes;
- análise de dados;
- derivada como taxa de variação em nível adequado;
- integrais conceituais em energia e área futura;
- probabilidade e incerteza.

---

# 20. Acessibilidade consolidada

- alto contraste;
- tamanho de interface;
- símbolos além das cores;
- teclado;
- toque;
- teletransporte;
- câmera fixa;
- modo 2D;
- descrição textual do experimento;
- leitura de fórmulas;
- tabelas equivalentes aos gráficos;
- redução de movimento;
- desativação de partículas;
- modo sem áudio;
- legendas;
- narração;
- sonificação opcional;
- linguagem simplificada;
- ajuda progressiva;
- controles ampliados.

---

# 21. Testes obrigatórios

## 21.1 Científicos

Cada fórmula deverá possuir casos conhecidos com tolerância documentada.

## 21.2 Unidade

- conversões;
- sinais;
- vetores;
- limites;
- singularidades;
- conservação;
- eficiência.

## 21.3 Visuais

Capturas em:

- desktop;
- tablet;
- celular;
- Econômico;
- Alto;
- Ultra;
- contraste elevado;
- redução de movimento.

## 21.4 Experiência

- primeira ação rápida;
- HUD discreto;
- câmera estável;
- menus sem conflito com controle;
- reinício completo;
- salvamento;
- retorno ao Hall;
- tratamento de falhas.

## 21.5 Desempenho

- FPS;
- memória;
- draw calls;
- texturas;
- carregamento;
- contexto perdido;
- aba em segundo plano;
- rotação;
- redimensionamento.

---

# 22. Estado atual do pacote executável

## Funcional na versão 0.2.3

- aplicação estática para GitHub Pages;
- Hall procedural em Three.js/WebGL 2;
- câmera orbital por mouse e toque;
- câmera automática e restauração de visão;
- portais tridimensionais com rótulos DOM acessíveis;
- fallback 2D quando o motor 3D não estiver disponível;
- diagnóstico de WebGL, processador, memória estimada e toque;
- adaptação básica de resolução por desempenho;
- navegação por rotas;
- configurações locais;
- qualidade Auto, Econômico, Médio, Alto, Ultra e Científico;
- redução de movimento;
- alto contraste;
- densidade de interface confortável ou compacta;
- escala da interface de 90% a 120%;
- redução de transparências;
- Design System Científico com temas por módulo;
- biblioteca própria de ícones SVG;
- topbar contextual, dock responsivo, status rail e painéis de instrumentos;
- PWA e cache progressivo;
- roadmap;
- motor eletrostático separado do canvas;
- testes automatizados de Coulomb, campo, potencial e superposição;
- cargas arrastáveis;
- dinâmica visual de atração e repulsão;
- sonda arrastável de campo e potencial;
- campo vetorial;
- mapa de potencial;
- fórmula e gráfico;
- salvamento local do experimento;
- exportação JSON;
- laboratório introdutório de Lei de Ohm;
- Fronteira Científica 360 com seis prévias tridimensionais;
- controles avançados de órbita, zoom, velocidade, partículas e modo imersivo;
- avisos científicos por nível de evidência e limitação;
- circuito aberto e fechado;
- tensão, corrente, resistência, potência e energia;
- aquecimento didático.

## Parcial

- o Hall 3D é procedural e ainda não utiliza ambientes GLB definitivos;
- o motor Three.js é carregado por CDN fixada e possui fallback, mas o pacote local vendorizado ainda será avaliado;
- campo e potencial são apresentados em uma arena bidimensional científica;
- instrumentos completos ainda não foram implementados;
- Lei de Ohm ainda utiliza uma montagem visual simplificada;
- testes automatizados de navegador e capturas visuais ainda são limitados pelo ambiente de execução.

## Planejado

- assets GLB/glTF e manifesto de recursos;
- sistema de carregamento de ambientes pesados;
- Rapier para Mecânica e colisões;
- associação de resistores em série, paralelo e mista;
- bancada com fios e instrumentos arrastáveis;
- Casa Elétrica;
- Cidade Sustentável;
- Magnetismo;
- Indução e Máquinas;
- Mecânica;
- Ondas, Som e Óptica;
- Termologia e Fluidos;
- solvers avançados de Quântica, Relatividade e Astrofísica;
- plataformas independentes para Química e outras áreas, fora deste repositório;
- exportações avançadas;
- relatórios;
- áudio científico;
- realidade virtual opcional.

# 23. Ordem recomendada de evolução do código

1. aplicar o padrão gráfico obrigatório;
2. concluir direção artística e design system científico;
3. criar núcleo compartilhado de renderização;
4. implementar pipeline GLB/glTF, PBR, compressão, LOD e colisores;
5. reconstruir o Hall como ambiente premium;
6. criar sistema universal de manipulação, encaixe, undo/redo e cabos;
7. desenvolver biblioteca de instrumentos;
8. transformar a bancada elétrica no laboratório piloto de alta fidelidade;
9. validar desktop, mobile e perfis gráficos;
10. somente depois retomar a expansão dos outros laboratórios.

---

# 24. Regras para futuras atualizações

Sempre que uma nova fase ou implementação for concluída:

1. atualizar este arquivo;
2. atualizar `PROMPT_CONTEXTO_ATUALIZADO.md`;
3. atualizar `STATUS_IMPLEMENTACAO.md`;
4. atualizar versão no histórico;
5. testar a plataforma;
6. gerar ZIP completo;
7. informar claramente o que está funcional, parcial ou apenas planejado;
8. nunca fingir que um laboratório planejado já foi implementado.


---

# ATUALIZAÇÃO DE IMPLEMENTAÇÃO — v0.2.3

A Fase Visual 1 foi concluída com design system científico, temas por módulo, paleta funcional, biblioteca de ícones SVG, topbar contextual, dock responsivo, status científicos, painéis de instrumentos e configurações de densidade e escala.

A próxima etapa obrigatória é a Fase Visual 2: núcleo compartilhado de renderização premium.


# ATUALIZAÇÃO DE IMPLEMENTAÇÃO — v0.2.4

A Fase Visual 2 centralizou a infraestrutura gráfica em `js/render/`. Hall e Física Avançada compartilham ciclo de vida, câmera orbital, iluminação, environment map, materiais, pós-processamento, monitoramento e recuperação WebGL. A melhoria é estrutural; os modelos GLB e equipamentos realistas continuam como próxima fase obrigatória. Consulte `docs/NUCLEO_RENDERIZACAO_PREMIUM.md`.


# ATUALIZAÇÃO DE IMPLEMENTAÇÃO — v0.2.5

## Fase Visual 3 concluída

Foi criado o pipeline profissional de assets 3D e a primeira bancada elétrica tridimensional.

### Arquivos centrais

- `js/assets/glb-loader-lite.js`;
- `js/assets/asset-manager.js`;
- `js/assets/texture-library.js`;
- `js/assets/procedural-fallbacks.js`;
- `js/render/cables.js`;
- `assets/models/electrical/manifest.json`;
- `tools/generate_asset_pack.py`;
- `css/electrical-bench.css`.

### Kit inicial

Seis assets, três níveis de detalhe por asset, texturas PBR, colisores e seleção por câmera. O laboratório de Ohm agora utiliza bancada 3D com displays, cabos, corrente visual, iluminação, foco e resposta térmica.

### Próxima etapa

Fase Visual 4 — reconstrução premium do Hall Científico 360.


## Marco de implementação — v0.2.7

A Fase Visual 5 implementou o Sistema Universal de Interação. A bancada elétrica agora permite selecionar, mover, girar, encaixar e reconectar equipamentos, com histórico, desfazer/refazer, persistência local e validação do caminho elétrico. Esse contrato deverá ser reutilizado nos laboratórios de Mecânica, Magnetismo, Energia, Ondas e Física Avançada.

# ATUALIZAÇÃO DE IMPLEMENTAÇÃO — v0.2.8

## Fase Visual 6 concluída

A biblioteca elétrica passou a incluir doze equipamentos e trinta e seis GLBs. A bancada agora possui fonte CV/CC, multímetro configurável, amperímetro, voltímetro, fusíveis, reostato, diodo e LED. O novo motor `js/science/electrical-instruments.js` calcula corrente, tensão, potência, temperatura, proteção, polaridade, precisão, incerteza e erros de ligação.

### Padrão confirmado

As próximas fases devem manter inspeção 360°, zoom, controles funcionais, materiais PBR, estados físicos, diagnóstico, acessibilidade e fallback. Efeitos visuais não podem substituir o cálculo científico.

### Próxima etapa

Fase Visual 7 — Laboratório Piloto de Eletricidade Premium, com construtor de circuitos série, paralelo e misto, catálogo de componentes, solver nodal, práticas guiadas e exportação de evidência.


# ATUALIZAÇÃO DE IMPLEMENTAÇÃO — v0.2.9

## Fase Visual 7 concluída

A bancada elétrica foi promovida a laboratório piloto de referência.

### Motor científico

- `js/science/resistive-network.js`;
- análise nodal;
- eliminação gaussiana;
- série, paralelo e misto;
- resistência equivalente;
- tensões nodais;
- correntes e potências por ramo;
- CV/CC;
- modos ideal, realista e experimental.

### Cena e interação

- três resistores tridimensionais;
- displays locais;
- aquecimento por potência;
- cabos reorganizados por topologia;
- terminais e derivações;
- inspeção 360°;
- câmera orbital e zoom;
- manipulação universal.

### Aprendizagem e evidência

- prática de corrente em série;
- prática de tensão em paralelo;
- prática de Lei dos Nós;
- exportação JSON;
- exportação CSV;
- persistência local.

### Próxima fase

Fase Visual 8 — Eletromagnetismo e Energia Premium 360, com ímãs, bobinas, solenoides, motores, geradores, transformadores, campos e transferência de energia.


# ATUALIZAÇÃO DE IMPLEMENTAÇÃO — v0.3.0

## Fase Visual 8A — Eletromagnetismo e Máquinas Premium 360

A plataforma recebeu um laboratório dedicado a magnetismo e conversão eletromecânica. O módulo utiliza o núcleo de renderização premium e um motor científico independente.

### Implementado

- rota e tema de Eletromagnetismo;
- ambiente fechado 3D com câmera orbital e zoom;
- ímãs, campo, limalha, bússolas e sonda;
- solenoide e eletroímã;
- indução eletromagnética;
- motor CC educacional;
- gerador CA;
- transformador;
- cálculos de dipolo, solenoide, fluxo, Faraday, forças, torque, geração e transformação;
- práticas guiadas;
- persistência e exportação JSON;
- testes automatizados.

### Próxima fase

Fase Visual 8B — Energia, Casa Elétrica e Rede Premium 360.


## Atualização v0.3.1 — Energia Premium

Implementados casa elétrica 3D, quadro e proteções, consumo em kWh, solar, eólica, bateria, inversor, medidor bidirecional, transformador e rede com perdas. O próximo eixo de desenvolvimento passa a ser Mecânica Premium 360.


# ATUALIZAÇÃO DE IMPLEMENTAÇÃO — v0.3.3

## Fase Visual 10 — Ondas, Som e Óptica Premium 360

A plataforma recebeu seis experiências integradas de fenômenos ondulatórios, acústica, óptica geométrica e fotônica. O módulo usa o núcleo gráfico compartilhado e um motor científico independente.

### Implementado

- rota e tema de Ondas e Óptica;
- tanque de ondas 3D;
- superposição, interferência e difração;
- corda estacionária, tubos e harmônicos;
- sala acústica, eco e reverberação;
- Doppler com fonte e observador;
- bancada de lentes, espelhos e refração;
- prismas, espectro, fibra óptica e dupla fenda;
- áudio seguro, práticas, persistência e exportação;
- testes científicos automatizados.

### Próxima fase

Fase Visual 11 — Termologia, Calor, Gases e Fluidos Premium 360.


# ATUALIZAÇÃO DE IMPLEMENTAÇÃO — v0.3.4

## Fase Visual 11 — Termologia, Gases e Fluidos Premium 360

A plataforma recebeu seis experiências integradas de calorimetria, transferência térmica, estados da matéria, gases, hidrostática, escoamento e máquinas térmicas.

### Implementado

- rota, tema e setor Termologia e Fluidos;
- calorimetria com equilíbrio energético;
- calor sensível, latente e dilatação;
- condução, convecção e radiação;
- curva de aquecimento e mudanças de fase;
- gás ideal e processos termodinâmicos;
- pressão hidrostática e empuxo;
- continuidade, Bernoulli, Reynolds e Poiseuille;
- motor térmico e refrigeração;
- experiências 3D/360°, partículas, gráficos, mobile e fallback;
- persistência e evidência JSON;
- testes científicos automatizados.

### Próxima fase

Fase Visual 12 — Física Avançada Premium 360 e refinamento gráfico transversal.


# ATUALIZAÇÃO DE IMPLEMENTAÇÃO — v0.3.5

## Fase Visual 12 — Física Avançada Premium 360

A antiga galeria conceitual foi promovida a laboratório científico parametrizado com cinco observatórios: Quântica, Relatividade, Matéria Escura, Buracos Negros/Lentes e Causalidade. A engine `js/science/advanced-physics.js` é independente do renderizador. Foram adicionados gráficos, leituras, controles, persistência e evidência JSON.

### Próxima fase

Fase Visual 13 — otimização multiplataforma, refinamento transversal e validação visual científica.


# ATUALIZAÇÃO DE IMPLEMENTAÇÃO — v0.3.6

## Fase Visual 13 — Otimização e Validação Transversal

A plataforma recebeu monitoramento ampliado, orçamentos por perfil, otimização adaptativa de Points e InstancedMesh, suspensão automática de cenas, recuperação WebGL, diagnóstico local, ciclo de vida ampliado de assets e auditoria estática reproduzível. Todos os motores científicos permanecem independentes do FPS.


# ATUALIZAÇÃO DE IMPLEMENTAÇÃO — v0.3.7

## Fase Visual 14 — Refinamento Artístico e Kit de Validação Real

A plataforma recebeu uma camada artística compartilhada, materiais físicos ampliados, iluminação de inspeção, controles universais de câmera e o pacote elétrico premium-procedural-v2. Foi criada uma matriz local para registrar testes automáticos e manuais por aparelho, com exportação JSON e CSV.

### Entregas

- 12 assets e 36 GLBs refinados;
- três LODs e colisores preservados;
- barra de câmera em todas as cenas WebGL;
- gestos e teclado ampliados;
- diagnóstico de alvos de toque;
- checklist de visual, toque, legibilidade, orientação, temperatura e bateria;
- documentação e testes de regressão.

### Limitação

A execução da matriz em hardware real permanece necessária para concluir a validação física.

### Próxima fase

Fase Visual 15 — validação de uso, acessibilidade pedagógica e correções orientadas pelos relatórios reais.


# ATUALIZAÇÃO DE IMPLEMENTAÇÃO — v0.3.8

## Fase Visual 15 — Validação de Uso e Acessibilidade Pedagógica

Foi adicionada uma camada pedagógica transversal sem reduzir o espaço visual dos laboratórios. Dez rotas possuem objetivos, checkpoints, tutorial, tempo ativo, conclusão, retomada e evidência. Também foi criada uma matriz de uso por laboratório e perfil gráfico.

### Arquivos centrais

- `js/pedagogy/guided-learning.js`;
- `js/pedagogy/usage-validation.js`;
- `css/pedagogy.css`;
- `assets/pedagogy-standard.json`.

### Acessibilidade

- linguagem simplificada;
- alvos de toque ampliados;
- foco forte;
- rótulos persistentes;
- leitura do objetivo;
- alto contraste e redução de movimento preservados.

### Limitação

A avaliação conceitual permanece docente. Correções específicas por aparelho só podem ser aplicadas depois da coleta de relatórios reais.

### Próxima fase

Fase Visual 16 — Publicação Piloto, Relatórios Docentes e Correções por Evidência.

## Prioridade extraordinária — Recuperação v0.3.9

Nenhuma nova área científica deve ser adicionada antes de validar a experiência básica. A sequência obrigatória passa a ser: iniciar, navegar, compreender o objetivo, alterar um parâmetro, observar resposta, reiniciar, salvar e sair sem erro. Somente depois dessa sequência funcionar em cada laboratório a expansão poderá ser retomada.