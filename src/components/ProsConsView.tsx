import React, { useState } from 'react';
import { CheckCircle2, XCircle, Plus, Trash2, ShieldAlert, Award } from 'lucide-react';
import { ProsConsResult, ProConItem } from '../types';

interface ProsConsViewProps {
  prosCons: ProsConsResult;
  option1Title: string;
  option2Title: string;
  onChange: (updated: ProsConsResult) => void;
}

export const ProsConsView: React.FC<ProsConsViewProps> = ({
  prosCons,
  option1Title,
  option2Title,
  onChange,
}) => {
  const [newText, setNewText] = useState<{ [key: string]: string }>({});
  const [newWeight, setNewWeight] = useState<{ [key: string]: number }>({});
  const [activeForm, setActiveForm] = useState<string | null>(null);

  const calculateScores = (items: { pros: ProConItem[]; cons: ProConItem[] }) => {
    const prosTotal = items.pros.reduce((acc, curr) => acc + curr.weight, 0);
    const consTotal = items.cons.reduce((acc, curr) => acc + curr.weight, 0);
    const net = prosTotal - consTotal;
    return { prosTotal, consTotal, net };
  };

  const opt1Scores = calculateScores(prosCons.option1);
  const opt2Scores = calculateScores(prosCons.option2);

  const handleAddItem = (target: 'option1' | 'option2', type: 'pros' | 'cons') => {
    const formKey = `${target}_${type}`;
    const text = newText[formKey]?.trim();
    if (!text) return;
    const weight = newWeight[formKey] || 3;

    const newItem: ProConItem = {
      id: `${type[0]}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      text,
      weight,
      category: 'Пользовательский'
    };

    const updated = {
      ...prosCons,
      [target]: {
        ...prosCons[target],
        [type]: [...prosCons[target][type], newItem]
      }
    };

    onChange(updated);
    setNewText(prev => ({ ...prev, [formKey]: '' }));
    setActiveForm(null);
  };

  const handleDeleteItem = (target: 'option1' | 'option2', type: 'pros' | 'cons', id: string) => {
    const updated = {
      ...prosCons,
      [target]: {
        ...prosCons[target],
        [type]: prosCons[target][type].filter(item => item.id !== id)
      }
    };
    onChange(updated);
  };

  const renderList = (
    title: string,
    target: 'option1' | 'option2',
    type: 'pros' | 'cons',
    items: ProConItem[],
    accentColor: 'emerald' | 'rose'
  ) => {
    const isPro = type === 'pros';
    const formKey = `${target}_${type}`;
    const isAdding = activeForm === formKey;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
            {isPro ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            )}
            <span>{title} ({items.length})</span>
          </p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPro ? 'bg-emerald-100/80 text-emerald-800' : 'bg-rose-100/80 text-rose-800'}`}>
            Вес: {items.reduce((a, b) => a + b.weight, 0)} б.
          </span>
        </div>

        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className={`group flex gap-2.5 text-slate-700 p-2.5 rounded-lg border text-sm transition-all ${
                isPro
                  ? 'bg-emerald-50/70 border-emerald-100 hover:border-emerald-200'
                  : 'bg-rose-50/70 border-rose-100 hover:border-rose-200'
              }`}
            >
              <span className={`font-bold text-sm leading-none mt-0.5 select-none ${isPro ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isPro ? '+' : '−'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="leading-snug text-slate-800 text-xs sm:text-sm">{item.text}</p>
                <div className="mt-1 flex items-center space-x-2">
                  <span className="text-[10px] font-medium text-slate-400">
                    Сила:
                  </span>
                  <div className="flex items-center space-x-0.5">
                    {[1, 2, 3, 4, 5].map(w => (
                      <span
                        key={w}
                        className={`w-1.5 h-1.5 rounded-full ${w <= item.weight ? (isPro ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-slate-200'}`}
                      />
                    ))}
                    <span className="text-[10px] font-semibold text-slate-500 ml-1">
                      {item.weight}/5
                    </span>
                  </div>
                  {item.category && (
                    <span className="text-[9px] font-medium bg-white/80 border border-slate-200/60 text-slate-600 px-1.5 py-0.2 rounded">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteItem(target, type, item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity self-start"
                title="Удалить аргумент"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>

        {/* Add item form / button */}
        {isAdding ? (
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <input
              type="text"
              value={newText[formKey] || ''}
              onChange={(e) => setNewText(prev => ({ ...prev, [formKey]: e.target.value }))}
              placeholder={isPro ? "Введите новый аргумент «За»..." : "Введите новый аргумент «Против»..."}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem(target, type);
                }
              }}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                <span className="text-[11px] font-medium">Важность:</span>
                <select
                  value={newWeight[formKey] || 3}
                  onChange={(e) => setNewWeight(prev => ({ ...prev, [formKey]: Number(e.target.value) }))}
                  className="text-xs bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700"
                >
                  <option value={1}>1 - Низкая</option>
                  <option value={2}>2 - Умеренная</option>
                  <option value={3}>3 - Средняя</option>
                  <option value={4}>4 - Высокая</option>
                  <option value={5}>5 - Критическая</option>
                </select>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem(target, type)}
                  className="text-xs bg-slate-900 text-white font-medium px-2.5 py-1 rounded-md hover:bg-slate-800 transition-colors"
                >
                  Добавить
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setActiveForm(formKey)}
            className="w-full py-1.5 px-3 border border-dashed border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors bg-white hover:bg-slate-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Добавить аргумент</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Option 1 Column */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-2xs">
              A
            </span>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
              {option1Title}
            </h3>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${opt1Scores.net >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            Баланс: {opt1Scores.net > 0 ? `+${opt1Scores.net}` : opt1Scores.net}
          </span>
        </div>

        <div className="p-5 flex-1 space-y-6">
          {/* Ratio visual bar */}
          <div>
            <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400 mb-1.5">
              <span className="text-emerald-700">За: {opt1Scores.prosTotal} б.</span>
              <span className="text-rose-700">Против: {opt1Scores.consTotal} б.</span>
            </div>
            <div className="bg-slate-100 h-2 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${(opt1Scores.prosTotal / (opt1Scores.prosTotal + opt1Scores.consTotal || 1)) * 100}%` }}
                title={`За: ${opt1Scores.prosTotal}`}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-300"
                style={{ width: `${(opt1Scores.consTotal / (opt1Scores.prosTotal + opt1Scores.consTotal || 1)) * 100}%` }}
                title={`Против: ${opt1Scores.consTotal}`}
              />
            </div>
          </div>

          <div className="space-y-5">
            {renderList("Преимущества (Advantages)", 'option1', 'pros', prosCons.option1.pros, 'emerald')}
            {renderList("Недостатки и риски (Drawbacks)", 'option1', 'cons', prosCons.option1.cons, 'rose')}
          </div>
        </div>
      </div>

      {/* Option 2 Column */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-2xs">
              B
            </span>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
              {option2Title}
            </h3>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${opt2Scores.net >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            Баланс: {opt2Scores.net > 0 ? `+${opt2Scores.net}` : opt2Scores.net}
          </span>
        </div>

        <div className="p-5 flex-1 space-y-6">
          {/* Ratio visual bar */}
          <div>
            <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400 mb-1.5">
              <span className="text-emerald-700">За: {opt2Scores.prosTotal} б.</span>
              <span className="text-rose-700">Против: {opt2Scores.consTotal} б.</span>
            </div>
            <div className="bg-slate-100 h-2 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${(opt2Scores.prosTotal / (opt2Scores.prosTotal + opt2Scores.consTotal || 1)) * 100}%` }}
                title={`За: ${opt2Scores.prosTotal}`}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-300"
                style={{ width: `${(opt2Scores.consTotal / (opt2Scores.prosTotal + opt2Scores.consTotal || 1)) * 100}%` }}
                title={`Против: ${opt2Scores.consTotal}`}
              />
            </div>
          </div>

          <div className="space-y-5">
            {renderList("Преимущества (Advantages)", 'option2', 'pros', prosCons.option2.pros, 'emerald')}
            {renderList("Недостатки и риски (Drawbacks)", 'option2', 'cons', prosCons.option2.cons, 'rose')}
          </div>
        </div>
      </div>
    </div>
  );
};
