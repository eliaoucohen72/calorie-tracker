export default function MealInput({ onAnalyze, loading, value, onChange }) {
  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim() || loading) return;
    onAnalyze(value);
    onChange('');
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Qu'avez-vous mangé ?
      </label>
      <div className="flex gap-2">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Ex : j'ai mangé une assiette de pâtes carbonara et un grand verre de jus d'orange"
          rows={3}
          disabled={loading}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100 resize-none"
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="self-end px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Analyse...
            </span>
          ) : 'Analyser'}
        </button>
      </div>
      {loading && (
        <p className="mt-2 text-xs text-gray-500 animate-pulse">Recherche en cours...</p>
      )}
    </form>
  );
}
