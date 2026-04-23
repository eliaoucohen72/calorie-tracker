export default function TodaySummary({ totalJour }) {
  const formatted = totalJour.toLocaleString('fr-FR');
  return (
    <div className="rounded-xl bg-green-600 text-white px-5 py-4 mb-6 flex items-center justify-between shadow">
      <div>
        <p className="text-green-100 text-sm">Total aujourd'hui</p>
        <p className="text-3xl font-bold">{formatted} kcal</p>
      </div>
      <div className="text-green-200 text-5xl opacity-30 select-none">🥗</div>
    </div>
  );
}
