export type Language = 'ru' | 'en';

export interface TranslationDict {
  header: {
    appTitle: string;
    versionBadge: string;
    subtitle: string;
    exportPdf: string;
    newComparison: string;
    engineBadge: string;
    viewAndroid: string;
    viewDesktop: string;
    switchLang: string;
  };
  form: {
    step1: string;
    title: string;
    subtitle: string;
    presetsTitle: string;
    option1Label: string;
    option1Placeholder: string;
    option2Label: string;
    option2Placeholder: string;
    addContext: string;
    hideContext: string;
    contextLabel: string;
    contextPlaceholder: string;
    submit: string;
    submitting: string;
    hint: string;
  };
  tabs: {
    all: string;
    prosCons: string;
    comparison: string;
    swot: string;
    verdict: string;
  };
  prosCons: {
    title: string;
    subtitle: string;
    pros: string;
    cons: string;
    weight: string;
    weightLabel: string;
    totalPros: string;
    totalCons: string;
    balance: string;
    favorable: string;
    unfavorable: string;
  };
  comparison: {
    title: string;
    subtitle: string;
    criterion: string;
    weight: string;
    score: string;
    totalScore: string;
    advantage: string;
    tied: string;
  };
  swot: {
    title: string;
    subtitle: string;
    strengths: string;
    weaknesses: string;
    opportunities: string;
    threats: string;
    strengthsDesc: string;
    weaknessesDesc: string;
    opportunitiesDesc: string;
    threatsDesc: string;
    both: string;
    only1: string;
    only2: string;
  };
  verdict: {
    title: string;
    winner: string;
    winnerTitle: string;
    confidence: string;
    summary: string;
    keyDrivers: string;
    keyFactors: string;
    tradeOff: string;
    tradeoff: string;
    nextSteps: string;
    copyReport: string;
    copyMarkdown: string;
    copied: string;
    print: string;
    printPdf: string;
    downloadJson: string;
    tieTitle: string;
    tie: string;
  };
  pwa: {
    install: string;
    installBtn: string;
    installed: string;
    active: string;
    installPrompt: string;
    modalTitle: string;
    modalSubtitle: string;
    guideTitle: string;
    guideSubtitle: string;
    iosTitle: string;
    iosStep1: string;
    iosStep2: string;
    androidTitle: string;
    androidStep1: string;
    androidStep2: string;
    androidBenefit: string;
    gotIt: string;
    understand: string;
  };
  offline: {
    title: string;
    description: string;
  };
  footer: {
    rights: string;
    tagline: string;
  };
  androidDevice: {
    title: string;
    toggleMode: string;
    backToDesktop: string;
    landscape: string;
    portrait: string;
    zoomFit: string;
    zoom100: string;
    standaloneMode: string;
    browserMode: string;
    carrier: string;
  };
}

