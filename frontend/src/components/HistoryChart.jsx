import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLang } from '../i18n/LangContext';

function shortDate(dateStr, lang) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short', day: 'numeric' });
}

function CustomTooltip({ active, payload, label, lang }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-green-700 font-bold">
          {payload[0].value.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} kcal
        </p>
      </div>
    );
  }
  return null;
}

export default function HistoryChart({ history }) {
  const today = new Date().toISOString().slice(0, 10);
  const { lang, t } = useLang();

  const data = Object.entries(history)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, day]) => ({
      date: shortDate(date, lang),
      rawDate: date,
      calories: day.total_jour || 0,
    }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 mb-6">
      <h2 className="text-sm font-medium text-gray-700 mb-4">{t.caloriesSevenDays}</h2>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
          <Tooltip content={<CustomTooltip lang={lang} />} cursor={{ fill: '#f0fdf4' }} />
          <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map(entry => (
              <Cell
                key={entry.rawDate}
                fill={entry.rawDate === today ? '#16a34a' : '#86efac'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
