export const translations = {
  fr: {
    // Header
    appTitle: 'Suivi Calories',
    appSubtitle: "Analysez vos repas avec l'IA",
    switchToEnglish: 'Switch to English',
    switchToFrench: 'Passer en français',

    // Navigation
    today: "Aujourd'hui",
    history: 'Historique',

    // Today summary
    totalToday: "Total aujourd'hui",

    // Meal input
    whatDidYouEat: "Qu'avez-vous mangé ?",
    mealPlaceholder: "Ex : j'ai mangé une assiette de pâtes carbonara et un grand verre de jus d'orange",
    analyze: 'Analyser',
    analyzing: 'Analyse...',
    searching: 'Recherche en cours...',

    // Today view
    noMealsToday: "Aucun repas enregistré aujourd'hui.",
    noMealsTodaySub: 'Décrivez votre repas ci-dessus pour commencer.',
    mealsOfDay: 'Repas du jour',

    // History view
    lastSevenDays: '7 derniers jours',
    loadingHistory: "Chargement de l'historique...",
    caloriesSevenDays: 'Calories sur 7 jours',

    // Meal result
    item: 'aliment',
    items: 'aliments',
    notFound: 'Non trouvé',
    recalculate: 'Recalculer le total',
    close: 'Fermer',
    addToInput: "Ajouter à l'entrée",
    proteins: 'Protéines',
    carbs: 'Glucides',
    fats: 'Lipides',
    calories_kcal: 'Calories (kcal)',
    validate: 'Valider',
    addFoodToMeal: 'Ajouter un aliment à ce repas',
    foodPlaceholder: 'Ex : une banane, 30g de fromage…',
    addFood: 'Ajouter',
    clickHint: 'Cliquer sur le nom · image pour agrandir',
    deleteMeal: 'Supprimer ce repas',

    // History day
    noMeals: 'Aucun repas',
    meal: 'repas',
    meals: 'repas',

    // Food browser
    browseFoodsByLetter: 'Parcourir les aliments par lettre',
    browseFoods: 'Parcourir les aliments',
    quantity: 'Quantité',
    unit: 'Unité',
    cancel: 'Annuler',
    add: 'Ajouter',
    adding: 'Ajout en cours...',
    noFoodFound: (letter) => `Aucun aliment trouvé pour « ${letter} »`,
    loadError: 'Impossible de charger les aliments. Vérifiez votre connexion.',

    // Units
    unitG: 'g',
    unitMl: 'ml',
    unitPiece: 'pièce',
    unitPortion: 'portion',
    unitSlice: 'tranche',
  },

  en: {
    // Header
    appTitle: 'Calorie Tracker',
    appSubtitle: 'Analyze your meals with AI',
    switchToEnglish: 'Switch to English',
    switchToFrench: 'Switch to French',

    // Navigation
    today: 'Today',
    history: 'History',

    // Today summary
    totalToday: "Today's total",

    // Meal input
    whatDidYouEat: 'What did you eat?',
    mealPlaceholder: 'E.g.: I had a plate of carbonara pasta and a large glass of orange juice',
    analyze: 'Analyze',
    analyzing: 'Analyzing...',
    searching: 'Searching...',

    // Today view
    noMealsToday: 'No meals logged today.',
    noMealsTodaySub: 'Describe your meal above to get started.',
    mealsOfDay: "Today's meals",

    // History view
    lastSevenDays: 'Last 7 days',
    loadingHistory: 'Loading history...',
    caloriesSevenDays: 'Calories over 7 days',

    // Meal result
    item: 'item',
    items: 'items',
    notFound: 'Not found',
    recalculate: 'Recalculate total',
    close: 'Close',
    addToInput: 'Add to input',
    proteins: 'Protein',
    carbs: 'Carbs',
    fats: 'Fat',
    calories_kcal: 'Calories (kcal)',
    validate: 'Save',
    addFoodToMeal: 'Add a food to this meal',
    foodPlaceholder: 'E.g.: a banana, 30g of cheese…',
    addFood: 'Add',
    clickHint: 'Click name · image to enlarge',
    deleteMeal: 'Delete this meal',

    // History day
    noMeals: 'No meals',
    meal: 'meal',
    meals: 'meals',

    // Food browser
    browseFoodsByLetter: 'Browse foods by letter',
    browseFoods: 'Browse foods',
    quantity: 'Quantity',
    unit: 'Unit',
    cancel: 'Cancel',
    add: 'Add',
    adding: 'Adding...',
    noFoodFound: (letter) => `No food found for "${letter}"`,
    loadError: 'Unable to load foods. Check your connection.',

    // Units
    unitG: 'g',
    unitMl: 'ml',
    unitPiece: 'piece',
    unitPortion: 'serving',
    unitSlice: 'slice',
  },
};
