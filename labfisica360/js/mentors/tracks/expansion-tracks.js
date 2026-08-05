import { manual, click, input, change } from './step-builders.js';

export const EXPANSION_TRACKS = Object.freeze({
  einstein: {
    waves: {
      title: 'Luz, ondas e diferentes descrições do mesmo fenômeno',
      question: 'Como frequência, velocidade e meio mudam a forma de observar uma onda?',
      steps: [
        click('optics', 'Abra a bancada óptica', 'Selecione Espelhos, lentes e refração.', '[data-waves-mode="optics"]', 'A bancada separa objeto, elemento óptico e imagem.'),
        change('refraction', 'Escolha refração', 'Selecione Interface refrativa no controle do elemento.', '[data-param="opticElement"]', 'A direção da luz depende dos índices dos dois meios.', (target) => target.value === 'refraction'),
        input('incident-angle', 'Altere o ângulo de incidência', 'Aumente o ângulo para pelo menos 50°.', '[data-param="incidentAngle"]', 'O ângulo refratado não cresce na mesma proporção.', (target) => Number(target.value) >= 50),
        manual('compare-rays', 'Compare as descrições', 'Observe os raios, os ângulos e a leitura numérica.', '[data-readout="primary"]', 'A construção visual e a equação descrevem o mesmo evento por linguagens diferentes.'),
      ],
    },
    energy: {
      title: 'Energia transformada e observada em diferentes sistemas',
      question: 'Como a mesma energia aparece como consumo, geração e armazenamento?',
      steps: [
        click('microgrid', 'Abra a microgeração', 'Selecione Microgeração.', '[data-energy-mode="microgrid"]', 'O sistema combina solar, vento, bateria e rede.'),
        input('irradiance', 'Aumente a irradiância', 'Leve a irradiância a pelo menos 1.000 W/m².', '[data-energy-param="irradiance"]', 'A potência solar cresce, limitada pela instalação e pelas perdas.', (target) => Number(target.value) >= 1000),
        input('battery', 'Carregue a bateria', 'Ajuste a potência da bateria para um valor negativo.', '[data-energy-param="batteryPower"]', 'Potência negativa representa armazenamento de energia.', (target) => Number(target.value) <= -1),
        manual('balance', 'Interprete o balanço', 'Compare demanda, geração, bateria e troca com a rede.', '[data-result="renewable"]', 'O balanço depende do referencial adotado para entrada e saída de potência.'),
      ],
    },
    advanced: {
      title: 'Relatividade e medidas dependentes do observador',
      question: 'Como dois observadores podem medir tempos diferentes sem contradição?',
      steps: [
        click('relativity', 'Abra Relatividade', 'Selecione o módulo Relatividade.', '[data-advanced-mode="relativity"]', 'O modelo compara tempo coordenado e tempo próprio.'),
        input('beta', 'Aumente a velocidade', 'Ajuste β para pelo menos 0,90.', '[data-param="beta"]', 'O fator de Lorentz cresce rapidamente próximo de c.', (target) => Number(target.value) >= .9),
        input('distance', 'Defina uma viagem longa', 'Aumente a distância para pelo menos 10 anos-luz.', '[data-param="distanceLy"]', 'Uma distância maior torna a diferença acumulada mais evidente.', (target) => Number(target.value) >= 10),
        manual('clocks', 'Compare os relógios', 'Observe o tempo na Terra e o tempo na nave.', '[data-readouts]', 'Os dois tempos são medidas válidas em trajetórias diferentes pelo espaço-tempo.'),
      ],
    },
  },
  newton: {
    energy: {
      title: 'Potência, perdas e relações quantitativas',
      question: 'Como a resistência da linha altera a energia entregue?',
      steps: [
        click('network', 'Abra a rede de distribuição', 'Selecione Rede de distribuição.', '[data-energy-mode="network"]', 'A rede explicita corrente, queda de tensão e perdas.'),
        input('length', 'Aumente o comprimento', 'Leve a linha a pelo menos 2 km.', '[data-energy-param="lineLength"]', 'A resistência total cresce com o comprimento.', (target) => Number(target.value) >= 2),
        input('resistance', 'Aumente a resistência', 'Ajuste o condutor para pelo menos 0,50 Ω/km.', '[data-energy-param="lineResistance"]', 'As perdas Joule aumentam com I²R.', (target) => Number(target.value) >= .5),
        manual('losses', 'Relacione as grandezas', 'Compare queda de tensão, corrente e perdas totais.', '[data-result="losses"]', 'Procure a relação entre resistência, corrente e potência dissipada.'),
      ],
    },
    thermal: {
      title: 'Equilíbrio térmico e conservação de energia',
      question: 'Qual temperatura final conserva a energia trocada?',
      steps: [
        click('calorimetry', 'Abra Calorimetria', 'Selecione Calorimetria.', '[data-thermal-mode="calorimetry"]', 'O sistema ideal considera a soma das trocas de calor igual a zero.'),
        input('hot-mass', 'Aumente a massa quente', 'Ajuste a massa quente para pelo menos 2 kg.', '[data-param="hotMass"]', 'Uma massa maior possui maior capacidade térmica se o material for mantido.', (target) => Number(target.value) >= 2),
        input('cold-temp', 'Altere a temperatura fria', 'Reduza a temperatura fria para no máximo 10 °C.', '[data-param="coldTemperature"]', 'A diferença inicial de temperatura aumenta.', (target) => Number(target.value) <= 10),
        manual('equilibrium', 'Verifique a conservação', 'Observe a temperatura de equilíbrio e as energias trocadas.', '[data-readout="primary"]', 'O calor cedido deve compensar o calor recebido no modelo isolado.'),
      ],
    },
    advanced: {
      title: 'Gravitação no limite relativístico',
      question: 'Quais conceitos clássicos permanecem úteis perto de um buraco negro?',
      steps: [
        click('black-hole', 'Abra Buracos Negros', 'Selecione Buracos Negros.', '[data-advanced-mode="blackHole"]', 'Órbitas e gravitação continuam centrais, mas exigem correções relativísticas.'),
        input('mass', 'Aumente a massa', 'Ajuste a massa para pelo menos 30 massas solares.', '[data-param="blackHoleMassSolar"]', 'O raio de Schwarzschild é proporcional à massa.', (target) => Number(target.value) >= 30),
        input('orbit', 'Aproxime a sonda', 'Reduza o raio da sonda para no máximo 6 rₛ.', '[data-param="orbitRadiusRs"]', 'A aproximação aumenta os efeitos relativísticos.', (target) => Number(target.value) <= 6),
        manual('read', 'Compare órbita e relógio', 'Observe período orbital, raio e fator do relógio.', '[data-readouts]', 'A dinâmica orbital continua quantitativa, mas o espaço-tempo deixa de ser newtoniano.'),
      ],
    },
  },
  faraday: {
    magnetism: {
      title: 'Indução descoberta pelo movimento',
      question: 'Como o movimento relativo modifica fluxo e tensão induzida?',
      steps: [
        click('induction', 'Abra Indução', 'Selecione Indução.', '[data-mag-mode="induction"]', 'O módulo mostra fluxo, fem e sentido da corrente.'),
        input('speed', 'Aumente a velocidade', 'Leve a velocidade para pelo menos 2×.', '[data-param="speed"]', 'Uma variação de fluxo mais rápida produz maior fem.', (target) => Number(target.value) >= 2),
        input('strength', 'Fortaleça o ímã', 'Aumente a intensidade magnética para pelo menos 0,80 T.', '[data-param="magnetStrength"]', 'Um campo maior aumenta o fluxo disponível.', (target) => Number(target.value) >= .8),
        manual('emf', 'Observe a evidência', 'Compare fem, corrente e polaridade ao longo do movimento.', '[data-readout-primary]', 'O sinal muda quando a variação de fluxo muda de sentido.'),
      ],
    },
    energy: {
      title: 'Da geração ao armazenamento',
      question: 'Como experimentos de campo se conectam a uma microrede real?',
      steps: [
        click('microgrid', 'Abra a microrede', 'Selecione Microgeração.', '[data-energy-mode="microgrid"]', 'Geração e armazenamento aparecem em um mesmo balanço.'),
        input('wind', 'Aumente o vento', 'Ajuste a velocidade do vento para pelo menos 12 m/s.', '[data-energy-param="windSpeed"]', 'A potência disponível no vento cresce fortemente com a velocidade.', (target) => Number(target.value) >= 12),
        input('battery', 'Descarregue a bateria', 'Ajuste a potência da bateria para pelo menos 2 kW.', '[data-energy-param="batteryPower"]', 'A bateria reduz a energia solicitada da rede.', (target) => Number(target.value) >= 2),
        manual('grid', 'Leia o balanço experimental', 'Observe geração, bateria e direção da rede.', '[data-energy-grid]', 'O medidor final resume várias transformações físicas.'),
      ],
    },
    waves: {
      title: 'Campo variável e ondas observáveis',
      question: 'Como uma oscilação produz padrões que se propagam?',
      steps: [
        click('waves', 'Abra Ondas', 'Selecione Ondas e interferência.', '[data-waves-mode="waves"]', 'Duas fontes permitem observar superposição.'),
        change('interference', 'Escolha duas fontes', 'Selecione Duas fontes.', '[data-param="wavePhenomenon"]', 'As amplitudes se somam ponto a ponto.', (target) => target.value === 'interference'),
        input('phase', 'Altere a fase', 'Ajuste a diferença de fase para pelo menos 3 rad.', '[data-param="phaseDifference"]', 'A fase desloca regiões de reforço e cancelamento.', (target) => Number(target.value) >= 3),
        manual('pattern', 'Observe o padrão', 'Compare o mapa de interferência e as leituras.', '[data-waves-graph]', 'O padrão espacial revela a soma das oscilações.'),
      ],
    },
  },
  curie: {
    thermal: {
      title: 'Medição cuidadosa das trocas de calor',
      question: 'Como massa, material e temperatura determinam o equilíbrio?',
      steps: [
        click('calorimetry', 'Prepare a mistura', 'Selecione Calorimetria.', '[data-thermal-mode="calorimetry"]', 'O modelo permite controlar massas, temperaturas e calores específicos.'),
        input('specific-heat', 'Troque a capacidade térmica', 'Aumente o calor específico do corpo frio para pelo menos 3.500 J/(kg·K).', '[data-param="coldSpecificHeat"]', 'Materiais diferentes exigem quantidades diferentes de energia para a mesma variação de temperatura.', (target) => Number(target.value) >= 3500),
        input('hot-temp', 'Ajuste a fonte quente', 'Leve a temperatura quente a pelo menos 100 °C.', '[data-param="hotTemperature"]', 'A diferença térmica inicial aumenta a energia transferida.', (target) => Number(target.value) >= 100),
        manual('record', 'Registre as medidas', 'Compare temperatura final, calor cedido e calor recebido.', '[data-readout="energy"]', 'Uma investigação confiável registra condições e resultado.'),
      ],
    },
    energy: {
      title: 'Energia, eficiência e evidências',
      question: 'Quais perdas aparecem entre a fonte e o uso final?',
      steps: [
        click('network', 'Abra a rede', 'Selecione Rede de distribuição.', '[data-energy-mode="network"]', 'A rede separa energia útil e perdas.'),
        input('efficiency', 'Reduza a eficiência', 'Ajuste a eficiência do transformador para no máximo 0,85.', '[data-energy-param="transformerEfficiency"]', 'Uma eficiência menor aumenta as perdas no transformador.', (target) => Number(target.value) <= .85),
        input('load', 'Aumente a demanda', 'Leve a demanda comunitária a pelo menos 70 kW.', '[data-energy-param="communityLoad"]', 'Maior corrente amplia perdas resistivas.', (target) => Number(target.value) >= 70),
        manual('evidence', 'Compare antes e depois', 'Observe tensão entregue e perdas totais.', '[data-result="losses"]', 'A comparação controlada permite atribuir o efeito à variável alterada.'),
      ],
    },
    magnetism: {
      title: 'Campo, núcleo e aquecimento',
      question: 'Como materiais e corrente alteram um eletroímã?',
      steps: [
        click('solenoid', 'Abra o eletroímã', 'Selecione Eletroímã.', '[data-mag-mode="solenoid"]', 'O solenoide permite controlar corrente, espiras e núcleo.'),
        change('core', 'Use ferrite', 'Selecione o núcleo de ferrite.', '[data-param="coreMu"]', 'O material aumenta a resposta magnética efetiva.', (target) => target.value === '80'),
        input('current', 'Aumente a corrente', 'Leve a corrente a pelo menos 3 A.', '[data-param="current"]', 'Campo e aquecimento respondem à corrente.', (target) => Number(target.value) >= 3),
        manual('measure-field', 'Compare campo e aquecimento', 'Observe as leituras principais e o estado do sistema.', '[data-readout-primary]', 'Uma medida isolada não basta: desempenho e segurança precisam ser comparados.'),
      ],
    },
    advanced: {
      title: 'Probabilidade e evidência na Física Quântica',
      question: 'Como interpretar uma previsão probabilística sem tratá-la como trajetória?',
      steps: [
        click('quantum', 'Abra Física Quântica', 'Selecione Física Quântica.', '[data-advanced-mode="quantum"]', 'A nuvem representa densidade de probabilidade.'),
        input('energy', 'Aumente a energia', 'Leve a energia da partícula a pelo menos 10 eV.', '[data-param="energyEv"]', 'A transmissão tende a aumentar quando a energia se aproxima da barreira.', (target) => Number(target.value) >= 10),
        input('width', 'Afine a barreira', 'Reduza a largura para no máximo 0,30 nm.', '[data-param="barrierWidthNm"]', 'Uma barreira mais estreita aumenta a probabilidade de tunelamento.', (target) => Number(target.value) <= .3),
        manual('probability', 'Leia a probabilidade', 'Observe transmissão e reflexão.', '[data-readouts]', 'O resultado é uma previsão estatística do modelo.'),
      ],
    },
    waves: {
      title: 'Espectro, cor e medição',
      question: 'Como o comprimento de onda se relaciona com a cor observada?',
      steps: [
        click('photonics', 'Abra Fotônica', 'Selecione Cores, fibra e interferência.', '[data-waves-mode="photonics"]', 'O módulo reúne comprimento de onda e representação de cor.'),
        change('prism', 'Escolha prisma', 'Selecione Prisma e cores.', '[data-param="photonicsMode"]', 'O índice varia com o comprimento de onda no modelo dispersivo.', (target) => target.value === 'prism'),
        input('wavelength', 'Vá ao violeta', 'Reduza o comprimento de onda para no máximo 430 nm.', '[data-param="wavelength"]', 'Comprimentos menores aparecem na região violeta do espectro visível.', (target) => Number(target.value) <= 430),
        manual('spectrum', 'Compare cor e leitura', 'Observe a cor representada e os resultados numéricos.', '[data-readout="primary"]', 'A cor é uma interpretação visual de uma faixa de comprimentos de onda.'),
      ],
    },
  },
  tesla: {
    ohm: {
      title: 'Circuito preparado para potência útil',
      question: 'Como tensão, topologia e proteção determinam o funcionamento da bancada?',
      steps: [
        click('parallel', 'Escolha paralelo', 'Selecione a montagem Paralela.', '[data-guided-template="parallel"]', 'Os ramos recebem a mesma tensão.'),
        click('voltage', 'Use 18 V', 'Selecione 18 V.', '[data-safe-voltage="18"]', 'A tensão maior torna diferenças de corrente mais visíveis.'),
        click('apply', 'Aplique com segurança', 'Use Aplicar montagem segura.', '[data-safe-start]', 'A proteção e o instrumento são configurados antes da análise.'),
        manual('power', 'Compare a potência dos ramos', 'Observe corrente total, potência e multímetro.', '[data-read="p"]', 'A potência total é a soma das transformações em cada ramo.'),
      ],
    },
    magnetism: {
      title: 'Transformação eficiente de tensão',
      question: 'Como a razão de espiras modifica tensão e corrente?',
      steps: [
        click('transformer', 'Abra o transformador', 'Selecione Transformador.', '[data-mag-mode="transformer"]', 'O núcleo acopla os dois enrolamentos.'),
        input('primary', 'Defina o primário', 'Ajuste o primário para pelo menos 800 espiras.', '[data-param="primaryTurns"]', 'A razão entre espiras controla a relação de tensão.', (target) => Number(target.value) >= 800),
        input('secondary', 'Crie uma saída elevada', 'Ajuste o secundário para pelo menos 1.100 espiras.', '[data-param="secondaryTurns"]', 'Com mais espiras no secundário, a tensão aumenta no modelo ideal.', (target) => Number(target.value) >= 1100),
        manual('transform', 'Leia tensão e eficiência', 'Compare primário, secundário, corrente e perdas.', '[data-readout-secondary]', 'A conservação de potência é limitada pela eficiência real.'),
      ],
    },
    energy: {
      title: 'Microrede com geração e armazenamento',
      question: 'Como coordenar fontes diferentes para reduzir a importação?',
      steps: [
        click('microgrid', 'Abra a microgeração', 'Selecione Microgeração.', '[data-energy-mode="microgrid"]', 'Solar, vento e bateria podem atuar em conjunto.'),
        input('solar', 'Amplie a potência solar', 'Leve a instalação a pelo menos 8 kW.', '[data-energy-param="solarRatedKw"]', 'A potência nominal define o teto do gerador solar.', (target) => Number(target.value) >= 8),
        input('wind', 'Aumente o vento', 'Leve o vento a pelo menos 10 m/s.', '[data-energy-param="windSpeed"]', 'A geração eólica cresce até o limite nominal.', (target) => Number(target.value) >= 10),
        input('battery', 'Forneça potência da bateria', 'Ajuste a bateria para pelo menos 2 kW.', '[data-energy-param="batteryPower"]', 'A bateria ajuda a atender a demanda local.', (target) => Number(target.value) >= 2),
        manual('independence', 'Verifique a troca com a rede', 'Observe se a rede importa ou exporta energia.', '[data-energy-grid]', 'Uma microrede coordenada reduz picos e pode exportar excedentes.'),
      ],
    },
    waves: {
      title: 'Ressonância e transmissão de sinais',
      question: 'Como frequência e geometria selecionam modos de oscilação?',
      steps: [
        click('resonance', 'Abra Ressonância', 'Selecione Ressonância e instrumentos.', '[data-waves-mode="resonance"]', 'Cordas e tubos possuem frequências naturais.'),
        input('harmonic', 'Escolha um harmônico alto', 'Ajuste o harmônico para pelo menos 4.', '[data-param="harmonic"]', 'Modos superiores apresentam mais nós e frequência maior.', (target) => Number(target.value) >= 4),
        input('tension', 'Aumente a tensão', 'Leve a tensão da corda a pelo menos 120 N.', '[data-param="tension"]', 'Maior tensão aumenta a velocidade da onda na corda.', (target) => Number(target.value) >= 120),
        manual('frequency', 'Compare as frequências', 'Observe frequência fundamental, harmônico e batimentos.', '[data-readout="primary"]', 'A geometria e as condições de contorno selecionam os modos permitidos.'),
      ],
    },
    advanced: {
      title: 'Causalidade e limites de transmissão',
      question: 'Quais eventos podem trocar informação sem superar a velocidade da luz?',
      steps: [
        click('causality', 'Abra Tempo e Causalidade', 'Selecione Tempo e Causalidade.', '[data-advanced-mode="timeTravel"]', 'O cone de luz separa eventos causalmente conectáveis.'),
        input('time', 'Aumente a separação temporal', 'Ajuste Δt para pelo menos 30 ns.', '[data-param="deltaTimeNs"]', 'Mais tempo permite que a luz percorra maior distância.', (target) => Number(target.value) >= 30),
        input('space', 'Aumente a distância espacial', 'Leve Δx a pelo menos 12 m.', '[data-param="deltaX"]', 'A classificação depende da comparação entre distância e cΔt.', (target) => Number(target.value) >= 12),
        manual('classification', 'Classifique os eventos', 'Observe intervalo e velocidade necessária.', '[data-readouts]', 'Uma transmissão física deve permanecer dentro ou sobre o cone de luz.'),
      ],
    },
  },
  galileo: {
    mechanics: {
      title: 'Movimento medido e repetido',
      question: 'Como uma alteração controlada muda uma trajetória?',
      steps: [
        click('projectile', 'Abra Projéteis', 'Selecione Lançamento de projéteis.', '[data-mechanics-mode="projectile"]', 'O movimento horizontal e vertical pode ser analisado separadamente.'),
        input('angle', 'Use 45 graus', 'Ajuste o ângulo entre 44° e 46°.', '[data-param="launchAngle"]', 'No modelo ideal e mesma altura, 45° maximiza o alcance.', (target) => Number(target.value) >= 44 && Number(target.value) <= 46),
        click('restart', 'Repita a experiência', 'Reinicie com o ângulo ajustado.', '[data-mechanics-restart]', 'Repetir desde a mesma condição permite comparação.'),
        manual('trajectory', 'Meça a trajetória', 'Observe alcance, altura e tempo de voo.', '[data-readout="primary"]', 'A medição substitui uma impressão apenas visual.'),
      ],
    },
    waves: {
      title: 'Som, eco e medida de distância',
      question: 'Como o tempo de retorno permite medir uma distância?',
      steps: [
        click('acoustics', 'Abra Acústica', 'Selecione Som e acústica.', '[data-waves-mode="acoustics"]', 'O módulo relaciona propagação, eco e reverberação.'),
        input('echo', 'Aumente o atraso do eco', 'Ajuste o atraso para pelo menos 0,20 s.', '[data-param="echoDelay"]', 'O som percorre ida e volta antes de retornar.', (target) => Number(target.value) >= .2),
        input('temperature', 'Mude a temperatura', 'Aumente a temperatura para pelo menos 30 °C.', '[data-param="temperature"]', 'A velocidade do som no ar muda com a temperatura.', (target) => Number(target.value) >= 30),
        manual('distance', 'Calcule pela observação', 'Compare atraso, velocidade e distância estimada.', '[data-readout="secondary"]', 'Tempo e velocidade permitem inferir uma distância não medida diretamente.'),
      ],
    },
    thermal: {
      title: 'Flutuação como experimento comparativo',
      question: 'Quando um corpo flutua, afunda ou fica em equilíbrio?',
      steps: [
        click('hydro', 'Abra Hidrostática', 'Selecione Hidrostática e empuxo.', '[data-thermal-mode="hydrostatics"]', 'Peso e empuxo podem ser comparados diretamente.'),
        input('depth', 'Mova a sonda', 'Aumente a profundidade para pelo menos 2 m.', '[data-param="probeDepth"]', 'A pressão aumenta com a profundidade.', (target) => Number(target.value) >= 2),
        input('mass', 'Ajuste a massa', 'Leve a massa do corpo para pelo menos 1,5 kg.', '[data-param="objectMass"]', 'A densidade média do corpo muda sem alterar seu volume.', (target) => Number(target.value) >= 1.5),
        manual('buoyancy', 'Compare peso e empuxo', 'Observe o estado de flutuação e as forças.', '[data-readout="secondary"]', 'A conclusão deve vir da comparação das grandezas.'),
      ],
    },
    energy: {
      title: 'Queda de tensão observada ao longo de uma rede',
      question: 'Como comprimento e corrente afetam o que chega ao consumidor?',
      steps: [
        click('network', 'Abra a distribuição', 'Selecione Rede de distribuição.', '[data-energy-mode="network"]', 'A cena representa fonte, linha e cargas.'),
        input('length', 'Alongue a linha', 'Ajuste o comprimento para pelo menos 3 km.', '[data-energy-param="lineLength"]', 'Uma linha maior possui maior resistência total.', (target) => Number(target.value) >= 3),
        input('load', 'Aumente a carga', 'Leve a demanda para pelo menos 90 kW.', '[data-energy-param="communityLoad"]', 'Maior demanda aumenta a corrente.', (target) => Number(target.value) >= 90),
        manual('voltage-drop', 'Observe a queda', 'Compare tensão da fonte, tensão entregue e perdas.', '[data-energy-grid]', 'A medição evidencia um efeito que não seria visível apenas olhando os cabos.'),
      ],
    },
    advanced: {
      title: 'Órbitas e evidências além do visível',
      question: 'Como velocidades orbitais revelam massa que não vemos diretamente?',
      steps: [
        click('dark-matter', 'Abra Matéria Escura', 'Selecione Matéria Escura.', '[data-advanced-mode="darkMatter"]', 'A curva de rotação compara matéria luminosa e halo.'),
        input('radius', 'Observe a região externa', 'Aumente o raio para pelo menos 20 kpc.', '[data-param="radiusKpc"]', 'A região externa é decisiva para a forma da curva.', (target) => Number(target.value) >= 20),
        input('halo', 'Aumente a contribuição do halo', 'Leve a velocidade do halo a pelo menos 230 km/s.', '[data-param="haloVelocityKmS"]', 'A curva total pode permanecer aproximadamente plana.', (target) => Number(target.value) >= 230),
        manual('evidence', 'Compare as curvas', 'Observe velocidade luminosa e velocidade total.', '[data-readouts]', 'A diferença entre previsão e observação sustenta uma inferência gravitacional.'),
      ],
    },
  },
});
