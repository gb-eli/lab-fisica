# ELETROMAGNETISMO E MÁQUINAS PREMIUM 360

**Projeto:** Física Imersiva 360  
**Versão:** 0.3.0  
**Fase:** Visual 8A  
**Escopo:** Magnetismo, eletroímãs, indução e máquinas elétricas

## 1. Objetivo

Criar um laboratório tridimensional em que fenômenos magnéticos e eletromagnéticos sejam observados em 360°, com zoom, câmeras orbitais, partículas, campos, instrumentos e máquinas que respondam ao motor científico.

A animação nunca é a fonte do resultado. O módulo `js/science/electromagnetism.js` calcula as grandezas; `js/modules/magnetism3d.js` apenas representa o estado.

## 2. Experiências implementadas

### 2.1 Ímãs e campo magnético

- dois ímãs de barra 3D;
- configuração de atração e repulsão;
- separação ajustável;
- linhas de campo representativas;
- limalha virtual orientada pela direção local do campo;
- oito bússolas tridimensionais;
- sonda móvel X/Z;
- vetor e módulo de campo na posição da sonda;
- modelo de dipolos magnéticos regularizado próximo às superfícies.

### 2.2 Solenoide e eletroímã

- bobina helicoidal 3D;
- corrente positiva e negativa;
- quantidade de espiras;
- comprimento do solenoide;
- núcleo de ar, ferrite ou ferro didático;
- partículas percorrendo a bobina;
- linhas de campo;
- bússola e vetor de campo;
- cálculo de campo, indutância, energia magnética, potência e temperatura estimada.

### 2.3 Indução eletromagnética

- ímã móvel atravessando uma bobina;
- velocidade ajustável;
- número de espiras;
- intensidade magnética;
- fluxo magnético;
- fem induzida;
- sinal da fem conforme a Lei de Lenz;
- partículas com mudança visual de sentido;
- painel de forma de onda.

### 2.4 Motor elétrico

- polos do estator;
- bobina do rotor;
- eixo;
- comutador;
- carga mecânica visual;
- campo representado por vetores;
- corrente, campo e espiras ajustáveis;
- torque, potência mecânica, perdas Joule e eficiência;
- aquecimento visual da bobina;
- rotação sincronizada ao estado calculado.

### 2.5 Gerador

- rotor entre polos magnéticos;
- rotação em rpm;
- número de espiras;
- intensidade de campo;
- resistência da carga;
- tensão instantânea, de pico e eficaz;
- corrente e potência na carga;
- potência mecânica e perdas;
- forma de onda alternada;
- emissões e rotação vinculadas aos cálculos.

### 2.6 Transformador

- núcleo magnético 3D;
- bobina primária;
- bobina secundária;
- fluxo animado no núcleo;
- partículas nos dois enrolamentos;
- espiras do primário e secundário;
- tensão e corrente de entrada;
- eficiência;
- tensão, corrente e potência de saída;
- perdas e aquecimento visual.

## 3. Motor científico

Arquivo: `js/science/electromagnetism.js`.

Funções principais:

- campo de dipolo magnético;
- superposição de dipolos;
- campo de solenoide ideal;
- indutância;
- fluxo magnético;
- fem de Faraday;
- força de Lorentz;
- força em condutor;
- torque de motor;
- energia magnética;
- tensão de gerador;
- relações de transformador;
- estados compostos de eletroímã, motor e gerador.

## 4. Realismo gráfico

- ambiente laboratorial fechado;
- plataforma técnica central;
- arquitetura radial;
- metal, polímero, cerâmica, vidro e cobre PBR;
- sombras adaptativas;
- environment map e ACES Filmic;
- iluminação violeta e ciano por setor;
- câmera orbital, toque, pinça e zoom;
- tela cheia;
- resolução dinâmica;
- pós-processamento opcional;
- ajuste de partículas conforme o perfil gráfico;
- fallback 2D.

## 5. Experiências guiadas

Cada modo possui uma orientação própria e checklist:

1. alterar dois ou mais parâmetros;
2. comparar grandezas e visualização;
3. registrar conclusão;
4. salvar localmente;
5. exportar evidência JSON.

## 6. Acessibilidade e mobile

- DOM para controles e leituras;
- labels associados aos campos;
- descrição textual do modelo;
- alternativa 2D quando o WebGL falhar;
- interface reorganizada em celular;
- botões grandes;
- redução de movimento preservada;
- alto contraste e escala de UI preservados;
- fenômenos não dependem apenas de cor.

## 7. Limitações honestas

- ímãs, bobinas e máquinas desta versão são modelos procedurais detalhados, não assets Blender finais;
- linhas de campo são amostras visuais e não representam infinitas trajetórias;
- o solenoide utiliza aproximação ideal;
- saturação, histerese, correntes parasitas e harmônicos são simplificados;
- comutação do motor é educacional;
- o transformador utiliza relações ideais com eficiência configurável;
- não há física Rapier ou desmontagem manual completa;
- a inspeção visual em aparelhos reais permanece obrigatória.

## 8. Critérios de conclusão

A fase 8A é considerada implementada porque:

- existem seis experiências independentes;
- todas usam o núcleo premium compartilhado;
- todas possuem inspeção 360° e zoom;
- os parâmetros alteram o cálculo e a cena;
- os motores científicos possuem testes automatizados;
- Hall e dock acessam o laboratório;
- há persistência e exportação;
- existe fallback e interface móvel.

## 9. Próxima etapa

**Fase Visual 8B — Energia, Casa Elétrica e Rede Premium 360**:

- residência elétrica completa;
- quadro de distribuição;
- disjuntores e DR;
- tomadas, iluminação e eletrodomésticos;
- potência, energia e custo;
- sobrecarga, curto e aquecimento;
- geração solar e eólica;
- baterias e inversores;
- transformadores e rede de distribuição;
- cidade energética 3D;
- fluxo de energia e perdas;
- práticas de segurança e eficiência.
