import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { parseWithGemini } from '../services/gemini.js';
import { getNutrition } from '../services/nutrition.js';
import { saveMeal } from '../services/storage.js';

const router = Router();

router.post('/', async (req, res) => {
  const { description } = req.body;
  if (!description || !description.trim()) {
    return res.status(400).json({ erreur: 'Description manquante' });
  }

  let parsed;
  try {
    parsed = await parseWithGemini(description.trim());
  } catch (err) {
    console.error('[analyze] Erreur Gemini:', err.message);
    return res.status(422).json({ erreur: 'Impossible d\'analyser ce repas. Veuillez reformuler.' });
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return res.status(422).json({ erreur: 'Impossible d\'analyser ce repas. Veuillez reformuler.' });
  }

  const aliments = await Promise.all(
    parsed.map(item => getNutrition(item.aliment, item.quantite, item.unite))
  );

  const totalCalories = aliments.reduce((sum, a) => sum + (a.calories || 0), 0);

  const now = new Date();
  const dateKey = now.toISOString().slice(0, 10);
  const heure = now.toTimeString().slice(0, 5);

  const mealEntry = {
    id: uuidv4(),
    heure,
    description_originale: description.trim(),
    aliments,
    total_calories: totalCalories,
  };

  const dayData = saveMeal(dateKey, mealEntry);

  res.json({
    repas: mealEntry,
    total_jour: dayData.total_jour,
  });
});

export default router;
