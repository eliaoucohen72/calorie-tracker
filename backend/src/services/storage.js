import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '../../data/logs.json');

function readLogs() {
  if (!existsSync(DATA_PATH)) {
    writeFileSync(DATA_PATH, '{}', 'utf-8');
    return {};
  }
  try {
    const raw = readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeLogs(data) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function saveMeal(dateKey, mealEntry) {
  const logs = readLogs();
  if (!logs[dateKey]) {
    logs[dateKey] = { repas: [], total_jour: 0 };
  }
  logs[dateKey].repas.push(mealEntry);
  logs[dateKey].total_jour = logs[dateKey].repas.reduce(
    (sum, r) => sum + (r.total_calories || 0),
    0
  );
  writeLogs(logs);
  return logs[dateKey];
}

export function getLogsForDays(days = 7) {
  const logs = readLogs();
  const result = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result[key] = logs[key] || { repas: [], total_jour: 0 };
  }
  return result;
}

export function getTodayLogs() {
  const logs = readLogs();
  const today = new Date().toISOString().slice(0, 10);
  return logs[today] || { repas: [], total_jour: 0 };
}

export function patchAlimentCalories(dateKey, mealId, alimentIndex, calories) {
  const logs = readLogs();
  if (!logs[dateKey]) return null;
  const meal = logs[dateKey].repas.find(r => r.id === mealId);
  if (!meal || !meal.aliments[alimentIndex]) return null;
  meal.aliments[alimentIndex].calories = calories;
  meal.aliments[alimentIndex].non_trouve = false;
  meal.total_calories = meal.aliments.reduce((sum, a) => sum + (a.calories || 0), 0);
  logs[dateKey].total_jour = logs[dateKey].repas.reduce(
    (sum, r) => sum + (r.total_calories || 0),
    0
  );
  writeLogs(logs);
  return logs[dateKey];
}

export function addFoodsToMeal(dateKey, mealId, newAliments) {
  const logs = readLogs();
  if (!logs[dateKey]) return null;
  const meal = logs[dateKey].repas.find(r => r.id === mealId);
  if (!meal) return null;
  meal.aliments.push(...newAliments);
  meal.total_calories = meal.aliments.reduce((sum, a) => sum + (a.calories || 0), 0);
  logs[dateKey].total_jour = logs[dateKey].repas.reduce(
    (sum, r) => sum + (r.total_calories || 0),
    0
  );
  writeLogs(logs);
  return logs[dateKey];
}

export function getMeal(dateKey, mealId) {
  const logs = readLogs();
  if (!logs[dateKey]) return null;
  return logs[dateKey].repas.find(r => r.id === mealId) || null;
}

export function updateMealAliments(dateKey, mealId, aliments) {
  const logs = readLogs();
  if (!logs[dateKey]) return null;
  const meal = logs[dateKey].repas.find(r => r.id === mealId);
  if (!meal) return null;
  meal.aliments = aliments;
  meal.total_calories = aliments.reduce((sum, a) => sum + (a.calories || 0), 0);
  logs[dateKey].total_jour = logs[dateKey].repas.reduce(
    (sum, r) => sum + (r.total_calories || 0),
    0
  );
  writeLogs(logs);
  return logs[dateKey];
}

export function deleteMeal(dateKey, mealId) {
  const logs = readLogs();
  if (!logs[dateKey]) return null;
  logs[dateKey].repas = logs[dateKey].repas.filter(r => r.id !== mealId);
  logs[dateKey].total_jour = logs[dateKey].repas.reduce(
    (sum, r) => sum + (r.total_calories || 0),
    0
  );
  writeLogs(logs);
  return logs[dateKey];
}
