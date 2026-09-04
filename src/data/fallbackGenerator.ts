import { AnalysisResult, ComparisonCriterion, ProConItem, SWOTQuadrant } from '../types';

interface OptionProfile {
  title: string;
  isStability: boolean;
  isGrowth: boolean;
  isHighCapital: boolean;
  isLeanVariable: boolean;
  isComplexArch: boolean;
  isSimpleArch: boolean;
}

function extractProfile(text: string): OptionProfile {
  const t = text.toLowerCase();
  
  const isStability = /(стабильн|сохран|остать|надежн|корпорац|текущ|привычн|безопасн|медленн|постоянн|гаранти|штат|stay|keep|stable|enterprise|corporate|current|safe|familiar|in-house|steady)/i.test(t);
  const isGrowth = /(стартап|перейт|нов|бизнес|свой|венчур|фриланс|рискнуть|прорыв|масштаб|смен|startup|switch|join|new|business|venture|freelance|breakthrough|pivot|growth|risk)/i.test(t);
  const isHighCapital = /(купить|покупка|ипотек|собственн|автомобиль|машин|квартир|новостройк|приобрести|buy|purchase|mortgage|own vehicle|own car|apartment|acquire)/i.test(t);
  const isLeanVariable = /(аренд|снимать|каршеринг|такси|общественн|онлайн|практик|подписк|инвестир|rent|lease|car-share|ride-hail|transit|online|subscription|on-demand|invest)/i.test(t);
  const isComplexArch = /(микросервис|оркестрац|kubernetes|k8s|распределен|сервис-ориентир|microservice|distributed|cluster)/i.test(t);
  const isSimpleArch = /(монолит|модульн|единая кодовая|monolith|modular)/i.test(t);

  return {
    title: text,
    isStability,
    isGrowth,
    isHighCapital,
    isLeanVariable,
    isComplexArch,
    isSimpleArch
  };
}

interface ContextProfile {
  prioritizesSafety: boolean;
  prioritizesGrowth: boolean;
  resourceConstrained: boolean;
  urbanTransitFriendly: boolean;
}

function extractContext(contextText?: string): ContextProfile {
  if (!contextText || !contextText.trim()) {
    return {
      prioritizesSafety: false,
      prioritizesGrowth: false,
      resourceConstrained: false,
      urbanTransitFriendly: false
    };
  }

  const c = contextText.toLowerCase();

  const hasExplicitNoCommitments = /(нет|без|свободен от|не имею)\s+([а-яё\s]*)(обязательств|долг|кредит|детей)|(no\s+(commitments|debt|children|family commitments))/i.test(c);

  let prioritizesSafety = /(семья|дети|ребенок|кредит|ипотек|предсказуем|безопасн|подушк|стабильн|надежн|риск нежелателен|консервативн|гаранти|family|children|kid|debt|loan|mortgage|predictab|safety|buffer|runway|security|averse|conservative)/i.test(c);
  if (/(обязательств|commitment)/i.test(c) && !hasExplicitNoCommitments) {
    prioritizesSafety = true;
  }

  const prioritizesGrowth = /(рост|масштаб|прорыв|амбиц|максимум|карьер|высокий доход|готов к риску|аппетит к риску|рискован|экспанси|growth|scale|breakthrough|ambition|career|high yield|risk tolerant|risk appetite|upside|multiplier)/i.test(c);
  const resourceConstrained = /(мало|небольш|ограничен|6 разработчик|неопределен|ранний этап|старт|бюджет ограничен|сбережен|small team|team of 6|solo|constrained|tight budget|uncertain|early stage|mvp|limited)/i.test(c);
  const urbanTransitFriendly = /(город|инфраструктур|3-4 раза|редк|метро|такси|каршеринг|urban|city|transit|infrastructure|3-4|occasional|metro)/i.test(c);

  return {
    prioritizesSafety,
    prioritizesGrowth,
    resourceConstrained,
    urbanTransitFriendly
  };
}

