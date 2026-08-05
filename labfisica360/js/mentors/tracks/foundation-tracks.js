import { manual, click, input, change } from './step-builders.js';

export const FOUNDATION_TRACKS = Object.freeze({
  einstein: {
    mechanics: {
      title: 'Movimento visto por condições diferentes',
      question: 'Como as condições iniciais mudam a trajetória observada?',
      steps: [
        click('projectile', 'Escolha o lançamento', 'Abra o experimento de projéteis.', '[data-mechanics-mode="projectile"]', 'A cena passa a representar um movimento com componentes horizontal e vertical.'),
        input('speed', 'Mude a velocidade inicial', 'Altere a velocidade de lançamento e observe a nova trajetória.', '[data-param="launchSpeed"]', 'O alcance e a altura respondem à velocidade inicial.', (target) => Number(target.value) >= 18),
        input('angle', 'Mude o ângulo', 'Ajuste o ângulo para comparar duas trajetórias.', '[data-param="launchAngle"]', 'O mesmo módulo de velocidade pode produzir trajetórias diferentes.', (target) => Number(target.value) >= 50),
        click('restart', 'Reinicie a experiência', 'Reinicie para aplicar as condições escolhidas desde o início.', '[data-mechanics-restart]', 'A comparação fica limpa quando o tempo volta a zero.'),
        manual('observe', 'Explique o que mudou', 'Compare alcance, altura máxima e tempo de voo nos resultados.', '[data-readout="primary"]', 'Registre mentalmente qual grandeza mudou mais.'),
      ],
    },
    coulomb: {
      title: 'Campo e potencial como modelos do espaço',
      question: 'Como uma configuração de cargas modifica o espaço ao redor?',
      steps: [
        click('asymmetric', 'Escolha uma configuração assimétrica', 'Selecione o cenário Assimétrico.', '[data-preset="asymmetric"]', 'Cargas de módulos diferentes produzem um mapa não simétrico.'),
        input('charge', 'Intensifique uma carga', 'Aumente q₁ para pelo menos 4 μC.', '[data-input="q1"]', 'O campo cresce com o módulo da carga.', (target) => Number(target.value) >= 4),
        click('potential', 'Mostre o potencial', 'Ative a camada Potencial.', '[data-action="potential"]', 'Potencial é escalar; campo é vetorial.'),
        manual('compare', 'Compare campo e potencial', 'Observe a leitura da sonda e o mapa ao redor das cargas.', '[data-out="potential"]', 'As duas representações descrevem a mesma configuração por grandezas diferentes.'),
      ],
    },
    ohm: {
      title: 'Energia elétrica em uma rede de componentes',
      question: 'Como a organização do circuito altera a distribuição de energia?',
      steps: [
        click('mixed', 'Escolha uma rede mista', 'Selecione a montagem Mista.', '[data-guided-template="mixed"]', 'Uma rede mista combina características de série e paralelo.'),
        click('voltage', 'Defina a fonte', 'Selecione 18 V para tornar as diferenças mais visíveis.', '[data-safe-voltage="18"]', 'A fonte define a energia por unidade de carga.'),
        click('apply', 'Aplique a montagem segura', 'Use Aplicar montagem segura.', '[data-safe-start]', 'Cabos, proteção e instrumento serão configurados automaticamente.'),
        manual('read', 'Leia a distribuição', 'Compare tensão, corrente, potência e leitura do multímetro.', '[data-read="p"]', 'A potência mostra a taxa de transformação de energia.'),
      ],
    },
  },
  newton: {
    mechanics: {
      title: 'Força resultante e mudança do movimento',
      question: 'Qual relação aparece entre força, massa e aceleração?',
      steps: [
        click('dynamics', 'Abra Dinâmica e atrito', 'Escolha o modo Dinâmica.', '[data-mechanics-mode="dynamics"]', 'O diagrama de forças será a referência.'),
        input('angle', 'Incline a rampa', 'Ajuste o ângulo da rampa para pelo menos 30°.', '[data-param="rampAngle"]', 'A componente do peso paralela à rampa aumenta.', (target) => Number(target.value) >= 30),
        input('force', 'Aplique uma força externa', 'Aumente a força aplicada.', '[data-param="appliedForce"]', 'A força resultante determina a aceleração.', (target) => Math.abs(Number(target.value)) >= 5),
        click('restart', 'Reinicie e compare', 'Reinicie a experiência com os novos valores.', '[data-mechanics-restart]', 'O movimento recomeça com as mesmas condições iniciais.'),
        manual('result', 'Relacione força e aceleração', 'Observe aceleração e força resultante.', '[data-readout="primary"]', 'Procure uma relação coerente com ΣF = m·a.'),
      ],
    },
    coulomb: {
      title: 'Uma força que depende da distância',
      question: 'O que acontece com a força elétrica quando a distância muda?',
      steps: [
        click('repulsion', 'Prepare a repulsão', 'Selecione o cenário Repulsão.', '[data-preset="repulsion"]', 'Cargas de mesmo sinal se afastam.'),
        input('q2', 'Confirme o mesmo sinal', 'Mantenha q₂ positiva e aumente seu módulo.', '[data-input="q2"]', 'O produto q₁q₂ positivo indica repulsão.', (target) => Number(target.value) >= 2),
        click('play', 'Execute o movimento', 'Pressione Executar.', '[data-action="play"]', 'A aceleração visual representa o efeito da força calculada.'),
        manual('force', 'Leia força e distância', 'Compare a força com a distância mostrada.', '[data-out="force"]', 'A lei apresenta dependência inversa com o quadrado da distância.'),
      ],
    },
    ohm: {
      title: 'Relações entre tensão, corrente e resistência',
      question: 'Como a corrente responde quando tensão e resistência são definidas?',
      steps: [
        click('series', 'Escolha circuito série', 'Selecione Série.', '[data-guided-template="series"]', 'A corrente será comum aos componentes.'),
        click('voltage', 'Use uma referência de 12 V', 'Selecione 12 V.', '[data-safe-voltage="12"]', 'A tensão total é distribuída entre as cargas.'),
        click('apply', 'Monte com segurança', 'Aplique a montagem segura.', '[data-safe-start]', 'O sistema configura a topologia e o instrumento.'),
        input('resistance', 'Mude uma resistência', 'Altere R₁ para observar a resposta da corrente.', '[data-input="r1"]', 'Com tensão fixa, maior resistência reduz a corrente.', (target) => Number(target.value) >= 150),
        manual('relation', 'Compare U, I e R', 'Leia as grandezas principais e verifique U ≈ R·I.', '[data-read="i"]', 'A relação deve permanecer coerente dentro do modelo.'),
      ],
    },
  },
  faraday: {
    ohm: {
      title: 'Montagem, instrumento e evidência',
      question: 'Como uma montagem segura produz uma medição confiável?',
      steps: [
        click('series', 'Escolha uma montagem simples', 'Selecione Série.', '[data-guided-template="series"]', 'Uma topologia simples facilita acompanhar o caminho da corrente.'),
        click('voltage', 'Comece em baixa tensão', 'Selecione 6 V.', '[data-safe-voltage="6"]', 'Começar com menor tensão é uma boa prática experimental.'),
        click('apply', 'Prepare cabos e instrumento', 'Pressione Aplicar montagem segura.', '[data-safe-start]', 'A bancada organiza conexões, proteção e multímetro.'),
        change('meter', 'Escolha a medição', 'Troque o modo do multímetro.', '[data-select="meter-mode"]', 'O instrumento precisa ser configurado para a grandeza desejada.'),
        manual('measure', 'Registre a leitura', 'Observe a leitura do multímetro e compare com os valores calculados.', '[data-read="meter"]', 'Uma medição só tem significado quando ligação e escala estão corretas.'),
      ],
    },
    coulomb: {
      title: 'Linhas de campo como evidência espacial',
      question: 'Como a sonda revela a direção do campo em diferentes pontos?',
      steps: [
        click('attraction', 'Prepare cargas opostas', 'Selecione Atração.', '[data-preset="attraction"]', 'As linhas tendem a conectar a carga positiva à negativa.'),
        click('field', 'Ative o campo', 'Garanta que a camada Campo esteja ativa.', '[data-action="field"]', 'O vetor mostra direção e intensidade local.'),
        input('charge', 'Altere uma fonte', 'Aumente o módulo de q₁.', '[data-input="q1"]', 'O campo próximo da carga mais intensa aumenta.', (target) => Number(target.value) >= 3),
        manual('probe', 'Use a sonda', 'Arraste a sonda em pontos diferentes e observe a leitura.', '[data-coulomb-stage]', 'A sonda mede sem modificar as cargas do modelo.'),
      ],
    },
    mechanics: {
      title: 'Oscilação observada por repetição',
      question: 'Como comprimento e massa influenciam uma oscilação?',
      steps: [
        click('oscillator', 'Abra Oscilações', 'Escolha o modo Oscilações.', '[data-mechanics-mode="oscillators"]', 'O laboratório oferece pêndulo e massa-mola.'),
        change('type', 'Escolha o pêndulo', 'Selecione Pêndulo no tipo de oscilador.', '[data-param="oscillator"]', 'O período do pêndulo depende principalmente de comprimento e gravidade.'),
        input('length', 'Mude o comprimento', 'Aumente o comprimento do pêndulo.', '[data-param="pendulumLength"]', 'Um pêndulo mais longo oscila mais lentamente.', (target) => Number(target.value) >= 2),
        click('restart', 'Repita desde o início', 'Reinicie a experiência.', '[data-mechanics-restart]', 'Repetir com uma única variável alterada melhora a comparação.'),
        manual('period', 'Compare o período', 'Observe o período e o gráfico.', '[data-readout="secondary"]', 'A repetição permite reconhecer o padrão.'),
      ],
    },
  },
});

