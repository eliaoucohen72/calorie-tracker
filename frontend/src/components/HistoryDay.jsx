import { useState } from 'react';
import { useLang } from '../i18n/LangContext';

function formatDate(dateStr, lang) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function HistoryDay({ dateKey, dayData, onAddToInput }) {
  const [open, setOpen] = useState(false);
  const { lang, t } = useLang();
  const hasRepas = dayData.repas && dayData.repas.length > 0;
  const count = dayData.repas?.length ?? 0;
  const mealLabel = count > 1 ? t.meals : t.meal;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-3">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="text-left">
          <div className="font-medium capitalize">{formatDate(dateKey, lang)}</div>
          <div className="text-xs text-gray-500">{hasRepas ? `${count} ${mealLabel}` : t.noMeals}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-bold ${dayData.total_jour > 0 ? 'text-green-700' : 'text-gray-400'}`}>
            {dayData.total_jour > 0 ? `${dayData.total_jour.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} kcal` : '—'}
          </span>
          {hasRepas && (
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20" fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
            </svg>
          )}
        </div>
      </button>
      {open && hasRepas && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {dayData.repas.map(repas => (
            <div key={repas.id} className="px-4 py-2">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="text-sm text-gray-700 truncate max-w-xs">{repas.description_originale}</p>
                  <p className="text-xs text-gray-400">
                    {repas.heure} · {repas.aliments.length} {repas.aliments.length > 1 ? t.items : t.item}
                  </p>
                </div>
                <span className="text-sm font-semibold text-green-700 shrink-0 ml-2">{repas.total_calories} kcal</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {repas.aliments.filter(a => !a.non_trouve).map((aliment, i) => (
                  <button
                    key={i}
                    onClick={() => onAddToInput(aliment)}
                    className="text-xs bg-gray-100 hover:bg-green-100 hover:text-green-700 text-gray-600 px-2 py-0.5 rounded-full transition-colors"
                    title={t.addToInput}
                  >
                    + {aliment.quantite} {aliment.nom}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
