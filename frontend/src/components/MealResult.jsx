import { useState } from 'react';
import { patchCalories, addFoodToMeal, recalculateMeal } from '../services/api';
import FoodImage from './FoodImage';
import { useLang } from '../i18n/LangContext';

function ImageModal({ nom, offImage, onClose }) {
  const { t } = useLang();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-4 shadow-2xl max-w-sm w-full mx-4 flex flex-col items-center gap-3"
        onClick={e => e.stopPropagation()}
      >
        <FoodImage nom={nom} offImage={offImage} size="large" />
        <p className="text-sm font-medium capitalize text-gray-800">{nom}</p>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          {t.close}
        </button>
      </div>
    </div>
  );
}

function MacroBadge({ label, value, color }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>
      {label} {value}g
    </span>
  );
}

function AlimentCard({ aliment, index, mealId, date, onPatch, onAddToInput }) {
  const [manualCal, setManualCal] = useState('');
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { t } = useLang();

  async function handlePatch(e) {
    e.preventDefault();
    if (!manualCal || isNaN(Number(manualCal))) return;
    setSaving(true);
    try {
      await onPatch(date, mealId, index, Number(manualCal));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {showModal && (
        <ImageModal nom={aliment.nom} offImage={aliment.image} onClose={() => setShowModal(false)} />
      )}
      <div className={`rounded-lg border p-3 transition-colors ${
        aliment.non_trouve ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-start gap-3">
          <div className="cursor-zoom-in shrink-0" onClick={() => setShowModal(true)} title="Agrandir">
            <FoodImage nom={aliment.nom} offImage={aliment.image} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {!aliment.non_trouve ? (
                  <button
                    type="button"
                    onClick={() => onAddToInput(aliment)}
                    className="font-medium text-sm capitalize text-left hover:text-green-700 hover:underline transition-colors"
                    title={t.addToInput}
                  >
                    {aliment.nom}
                  </button>
                ) : (
                  <span className="font-medium text-sm capitalize">{aliment.nom}</span>
                )}
                <span className="text-xs text-gray-500">{aliment.quantite} {aliment.unite}</span>
                {aliment.non_trouve && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                    {t.notFound}
                  </span>
                )}
              </div>
              <div className="shrink-0">
                {aliment.calories != null ? (
                  <span className="font-bold text-green-700">{aliment.calories} kcal</span>
                ) : (
                  <span className="text-gray-400 text-sm">—</span>
                )}
              </div>
            </div>
            {!aliment.non_trouve && aliment.calories != null && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <MacroBadge label={t.proteins} value={aliment.proteines} color="bg-blue-50 text-blue-700" />
                <MacroBadge label={t.carbs} value={aliment.glucides} color="bg-yellow-50 text-yellow-700" />
                <MacroBadge label={t.fats} value={aliment.lipides} color="bg-red-50 text-red-700" />
              </div>
            )}
            {aliment.non_trouve && (
              <form onSubmit={handlePatch} className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={manualCal}
                  onChange={e => setManualCal(e.target.value)}
                  placeholder={t.calories_kcal}
                  className="w-36 text-sm border border-orange-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
                <button
                  type="submit"
                  disabled={saving || !manualCal}
                  className="text-xs px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                >
                  {saving ? '...' : t.validate}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function AddFoodForm({ date, mealId, onAdded }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useLang();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await addFoodToMeal(date, mealId, text.trim());
      onAdded(updated);
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs text-gray-400 mb-2">{t.addFoodToMeal}</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t.foodPlaceholder}
          disabled={loading}
          className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : t.addFood}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </form>
  );
}

export default function MealResult({ repas, date, onUpdated, onDelete, onAddToInput }) {
  const [expanded, setExpanded] = useState(true);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const { lang, t } = useLang();

  async function handlePatch(date, mealId, alimentIndex, calories) {
    const updated = await patchCalories(date, mealId, alimentIndex, calories);
    onUpdated(updated);
  }

  async function handleRecalculate(e) {
    e.stopPropagation();
    setRecalcLoading(true);
    try {
      const updated = await recalculateMeal(date, repas.id);
      onUpdated(updated);
    } finally {
      setRecalcLoading(false);
    }
  }

  const count = repas.aliments.length;
  const itemLabel = count > 1 ? t.items : t.item;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-3">
      <div className="flex items-center">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex-1 flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
        >
          <div>
            <div className="text-sm font-medium text-gray-800 truncate max-w-xs">{repas.description_originale}</div>
            <div className="text-xs text-gray-400">{repas.heure} · {count} {itemLabel}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-green-700">{repas.total_calories} kcal</span>
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20" fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
            </svg>
          </div>
        </button>
        <button
          onClick={handleRecalculate}
          disabled={recalcLoading}
          title={t.recalculate}
          className="px-3 py-3 text-gray-400 hover:text-green-600 hover:bg-gray-50 transition-colors disabled:opacity-40 border-l border-gray-100"
        >
          <svg
            className={`h-4 w-4 ${recalcLoading ? 'animate-spin' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
          {repas.aliments.map((aliment, i) => (
            <AlimentCard
              key={i}
              aliment={aliment}
              index={i}
              mealId={repas.id}
              date={date}
              onPatch={handlePatch}
              onAddToInput={onAddToInput}
            />
          ))}

          <AddFoodForm
            date={date}
            mealId={repas.id}
            onAdded={onUpdated}
          />

          <div className="flex justify-between items-center pt-2">
            <p className="text-xs text-gray-400">{t.clickHint}</p>
            <button
              onClick={() => onDelete(date, repas.id)}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              {t.deleteMeal}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
