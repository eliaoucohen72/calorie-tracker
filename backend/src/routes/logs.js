import { Router } from 'express';
import {
  getLogsForDays, getTodayLogs, deleteMeal,
  patchAlimentCalories, addFoodsToMeal, getMeal, updateMealAliments,
} from '../services/storage.js';
import { parseWithGemini } from '../services/gemini.js';
import { getNutrition } from '../services/nutrition.js';

const router = Router();

router.get('/today', (_req, res) => {
  res.json(getTodayLogs());
});

router.get('/history', (req, res) => {
  const days = parseInt(req.query.days) || 7;
  res.json(getLogsForDays(days));
});

router.delete('/:date/:mealId', (req, res) => {
  const { date, mealId } = req.params;
  const updated = deleteMeal(date, mealId);
  if (!updated) return res.status(404).json({ erreur: 'Repas introuvable' });
  res.json(updated);
});

router.post('/patch-calories', (req, res) => {
  const { date, mealId, alimentIndex, calories } = req.body;
  if (calories == null || isNaN(Number(calories))) {
    return res.status(400).json({ erreur: 'Calories invalides' });
  }
  const updated = patchAlimentCalories(date, mealId, alimentIndex, Number(calories));
  if (!updated) return res.status(404).json({ erreur: 'Repas ou aliment introuvable' });
  res.json(updated);
});

router.post('/:date/:mealId/add', async (req, res) => {
  const { date, mealId } = req.params;
  const { description } = req.body;
  if (!description?.trim()) {
    return res.status(400).json({ erreur: 'Description manquante' });
  }
  let parsed;
  try {
    parsed = await parseWithGemini(description.trim());
  } catch (err) {
    console.error('[add-food] Erreur Groq:', err.message);
    return res.status(422).json({ erreur: 'Impossible d\'analyser cet aliment.' });
  }
  const newAliments = await Promise.all(
    parsed.map(item => getNutrition(item.aliment, item.quantite, item.unite))
  );
  const updated = addFoodsToMeal(date, mealId, newAliments);
  if (!updated) return res.status(404).json({ erreur: 'Repas introuvable' });
  res.json(updated);
});

router.post('/:date/:mealId/recalculate', async (req, res) => {
  const { date, mealId } = req.params;
  const meal = getMeal(date, mealId);
  if (!meal) return res.status(404).json({ erreur: 'Repas introuvable' });

  const updatedAliments = await Promise.all(
    meal.aliments.map(a => getNutrition(a.nom, a.quantite, a.unite))
  );

  const updated = updateMealAliments(date, mealId, updatedAliments);
  res.json(updated);
});

export default router;
