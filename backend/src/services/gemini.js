import Groq from 'groq-sdk';

const PROMPT = `Tu es un assistant nutritionnel. Analyse la description de repas en français et retourne UNIQUEMENT un JSON valide, sans aucun texte autour, sans balises markdown, avec ce format exact :
[
  { "aliment": "pâtes carbonara", "quantite": 250, "unite": "g" },
  { "aliment": "jus d'orange", "quantite": 250, "unite": "ml" }
]
Règles :
- Convertis toujours les portions vagues en grammes ou ml : "une assiette" = 250g, "un grand verre" = 250ml, "un bol" = 300ml, "une tasse" = 200ml, "une tranche" = 30g, "un morceau" = 100g
- Si la quantité est précise (ex: "2 œufs"), garde-la telle quelle avec unite = "pièce"
- Retourne toujours un tableau, même pour un seul aliment
- Répondre uniquement avec le tableau JSON brut, rien d'autre`;

function extractJSON(text) {
  const stripped = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();
  const match = stripped.match(/\[[\s\S]*\]/);
  if (match) return match[0];
  throw new Error(`Aucun JSON trouvé dans la réponse: ${text.slice(0, 200)}`);
}

export async function parseWithGemini(description) {
  console.log('[Groq] Clé présente ?', !!process.env.GROQ_API_KEY, '| longueur:', process.env.GROQ_API_KEY?.length);
  console.log('[Groq] Description reçue:', description);

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  async function attempt() {
    console.log('[Groq] Envoi requête à llama-3.3-70b-versatile...');
    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: PROMPT },
          { role: 'user', content: `Description : "${description}"` },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });
    } catch (apiErr) {
      console.error('[Groq] Erreur API:', apiErr.status, apiErr.message);
      throw apiErr;
    }

    const text = completion.choices[0].message.content;
    console.log('[Groq raw]', text);

    // json_object mode may return an object instead of an array
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
      // Single item: { "aliment": "...", "quantite": ..., "unite": "..." }
      if (parsed.aliment) return [parsed];
      // Wrapped array: { "aliments": [...] } or { "repas": [...] }
      const arr = parsed.aliments || parsed.repas || parsed.items;
      if (Array.isArray(arr)) return arr;
      // Last resort: first value that is an array
      const firstArr = Object.values(parsed).find(v => Array.isArray(v));
      if (firstArr) return firstArr;
    } catch {
      // fall through to extractJSON
    }
    const jsonStr = extractJSON(text);
    return JSON.parse(jsonStr);
  }

  try {
    return await attempt();
  } catch (err) {
    console.warn('[Groq] 1ère tentative échouée, retry...', err.message);
    return await attempt();
  }
}
