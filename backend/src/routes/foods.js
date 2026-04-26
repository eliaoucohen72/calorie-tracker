import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getNutrition } from '../services/nutrition.js';
import { saveMeal } from '../services/storage.js';

const router = Router();

// Curated food list with French names and approx kcal/100g
// Images are fetched client-side via Wikipedia
const FOODS_BY_LETTER = {
  a: [
    { nom: 'Abricot', calories_per_100g: 48 },
    { nom: 'Agneau', calories_per_100g: 294 },
    { nom: 'Ail', calories_per_100g: 149 },
    { nom: 'Amande', calories_per_100g: 575 },
    { nom: 'Ananas', calories_per_100g: 50 },
    { nom: 'Artichaut', calories_per_100g: 47 },
    { nom: 'Asperge', calories_per_100g: 20 },
    { nom: 'Aubergine', calories_per_100g: 25 },
    { nom: 'Avocat', calories_per_100g: 160 },
    { nom: 'Avoine', calories_per_100g: 389 },
  ],
  b: [
    { nom: 'Banane', calories_per_100g: 89 },
    { nom: 'Beurre', calories_per_100g: 717 },
    { nom: 'Brocoli', calories_per_100g: 34 },
    { nom: 'Bœuf', calories_per_100g: 250 },
    { nom: 'Blé', calories_per_100g: 340 },
    { nom: 'Betterave', calories_per_100g: 43 },
    { nom: 'Brie', calories_per_100g: 334 },
    { nom: 'Brugnon', calories_per_100g: 44 },
  ],
  c: [
    { nom: 'Camembert', calories_per_100g: 300 },
    { nom: 'Carotte', calories_per_100g: 41 },
    { nom: 'Cerise', calories_per_100g: 50 },
    { nom: 'Champignon', calories_per_100g: 22 },
    { nom: 'Chocolat noir', calories_per_100g: 546 },
    { nom: 'Chou-fleur', calories_per_100g: 25 },
    { nom: 'Citron', calories_per_100g: 29 },
    { nom: 'Concombre', calories_per_100g: 15 },
    { nom: 'Courgette', calories_per_100g: 17 },
    { nom: 'Crème fraîche', calories_per_100g: 292 },
  ],
  d: [
    { nom: 'Datte', calories_per_100g: 282 },
    { nom: 'Dinde', calories_per_100g: 189 },
    { nom: 'Dorade', calories_per_100g: 100 },
  ],
  e: [
    { nom: 'Edamame', calories_per_100g: 122 },
    { nom: 'Emmental', calories_per_100g: 382 },
    { nom: 'Endive', calories_per_100g: 17 },
    { nom: 'Épinard', calories_per_100g: 23 },
    { nom: 'Escalope de veau', calories_per_100g: 105 },
  ],
  f: [
    { nom: 'Figue', calories_per_100g: 74 },
    { nom: 'Farine de blé', calories_per_100g: 364 },
    { nom: 'Fenouil', calories_per_100g: 31 },
    { nom: 'Fraise', calories_per_100g: 32 },
    { nom: 'Framboise', calories_per_100g: 52 },
    { nom: 'Fromage blanc', calories_per_100g: 72 },
  ],
  g: [
    { nom: 'Gruyère', calories_per_100g: 413 },
    { nom: 'Grenade', calories_per_100g: 83 },
  ],
  h: [
    { nom: 'Haricot vert', calories_per_100g: 31 },
    { nom: 'Haricot blanc', calories_per_100g: 333 },
    { nom: 'Huile d\'olive', calories_per_100g: 884 },
    { nom: 'Huître', calories_per_100g: 68 },
  ],
  i: [
    { nom: 'Igname', calories_per_100g: 118 },
  ],
  j: [
    { nom: 'Jambon', calories_per_100g: 145 },
    { nom: 'Jus d\'orange', calories_per_100g: 45 },
  ],
  k: [
    { nom: 'Kiwi', calories_per_100g: 61 },
  ],
  l: [
    { nom: 'Lait demi-écrémé', calories_per_100g: 46 },
    { nom: 'Lait entier', calories_per_100g: 61 },
    { nom: 'Lentille', calories_per_100g: 116 },
    { nom: 'Lotte', calories_per_100g: 76 },
  ],
  m: [
    { nom: 'Maïs', calories_per_100g: 86 },
    { nom: 'Mangue', calories_per_100g: 60 },
    { nom: 'Melon', calories_per_100g: 34 },
    { nom: 'Mozzarella', calories_per_100g: 280 },
    { nom: 'Myrtille', calories_per_100g: 57 },
  ],
  n: [
    { nom: 'Noisette', calories_per_100g: 628 },
    { nom: 'Noix', calories_per_100g: 654 },
    { nom: 'Noix de cajou', calories_per_100g: 553 },
    { nom: 'Noix de coco', calories_per_100g: 354 },
  ],
  o: [
    { nom: 'Œuf', calories_per_100g: 155 },
    { nom: 'Oignon', calories_per_100g: 40 },
    { nom: 'Olive', calories_per_100g: 145 },
    { nom: 'Orange', calories_per_100g: 47 },
  ],
  p: [
    { nom: 'Pain complet', calories_per_100g: 247 },
    { nom: 'Pastèque', calories_per_100g: 30 },
    { nom: 'Pâtes', calories_per_100g: 157 },
    { nom: 'Pêche', calories_per_100g: 39 },
    { nom: 'Poireau', calories_per_100g: 31 },
    { nom: 'Poire', calories_per_100g: 57 },
    { nom: 'Pois chiche', calories_per_100g: 164 },
    { nom: 'Poivron', calories_per_100g: 31 },
    { nom: 'Pomme', calories_per_100g: 52 },
    { nom: 'Pomme de terre', calories_per_100g: 86 },
    { nom: 'Porc', calories_per_100g: 242 },
    { nom: 'Poulet', calories_per_100g: 165 },
  ],
  q: [
    { nom: 'Quinoa', calories_per_100g: 120 },
  ],
  r: [
    { nom: 'Radis', calories_per_100g: 16 },
    { nom: 'Raisin', calories_per_100g: 69 },
    { nom: 'Riz blanc', calories_per_100g: 130 },
    { nom: 'Riz complet', calories_per_100g: 111 },
  ],
  s: [
    { nom: 'Saumon', calories_per_100g: 208 },
    { nom: 'Sardine', calories_per_100g: 208 },
    { nom: 'Soja', calories_per_100g: 446 },
  ],
  t: [
    { nom: 'Thon', calories_per_100g: 116 },
    { nom: 'Tofu', calories_per_100g: 76 },
    { nom: 'Tomate', calories_per_100g: 18 },
    { nom: 'Truite', calories_per_100g: 119 },
  ],
  u: [
    { nom: 'Udon', calories_per_100g: 132 },
  ],
  v: [
    { nom: 'Veau', calories_per_100g: 172 },
  ],
  w: [
    { nom: 'Waffle', calories_per_100g: 291 },
  ],
  x: [
    { nom: 'Xérès', calories_per_100g: 116 },
  ],
  y: [
    { nom: 'Yaourt nature', calories_per_100g: 59 },
    { nom: 'Yaourt grec', calories_per_100g: 97 },
  ],
  z: [
    { nom: 'Zucchini', calories_per_100g: 17 },
  ],
};

// Browse foods by first letter — returns from built-in list (no external API)
router.get('/browse', (req, res) => {
  const letter = (req.query.letter || 'a').toLowerCase().slice(0, 1);
  const products = FOODS_BY_LETTER[letter] || [];
  res.json({ products, letter });
});



// Add a food directly (without AI parsing) to today's log
router.post('/add-direct', async (req, res) => {
  const { nom, quantite, unite } = req.body;
  if (!nom?.trim()) {
    return res.status(400).json({ erreur: 'Nom de l\'aliment manquant' });
  }
  const qty = parseFloat(quantite) || 100;
  const unit = (unite || 'g').trim();

  const aliment = await getNutrition(nom.trim(), qty, unit);

  const now = new Date();
  const dateKey = now.toISOString().slice(0, 10);
  const heure = now.toTimeString().slice(0, 5);

  const mealEntry = {
    id: uuidv4(),
    heure,
    description_originale: `${qty} ${unit} de ${nom.trim()}`,
    aliments: [aliment],
    total_calories: aliment.calories || 0,
  };

  const dayData = saveMeal(dateKey, mealEntry);
  res.json({ repas: mealEntry, total_jour: dayData.total_jour });
});

export default router;
