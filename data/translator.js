import translationsData from './translations.json';
import axios from 'axios';

// In-memory caches initialized with JSON
const cache = {
  abilities: { ...translationsData.abilities },
  items: { ...translationsData.items },
  moves: { ...translationsData.moves },
  natures: { ...translationsData.natures },
  types: { ...translationsData.types }
};

const isBrowser = typeof window !== 'undefined';

// Load from localStorage if in browser
if (isBrowser) {
  try {
    const localAbilities = localStorage.getItem('poketrans_abilities');
    const localItems = localStorage.getItem('poketrans_items');
    const localMoves = localStorage.getItem('poketrans_moves');
    const localNatures = localStorage.getItem('poketrans_natures');

    if (localAbilities) Object.assign(cache.abilities, JSON.parse(localAbilities));
    if (localItems) Object.assign(cache.items, JSON.parse(localItems));
    if (localMoves) Object.assign(cache.moves, JSON.parse(localMoves));
    if (localNatures) Object.assign(cache.natures, JSON.parse(localNatures));
  } catch (e) {
    console.error("Error loading translations from localStorage:", e);
  }
}

const saveToLocalStorage = (category) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(`poketrans_${category}`, JSON.stringify(cache[category]));
  } catch (e) {
    console.error("Error saving translations to localStorage:", e);
  }
};

const formatEnglishName = (name) => {
  if (!name) return '';
  // Capitalize each word
  return name
    .split(/[-_\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const getCleanKey = (name) => {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const getSlug = (name) => {
  if (!name) return '';
  return name.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

const getApiCategory = (category) => {
  switch (category) {
    case 'abilities': return 'ability';
    case 'items': return 'item';
    case 'moves': return 'move';
    case 'natures': return 'nature';
    default: return category;
  }
};

// Synchronous translation helpers
export const translateAbility = (name) => {
  if (!name) return 'Standard';
  const key = getCleanKey(name);
  if (key === 'none' || key === 'nothing') return 'Nessuna';
  return cache.abilities[key] || formatEnglishName(name);
};

export const translateItem = (name) => {
  if (!name) return 'Nessuno';
  const key = getCleanKey(name);
  if (key === 'none' || key === 'nothing') return 'Nessuno';
  return cache.items[key] || formatEnglishName(name);
};

export const translateMove = (name) => {
  if (!name) return '';
  const key = getCleanKey(name);
  return cache.moves[key] || formatEnglishName(name);
};

export const translateNature = (name) => {
  if (!name) return 'Seria (Neutra)';
  const key = getCleanKey(name);
  return cache.natures[key] || formatEnglishName(name);
};

export const translateType = (name) => {
  if (!name) return '';
  const key = getCleanKey(name);
  return cache.types[key] || formatEnglishName(name);
};

// Async translation of a single term
export const fetchSingleTranslation = async (category, englishName) => {
  if (!englishName) return '';
  const key = getCleanKey(englishName);
  if (key === 'none' || key === 'nothing') return 'Nessuno';

  // Check cache first
  if (cache[category] && cache[category][key]) {
    return cache[category][key];
  }

  const slug = getSlug(englishName);
  const apiCat = getApiCategory(category);

  try {
    const res = await axios.get(`https://pokeapi.co/api/v2/${apiCat}/${slug}`);
    if (res.data) {
      // Find Italian name
      const nameMatch = res.data.names?.find(n => n.language.name === 'it')?.name;
      if (nameMatch) {
        cache[category][key] = nameMatch;
        saveToLocalStorage(category);
        return nameMatch;
      }
    }
  } catch (err) {
    // Silent fail, will fallback to English formatted
  }

  // Fallback to formatted english name
  return formatEnglishName(englishName);
};

// Async batch translation
export const preloadTranslations = async (batchConfig) => {
  // batchConfig is an object like: { moves: [...], items: [...], abilities: [...], natures: [...] }
  const promises = [];

  for (const [category, names] of Object.entries(batchConfig)) {
    if (!cache[category] || !names || !names.length) continue;

    const uniqueNames = Array.from(new Set(names.filter(Boolean)));
    const missing = uniqueNames.filter(name => {
      const key = getCleanKey(name);
      return !cache[category][key];
    });

    for (const name of missing) {
      promises.push(fetchSingleTranslation(category, name));
    }
  }

  if (promises.length > 0) {
    await Promise.allSettled(promises);
  }
};