export function generateLocalAnalysis(
  option1: string,
  option2: string,
  context?: string,
  language: 'ru' | 'en' = 'ru'
): AnalysisResult {
  const isEn = language === 'en';
  const opt1 = typeof option1 === 'string' ? option1.trim() : '';
  const opt2 = typeof option2 === 'string' ? option2.trim() : '';

  if (!opt1 || !opt2) {
    throw new Error(
      isEn
        ? 'Both decision options must be non-empty strings. Please specify valid options to compare.'
        : 'Оба варианта решения должны быть заполнены. Пожалуйста, укажите реальные варианты для сравнения.'
    );
  }

  const p1 = extractProfile(opt1);
  const p2 = extractProfile(opt2);
  const ctx = extractContext(context);

  // 1. Calculate Multi-Criteria Scores & Weights dynamically
  // Criterion 1: Upfront Capital & Resource Threshold (1 = heavy burden, 10 = low barrier / easy)
  let weight1 = 4;
  let score1_crit1 = 7;
  let score2_crit1 = 7;
  let note1_crit1 = isEn ? 'Standard entry investment threshold' : 'Стандартный порог первоначальных вложений';
  let note2_crit1 = isEn ? 'Standard entry investment threshold' : 'Стандартный порог первоначальных вложений';

  if (p1.isHighCapital && !p2.isHighCapital) {
    score1_crit1 = 4;
    score2_crit1 = 8;
    note1_crit1 = isEn ? 'Heavy capital outlay or long-term financial commitment' : 'Существенные капитальные затраты или долгосрочные обязательства';
    note2_crit1 = isEn ? 'Pay-as-you-go model with low entry barrier' : 'Модель гибкой оплаты по факту с минимальным порогом входа';
  } else if (!p1.isHighCapital && p2.isHighCapital) {
    score1_crit1 = 8;
    score2_crit1 = 4;
    note1_crit1 = isEn ? 'Low entry barrier without tying up liquidity' : 'Минимальный порог входа без заморозки ликвидности';
    note2_crit1 = isEn ? 'Heavy capital outlay and high initial investment threshold' : 'Существенные первоначальные затраты и порог входа';
  } else if (p1.isStability && p2.isGrowth) {
    score1_crit1 = 8;
    score2_crit1 = 5;
    note1_crit1 = isEn ? 'Predictable, transparent budgeting within existing bandwidth' : 'Прозрачный бюджет и сохранение существующей подушки';
    note2_crit1 = isEn ? 'High initial investment of hours, focus, and adaptation effort' : 'Требуются ощутимые первоначальные инвестиции сил и времени';
  } else if (p1.isGrowth && p2.isStability) {
    score1_crit1 = 5;
    score2_crit1 = 8;
    note1_crit1 = isEn ? 'High upfront investment of focus and transition effort' : 'Требуются ощутимые первоначальные инвестиции сил и времени';
    note2_crit1 = isEn ? 'Transparent predictable budgeting and lower initial friction' : 'Прозрачный бюджет и сохранение существующей подушки';
  }

  // Criterion 2: Risk Profile & Downside Protection (1 = high catastrophic risk, 10 = highly protected / reversible)
  let weight2 = 4;
  let score1_crit2 = 7;
  let score2_crit2 = 7;
  let note1_crit2 = isEn ? 'Moderate downside exposure' : 'Умеренный уровень операционного риска';
  let note2_crit2 = isEn ? 'Moderate downside exposure' : 'Умеренный уровень операционного риска';

  if (p1.isStability && !p2.isStability) {
    score1_crit2 = 8;
    score2_crit2 = 5;
    note1_crit2 = isEn ? 'High downside protection, proven safety margins, smooth reversal' : 'Контролируемые риски, надежный тыл, безболезненный откат';
    note2_crit2 = isEn ? 'Higher volatility and elevated sensitivity to early missteps' : 'Повышенная неопределенность и зависимость от внешних факторов';
  } else if (!p1.isStability && p2.isStability) {
    score1_crit2 = 5;
    score2_crit2 = 8;
    note1_crit2 = isEn ? 'Higher volatility and sensitivity to early missteps' : 'Повышенная неопределенность и зависимость от внешних факторов';
    note2_crit2 = isEn ? 'High downside protection, proven safety margins, smooth reversal' : 'Контролируемые риски, надежный тыл, безболезненный откат';
  } else if (p1.isSimpleArch && p2.isComplexArch) {
    score1_crit2 = 9;
    score2_crit2 = 5;
    note1_crit2 = isEn ? 'Single failure domain, rapid debugging, zero network partition risks' : 'Простой дебаг, единая модель транзакций, минимум точек отказа';
    note2_crit2 = isEn ? 'Distributed failures, network latency, high infrastructure complexity' : 'Распределенные сбои, сложность мониторинга и согласованности';
  } else if (p1.isComplexArch && p2.isSimpleArch) {
    score1_crit2 = 5;
    score2_crit2 = 9;
    note1_crit2 = isEn ? 'Distributed failures, network latency, high infrastructure complexity' : 'Распределенные сбои, сложность мониторинга и согласованности';
    note2_crit2 = isEn ? 'Single failure domain, rapid debugging, zero network partition risks' : 'Простой дебаг, единая модель транзакций, минимум точек отказа';
  }

  // Criterion 3: Strategic Upside & Growth Ceiling (1 = capped/flat, 10 = exponential potential)
  let weight3 = 4;
  let score1_crit3 = 7;
  let score2_crit3 = 7;
  let note1_crit3 = isEn ? 'Solid sustainable return profile' : 'Стабильная отдача в рамках стандартной траектории';
  let note2_crit3 = isEn ? 'Solid sustainable return profile' : 'Стабильная отдача в рамках стандартной траектории';

  if (p1.isGrowth && !p2.isGrowth) {
    score1_crit3 = 9;
    score2_crit3 = 5;
    note1_crit3 = isEn ? 'Strong asymmetric multiplier and high compounding upside' : 'Высокий мультипликатор отдачи и потенциал качественного прорыва';
    note2_crit3 = isEn ? 'Linear, steady increments with a bounded ceiling' : 'Линейный прогнозируемый рост с умеренным потолком';
  } else if (!p1.isGrowth && p2.isGrowth) {
    score1_crit3 = 5;
    score2_crit3 = 9;
    note1_crit3 = isEn ? 'Linear, steady increments with a bounded ceiling' : 'Линейный прогнозируемый рост с умеренным потолком';
    note2_crit3 = isEn ? 'Strong asymmetric multiplier and high compounding upside' : 'Высокий мультипликатор отдачи и потенциал качественного прорыва';
  }

  // Criterion 4: Execution Friction & Cognitive Stress (1 = high friction/burnout, 10 = frictionless/peaceful)
  let weight4 = 3;
  let score1_crit4 = 7;
  let score2_crit4 = 7;
  let note1_crit4 = isEn ? 'Manageable operational tempo' : 'Умеренная нагрузка на текущий график';
  let note2_crit4 = isEn ? 'Manageable operational tempo' : 'Умеренная нагрузка на текущий график';

  if ((p1.isStability || p1.isSimpleArch) && (p2.isGrowth || p2.isComplexArch)) {
    score1_crit4 = 8;
    score2_crit4 = 4;
    note1_crit4 = isEn ? 'Familiar rhythms with low mental friction and predictable schedules' : 'Привычный ритм, минимум тревожности и стабильный баланс';
    note2_crit4 = isEn ? 'Steep learning curve and extended stretch outside comfort zone' : 'Высокая когнитивная нагрузка и регулярный выход из зоны комфорта';
  } else if ((p1.isGrowth || p1.isComplexArch) && (p2.isStability || p2.isSimpleArch)) {
    score1_crit4 = 4;
    score2_crit4 = 8;
    note1_crit4 = isEn ? 'Steep learning curve and extended stretch outside comfort zone' : 'Высокая когнитивная нагрузка и регулярный выход из зоны комфорта';
    note2_crit4 = isEn ? 'Familiar rhythms with low mental friction and predictable schedules' : 'Привычный ритм, минимум тревожности и стабильный баланс';
  }

  // Criterion 5: Autonomy & Strategic Flexibility (1 = rigid/locked-in, 10 = fluid/dynamic)
  let weight5 = 3;
  let score1_crit5 = 7;
  let score2_crit5 = 7;
  let note1_crit5 = isEn ? 'Balanced degree of operational independence' : 'Сбалансированная степень операционной самостоятельности';
  let note2_crit5 = isEn ? 'Balanced degree of operational independence' : 'Сбалансированная степень операционной самостоятельности';

  if (p1.isLeanVariable && p2.isHighCapital) {
    score1_crit5 = 9;
    score2_crit5 = 4;
    note1_crit5 = isEn ? 'Ultimate mobility: easily cancel, pause, or switch at any moment' : 'Максимальная мобильность: возможность сменить или остановить в любой момент';
    note2_crit5 = isEn ? 'Long-term lock-in with ongoing depreciation, upkeep, and liability' : 'Долгосрочная привязка, амортизация и расходы на содержание';
  } else if (p1.isHighCapital && p2.isLeanVariable) {
    score1_crit5 = 4;
    score2_crit5 = 9;
    note1_crit5 = isEn ? 'Long-term lock-in with ongoing depreciation, upkeep, and liability' : 'Долгосрочная привязка, амортизация и расходы на содержание';
    note2_crit5 = isEn ? 'Ultimate mobility: easily cancel, pause, or switch at any moment' : 'Максимальная мобильность: возможность сменить или остановить в любой момент';
  } else if (p1.isGrowth && p2.isStability) {
    score1_crit5 = 8;
    score2_crit5 = 6;
    note1_crit5 = isEn ? 'Agile decision authority and freedom to pivot fast' : 'Высокая автономия и свобода быстро перестраивать процессы';
    note2_crit5 = isEn ? 'Bound by corporate bureaucracy and multi-layer approval chains' : 'Связанность регламентами и многоуровневыми согласованиями';
  } else if (p1.isStability && p2.isGrowth) {
    score1_crit5 = 6;
    score2_crit5 = 8;
    note1_crit5 = isEn ? 'Bound by established processes and slower approval cadence' : 'Связанность регламентами и многоуровневыми согласованиями';
    note2_crit5 = isEn ? 'Agile decision authority and freedom to pivot fast' : 'Высокая автономия и свобода быстро перестраивать процессы';
  }

  // Adjust weights dynamically based on user's context constraints!
  if (ctx.prioritizesSafety && !ctx.prioritizesGrowth) {
    weight1 = 5; // Capital threshold matters heavily
    weight2 = 5; // Risk safety matters most
    weight4 = 4; // Stress and mental health matter
    weight3 = 3; // Speculative upside is secondary
    weight5 = 3;
  } else if (ctx.prioritizesGrowth && !ctx.prioritizesSafety) {
    weight3 = 5; // Upside & growth multiplier matter most
    weight5 = 5; // Agility and autonomy matter heavily
    weight2 = 2; // Downside volatility is accepted by risk-tolerant user
    weight4 = 2; // Stepping out of comfort zone is actively welcomed
    weight1 = 3; // Upfront capital is secondary to scaling potential
  } else if (ctx.prioritizesSafety && ctx.prioritizesGrowth) {
    // Balanced: wants growth but has firm safety constraints
    weight1 = 4;
    weight2 = 5;
    weight3 = 4;
    weight4 = 3;
    weight5 = 3;
  }

  if (ctx.resourceConstrained) {
    weight1 = 5; // Low capital barrier critical
    weight4 = 4; // Low team stress critical
  }
  if (ctx.urbanTransitFriendly) {
    weight1 = 5;
    weight5 = 5;
  }

  const comparisonTable: ComparisonCriterion[] = [
    {
      id: 'crit-1',
      category: isEn ? 'Capital & Resource Barrier' : 'Финансы и затраты',
      title: isEn ? 'Upfront Capital & Resource Threshold' : 'Первоначальные затраты и порог входа',
      description: isEn ? 'Capital, liquidity, and setup effort required to launch' : 'Объем требуемых денежных и временных ресурсов для старта',
      weight: weight1,
      option1Score: score1_crit1,
      option1Note: note1_crit1,
      option2Score: score2_crit1,
      option2Note: note2_crit1
    },
    {
      id: 'crit-2',
      category: isEn ? 'Risk & Reversibility' : 'Риски и обратимость',
      title: isEn ? 'Downside Protection and Rollback Ease' : 'Уровень риска и обратимость решения',
      description: isEn ? 'Downside exposure and ability to pivot back without critical loss' : 'Вероятность непредвиденных сбоев и легкость возврата в исходное состояние',
      weight: weight2,
      option1Score: score1_crit2,
      option1Note: note1_crit2,
      option2Score: score2_crit2,
      option2Note: note2_crit2
    },
    {
      id: 'crit-3',
      category: isEn ? 'Strategic Upside' : 'Потенциал роста',
      title: isEn ? 'Long-term Growth Ceiling & Multiplier' : 'Долгосрочный потенциал и масштаб выгоды',
      description: isEn ? 'Compounded upside and career/business ceiling over 3-5 years' : 'Каковы дивиденды решения на горизонте 3–5 лет',
      weight: weight3,
      option1Score: score1_crit3,
      option1Note: note1_crit3,
      option2Score: score2_crit3,
      option2Note: note2_crit3
    },
    {
      id: 'crit-4',
      category: isEn ? 'Execution Friction' : 'Сложность и стресс',
      title: isEn ? 'Operational Friction & Cognitive Load' : 'Уровень стресса и когнитивная нагрузка',
      description: isEn ? 'Daily strain imposed on team bandwidth or personal well-being' : 'Психологическое давление и нагрузка на привычный образ жизни',
      weight: weight4,
      option1Score: score1_crit4,
      option1Note: note1_crit4,
      option2Score: score2_crit4,
      option2Note: note2_crit4
    },
    {
      id: 'crit-5',
      category: isEn ? 'Autonomy & Agility' : 'Гибкость и маневренность',
      title: isEn ? 'Strategic Flexibility & Market Adaptability' : 'Автономия и адаптивность к изменениям',
      description: isEn ? 'Freedom to adjust trajectory as circumstances fluctuate' : 'Насколько легко перестроить курс при смене внешних условий',
      weight: weight5,
      option1Score: score1_crit5,
      option1Note: note1_crit5,
      option2Score: score2_crit5,
      option2Note: note2_crit5
    }
  ];

  // 2. Generate Pros & Cons tailored to option profiles
  function buildProsCons(p: OptionProfile, opposite: OptionProfile, prefix: string) {
    const pros: ProConItem[] = [];
    const cons: ProConItem[] = [];

    if (p.isStability) {
      pros.push(
        { id: `${prefix}_p1`, text: isEn ? `High predictability and robust baseline security: "${p.title}"` : `Высокая предсказуемость и надежный тыл: «${p.title}»`, weight: 4, category: isEn ? 'Security' : 'Стабильность' },
        { id: `${prefix}_p2`, text: isEn ? 'Smooth daily operations with minimal friction' : 'Отсутствие резкого стресса адаптации и понятные правила', weight: 4, category: isEn ? 'Comfort' : 'Комфорт' },
        { id: `${prefix}_p3`, text: isEn ? 'Preservation of accumulated momentum and capital reserves' : 'Сохранение накопленных ресурсов и финансовой подушки', weight: 3, category: isEn ? 'Reserves' : 'Ресурсы' }
      );
      cons.push(
        { id: `${prefix}_c1`, text: isEn ? 'Restricted growth ceiling compared to high-upside alternatives' : 'Ограниченный потолок долгосрочного роста по сравнению с альтернативой', weight: 4, category: isEn ? 'Ceiling' : 'Рост' },
        { id: `${prefix}_c2`, text: isEn ? 'Potential opportunity cost and risk of gradual stagnation' : 'Риск постепенной потери конкурентного преимущества и стагнации', weight: 3, category: isEn ? 'Strategy' : 'Перспективы' }
      );
    } else if (p.isGrowth) {
      pros.push(
        { id: `${prefix}_p1`, text: isEn ? `High compounding multiplier and breakout potential: "${p.title}"` : `Мощный потенциал масштабирования и качественного скачка: «${p.title}»`, weight: 5, category: isEn ? 'Upside' : 'Перспективы' },
        { id: `${prefix}_p2`, text: isEn ? 'Accelerated development of in-demand capabilities' : 'Быстрое освоение передовых навыков и расширение зоны влияния', weight: 4, category: isEn ? 'Skills' : 'Развитие' },
        { id: `${prefix}_p3`, text: isEn ? 'Strong motivational velocity and entrepreneurial alignment' : 'Высокий уровень энергии, автономии и вовлеченности', weight: 3, category: isEn ? 'Motivation' : 'Энергия' }
      );
      cons.push(
        { id: `${prefix}_c1`, text: isEn ? 'Elevated volatility requiring disciplined risk mitigation' : 'Повышенная волатильность и требование к психологической стойкости', weight: 4, category: isEn ? 'Risk' : 'Риски' },
        { id: `${prefix}_c2`, text: isEn ? 'Heavier initial investment of focus, time, or capital' : 'Необходимость серьезных вложений сил на этапе разгона', weight: 4, category: isEn ? 'Effort' : 'Затраты' }
      );
    } else if (p.isHighCapital) {
      pros.push(
        { id: `${prefix}_p1`, text: isEn ? `Tangible ownership and asset accumulation: "${p.title}"` : `Формирование собственного материального актива: «${p.title}»`, weight: 4, category: isEn ? 'Equity' : 'Актив' },
        { id: `${prefix}_p2`, text: isEn ? 'Full control without dependency on third-party pricing' : 'Полный суверенитет и независимость от сторонних условий', weight: 3, category: isEn ? 'Control' : 'Контроль' }
      );
      cons.push(
        { id: `${prefix}_c1`, text: isEn ? 'Heavy liquidity lock-in and high ongoing carrying costs' : 'Заморозка значительной ликвидности и регулярные сопутствующие расходы', weight: 5, category: isEn ? 'Liquidity' : 'Финансы' },
        { id: `${prefix}_c2`, text: isEn ? 'Impaired mobility and substantial friction upon disposal' : 'Привязка к месту и сложность быстрого выхода без потерь', weight: 4, category: isEn ? 'Flexibility' : 'Гибкость' }
      );
    } else if (p.isLeanVariable) {
      pros.push(
        { id: `${prefix}_p1`, text: isEn ? `Zero upfront capital strain with preserved liquidity: "${p.title}"` : `Нулевая нагрузка на капитал и сохранность свободной ликвидности: «${p.title}»`, weight: 5, category: isEn ? 'Liquidity' : 'Ликвидность' },
        { id: `${prefix}_p2`, text: isEn ? 'Maximum agility: pause, reconfigure, or stop without penalty' : 'Абсолютная мобильность: легкая пауза или смена формата без штрафов', weight: 4, category: isEn ? 'Agility' : 'Гибкость' }
      );
      cons.push(
        { id: `${prefix}_c1`, text: isEn ? 'Absence of long-term accumulated tangible equity' : 'Отсутствие материального актива в личной собственности', weight: 3, category: isEn ? 'Equity' : 'Капитал' },
        { id: `${prefix}_c2`, text: isEn ? 'Ongoing dependency on provider tariffs and availability' : 'Зависимость от тарифов и качества сервиса провайдера', weight: 3, category: isEn ? 'Dependency' : 'Зависимость' }
      );
    } else if (p.isSimpleArch) {
      pros.push(
        { id: `${prefix}_p1`, text: isEn ? `Radical simplicity, atomic deployments, and fast velocity: "${p.title}"` : `Максимальная простота развертывания и скорость разработки: «${p.title}»`, weight: 5, category: isEn ? 'Velocity' : 'Скорость' },
        { id: `${prefix}_p2`, text: isEn ? 'Zero distributed systems overhead or networking complexity' : 'Отсутствие сетевых накладных расходов и сложной оркестрации', weight: 4, category: isEn ? 'Simplicity' : 'Надежность' }
      );
      cons.push(
        { id: `${prefix}_c1`, text: isEn ? 'Discipline required to prevent boundaries from eroding over time' : 'Требуется архитектурная дисциплина во избежание запутывания модулей', weight: 3, category: isEn ? 'Governance' : 'Архитектура' }
      );
    } else if (p.isComplexArch) {
      pros.push(
        { id: `${prefix}_p1`, text: isEn ? `Independent scaling boundaries and decoupled services: "${p.title}"` : `Независимое масштабирование компонентов и изоляция сбоев: «${p.title}»`, weight: 4, category: isEn ? 'Scale' : 'Масштаб' },
        { id: `${prefix}_p2`, text: isEn ? 'Technology diversity across domain boundaries' : 'Возможность использовать специализированный стек под каждый сервис', weight: 3, category: isEn ? 'Flexibility' : 'Технологии' }
      );
      cons.push(
        { id: `${prefix}_c1`, text: isEn ? 'High infrastructure complexity and operational toll on a small team' : 'Колоссальные накладные расходы на инфраструктуру для небольшой команды', weight: 5, category: isEn ? 'Overhead' : 'Сложность' },
        { id: `${prefix}_c2`, text: isEn ? 'Complex distributed debugging, tracing, and data consistency' : 'Сложная отладка распределенных транзакций и сетевых задержек', weight: 4, category: isEn ? 'Debugging' : 'Отладка' }
      );
    } else {
      // Balanced default for arbitrary options
      pros.push(
        { id: `${prefix}_p1`, text: isEn ? `Direct focus on primary objective: "${p.title}"` : `Сфокусированность на решении ключевой задачи: «${p.title}»`, weight: 4, category: isEn ? 'Focus' : 'Цель' },
        { id: `${prefix}_p2`, text: isEn ? 'Established precedent with documented success cases' : 'Наличие понятной практики реализации и доступных ориентиров', weight: 3, category: isEn ? 'Execution' : 'Практика' }
      );
      cons.push(
        { id: `${prefix}_c1`, text: isEn ? `Specific trade-offs inherent to path: "${p.title}"` : `Специфические ограничения, присущие выбранному пути: «${p.title}»`, weight: 3, category: isEn ? 'Tradeoff' : 'Ограничения' }
      );
    }

    return { pros, cons };
  }

  const prosCons1 = buildProsCons(p1, p2, 'p1');
  const prosCons2 = buildProsCons(p2, p1, 'p2');

  // 3. Generate SWOT Quadrants
  function buildSwot(p: OptionProfile, opposite: OptionProfile): SWOTQuadrant {
    if (p.isStability) {
      return {
        strengths: isEn
          ? ['Proven operational foundation and predictable guidelines', 'Minimal systemic downside exposure and established buffer', 'Resilience against adverse macroeconomic volatility']
          : ['Проверенная база и понятные операционные правила', 'Минимальный риск критических ошибок и надежный тыл', 'Устойчивость к неблагоприятным внешним колебаниям'],
        weaknesses: isEn
          ? ['Conservative velocity and slower compounding rate', 'Vulnerability to disengagement from repetitive routines', 'Ceiling on maximum asymmetric financial return']
          : ['Медленный темп качественного роста', 'Возможное выгорание от рутины и дефицит вдохновения', 'Ограниченный потолок максимальной отдачи'],
        opportunities: isEn
          ? ['Steady capital accrual while preparing an opportunistic future leap', 'Deepening core defensibility within an established domain']
          : ['Постепенное накопление резервов и подготовка к будущему скачку', 'Укрепление позиций и репутации в проверенной нише'],
        threats: isEn
          ? ['Gradual obsolescence under pressure from agile competitors', 'Opportunity cost from delaying modernization']
          : ['Устаревание текущей модели под давлением новых реалий', 'Упущенные стратегические возможности и потеря драйва']
      };
    } else if (p.isGrowth) {
      return {
        strengths: isEn
          ? ['Dynamic forward velocity and aggressive market capture', 'Rapid skill acquisition and modern methodology adoption', 'High ownership, intrinsic motivation, and team engagement']
          : ['Мощный вектор развития и динамичное движение вперед', 'Опережение конкурентов и освоение прогрессивных подходов', 'Высокая вовлеченность и эмоциональная отдача'],
        weaknesses: isEn
          ? ['Elevated sensitivity to execution missteps in early phases', 'Absence of established safety nets requiring frequent course adjustments']
          : ['Высокая чувствительность к ошибкам на раннем этапе', 'Нехватка гарантий и необходимость частых корректировок'],
        opportunities: isEn
          ? ['Breakthrough into an elite market or career tier', 'Establishing sustainable long-term competitive moat']
          : ['Выход на принципиально новый качественный уровень', 'Создание сильного конкурентного преимущества на годы вперед'],
        threats: isEn
          ? ['Premature resource exhaustion before reaching positive unit traction', 'Adverse external shocks during transition window']
          : ['Переоценка собственных сил и преждевременное истощение ресурсов', 'Резкие непредвиденные изменения внешних условий']
      };
    } else if (p.isHighCapital) {
      return {
        strengths: isEn
          ? ['Tangible equity ownership and wealth preservation asset', 'Independence from fluctuating landlord/supplier terms']
          : ['Формирование твердого материального актива', 'Независимость от изменения условий третьих лиц'],
        weaknesses: isEn
          ? ['Heavy liquidity depletion and high ongoing maintenance overhead', 'Significant barrier to exit or liquidation']
          : ['Высокая долговая нагрузка или заморозка ликвидности', 'Сложность быстрой ликвидации без финансового дисконта'],
        opportunities: isEn
          ? ['Long-term asset appreciation and collateral power', 'Stability for family planning and peace of mind']
          : ['Долгосрочный прирост стоимости актива', 'Надежная база для долгосрочного планирования жизни'],
        threats: isEn
          ? ['Depreciation or unforeseen maintenance capital requirements', 'Immobility should career or market necessitate relocation']
          : ['Непредвиденные сопутствующие траты и амортизация', 'Потеря мобильности при необходимости смены локации']
      };
    } else if (p.isLeanVariable) {
      return {
        strengths: isEn
          ? ['Preservation of liquid cash for high-yield deployment', 'Effortless scalability and zero depreciation liabilities']
          : ['Сохранение ликвидности для высокодоходных вложений', 'Отсутствие обязательств по амортизации и техобслуживанию'],
        weaknesses: isEn
          ? ['Recurring operational expense without residual equity build', 'Exposure to service availability and third-party fee increases']
          : ['Регулярные расходы без формирования остаточного капитала', 'Зависимость от цен и доступности сервиса'],
        opportunities: isEn
          ? ['Freedom to pivot location, tooling, or lifestyle instantaneously', 'Compound investment returns from retained capital']
          : ['Свобода сменить образ жизни или локацию в любой момент', 'Доходность от инвестирования сохраненного капитала'],
        threats: isEn
          ? ['Long-term cumulative rental inflation exceeding ownership costs', 'Sudden policy shifts by service platforms']
          : ['Долгосрочный рост тарифов сервисов', 'Внезапные изменения правил обслуживания']
      };
    } else {
      return {
        strengths: isEn
          ? ['Direct alignment with immediate requirements', 'Predictable operational footprint']
          : ['Прямое соответствие поставленной задаче', 'Понятный план первоочередных действий'],
        weaknesses: isEn
          ? ['Trade-offs in adjacent dimensions', 'Requires focused management bandwidth']
          : ['Необходимость балансировать компромиссы', 'Требование к дисциплине выполнения'],
        opportunities: isEn
          ? ['Achieving the target milestone with minimum friction', 'Building confidence through incremental wins']
          : ['Достижение цели с контролируемыми затратами', 'Укрепление позиций через последовательные шаги'],
        threats: isEn
          ? ['Unanticipated external condition changes', 'Alternative becoming unexpectedly superior']
          : ['Непредвиденные изменения внешних условий', 'Риск недооценки альтернативного пути']
      };
    }
  }

  const swot = {
    option1: buildSwot(p1, p2),
    option2: buildSwot(p2, p1)
  };

  // 4. Mathematical Determination of Winner and Confidence Score
  const totalWeights = comparisonTable.reduce((sum, c) => sum + c.weight, 0);
  const weightedSum1 = comparisonTable.reduce((sum, c) => sum + (c.option1Score * c.weight), 0);
  const weightedSum2 = comparisonTable.reduce((sum, c) => sum + (c.option2Score * c.weight), 0);

  const pct1 = (weightedSum1 / (totalWeights * 10)) * 100;
  const pct2 = (weightedSum2 / (totalWeights * 10)) * 100;

  const prosWeight1 = prosCons1.pros.reduce((s, p) => s + p.weight, 0);
  const consWeight1 = prosCons1.cons.reduce((s, c) => s + c.weight, 0);
  const netProsCons1 = prosWeight1 - consWeight1;

  const prosWeight2 = prosCons2.pros.reduce((s, p) => s + p.weight, 0);
  const consWeight2 = prosCons2.cons.reduce((s, c) => s + c.weight, 0);
  const netProsCons2 = prosWeight2 - consWeight2;

  // Composite difference
  const criteriaDiff = pct1 - pct2;
  const prosConsDiff = (netProsCons1 - netProsCons2) * 1.5;
  const totalScoreDiff = criteriaDiff + prosConsDiff;

  let winner: 'option1' | 'option2' | 'tie' = 'tie';
  let winnerTitle = '';
  let confidenceScore = 50;

  // Objective margin threshold of 2.5 points
  if (totalScoreDiff > 2.5) {
    winner = 'option1';
    winnerTitle = opt1;
    confidenceScore = Math.min(88, Math.max(60, Math.round(60 + Math.abs(totalScoreDiff) * 2.2)));
  } else if (totalScoreDiff < -2.5) {
    winner = 'option2';
    winnerTitle = opt2;
    confidenceScore = Math.min(88, Math.max(60, Math.round(60 + Math.abs(totalScoreDiff) * 2.2)));
  } else {
    winner = 'tie';
    winnerTitle = isEn ? 'Equal Parity / Balanced Trade-off' : 'Равный стратегический паритет';
    confidenceScore = 52;
  }

  // 5. Dynamic Verdict Narrative Synthesis based on actual winner
  let summary = '';
  let keyDrivers: string[] = [];
  let tradeOffSummary = '';
  let recommendedNextSteps: string[] = [];

  if (winner === 'option1') {
    if (isEn) {
      summary = `Based on multi-dimensional objective scoring, "${opt1}" emerges as the recommended path with a composite rating of ${pct1.toFixed(0)}% vs ${pct2.toFixed(0)}%. It delivers superior risk-adjusted return, capital efficiency, and alignment with your stated priorities while avoiding excessive early volatility.`;
      keyDrivers = [
        `Decisive advantage in downside protection and capital preservation (${score1_crit2}/10 vs ${score2_crit2}/10)`,
        `Lower operational friction and mental stress during execution (${score1_crit4}/10 vs ${score2_crit4}/10)`,
        `Strong structural alignment with risk constraints and predictable resource allocation`
      ];
      tradeOffSummary = `By committing to "${opt1}", you trade explosive speculative upside for defensive resilience and peace of mind. To compensate, proactively schedule quarterly reviews to capture growth opportunities without compromising stability.`;
      recommendedNextSteps = [
        `Lock in the core commitments for "${opt1}" and establish clear 30-day milestones`,
        `Optimize budget and resources to maximize the upside of this chosen baseline`,
        `Formalize contingency trigger points for reassessing high-growth alternatives in 6–12 months`
      ];
    } else {
      summary = `По результатам многофакторного скоринга вариант «${opt1}» получает итоговый перевес (${pct1.toFixed(0)}% против ${pct2.toFixed(0)}%). Он обеспечивает оптимальный баланс защищенности капитала, управляемости рисков и полного соответствия обозначенным ограничениям, избегая неоправданного стресса.`;
      keyDrivers = [
        `Существенный перевес по критериям надежности и сохранения ресурсов (${score1_crit2}/10 против ${score2_crit2}/10)`,
        `Минимальная когнитивная нагрузка и предсказуемость расписания (${score1_crit4}/10 против ${score2_crit4}/10)`,
        `Максимальное соответствие текущим жизненным и финансовым приоритетам`
      ];
      tradeOffSummary = `Выбирая «${opt1}», вы размениваете взрывной спекулятивный рост на предсказуемость и надежный тыл. Чтобы не упустить потенциал, запланируйте регулярный пересмотр стратегии раз в полгода.`;
      recommendedNextSteps = [
        `Зафиксировать договоренности и контрольные точки по варианту «${opt1}» на первые 30 дней`,
        `Оптимизировать распределение сил и ресурсов для выжимания максимума из текущего выбора`,
        `Определить условия и метрики, при наступлении которых стоит вернуться к рассмотрению более рискованных альтернатив`
      ];
    }
  } else if (winner === 'option2') {
    if (isEn) {
      summary = `Upon multi-criteria evaluation, "${opt2}" outscores the alternative (${pct2.toFixed(0)}% vs ${pct1.toFixed(0)}%). It presents superior strategic leverage and compounded return potential, making it the mathematically optimal decision under dynamic growth parameters.`;
      keyDrivers = [
        `Clear strategic dominance in long-term growth and multiplier (${score2_crit3}/10 vs ${score1_crit3}/10)`,
        `Higher agility, market responsiveness, and decision autonomy (${score2_crit5}/10 vs ${score1_crit5}/10)`,
        `Superior risk-adjusted return when backed by a disciplined execution plan`
      ];
      tradeOffSummary = `By opting for "${opt2}", you exchange near-term tranquility for long-term breakout capability. Staged milestone rollouts and risk buffers are strongly recommended to bound downside risk.`;
      recommendedNextSteps = [
        `Define unambiguous 30/60/90-day progress milestones for "${opt2}"`,
        `Formalize contingency safeguards and downside circuit-breakers to cap exposure`,
        `Execute the top 3 tactical activation actions within the next 7 calendar days`
      ];
    } else {
      summary = `При комплексном анализе вариант «${opt2}» демонстрирует уверенный перевес (${pct2.toFixed(0)}% против ${pct1.toFixed(0)}%). Он обладает значительно более высоким стратегическим потенциалом и окупаемостью, являясь наилучшим выбором для качественного прорыва.`;
      keyDrivers = [
        `Стратегический перевес по критерию долгосрочного масштабирования (${score2_crit3}/10 против ${score1_crit3}/10)`,
        `Высокая маневренность, автономия и адаптивность к рынку (${score2_crit5}/10 против ${score1_crit5}/10)`,
        `Возможность качественного скачка вместо затяжной стагнации`
      ];
      tradeOffSummary = `Выбирая «${opt2}», вы размениваете сиюминутное спокойствие на качественный рывок. Для нейтрализации рисков критически важно внедрять решение поэтапно с подушкой безопасности.`;
      recommendedNextSteps = [
        `Определить критические контрольные точки (Milestones) для варианта «${opt2}» на 30/60/90 дней`,
        `Сформировать план управления главными рисками и определить условия экстренного отката`,
        `Совершить первые 3 практических действия по запуску решения в течение ближайшей недели`
      ];
    }
  } else {
    // Balanced Tie
    if (isEn) {
      summary = `Both "${opt1}" and "${opt2}" present an exceptionally balanced trade-off (${pct1.toFixed(0)}% vs ${pct2.toFixed(0)}%). Neither option strictly dominates the other across all dimensions: one leads in stability and resilience, while the other excels in agility and growth.`;
      keyDrivers = [
        `Direct balance between security and upside potential (${pct1.toFixed(0)}% vs ${pct2.toFixed(0)}%)`,
        `Each option holds distinct non-overlapping competitive strengths`,
        `The final decision hinges directly on your personal threshold for risk vs velocity`
      ];
      tradeOffSummary = `There is no objective structural loser here. The decision is purely a strategic value judgment between certainty and ambition.`;
      recommendedNextSteps = [
        `Run a low-cost, 14-day small-scale pilot or simulation before irreversible commitment`,
        `Define a single tie-breaking constraint (e.g. strict monthly budget or hard timeline)`,
        `Consult a key stakeholder or peer who will be directly impacted by the outcome`
      ];
    } else {
      summary = `Оба варианта («${opt1}» и «${opt2}») находятся в состоянии близкого стратегического паритета (${pct1.toFixed(0)}% против ${pct2.toFixed(0)}%). Ни один из них безусловно не доминирует: один выигрывает в надежности и предсказуемости, а второй — в потенциале и гибкости.`;
      keyDrivers = [
        `Равный баланс между надежностью и потенциалом роста (${pct1.toFixed(0)}% против ${pct2.toFixed(0)}%)`,
        `Каждый вариант обладает выраженными преимуществами в своих категориях`,
        `Выбор зависит от вашего личного психологического приоритета (сохранение vs прорыв)`
      ];
      tradeOffSummary = `В данной ситуации нет однозначно худшего решения. Выбор между ними — это выбор личной стратегии отношения к риску.`;
      recommendedNextSteps = [
        `Провести недорогой двухнедельный тест-драйв или пилотную пробу выбранного формата`,
        `Выделить один решающий критерий-отсечку (например, жесткий лимит бюджета или дедлайн)`,
        `Обсудить выбор с ключевыми заинтересованными лицами, на которых повлияет результат`
      ];
    }
  }

  return {
    id: 'analysis-' + Date.now(),
    createdAt: new Date().toISOString(),
    option1Title: opt1,
    option2Title: opt2,
    context: context?.trim() || undefined,
    prosCons: {
      option1: prosCons1,
      option2: prosCons2
    },
    comparisonTable,
    swot,
    verdict: {
      winner,
      winnerTitle,
      confidenceScore,
      summary,
      keyDrivers,
      tradeOffSummary,
      recommendedNextSteps
    }
  };
}
