export default function Navigation({ tab, setTab }) {
  return (
    <nav className="flex border-b border-gray-200 mb-6">
      <button
        onClick={() => setTab('today')}
        className={`px-6 py-3 text-sm font-medium transition-colors ${
          tab === 'today'
            ? 'border-b-2 border-green-600 text-green-700'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Aujourd'hui
      </button>
      <button
        onClick={() => setTab('history')}
        className={`px-6 py-3 text-sm font-medium transition-colors ${
          tab === 'history'
            ? 'border-b-2 border-green-600 text-green-700'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Historique
      </button>
    </nav>
  );
}
