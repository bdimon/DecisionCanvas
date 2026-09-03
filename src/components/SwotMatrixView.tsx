import React, { useState } from 'react';
import { Plus, Trash2, Zap, AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';
import { SWOTResult, SWOTQuadrant } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface SwotMatrixViewProps {
  swot: SWOTResult;
  option1Title: string;
  option2Title: string;
  onChange: (updated: SWOTResult) => void;
}

export const SwotMatrixView: React.FC<SwotMatrixViewProps> = ({
  swot,
  option1Title,
  option2Title,
  onChange,
}) => {
  const { language, t } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<'both' | 'option1' | 'option2'>('both');
  const [activeInput, setActiveInput] = useState<{ target: 'option1' | 'option2'; section: keyof SWOTQuadrant } | null>(null);
  const [inputText, setInputText] = useState('');

  const handleAddItem = (target: 'option1' | 'option2', section: keyof SWOTQuadrant) => {
    if (!inputText.trim()) return;
    const currentList = swot[target][section];
    const updated = {
      ...swot,
      [target]: {
        ...swot[target],
        [section]: [...currentList, inputText.trim()]
      }
    };
    onChange(updated);
    setInputText('');
    setActiveInput(null);
  };

  const handleDeleteItem = (target: 'option1' | 'option2', section: keyof SWOTQuadrant, index: number) => {
    const updated = {
      ...swot,
      [target]: {
        ...swot[target],
        [section]: swot[target][section].filter((_, i) => i !== index)
      }
    };
    onChange(updated);
  };

  const renderQuadrantCard = (
    target: 'option1' | 'option2',
    section: keyof SWOTQuadrant,
    title: string,
    subtitle: string,
    items: string[],
    icon: React.ReactNode,
    bgClass: string,
    borderClass: string,
    badgeClass: string
  ) => {
    const isAdding = activeInput?.target === target && activeInput?.section === section;

    return (
      <div className={`p-4 rounded-xl border ${bgClass} ${borderClass} flex flex-col justify-between shadow-2xs`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`text-[10px] font-bold uppercase tracking-widest ${badgeClass} flex items-center gap-1.5`}>
              {icon}
              <span>{title}</span>
            </h4>
            <span className="text-[10px] font-bold text-slate-400 bg-white/70 px-1.5 py-0.5 rounded border border-slate-200/50">
              {items.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-normal mb-2.5">
            {subtitle}
          </p>

          <ul className="space-y-2">
            {items.map((item, idx) => (
              <li
                key={idx}
                className="group bg-white/95 p-2.5 rounded-lg border border-slate-200/80 text-xs text-slate-800 flex items-start justify-between space-x-2 shadow-2xs hover:border-slate-300"
              >
                <div className="flex items-start space-x-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed text-slate-700 text-xs">{item}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(target, section, idx)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-0.5 shrink-0 cursor-pointer"
                  title={language === 'en' ? 'Delete' : 'Удалить'}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Add item control */}
        <div className="mt-3 pt-2">
          {isAdding ? (
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-2 shadow-2xs">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={language === 'en' ? 'Enter SWOT point...' : 'Введите пункт SWOT...'}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem(target, section);
                  }
                }}
              />
              <div className="flex items-center justify-end space-x-1.5">
                <button
                  type="button"
                  onClick={() => setActiveInput(null)}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'Отмена'}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem(target, section)}
                  className="text-xs bg-slate-900 text-white px-2.5 py-1 rounded-md hover:bg-slate-800 font-medium cursor-pointer"
                >
                  {language === 'en' ? 'Add' : 'Добавить'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setActiveInput({ target, section });
                setInputText('');
              }}
              className="w-full py-1.5 text-slate-500 hover:text-slate-800 text-[11px] font-semibold border border-dashed border-slate-300 hover:border-slate-400 rounded-lg flex items-center justify-center space-x-1 bg-white/70 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{language === 'en' ? 'Add Item' : 'Добавить пункт'}</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderSingleOptionMatrix = (target: 'option1' | 'option2', title: string, badgeLetter: string, badgeBg: string) => {
    const data = swot[target];

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className={`w-6 h-6 rounded-lg ${badgeBg} text-white text-xs font-bold flex items-center justify-center shadow-2xs`}>
              {badgeLetter}
            </span>
            <h4 className="font-bold text-slate-800 text-sm sm:text-base">
              {title}
            </h4>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            SWOT
          </span>
        </div>

        {/* 2x2 Grid */}
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {renderQuadrantCard(
            target,
            'strengths',
            t.swot.strengths,
            t.swot.strengthsDesc,
            data.strengths,
            <Zap className="w-3.5 h-3.5 text-indigo-600" />,
            'bg-indigo-50/50',
            'border-indigo-100',
            'text-indigo-700'
          )}
          {renderQuadrantCard(
            target,
            'weaknesses',
            t.swot.weaknesses,
            t.swot.weaknessesDesc,
            data.weaknesses,
            <AlertTriangle className="w-3.5 h-3.5 text-slate-600" />,
            'bg-slate-50',
            'border-slate-200',
            'text-slate-600'
          )}
          {renderQuadrantCard(
            target,
            'opportunities',
            t.swot.opportunities,
            t.swot.opportunitiesDesc,
            data.opportunities,
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />,
            'bg-emerald-50/50',
            'border-emerald-100',
            'text-emerald-700'
          )}
          {renderQuadrantCard(
            target,
            'threats',
            t.swot.threats,
            t.swot.threatsDesc,
            data.threats,
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />,
            'bg-rose-50/50',
            'border-rose-100',
            'text-rose-700'
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Selector pills */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-slate-500">
          {t.swot.subtitle}
        </p>
        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setSelectedOption('both')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${selectedOption === 'both' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {t.swot.both}
          </button>
          <button
            type="button"
            onClick={() => setSelectedOption('option1')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${selectedOption === 'option1' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {t.swot.only1}
          </button>
          <button
            type="button"
            onClick={() => setSelectedOption('option2')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${selectedOption === 'option2' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {t.swot.only2}
          </button>
        </div>
      </div>

      {/* Grid or Single Render */}
      {selectedOption === 'both' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {renderSingleOptionMatrix('option1', option1Title, 'A', 'bg-indigo-600')}
          {renderSingleOptionMatrix('option2', option2Title, 'B', 'bg-emerald-600')}
        </div>
      ) : selectedOption === 'option1' ? (
        renderSingleOptionMatrix('option1', option1Title, 'A', 'bg-indigo-600')
      ) : (
        renderSingleOptionMatrix('option2', option2Title, 'B', 'bg-emerald-600')
      )}
    </div>
  );
};
