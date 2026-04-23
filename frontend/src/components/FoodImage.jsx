import { useState, useEffect } from 'react';

const EMOJI_MAP = [
  [['patate douce', 'sweet potato'], '🍠'],
  [['pomme de terre', 'potato'], '🥔'],
  [['pomme'], '🍎'],
  [['banane', 'banana'], '🍌'],
  [['orange'], '🍊'],
  [['tomate', 'tomato'], '🍅'],
  [['carotte', 'carrot'], '🥕'],
  [['avocat', 'avocado'], '🥑'],
  [['brocoli', 'broccoli'], '🥦'],
  [['salade', 'laitue', 'lettuce'], '🥗'],
  [['riz', 'rice'], '🍚'],
  [['pâtes', 'pasta', 'spaghetti', 'tagliatelle', 'penne', 'carbonara'], '🍝'],
  [['pain', 'bread', 'baguette'], '🍞'],
  [['œuf', 'oeuf', 'egg'], '🥚'],
  [['poulet', 'chicken'], '🍗'],
  [['bœuf', 'boeuf', 'steak', 'viande', 'beef'], '🥩'],
  [['poisson', 'fish', 'saumon', 'thon', 'cabillaud'], '🐟'],
  [['fromage', 'cheese'], '🧀'],
  [['lait', 'milk'], '🥛'],
  [['yaourt', 'yogurt'], '🫙'],
  [['chocolat', 'chocolate'], '🍫'],
  [['café', 'coffee'], '☕'],
  [['thé', 'tea'], '🍵'],
  [['jus', 'juice'], '🧃'],
  [['eau', 'water'], '💧'],
  [['beurre', 'butter'], '🧈'],
  [['fraise', 'strawberry'], '🍓'],
  [['kiwi'], '🥝'],
  [['raisin', 'grape'], '🍇'],
  [['mangue', 'mango'], '🥭'],
  [['poire', 'pear'], '🍐'],
  [['cerise', 'cherry'], '🍒'],
  [['noix', 'nut', 'amande', 'almond', 'cacahuète'], '🥜'],
  [['soupe', 'soup', 'bouillon'], '🍲'],
  [['pizza'], '🍕'],
  [['burger', 'hamburger'], '🍔'],
  [['sandwich'], '🥪'],
  [['sushi'], '🍣'],
  [['glace', 'ice cream'], '🍦'],
  [['gâteau', 'cake', 'tarte'], '🍰'],
  [['courgette', 'zucchini'], '🥒'],
  [['poivron', 'pepper'], '🫑'],
  [['maïs', 'corn'], '🌽'],
  [['champignon', 'mushroom'], '🍄'],
  [['aubergine', 'eggplant'], '🍆'],
];

function getFoodEmoji(nom) {
  const lower = nom.toLowerCase();
  for (const [keywords, emoji] of EMOJI_MAP) {
    if (keywords.some(k => lower.includes(k))) return emoji;
  }
  return '🍽️';
}

// In-memory cache shared across all FoodImage instances
const cache = {};

async function fetchWikiImage(nom) {
  if (cache[nom] !== undefined) return cache[nom];

  const encoded = encodeURIComponent(nom);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://fr.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (!res.ok) throw new Error('not found');
    const data = await res.json();
    const url = data.thumbnail?.source ?? null;
    cache[nom] = url;
    return url;
  } catch {
    cache[nom] = null;
    return null;
  }
}

export default function FoodImage({ nom, offImage, size = 'small' }) {
  const [src, setSrc] = useState(offImage || null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (offImage) return;
    let cancelled = false;
    fetchWikiImage(nom).then(url => {
      if (!cancelled) setSrc(url);
    });
    return () => { cancelled = true; };
  }, [nom, offImage]);

  const cls = size === 'large'
    ? 'w-48 h-48 rounded-xl object-cover border border-gray-200 bg-gray-50'
    : 'w-10 h-10 rounded-lg object-cover border border-gray-100 bg-gray-50';

  const fallbackCls = size === 'large'
    ? 'w-48 h-48 rounded-xl bg-gray-100 flex items-center justify-center text-7xl select-none'
    : 'w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl shrink-0 select-none';

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={nom}
        onError={() => setImgError(true)}
        className={cls}
      />
    );
  }

  return (
    <div className={fallbackCls}>
      {getFoodEmoji(nom)}
    </div>
  );
}
