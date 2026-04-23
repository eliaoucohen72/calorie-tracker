const TIMEOUT_MS = 5000;

async function fetchWithTimeout(url, ms = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function searchOpenFoodFacts(aliment) {
  const encoded = encodeURIComponent(aliment);
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encoded}&json=1&page_size=5&fields=product_name,nutriments,image_front_thumb_url,image_thumb_url`;
  try {
    const res = await fetchWithTimeout(url);
    const data = await res.json();
    const products = data.products || [];
    for (const p of products) {
      const n = p.nutriments || {};
      const kcal = n['energy-kcal_100g'] || n['energy-kcal'] || n['energy_100g'];
      if (kcal) {
        return {
          source: 'openfoodfacts',
          image: p.image_front_thumb_url || p.image_thumb_url || null,
          calories_per_100g: parseFloat(kcal),
          proteines_per_100g: parseFloat(n['proteins_100g'] || 0),
          glucides_per_100g: parseFloat(n['carbohydrates_100g'] || 0),
          lipides_per_100g: parseFloat(n['fat_100g'] || 0),
        };
      }
    }
  } catch {
    // timeout or network error — fall through to USDA
  }
  return null;
}

async function searchUSDA(aliment) {
  const encoded = encodeURIComponent(aliment);
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encoded}&api_key=DEMO_KEY&pageSize=5`;
  try {
    const res = await fetchWithTimeout(url);
    const data = await res.json();
    const foods = data.foods || [];
    for (const food of foods) {
      const nutrients = food.foodNutrients || [];
      const find = (name) => {
        const n = nutrients.find(n => n.nutrientName && n.nutrientName.toLowerCase().includes(name));
        return n ? parseFloat(n.value) : 0;
      };
      const kcal = find('energy') || find('calorie');
      if (kcal) {
        return {
          source: 'usda',
          calories_per_100g: kcal,
          proteines_per_100g: find('protein'),
          glucides_per_100g: find('carbohydrate'),
          lipides_per_100g: find('total lipid'),
        };
      }
    }
  } catch {
    // fallback also failed
  }
  return null;
}

// Units measured in g or ml directly
const UNITES_DIRECTES = new Set(['g', 'ml', 'cl', 'dl', 'l', 'kg']);

// Gram weight for container/portion units (per unit)
const POIDS_PAR_UNITE_CONTENEUR = {
  'boite': 150, 'boîte': 150, 'can': 150, 'conserve': 150,
  'canette': 330,
  'bouteille': 500,
  'verre': 200, 'grand verre': 300,
  'tasse': 200,
  'bol': 300,
  'assiette': 250,
  'portion': 150,
  'sachet': 100,
  'paquet': 100,
  'tranche': 30,
  'morceau': 100,
  'cuillère à soupe': 15, 'cuillere a soupe': 15,
  'cuillère à café': 5, 'cuillere a cafe': 5,
};

// Gram weight per piece for specific foods
const POIDS_PAR_PIECE_ALIMENT = [
  [['œuf', 'oeuf', 'egg'], 55],
  [['pomme de terre', 'potato'], 150],
  [['patate douce', 'sweet potato'], 150],
  [['pomme', 'apple'], 182],
  [['banane', 'banana'], 120],
  [['orange'], 131],
  [['tomate', 'tomato'], 123],
  [['carotte', 'carrot'], 61],
  [['avocat', 'avocado'], 150],
  [['kiwi'], 76],
  [['poire', 'pear'], 178],
];

function getPoidsParPiece(aliment) {
  const lower = aliment.toLowerCase();
  for (const [keywords, poids] of POIDS_PAR_PIECE_ALIMENT) {
    if (keywords.some(k => lower.includes(k))) return poids;
  }
  return 100;
}

function gramsFromUnite(quantite, unite, aliment) {
  const u = (unite || '').toLowerCase().trim();

  if (UNITES_DIRECTES.has(u)) {
    // Convert to grams
    if (u === 'kg') return quantite * 1000;
    if (u === 'l') return quantite * 1000;
    if (u === 'dl') return quantite * 100;
    if (u === 'cl') return quantite * 10;
    return quantite; // g or ml
  }

  // Container units
  for (const [key, poids] of Object.entries(POIDS_PAR_UNITE_CONTENEUR)) {
    if (u.includes(key)) return quantite * poids;
  }

  // Piece — use food-specific weight
  if (u === 'pièce' || u === 'piece' || u === '' || u === 'unité' || u === 'unite') {
    return quantite * getPoidsParPiece(aliment);
  }

  // Unknown unit — log and default to 100g per unit
  console.warn(`[nutrition] Unité inconnue: "${unite}" pour "${aliment}", défaut 100g/unité`);
  return quantite * 100;
}

function calcNutrition(per100, quantite, unite, aliment = '') {
  const grams = gramsFromUnite(quantite, unite, aliment);
  const factor = grams / 100;
  return {
    calories: Math.round(per100.calories_per_100g * factor),
    proteines: Math.round(per100.proteines_per_100g * factor * 10) / 10,
    glucides: Math.round(per100.glucides_per_100g * factor * 10) / 10,
    lipides: Math.round(per100.lipides_per_100g * factor * 10) / 10,
  };
}

export async function getNutrition(aliment, quantite, unite) {
  let per100 = await searchOpenFoodFacts(aliment);
  if (!per100) {
    per100 = await searchUSDA(aliment);
  }
  if (!per100) {
    return { nom: aliment, quantite, unite, calories: null, non_trouve: true };
  }
  const macros = calcNutrition(per100, quantite, unite, aliment);
  return {
    nom: aliment,
    quantite,
    unite,
    calories: macros.calories,
    proteines: macros.proteines,
    glucides: macros.glucides,
    lipides: macros.lipides,
    source: per100.source,
    image: per100.image || null,
    non_trouve: false,
  };
}
