const BASE = '/api';

export async function analyzeMeal(description) {
  const res = await fetch(`${BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erreur || 'Erreur serveur');
  return data;
}

export async function getToday() {
  const res = await fetch(`${BASE}/logs/today`);
  return res.json();
}

export async function getHistory(days = 7) {
  const res = await fetch(`${BASE}/logs/history?days=${days}`);
  return res.json();
}

export async function deleteMeal(date, mealId) {
  const res = await fetch(`${BASE}/logs/${date}/${mealId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erreur lors de la suppression');
  return res.json();
}

export async function addFoodToMeal(date, mealId, description) {
  const res = await fetch(`/api/logs/${date}/${mealId}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erreur || 'Erreur serveur');
  return data;
}

export async function recalculateMeal(date, mealId) {
  const res = await fetch(`/api/logs/${date}/${mealId}/recalculate`, { method: 'POST' });
  if (!res.ok) throw new Error('Erreur recalcul');
  return res.json();
}

export async function browseFoods(letter) {
  const res = await fetch(`${BASE}/foods/browse?letter=${encodeURIComponent(letter)}`);
  if (!res.ok) throw new Error('Erreur lors de la recherche');
  return res.json();
}

export async function addFoodDirect(nom, quantite, unite) {
  const res = await fetch(`${BASE}/foods/add-direct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nom, quantite, unite }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erreur || 'Erreur serveur');
  return data;
}

export async function patchCalories(date, mealId, alimentIndex, calories) {
  const res = await fetch(`${BASE}/logs/patch-calories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, mealId, alimentIndex, calories }),
  });
  if (!res.ok) throw new Error('Erreur lors de la mise à jour');
  return res.json();
}
