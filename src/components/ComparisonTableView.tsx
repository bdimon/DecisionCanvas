import React, { useState } from 'react';
import { Plus, Trash2, ArrowUpRight, Check, HelpCircle, Trophy, BarChart2 } from 'lucide-react';
import { ComparisonCriterion } from '../types';

interface ComparisonTableViewProps {
  criteria: ComparisonCriterion[];
  option1Title: string;
  option2Title: string;
  onChange: (updated: ComparisonCriterion[]) => void;
}

export const ComparisonTableView: React.FC<ComparisonTableViewProps> = ({
  criteria,
  option1Title,
  option2Title,
  onChange,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Общее');
  const [newDescription, setNewDescription] = useState('');
  const [newWeight, setNewWeight] = useState(4);
  const [newScore1, setNewScore1] = useState(7);
  const [newNote1, setNewNote1] = useState('');
  const [newScore2, setNewScore2] = useState(7);
  const [newNote2, setNewNote2] = useState('');

  // Calculate weighted total scores
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0) || 1;
  const weightedTotal1 = criteria.reduce((sum, c) => sum + (c.option1Score * c.weight), 0);
  const weightedTotal2 = criteria.reduce((sum, c) => sum + (c.option2Score * c.weight), 0);
  const normalizedScore1 = (weightedTotal1 / (totalWeight * 10)) * 100;
  const normalizedScore2 = (weightedTotal2 / (totalWeight * 10)) * 100;

  const handleUpdateCriterion = (id: string, updates: Partial<ComparisonCriterion>) => {
    const updated = criteria.map(c => c.id === id ? { ...c, ...updates } : c);
    onChange(updated);
  };

  const handleDeleteCriterion = (id: string) => {
    onChange(criteria.filter(c => c.id !== id));
  };

  const handleAddCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCrit: ComparisonCriterion = {
      id: 'crit_' + Date.now(),
      category: newCategory.trim() || 'Пользовательский',
      title: newTitle.trim(),
      description: newDescription.trim() || 'Пользовательский критерий оценки',
      weight: Number(newWeight) || 3,
      option1Score: Number(newScore1) || 5,
      option1Note: newNote1.trim() || 'Оценка пользователя',
      option2Score: Number(newScore2) || 5,
      option2Note: newNote2.trim() || 'Оценка пользователя',
    };

    onChange([...criteria, newCrit]);
    setShowAddModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewNote1('');
    setNewNote2('');
  };

  return (
    <div className="space-y-6">
      {/* Overview Scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={`p-5 rounded-2xl border shadow-sm transition-all ${normalizedScore1 >= normalizedScore2 ? 'bg-indigo-50/50 border-indigo-200/80' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-2xs">
                A
              </span>
              <h4 className="font-bold text-slate-800 text-sm sm:text-base">{option1Title}</h4>
            </div>
            {normalizedScore1 > normalizedScore2 && (
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                <Trophy className="w-3 h-3" />
                <span>Лидер</span>
              </span>
            )}
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {normalizedScore1.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              (Взвешенный балл: {weightedTotal1} из {totalWeight * 10})
            </span>
          </div>
          <div className="w-full bg-slate-200/80 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, normalizedScore1))}%` }}
            />
          </div>
        </div>

        <div className={`p-5 rounded-2xl border shadow-sm transition-all ${normalizedScore2 > normalizedScore1 ? 'bg-emerald-50/50 border-emerald-200/80' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-2xs">
                B
              </span>
              <h4 className="font-bold text-slate-800 text-sm sm:text-base">{option2Title}</h4>
            </div>
            {normalizedScore2 > normalizedScore1 && (
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                <Trophy className="w-3 h-3" />
                <span>Лидер</span>
              </span>
            )}
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {normalizedScore2.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              (Взвешенный балл: {weightedTotal2} из {totalWeight * 10})
            </span>
          </div>
          <div className="w-full bg-slate-200/80 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, normalizedScore2))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <span>Direct Comparison (Матрица критериев)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Параметры оцениваются по шкале 1–10 с учетом веса важности (1–5×).
            </p>
          </div>
          <button
            type="button"
            id="add-criterion-btn"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Добавить критерий</span>
          </button>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] sticky top-0 border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3 w-[30%]">Критерий и вес</th>
                <th className="px-4 py-3 w-[32%] text-indigo-900">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-4 h-4 rounded bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">A</span>
                    <span className="truncate">{option1Title}</span>
                  </div>
                </th>
                <th className="px-4 py-3 w-[32%] text-emerald-900">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-4 h-4 rounded bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">B</span>
                    <span className="truncate">{option2Title}</span>
                  </div>
                </th>
                <th className="px-3 py-3 w-[6%] text-center">Удал.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {criteria.map((c) => {
                const diff = c.option1Score - c.option2Score;
                const opt1Wins = diff > 0;
                const opt2Wins = diff < 0;

                return (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 align-top">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {c.category}
                        </span>
                        <div className="font-semibold text-slate-800 mt-1 text-xs sm:text-sm">
                          {c.title}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {c.description}
                        </p>
                        <div className="mt-2 flex items-center space-x-1.5 text-xs">
                          <span className="text-slate-400 text-[11px]">Вес:</span>
                          <select
                            value={c.weight}
                            onChange={(e) => handleUpdateCriterion(c.id, { weight: Number(e.target.value) })}
                            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700"
                          >
                            <option value={1}>1 × (Низкий)</option>
                            <option value={2}>2 × (Умеренный)</option>
                            <option value={3}>3 × (Средний)</option>
                            <option value={4}>4 × (Высокий)</option>
                            <option value={5}>5 × (Критический)</option>
                          </select>
                        </div>
                      </div>
                    </td>

                    {/* Option 1 Column */}
                    <td className={`px-4 py-3.5 align-top border-x border-slate-100/80 ${opt1Wins ? 'bg-indigo-50/25' : ''}`}>
                      <div className="flex items-center space-x-2">
                        <select
                          value={c.option1Score}
                          onChange={(e) => handleUpdateCriterion(c.id, { option1Score: Number(e.target.value) })}
                          className="font-bold text-xs bg-white border border-slate-200 rounded-md px-2 py-1 text-indigo-700 shadow-2xs focus:ring-1 focus:ring-indigo-500"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                            <option key={s} value={s}>{s} / 10</option>
                          ))}
                        </select>
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${c.option1Score * 10}%` }}
                          />
                        </div>
                        {opt1Wins && (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            +{diff}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {c.option1Note}
                      </p>
                    </td>

                    {/* Option 2 Column */}
                    <td className={`px-4 py-3.5 align-top ${opt2Wins ? 'bg-emerald-50/25' : ''}`}>
                      <div className="flex items-center space-x-2">
                        <select
                          value={c.option2Score}
                          onChange={(e) => handleUpdateCriterion(c.id, { option2Score: Number(e.target.value) })}
                          className="font-bold text-xs bg-white border border-slate-200 rounded-md px-2 py-1 text-emerald-700 shadow-2xs focus:ring-1 focus:ring-emerald-500"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                            <option key={s} value={s}>{s} / 10</option>
                          ))}
                        </select>
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${c.option2Score * 10}%` }}
                          />
                        </div>
                        {opt2Wins && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            +{Math.abs(diff)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {c.option2Note}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3.5 align-top text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteCriterion(c.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Удалить критерий"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Match Score Bottom Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] mb-2 font-bold uppercase text-slate-500">
            <span>Match Score (Итоговое соответствие)</span>
            <span className={normalizedScore1 >= normalizedScore2 ? 'text-indigo-600 font-bold' : 'text-emerald-600 font-bold'}>
              {normalizedScore1 > normalizedScore2
                ? `${option1Title} лидирует (${normalizedScore1.toFixed(0)}%)`
                : normalizedScore2 > normalizedScore1
                ? `${option2Title} лидирует (${normalizedScore2.toFixed(0)}%)`
                : `Ничья (${normalizedScore1.toFixed(0)}%)`}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
            <div
              className="bg-indigo-600 h-full transition-all duration-500"
              style={{ width: `${(weightedTotal1 / (weightedTotal1 + weightedTotal2 || 1)) * 100}%` }}
              title={`${option1Title}: ${weightedTotal1}`}
            />
            <div
              className="bg-emerald-600 h-full transition-all duration-500"
              style={{ width: `${(weightedTotal2 / (weightedTotal1 + weightedTotal2 || 1)) * 100}%` }}
              title={`${option2Title}: ${weightedTotal2}`}
            />
          </div>
        </div>
      </div>

      {/* Add Criterion Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6">
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Добавить пользовательский критерий
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Введите параметр для детального сравнительного взвешивания вариантов.
            </p>

            <form onSubmit={handleAddCriterion} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Название критерия
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Автономия и независимость"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Категория
                  </label>
                  <input
                    type="text"
                    placeholder="Например: Карьера / Финансы"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Вес (Важность 1-5)
                  </label>
                  <select
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>1 - Второстепенный</option>
                    <option value={2}>2 - Умеренный</option>
                    <option value={3}>3 - Средний</option>
                    <option value={4}>4 - Высокий</option>
                    <option value={5}>5 - Критический</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Описание критерия
                </label>
                <input
                  type="text"
                  placeholder="Что именно оценивает этот фактор..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
                  <span className="text-xs font-bold text-indigo-900 block mb-1">
                    {option1Title}
                  </span>
                  <div className="flex items-center space-x-2">
                    <label className="text-[11px] text-slate-500">Балл (1-10):</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={newScore1}
                      onChange={(e) => setNewScore1(Number(e.target.value))}
                      className="w-16 text-xs border border-slate-200 rounded p-1 bg-white"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Заметка к оценке..."
                    value={newNote1}
                    onChange={(e) => setNewNote1(e.target.value)}
                    className="mt-1.5 w-full text-[11px] border border-slate-200 rounded p-1.5 bg-white"
                  />
                </div>

                <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-900 block mb-1">
                    {option2Title}
                  </span>
                  <div className="flex items-center space-x-2">
                    <label className="text-[11px] text-slate-500">Балл (1-10):</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={newScore2}
                      onChange={(e) => setNewScore2(Number(e.target.value))}
                      className="w-16 text-xs border border-slate-200 rounded p-1 bg-white"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Заметка к оценке..."
                    value={newNote2}
                    onChange={(e) => setNewNote2(e.target.value)}
                    className="mt-1.5 w-full text-[11px] border border-slate-200 rounded p-1.5 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  Сохранить критерий
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
