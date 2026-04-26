import { useState, useEffect, useCallback } from 'react';
import { useTranslate } from './hooks/useTranslate';
import Navigation from './components/Navigation';
import MealInput from './components/MealInput';
import MealResult from './components/MealResult';
import TodaySummary from './components/TodaySummary';
import HistoryDay from './components/HistoryDay';
import HistoryChart from './components/HistoryChart';
import { analyzeMeal, getToday, getHistory, deleteMeal } from './services/api';
import FoodBrowser from './components/FoodBrowser';

export default function App() {
  const [tab, setTab] = useState('today');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [todayData, setTodayData] = useState({ repas: [], total_jour: 0 });
  const [history, setHistory] = useState({});
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [inputText, setInputText] = useState('');

  const today = new Date().toISOString().slice(0, 10);
  const { lang, toggle: toggleLang } = useTranslate();

  const loadToday = useCallback(async () => {
    try {
      const data = await getToday();
      setTodayData(data);
    } catch {
      // ignore
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const data = await getHistory(7);
      setHistory(data);
      setHistoryLoaded(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  useEffect(() => {
    if (tab === 'history') loadHistory();
  }, [tab]);

  async function handleAnalyze(description) {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeMeal(description);
      setTodayData(prev => ({
        repas: [...prev.repas, result.repas],
        total_jour: result.total_jour,
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(date, mealId) {
    try {
      const updated = await deleteMeal(date, mealId);
      if (date === today) setTodayData(updated);
      if (historyLoaded) setHistory(prev => ({ ...prev, [date]: updated }));
    } catch (e) {
      setError(e.message);
    }
  }

  function handleMealUpdated(date, updated) {
    if (date === today) setTodayData(updated);
    if (historyLoaded) setHistory(prev => ({ ...prev, [date]: updated }));
  }

  function handleAddToInput(aliment) {
    const label = `${aliment.quantite} ${aliment.nom}`;
    setInputText(prev => prev ? `${prev}, ${label}` : label);
    setTab('today');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Suivi Calories</h1>
            <p className="text-xs text-gray-400">Analysez vos repas avec l'IA</p>
          </div>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
          >
            <span className="text-base leading-none">{lang === 'fr' ? '🇬🇧' : '🇫🇷'}</span>
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Navigation tab={tab} setTab={setTab} />

        {tab === 'today' && (
          <>
            <TodaySummary totalJour={todayData.total_jour} />
            <FoodBrowser
              onFoodAdded={result => setTodayData(prev => ({
                repas: [...prev.repas, result.repas],
                total_jour: result.total_jour,
              }))}
            />
            <MealInput
              onAnalyze={handleAnalyze}
              loading={loading}
              value={inputText}
              onChange={setInputText}
            />

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {todayData.repas.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-12">
                Aucun repas enregistré aujourd'hui.<br />
                Décrivez votre repas ci-dessus pour commencer.
              </div>
            ) : (
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-3">Repas du jour</h2>
                {[...todayData.repas].reverse().map(repas => (
                  <MealResult
                    key={repas.id}
                    repas={repas}
                    date={today}
                    onUpdated={updated => handleMealUpdated(today, updated)}
                    onDelete={handleDelete}
                    onAddToInput={handleAddToInput}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'history' && (
          <>
            {historyLoaded && Object.keys(history).length > 0 && (
              <HistoryChart history={history} />
            )}
            <h2 className="text-sm font-medium text-gray-500 mb-3">7 derniers jours</h2>
            {!historyLoaded ? (
              <div className="text-center text-gray-400 text-sm py-8 animate-pulse">
                Chargement de l'historique...
              </div>
            ) : (
              Object.entries(history)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([dateKey, dayData]) => (
                  <HistoryDay
                    key={dateKey}
                    dateKey={dateKey}
                    dayData={dayData}
                    onAddToInput={handleAddToInput}
                  />
                ))
            )}
          </>
        )}
      </main>
    </div>
  );
}
