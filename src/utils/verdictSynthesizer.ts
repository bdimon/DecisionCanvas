import { AnalysisResult, DecisionVerdict } from '../types';

/**
 * Dynamically synthesizes an executive verdict, confidence score, key drivers,
 * trade-off summary, and next steps based on the user's live criteria, weights,
 * and pros/cons assessments.
 */
export function synthesizeVerdict(analysis: AnalysisResult, language: 'ru' | 'en'): DecisionVerdict {
  const isEn = language === 'en';
  const { option1Title, option2Title, comparisonTable, prosCons } = analysis;

  // 1. Weighted criteria calculation
  const totalWeight = comparisonTable.reduce((sum, c) => sum + (c.weight || 1), 0) || 1;
  const weighted1 = comparisonTable.reduce((sum, c) => sum + (c.option1Score * (c.weight || 1)), 0);
  const weighted2 = comparisonTable.reduce((sum, c) => sum + (c.option2Score * (c.weight || 1)), 0);

  const score1 = Math.round((weighted1 / (totalWeight * 10)) * 100);
  const score2 = Math.round((weighted2 / (totalWeight * 10)) * 100);

  // 2. Pros/Cons net calculations
  const pros1Weight = prosCons.option1.pros.reduce((acc, p) => acc + p.weight, 0);
  const cons1Weight = prosCons.option1.cons.reduce((acc, c) => acc + c.weight, 0);
  const net1 = pros1Weight - cons1Weight;

  const pros2Weight = prosCons.option2.pros.reduce((acc, p) => acc + p.weight, 0);
  const cons2Weight = prosCons.option2.cons.reduce((acc, c) => acc + c.weight, 0);
  const net2 = pros2Weight - cons2Weight;

  // 3. Determine winner
  let winner: 'option1' | 'option2' | 'tie' = 'tie';
  if (score1 > score2 + 1) {
    winner = 'option1';
  } else if (score2 > score1 + 1) {
    winner = 'option2';
  } else if (net1 > net2 + 2) {
    winner = 'option1';
  } else if (net2 > net1 + 2) {
    winner = 'option2';
  }

  const winnerTitle = winner === 'option1'
    ? option1Title
    : winner === 'option2'
    ? option2Title
    : (isEn ? 'Tie / Parity' : 'Паритет (Оба варианта равнозначны)');

  const loserTitle = winner === 'option1' ? option2Title : option1Title;
  const winnerScore = winner === 'option1' ? score1 : winner === 'option2' ? score2 : 50;
  const loserScore = winner === 'option1' ? score2 : winner === 'option2' ? score1 : 50;

  // 4. Dynamic Confidence Score
  const scoreDiff = Math.abs(score1 - score2);
  const netDiff = Math.abs(net1 - net2);
  let confidenceScore = 50;

  if (winner !== 'tie') {
    confidenceScore = Math.min(95, Math.max(53, Math.round(50 + scoreDiff * 1.6 + Math.min(netDiff * 1.1, 10))));
  }

  // 5. Dynamic Key Drivers
  const keyDrivers: string[] = [];
  if (winner === 'tie') {
    if (isEn) {
      keyDrivers.push(`Both options scored virtually equally in weighted evaluation (${score1}% vs ${score2}%).`);
      keyDrivers.push(`Balance of Pros and Cons is closely matched (Net score: ${net1 > 0 ? '+' : ''}${net1} vs ${net2 > 0 ? '+' : ''}${net2}).`);
      keyDrivers.push('Consider adding deeper personal risk tolerance or financial constraints to break the tie.');
    } else {
      keyDrivers.push(`Оба варианта набрали практически равный взвешенный балл (${score1}% против ${score2}%).`);
      keyDrivers.push(`Баланс «За» и «Против» находится в паритете (Чистый баланс: ${net1 > 0 ? '+' : ''}${net1} против ${net2 > 0 ? '+' : ''}${net2}).`);
      keyDrivers.push('Рекомендуется добавить индивидуальные приоритеты или временные ограничения для выбора.');
    }
  } else {
    // Sort criteria by advantage for the winner
    const criteriaWithAdvantage = comparisonTable
      .map(c => {
        const diff = winner === 'option1'
          ? (c.option1Score - c.option2Score)
          : (c.option2Score - c.option1Score);
        const winnerCritScore = winner === 'option1' ? c.option1Score : c.option2Score;
        const loserCritScore = winner === 'option1' ? c.option2Score : c.option1Score;
        const winnerNote = winner === 'option1' ? c.option1Note : c.option2Note;
        return {
          criterion: c,
          diff,
          weightedImpact: diff * c.weight,
          winnerCritScore,
          loserCritScore,
          winnerNote
        };
      })
      .filter(item => item.diff > 0)
      .sort((a, b) => b.weightedImpact - a.weightedImpact);

    // Pick top advantage criteria
    for (const item of criteriaWithAdvantage.slice(0, 3)) {
      if (isEn) {
        keyDrivers.push(
          `"${item.criterion.title}": Decisive edge scoring ${item.winnerCritScore}/10 vs ${item.loserCritScore}/10 (${item.criterion.weight}x weight)${item.winnerNote ? ` — ${item.winnerNote}` : ''}`
        );
      } else {
        keyDrivers.push(
          `«${item.criterion.title}»: Заметное превосходство с оценкой ${item.winnerCritScore}/10 против ${item.loserCritScore}/10 (вес ${item.criterion.weight}x)${item.winnerNote ? ` — ${item.winnerNote}` : ''}`
        );
      }
    }

    // Include top high-weight pro of the winner
    const winnerPros = (winner === 'option1' ? prosCons.option1.pros : prosCons.option2.pros)
      .slice()
      .sort((a, b) => b.weight - a.weight);

    if (winnerPros.length > 0 && keyDrivers.length < 4) {
      const topPro = winnerPros[0];
      if (isEn) {
        keyDrivers.push(`Key argument in favor: "${topPro.text}" (Impact: ${topPro.weight}/5).`);
      } else {
        keyDrivers.push(`Ключевой аргумент «За»: «${topPro.text}» (вес ${topPro.weight}/5).`);
      }
    }

    if (keyDrivers.length === 0) {
      keyDrivers.push(
        isEn
          ? `Overall weighted criteria balance favors ${winnerTitle} with a margin of ${scoreDiff}%.`
          : `Общий взвешенный баланс критериев склоняется в пользу «${winnerTitle}» с преимуществом в ${scoreDiff}%.`
      );
    }
  }

  // 6. Dynamic Trade-Off Summary
  let tradeOffSummary = '';
  if (winner === 'tie') {
    tradeOffSummary = isEn
      ? `Neither option clearly dominates. Choosing either option means accepting trade-offs in different dimensions without a clear aggregate upside.`
      : `Ни один вариант не имеет решающего отрыва. Выбор любого из них означает компромиссы по разным направлениям без явного итогового перевеса.`;
  } else {
    // Check where competitor scored higher
    const competitorAdvantages = comparisonTable
      .filter(c => (winner === 'option1' ? c.option2Score > c.option1Score : c.option1Score > c.option2Score))
      .sort((a, b) => {
        const diffA = winner === 'option1' ? a.option2Score - a.option1Score : a.option1Score - a.option2Score;
        const diffB = winner === 'option1' ? b.option2Score - b.option1Score : b.option1Score - b.option2Score;
        return (diffB * b.weight) - (diffA * a.weight);
      });

    // Top con for the winner
    const winnerCons = (winner === 'option1' ? prosCons.option1.cons : prosCons.option2.cons)
      .slice()
      .sort((a, b) => b.weight - a.weight);

    const sacrificedAreas = competitorAdvantages.slice(0, 2).map(c => `«${c.title}»`).join(', ');
    const topConText = winnerCons[0]?.text;

    if (isEn) {
      const areasEn = competitorAdvantages.slice(0, 2).map(c => `"${c.title}"`).join(', ');
      if (areasEn) {
        tradeOffSummary = `Selecting "${winnerTitle}" means accepting lower scores compared to "${loserTitle}" in ${areasEn}${topConText ? `, as well as actively mitigating: "${topConText}"` : ''}.`;
      } else if (topConText) {
        tradeOffSummary = `While "${winnerTitle}" dominates the criteria, the primary trade-off is the need to manage: "${topConText}".`;
      } else {
        tradeOffSummary = `Selecting "${winnerTitle}" requires dedicated execution focus and resource allocation to sustain its projected benefits.`;
      }
    } else {
      if (sacrificedAreas) {
        tradeOffSummary = `Выбирая «${winnerTitle}», вы идете на уступки перед «${loserTitle}» по критериям ${sacrificedAreas}${topConText ? `, а также принимаете необходимость контроля над риском: «${topConText}»` : ''}.`;
      } else if (topConText) {
        tradeOffSummary = `Хотя «${winnerTitle}» лидирует по критериям, главный компромисс заключается в необходимости купировать фактор: «${topConText}».`;
      } else {
        tradeOffSummary = `Выбор «${winnerTitle}» потребует повышенной концентрации ресурсов и дисциплины при исполнении.`;
      }
    }
  }

  // 7. Dynamic Narrative Summary
  let summary = '';
  if (winner === 'tie') {
    summary = isEn
      ? `After evaluating multi-criteria matrix and argument weights, "${option1Title}" and "${option2Title}" stand in equal strategic parity (${score1}% vs ${score2}%). Neither option provides a statistically decisive margin. We recommend defining a single highest-priority tie-breaker metric or testing on a smaller pilot scale.`
      : `По результатам комплексной оценки матрицы критериев и весов аргументов, «${option1Title}» и «${option2Title}» находятся в стратегическом паритете (${score1}% против ${score2}%). Ни один вариант не дает решающего перевеса. Рекомендуется выделить один ключевой критический фактор или провести пилотное тестирование.`;
  } else {
    const topDriverBrief = comparisonTable
      .filter(c => (winner === 'option1' ? c.option1Score > c.option2Score : c.option2Score > c.option1Score))
      .slice(0, 2)
      .map(c => isEn ? `"${c.title}"` : `«${c.title}»`)
      .join(isEn ? ' and ' : ' и ');

    if (isEn) {
      summary = `Based on your multi-criteria scoring and assigned weights, "${winnerTitle}" emerges as the optimal decision with an aggregate rating of ${winnerScore}% versus ${loserScore}%. The primary justification is clear superiority in ${topDriverBrief || 'key performance indicators'}, achieving higher expected return relative to risks. Proceeding with "${winnerTitle}" provides the most resilient strategic position.`;
    } else {
      summary = `С учетом детальных оценок по критериям и заданных весов побеждает «${winnerTitle}» с общим взвешенным результатом ${winnerScore}% против ${loserScore}%. Решающим фактором стало превосходство по направлению ${topDriverBrief || 'ключевых параметров'}, что обеспечивает наиболее сбалансированное соотношение отдачи и рисков. Рекомендуется выбрать данный вариант в качестве базовой стратегии.`;
    }
  }

  // 8. Dynamic Recommended Next Steps
  const recommendedNextSteps: string[] = [];
  if (winner === 'tie') {
    if (isEn) {
      recommendedNextSteps.push('Define a single non-negotiable decision constraint (e.g., maximum budget or exact deadline).');
      recommendedNextSteps.push('Consult key stakeholders to calibrate subjective comfort and long-term values.');
      recommendedNextSteps.push('Run a 1-2 week low-risk trial or information gathering period before final commitment.');
    } else {
      recommendedNextSteps.push('Сформулируйте один жесткий не подлежащий компромиссу критерий (бюджет, дедлайн или риск).');
      recommendedNextSteps.push('Проконсультируйтесь с ключевыми стейкхолдерами для калибровки приоритетов.');
      recommendedNextSteps.push('Проведите короткий тестовый период или соберите дополнительные данные перед финализацией.');
    }
  } else {
    const winnerCons = (winner === 'option1' ? prosCons.option1.cons : prosCons.option2.cons)
      .slice()
      .sort((a, b) => b.weight - a.weight);
    const topRisk = winnerCons[0]?.text;

    if (isEn) {
      recommendedNextSteps.push(`Lock in immediate commitments to operationalize "${winnerTitle}".`);
      if (topRisk) {
        recommendedNextSteps.push(`Develop a contingency mitigation plan specifically for risk: "${topRisk}".`);
      } else {
        recommendedNextSteps.push('Establish a clear milestone schedule and resource allocation for the first 30 days.');
      }
      recommendedNextSteps.push('Schedule a formal review checkpoint in 30-60 days to evaluate actual performance against projected scores.');
    } else {
      recommendedNextSteps.push(`Зафиксируйте план первоочередных действий по запуску варианта «${winnerTitle}».`);
      if (topRisk) {
        recommendedNextSteps.push(`Разработайте план превентивных мер для снижения риска: «${topRisk}».`);
      } else {
        recommendedNextSteps.push('Сформируйте четкий график контрольных точек и распределение ресурсов на первые 30 дней.');
      }
      recommendedNextSteps.push('Назначьте дату контрольного обзора через 30–60 дней для сопоставления фактических результатов с прогнозом.');
    }
  }

  return {
    winner,
    winnerTitle,
    confidenceScore,
    summary,
    keyDrivers,
    tradeOffSummary,
    recommendedNextSteps,
    isCustomized: true
  };
}
