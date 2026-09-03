import { AnalysisResult } from '../types';

export function generateLocalAnalysis(
  option1: string,
  option2: string,
  context?: string,
  language: 'ru' | 'en' = 'ru'
): AnalysisResult {
  const isEn = language === 'en';
  const opt1 = option1.trim() || (isEn ? 'Option A' : 'Вариант 1');
  const opt2 = option2.trim() || (isEn ? 'Option B' : 'Вариант 2');

  if (isEn) {
    return {
      id: 'analysis-' + Date.now(),
      createdAt: new Date().toISOString(),
      option1Title: opt1,
      option2Title: opt2,
      context: context?.trim() || undefined,
      prosCons: {
        option1: {
          pros: [
            { id: 'p1_1', text: `Predictability, reliability, and established footing: "${opt1}"`, weight: 4, category: 'Stability' },
            { id: 'p1_2', text: `Lower operational ambiguity and minimal transition friction`, weight: 4, category: 'Risk' },
            { id: 'p1_3', text: `Transparent budgeting and predictable runway usage`, weight: 3, category: 'Resources' },
            { id: 'p1_4', text: `Preservation of existing organizational momentum and workflows`, weight: 3, category: 'Comfort' }
          ],
          cons: [
            { id: 'c1_1', text: `Potential opportunity cost from delayed innovation or scaling`, weight: 4, category: 'Growth' },
            { id: 'c1_2', text: `Risk of gradual stagnation against agile market competitors`, weight: 4, category: 'Strategy' },
            { id: 'c1_3', text: `Capped upside potential and constrained ceiling`, weight: 3, category: 'Efficiency' }
          ]
        },
        option2: {
          pros: [
            { id: 'p2_1', text: `High upside scaling potential and asymmetric long-term payoff`, weight: 5, category: 'Upside' },
            { id: 'p2_2', text: `Rapid capability building, modern skill adoption, and agility`, weight: 4, category: 'Development' },
            { id: 'p2_3', text: `Opportunity to seize leadership positioning in an emerging domain`, weight: 4, category: 'Strategy' },
            { id: 'p2_4', text: `High motivational velocity and ambitious organizational alignment`, weight: 3, category: 'Energy' }
          ],
          cons: [
            { id: 'c2_1', text: `Elevated variance and requirement for disciplined resilience`, weight: 4, category: 'Risk' },
            { id: 'c2_2', text: `Heavier initial upfront commitment of capital, focus, or hours`, weight: 4, category: 'Cost' },
            { id: 'c2_3', text: `Higher reversal friction should circumstances necessitate pivot`, weight: 3, category: 'Complexity' }
          ]
        }
      },
      comparisonTable: [
        {
          id: 'crit-1',
          category: 'Finance & Capital',
          title: 'Upfront Capital & Resource Threshold',
          description: 'Magnitude of initial capital, infrastructure, and hours required to execute',
          weight: 4,
          option1Score: 8,
          option1Note: 'Low-to-moderate barrier with predictable, transparent budget allocation',
          option2Score: 5,
          option2Note: 'Substantial upfront investment needed to establish traction'
        },
        {
          id: 'crit-2',
          category: 'Risk & Reversibility',
          title: 'Risk Profile and Rollback Ease',
          description: 'Downside exposure and ability to pivot back without catastrophic loss',
          weight: 5,
          option1Score: 8,
          option1Note: 'Known variables, robust safety margins, smooth pivot path',
          option2Score: 6,
          option2Note: 'Higher volatility; pivots carry noticeable transition costs'
        },
        {
          id: 'crit-3',
          category: 'Strategic Upside',
          title: 'Long-term Growth Ceiling & Multiplier',
          description: 'Compounded enterprise value and competitive advantage across a 3–5 year horizon',
          weight: 5,
          option1Score: 5,
          option1Note: 'Linear, steady increments without explosive multiplier potential',
          option2Score: 9,
          option2Note: 'Substantial compound upside if execution discipline is maintained'
        },
        {
          id: 'crit-4',
          category: 'Execution Friction',
          title: 'Operational Stress & Team Bandwidth',
          description: 'Burden imposed on current daily schedules and stress baseline',
          weight: 3,
          option1Score: 7,
          option1Note: 'Maintains familiar equilibrium with minimal cognitive overload',
          option2Score: 5,
          option2Note: 'Steep learning curve demanding temporary stretch outside comfort zone'
        },
        {
          id: 'crit-5',
          category: 'Agility & Autonomy',
          title: 'Strategic Flexibility & Market Adaptability',
          description: 'Ease of adjusting direction as external market dynamics fluctuate',
          weight: 4,
          option1Score: 6,
          option1Note: 'Constrained autonomy bound by legacy conventions',
          option2Score: 8,
          option2Note: 'High responsiveness with autonomy to restructure fast'
        }
      ],
      swot: {
        option1: {
          strengths: [
            'Proven operational foundation with audited, predictable rules',
            'Minimal exposure to critical systemic mistakes',
            'Resilient against adverse macroeconomic volatility'
          ],
          weaknesses: [
            'Slow compounding rate and conservative velocity',
            'Vulnerability to employee burnout from repetitive routine',
            'Dependencies on status-quo market conditions'
          ],
          opportunities: [
            'Steady accrual of reserves while preparing a targeted future leap',
            'Solidifying defensibility within a familiar niche'
          ],
          threats: [
            'Gradual obsolescence under pressure from agile disruptors',
            'Unrealized strategic upside leading to talent attrition'
          ]
        },
        option2: {
          strengths: [
            'Aggressive growth trajectory with dynamic forward momentum',
            'Preempting competitor movement with modern best practices',
            'High psychological engagement and team ownership'
          ],
          weaknesses: [
            'Heightened sensitivity to execution missteps in early phases',
            'Absence of historic precedent requiring frequent iterations'
          ],
          opportunities: [
            'Breakthrough into a dominant market or career tier',
            'Creating sustainable defensible moat for years ahead'
          ],
          threats: [
            'Premature resource burn before positive unit economics are unlocked',
            'Unanticipated external regulatory or macroeconomic shocks'
          ]
        }
      },
      verdict: {
        winner: 'option2',
        winnerTitle: opt2,
        confidenceScore: 74,
        summary: `Upon multi-criteria evaluation, "${opt2}" presents superior strategic leverage and compounded return, provided downside volatility is actively managed. While "${opt1}" offers defensive stability in the near term, it suffers from a constrained ceiling.`,
        keyDrivers: [
          `Clear strategic dominance in 3-5 year growth multiplier`,
          `High-value opportunity capture over defensive status-quo`,
          `Healthy risk-adjusted return when backed by a safety runway`
        ],
        tradeOffSummary: `By opting for "${opt2}", you exchange near-term tranquility for long-term breakout capability. Staged milestone rollout is strongly advised to keep downside bounded.`,
        recommendedNextSteps: [
          `Define unambiguous 30/60/90-day progress milestones for "${opt2}"`,
          `Formalize contingency safeguards and downside circuit-breakers`,
          `Lock in the commitment by executing the top 3 tactical actions within 7 calendar days`
        ]
      }
    };
  }

  // Default Russian generator
  return {
    id: 'analysis-' + Date.now(),
    createdAt: new Date().toISOString(),
    option1Title: opt1,
    option2Title: opt2,
    context: context?.trim() || undefined,
    prosCons: {
      option1: {
        pros: [
          { id: 'p1_1', text: `Привычность, надежность и предсказуемость пути: "${opt1}"`, weight: 4, category: 'Стабильность' },
          { id: 'p1_2', text: `Меньше неизвестных факторов и стресса адаптации на старте`, weight: 4, category: 'Риски' },
          { id: 'p1_3', text: `Более понятная оценка затрат ресурсов и времени`, weight: 3, category: 'Ресурсы' },
          { id: 'p1_4', text: `Сохранение текущих наработок и отсутствие резкого слома привычек`, weight: 3, category: 'Комфорт' }
        ],
        cons: [
          { id: 'c1_1', text: `Потенциально упущенная выгода от инноваций или качественного скачка`, weight: 4, category: 'Рост' },
          { id: 'c1_2', text: `Риск стагнации или постепенного отставания в долгосрочной перспективе`, weight: 4, category: 'Перспективы' },
          { id: 'c1_3', text: `Ограниченный потолок возможного выигрыша`, weight: 3, category: 'Эффективность' }
        ]
      },
      option2: {
        pros: [
          { id: 'p2_1', text: `Высокий потенциал роста, масштабирования и качественного прорыва`, weight: 5, category: 'Перспективы' },
          { id: 'p2_2', text: `Новый опыт, развитие актуальных навыков и гибкости`, weight: 4, category: 'Развитие' },
          { id: 'p2_3', text: `Возможность занять более сильную конкурентную позицию`, weight: 4, category: 'Стратегия' },
          { id: 'p2_4', text: `Мотивационный заряд от новизны и амбициозной цели`, weight: 3, category: 'Энергия' }
        ],
        cons: [
          { id: 'c2_1', text: `Повышенная неопределенность и требование к стрессоустойчивости`, weight: 4, category: 'Риски' },
          { id: 'c2_2', text: `Необходимость дополнительных инвестиций времени или ресурсов на старте`, weight: 4, category: 'Затраты' },
          { id: 'c2_3', text: `Возможное сопротивление окружения или сложность отката назад`, weight: 3, category: 'Сложность' }
        ]
      }
    },
    comparisonTable: [
      {
        id: 'crit-1',
        category: 'Финансы и затраты',
        title: 'Первоначальные затраты и порог входа',
        description: 'Объем требуемых денежных и временных ресурсов для старта',
        weight: 4,
        option1Score: 8,
        option1Note: 'Низкий или умеренный уровень первоначальных вложений, прозрачный бюджет',
        option2Score: 5,
        option2Note: 'Требуются ощутимые первоначальные инвестиции сил, времени или средств'
      },
      {
        id: 'crit-2',
        category: 'Риски',
        title: 'Уровень риска и обратимость решения',
        description: 'Вероятность непредвиденных сбоев и легкость возврата в исходное состояние',
        weight: 5,
        option1Score: 8,
        option1Note: 'Контролируемые риски, легкий или безболезненный откат',
        option2Score: 6,
        option2Note: 'Повышенная волатильность, решение сложнее аннулировать без потерь'
      },
      {
        id: 'crit-3',
        category: 'Потенциал',
        title: 'Долгосрочный потенциал и масштаб выгоды',
        description: 'Каковы дивиденды решения на горизонте 3–5 лет',
        weight: 5,
        option1Score: 5,
        option1Note: 'Умеренный, прогнозируемый прирост без экспоненциального взлета',
        option2Score: 9,
        option2Note: 'Максимальный потолок возможностей при успешной реализации'
      },
      {
        id: 'crit-4',
        category: 'Комфорт',
        title: 'Уровень стресса и психологический комфорт',
        description: 'Психологическое давление и нагрузка на привычный образ жизни',
        weight: 3,
        option1Score: 7,
        option1Note: 'Сохранение привычного ритма, минимум тревожности',
        option2Score: 5,
        option2Note: 'Высокая интенсивность адаптации, временный выход из зоны комфорта'
      },
      {
        id: 'crit-5',
        category: 'Гибкость',
        title: 'Автономия и адаптивность к внешним изменениям',
        description: 'Насколько легко подстроиться под меняющиеся внешние условия',
        weight: 4,
        option1Score: 6,
        option1Note: 'Ограниченная гибкость, привязка к существующим рамкам',
        option2Score: 8,
        option2Note: 'Высокая мобильность и способность оперативно перестроить курс'
      }
    ],
    swot: {
      option1: {
        strengths: [
          'Проверенная база и понятные операционные правила',
          'Минимальный риск критических ошибок',
          'Меньшая зависимость от благоприятной конъюнктуры'
        ],
        weaknesses: [
          'Медленный темп качественного роста',
          'Возможное выгорание от рутины и дефицит вдохновения',
          'Зависимость от стабильности внешних факторов'
        ],
        opportunities: [
          'Постепенное накопление резервов и подготовка к будущему скачку',
          'Укрепление экспертности в проверенной нише'
        ],
        threats: [
          'Устаревание текущей модели под давлением новых реалий',
          'Потеря интереса и упущенные стратегические возможности'
        ]
      },
      option2: {
        strengths: [
          'Мощный вектор развития и динамичное движение вперед',
          'Опережение конкурентов и освоение прогрессивных подходов',
          'Высокая вовлеченность и эмоциональная отдача'
        ],
        weaknesses: [
          'Высокая чувствительность к ошибкам на раннем этапе',
          'Нехватка гарантий и необходимость частых корректировок'
        ],
        opportunities: [
          'Выход на принципиально новый качественный уровень',
          'Создание сильного конкурентного преимущества на годы вперед'
        ],
        threats: [
          'Переоценка собственных сил и преждевременное истощение ресурсов',
          'Резкие непредвиденные изменения внешних условий'
        ]
      }
    },
    verdict: {
      winner: 'option2',
      winnerTitle: opt2,
      confidenceScore: 74,
      summary: `При комплексном анализе вариант «${opt2}» обладает значительно более высоким стратегическим потенциалом, хотя требует осознанного управления рисками. Вариант «${opt1}» обеспечивает высокую стабильность в краткосрочном периоде, но уступает по итоговой отдаче.`,
      keyDrivers: [
        `Стратегический перевес по критерию долгосрочного роста`,
        `Возможность качественного прорыва вместо консервативной стагнации`,
        `Оптимальный баланс при условии формирования подушки безопасности`
      ],
      tradeOffSummary: `Выбирая «${opt2}», вы размениваете сиюминутное спокойствие на качественный рывок. Для минимизации риска рекомендуется составить план поэтапного внедрения.`,
      recommendedNextSteps: [
        `Определить критические контрольные точки (Milestones) для варианта «${opt2}»`,
        `Сформировать план управления главными рисками и запасной вариант отката`,
        `Принять финальное решение с фиксацией 3 конкретных шагов на ближайшую неделю`
      ]
    }
  };
}
