import { useState, useEffect, useRef } from 'react';
import { browseFoods, addFoodDirect } from '../services/api';
import FoodImage from './FoodImage';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function QuantityModal({ food, onConfirm, onCancel }) {
  const [quantite, setQuantite] = useState('100');
  const [unite, setUnite] = useState('g');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const qty = parseFloat(quantite);
    if (!qty || qty <= 0) return;
    onConfirm(qty, unite);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <FoodImage nom={food.nom} size="small" />
          <div>
            <p className="font-semibold text-gray-900 leading-tight">{food.nom}</p>
            {food.calories_per_100g != null && (
              <p className="text-xs text-gray-400">{food.calories_per_100g} kcal / 100g</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Quantité</label>
              <input
                ref={inputRef}
                type="number"
                min="1"
                step="1"
                value={quantite}
                onChange={e => setQuantite(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-gray-500 mb-1 block">Unité</label>
              <select
                value={unite}
                onChange={e => setUnite(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="pièce">pièce</option>
                <option value="portion">portion</option>
                <option value="tranche">tranche</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FoodCard({ food, onSelect }) {
  return (
    <button
      onClick={() => onSelect(food)}
      className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-green-50 hover:shadow-md transition-all group cursor-pointer text-left w-full"
    >
      <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform [&_img]:object-contain">
        <FoodImage nom={food.nom} size="large" />
      </div>
      <p className="text-xs text-center text-gray-700 leading-tight line-clamp-2 w-full font-medium">
        {food.nom}
      </p>
      {food.calories_per_100g != null && (
        <p className="text-xs text-gray-400">{food.calories_per_100g} kcal</p>
      )}
    </button>
  );
}

export default function FoodBrowser({ onFoodAdded }) {
  const [selectedLetter, setSelectedLetter] = useState('A');
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    loadFoods(selectedLetter);
  }, [selectedLetter, open]);

  async function loadFoods(letter) {
    setLoading(true);
    setError(null);
    setFoods([]);
    try {
      const data = await browseFoods(letter);
      setFoods(data.products || []);
    } catch {
      setError('Impossible de charger les aliments. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmAdd(quantite, unite) {
    if (!selectedFood) return;
    setAdding(true);
    try {
      const result = await addFoodDirect(selectedFood.nom, quantite, unite);
      setSelectedFood(null);
      onFoodAdded(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setAdding(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full mb-4 py-3 rounded-xl border-2 border-dashed border-green-300 text-green-600 text-sm font-medium hover:border-green-400 hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
      >
        <span className="text-lg">🔤</span>
        Parcourir les aliments par lettre
      </button>
    );
  }

  return (
    <>
      {selectedFood && (
        <QuantityModal
          food={selectedFood}
          onConfirm={handleConfirmAdd}
          onCancel={() => setSelectedFood(null)}
        />
      )}

      <div className="mb-4 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔤</span>
            <span className="font-semibold text-gray-800 text-sm">Parcourir les aliments</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Alphabet strip */}
        <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50">
          {ALPHABET.map(letter => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                selectedLetter === letter
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-green-100 hover:text-green-700'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Food grid */}
        <div className="p-3">
          {loading && (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-full aspect-square rounded-lg bg-gray-200 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="text-sm text-red-500 text-center py-4">{error}</p>
          )}

          {!loading && !error && foods.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              Aucun aliment trouvé pour « {selectedLetter} »
            </p>
          )}

          {!loading && foods.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {foods.map((food, i) => (
                <FoodCard
                  key={`${food.nom}-${i}`}
                  food={food}
                  onSelect={setSelectedFood}
                />
              ))}
            </div>
          )}
        </div>

        {adding && (
          <div className="px-4 py-2 text-center text-xs text-gray-400 animate-pulse border-t border-gray-100">
            Ajout en cours...
          </div>
        )}
      </div>
    </>
  );
}