export const translations: Record<Language, TranslationDict> = {
  ru: {
    header: {
      appTitle: 'DecisionCanvas',
      versionBadge: 'Android Ready',
      subtitle: 'Выбор решения из двух вариантов',
      exportPdf: 'Экспорт',
      newComparison: 'Новое сравнение',
      engineBadge: 'Движок сравнения',
      viewAndroid: 'Экран Android',
      viewDesktop: 'Обычный вид',
      switchLang: 'English',
    },
    form: {
      step1: 'Шаг 1: Конфигурация',
      title: 'Формулирование дилеммы и альтернатив',
      subtitle: 'Введите 2 альтернативных решения. Система построит «За / Против», шкалу взвешенного скоринга и матрицу SWOT.',
      presetsTitle: 'Готовые сценарии анализа:',
      option1Label: 'Вариант решения А (Первая опция)',
      option1Placeholder: 'например, Остаться в стабильной крупной компании...',
      option2Label: 'Вариант решения Б (Вторая опция)',
      option2Placeholder: 'например, Перейти ведущим разработчиком в стартап...',
      addContext: '+ Добавить контекст ситуации (бюджет, цели, сроки, риски)',
      hideContext: '– Скрыть контекст',
      contextLabel: 'Контекст ситуации и приоритеты (необязательно, но повышает точность)',
      contextPlaceholder: 'Укажите важные ограничения: семья, финансовая подушка, горизонт планирования, готовность к риску...',
      submit: 'Сравнить решения и рассчитать вердикт',
      submitting: 'Формирование стратегического анализа...',
      hint: 'Интеллектуальный синтез: взвешенные списки «За/Против», 10-балльная матрица критериев, SWOT и итоговый вердикт.',
    },
    tabs: {
      all: 'Все форматы',
      prosCons: '«За» и «Против»',
      comparison: 'Таблица сравнения',
      swot: 'SWOT-матрица',
      verdict: 'Итоговый вердикт',
    },
    prosCons: {
      title: 'Анализ аргументов «За» и «Против»',
      subtitle: 'Оценка преимуществ и рисков каждого варианта с учетом силы влияния аргументов (от 1 до 5)',
      pros: '«ЗА» (Преимущества)',
      cons: '«ПРОТИВ» (Риски и минусы)',
      weight: 'Вес',
      weightLabel: 'Сила аргумента',
      totalPros: 'Сумма плюсов',
      totalCons: 'Сумма минусов',
      balance: 'Итоговый баланс',
      favorable: 'Преобладают плюсы',
      unfavorable: 'Преобладают минусы',
    },
    comparison: {
      title: 'Матрица критериев сравнения',
      subtitle: 'Детализированный скоринг по ключевым осям: финансы, риски, потенциал, гибкость и ресурсы',
      criterion: 'Критерий оценки',
      weight: 'Вес (1-5)',
      score: 'Балл (1-10)',
      totalScore: 'Итоговый взвешенный балл',
      advantage: 'Лидер по критерию',
      tied: 'Равнозначно',
    },
    swot: {
      title: 'Стратегическая SWOT-матрица',
      subtitle: 'Системный взгляд на внутренние факторы (силы/слабости) и внешние обстоятельства (шансы/угрозы)',
      strengths: 'Сильные стороны (Strengths)',
      weaknesses: 'Слабые стороны (Weaknesses)',
      opportunities: 'Возможности (Opportunities)',
      threats: 'Угрозы и риски (Threats)',
      strengthsDesc: 'Внутренние конкурентные преимущества и сильные стороны',
      weaknessesDesc: 'Внутренние уязвимости, дефицит ресурсов и ограничения',
      opportunitiesDesc: 'Внешние благоприятные факторы и перспективы роста',
      threatsDesc: 'Внешние барьеры, неопределенности и риски среды',
      both: 'Оба варианта',
      only1: 'Только Вариант 1',
      only2: 'Только Вариант 2',
    },
    verdict: {
      title: 'Стратегический вердикт и рекомендации',
      winner: 'Рекомендуемое решение',
      winnerTitle: 'Победитель анализа',
      confidence: 'Индекс уверенности модели',
      summary: 'Аналитическое резюме вердикта',
      keyDrivers: 'Ключевые факторы в пользу выбора',
      keyFactors: 'Ключевые факторы в пользу выбора',
      tradeOff: 'Главный компромисс (Trade-off)',
      tradeoff: 'Главный компромисс (Trade-off)',
      nextSteps: 'Рекомендуемые первые шаги',
      copyReport: 'Скопировать отчет (Markdown)',
      copyMarkdown: 'Копировать Markdown',
      copied: 'Скопировано в буфер!',
      print: 'Печать / Экспорт PDF',
      printPdf: 'Печать / PDF',
      downloadJson: 'Скачать в JSON',
      tieTitle: 'Паритет (Оба варианта равнозначны)',
      tie: 'Равный паритет',
    },
    pwa: {
      install: 'Установить',
      installBtn: 'Установить',
      installed: 'PWA активно',
      active: 'PWA активно',
      installPrompt: 'Установить как приложение на Android, iOS или рабочий стол',
      modalTitle: 'Установка DecisionCanvas',
      modalSubtitle: 'Работает как нативное приложение Android & iOS',
      guideTitle: 'Установка DecisionCanvas',
      guideSubtitle: 'Работает как нативное приложение Android & iOS',
      iosTitle: 'Инструкция для iPhone и iPad (Safari):',
      iosStep1: 'Нажмите кнопку «Поделиться» в нижней панели Safari.',
      iosStep2: 'Прокрутите вниз и выберите «На экран „Домой“».',
      androidTitle: 'Инструкция для Android (Chrome / Браузер):',
      androidStep1: 'Откройте меню браузера (три точки ⋮ в правом верхнем углу).',
      androidStep2: 'Нажмите «Установить приложение» или «Добавить на главный экран».',
      androidBenefit: 'Приложение появится среди остальных программ Android и будет запускаться в полноэкранном режиме офлайн.',
      gotIt: 'Понятно',
      understand: 'Понятно',
    },
    offline: {
      title: 'Офлайн-режим',
      description: 'Доступен локальный экспертный анализ и кэшированные данные.',
    },
    footer: {
      rights: 'DecisionCanvas • Выбор решения из 2-х вариантов',
      tagline: 'Форматы: «За» и «Против» • Сравнительная таблица • SWOT-матрица',
    },
    androidDevice: {
      title: 'Виртуальный экран Android',
      toggleMode: 'Экран Android',
      backToDesktop: 'Обычный вид',
      landscape: 'Альбомная',
      portrait: 'Книжная',
      zoomFit: 'По размеру',
      zoom100: '100%',
      standaloneMode: 'PWA Standalone',
      browserMode: 'Chrome Mobile',
      carrier: 'Google Fi 5G',
    },
  },
  en: {
    header: {
      appTitle: 'DecisionCanvas',
      versionBadge: 'Android Ready',
      subtitle: 'Two-Option Strategic Decision Engine',
      exportPdf: 'Export',
      newComparison: 'New Decision',
      engineBadge: 'Decision Engine',
      viewAndroid: 'Android Screen',
      viewDesktop: 'Desktop View',
      switchLang: 'Русский',
    },
    form: {
      step1: 'Step 1: Configuration',
      title: 'Define Dilemma & Alternatives',
      subtitle: 'Enter 2 alternative decisions. The system will build Pros & Cons, weighted scoring, and a SWOT matrix.',
      presetsTitle: 'Preset Dilemma Scenarios:',
      option1Label: 'Option A (First Alternative)',
      option1Placeholder: 'e.g. Stay at stable enterprise corporation...',
      option2Label: 'Option B (Second Alternative)',
      option2Placeholder: 'e.g. Join fast-growing startup as lead architect...',
      addContext: '+ Add situation context (budget, goals, timeline, risks)',
      hideContext: '– Hide context',
      contextLabel: 'Situation Context & Priorities (optional, improves precision)',
      contextPlaceholder: 'Specify key constraints: family, runway, planning horizon, risk tolerance...',
      submit: 'Compare Options & Calculate Verdict',
      submitting: 'Synthesizing Strategic Analysis...',
      hint: 'Intelligent synthesis: weighted Pros & Cons, 10-point multi-criteria matrix, SWOT, and strategic verdict.',
    },
    tabs: {
      all: 'All Formats',
      prosCons: 'Pros & Cons',
      comparison: 'Comparison Table',
      swot: 'SWOT Matrix',
      verdict: 'Strategic Verdict',
    },
    prosCons: {
      title: 'Pros & Cons Analysis',
      subtitle: 'Evaluate advantages and risks of each alternative weighted by impact magnitude (1 to 5)',
      pros: 'PROS (Advantages)',
      cons: 'CONS (Risks & Downsides)',
      weight: 'Weight',
      weightLabel: 'Impact Weight',
      totalPros: 'Sum of Pros',
      totalCons: 'Sum of Cons',
      balance: 'Net Balance',
      favorable: 'Pros Prevail',
      unfavorable: 'Cons Prevail',
    },
    comparison: {
      title: 'Multi-Criteria Evaluation Matrix',
      subtitle: 'Granular 10-point scoring across finance, risk, upside, flexibility, and effort with custom weights',
      criterion: 'Evaluation Criterion',
      weight: 'Weight (1-5)',
      score: 'Score (1-10)',
      totalScore: 'Total Weighted Score',
      advantage: 'Category Winner',
      tied: 'Tie',
    },
    swot: {
      title: 'Strategic SWOT Matrix',
      subtitle: 'Systemic breakdown of internal factors (Strengths/Weaknesses) and external dynamics (Opportunities/Threats)',
      strengths: 'Strengths',
      weaknesses: 'Weaknesses',
      opportunities: 'Opportunities',
      threats: 'Threats & Hazards',
      strengthsDesc: 'Internal competitive advantages and key assets',
      weaknessesDesc: 'Internal vulnerabilities, resource gaps and limitations',
      opportunitiesDesc: 'External favorable shifts and growth tailwinds',
      threatsDesc: 'External impediments, market headwinds and downside risks',
      both: 'Both Options',
      only1: 'Option 1 Only',
      only2: 'Option 2 Only',
    },
    verdict: {
      title: 'Strategic Verdict & Next Steps',
      winner: 'Recommended Decision',
      winnerTitle: 'Analysis Winner',
      confidence: 'Model Confidence Index',
      summary: 'Executive Analytical Summary',
      keyDrivers: 'Key Drivers in Favor of Selection',
      keyFactors: 'Key Drivers in Favor of Selection',
      tradeOff: 'Primary Trade-off',
      tradeoff: 'Primary Trade-off',
      nextSteps: 'Recommended First Actions',
      copyReport: 'Copy Report (Markdown)',
      copyMarkdown: 'Copy Markdown',
      copied: 'Copied to Clipboard!',
      print: 'Print / Export PDF',
      printPdf: 'Print / PDF',
      downloadJson: 'Download JSON',
      tieTitle: 'Parity (Both alternatives are equally viable)',
      tie: 'Equal Parity',
    },
    pwa: {
      install: 'Install',
      installBtn: 'Install',
      installed: 'PWA Active',
      active: 'PWA Active',
      installPrompt: 'Install as app on Android, iOS, or Desktop',
      modalTitle: 'Install DecisionCanvas',
      modalSubtitle: 'Operates as a full native Android & iOS app',
      guideTitle: 'Install DecisionCanvas',
      guideSubtitle: 'Operates as a full native Android & iOS app',
      iosTitle: 'iPhone & iPad (Safari) Instructions:',
      iosStep1: 'Tap the Share icon in the Safari bottom toolbar.',
      iosStep2: 'Scroll down and select "Add to Home Screen".',
      androidTitle: 'Android (Chrome / Browser) Instructions:',
      androidStep1: 'Open the browser menu (3 dots ⋮ in top right corner).',
      androidStep2: 'Tap "Install app" or "Add to Home screen".',
      androidBenefit: 'The app will live among your Android apps and launch in distraction-free fullscreen mode offline.',
      gotIt: 'Got it',
      understand: 'Got it',
    },
    offline: {
      title: 'Offline Mode',
      description: 'Local expert analytical engine and cached data are operational.',
    },
    footer: {
      rights: 'DecisionCanvas • Two-Alternative Decision Engine',
      tagline: 'Formats: Pros & Cons • Comparison Matrix • SWOT Analysis',
    },
    androidDevice: {
      title: 'Virtual Android Screen',
      toggleMode: 'Android Screen',
      backToDesktop: 'Desktop View',
      landscape: 'Landscape',
      portrait: 'Portrait',
      zoomFit: 'Fit Screen',
      zoom100: '100%',
      standaloneMode: 'PWA Standalone',
      browserMode: 'Chrome Mobile',
      carrier: 'Google Fi 5G',
    },
  },
};
