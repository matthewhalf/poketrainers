/**
 * Helper to fetch PokeAPI v2 data with caching
 */
async function fetchPokeApi(endpoint) {
  const url = `https://pokeapi.co/api/v2/${endpoint}`;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } }); // Cache for 24h
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`PokeAPI fetch error for ${endpoint}:`, err);
    return null;
  }
}

/**
 * Maps Pikalytics names to official PokeAPI slugs
 */
function normalizeName(name) {
  if (!name) return '';
  let slug = name.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');

  // Handle special cases
  if (slug === 'floette-eternal') return 'floette-eternal';
  if (slug === 'charizard-mega-y') return 'charizard-mega-y';
  if (slug === 'charizard-mega-x') return 'charizard-mega-x';
  if (slug === 'mewtwo-mega-y') return 'mewtwo-mega-y';
  if (slug === 'mewtwo-mega-x') return 'mewtwo-mega-x';
  if (slug === 'ninetales-alola') return 'ninetales-alola';
  if (slug === 'sandslash-alola') return 'sandslash-alola';
  if (slug === 'raichu-alola') return 'raichu-alola';
  if (slug === 'marowak-alola') return 'marowak-alola';
  if (slug === 'exeggutor-alola') return 'exeggutor-alola';
  if (slug === 'muk-alola') return 'muk-alola';
  if (slug === 'grimer-alola') return 'grimer-alola';
  if (slug === 'meowth-alola') return 'meowth-alola';
  if (slug === 'persian-alola') return 'persian-alola';

  // Base normalization for Champions/Pikalytics specific forms
  if (slug === 'basculegion') return 'basculegion-male';
  if (slug === 'pyroar') return 'pyroar-male';
  if (slug === 'maushold') return 'maushold-family-of-four';
  if (slug === 'basculegion-f') return 'basculegion-female';
  if (slug === 'basculegion-m') return 'basculegion-male';
  if (slug === 'indeedee-f') return 'indeedee-female';
  if (slug === 'indeedee-m') return 'indeedee-male';
  if (slug === 'meowstic-f') return 'meowstic-female';
  if (slug === 'meowstic-m') return 'meowstic-male';
  if (slug === 'oinkologne-f') return 'oinkologne-female';
  if (slug === 'oinkologne-m') return 'oinkologne-male';

  // Hisuian forms
  if (slug.endsWith('-hisui')) {
    return slug.replace('-hisui', '-hisui');
  }

  // Megas
  if (slug.endsWith('-mega')) {
    return slug;
  }

  return slug;
}

/**
 * Formats Pikalytics sprite names matching the CDN structure
 */
function getPikalyticsSpriteFilename(name) {
  if (!name) return '';
  let slug = name.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');

  if (slug.endsWith('-mega-y')) {
    slug = slug.replace('-mega-y', '_megay');
  } else if (slug.endsWith('-mega-x')) {
    slug = slug.replace('-mega-x', '_megax');
  } else {
    slug = slug.replace(/-/g, '_');
  }
  return slug;
}

/**
 * Gets base name if the specific custom/mega form doesn't exist in official PokeAPI
 */
function getBaseName(slug) {
  const officialMegas = [
    'venusaur-mega', 'charizard-mega-x', 'charizard-mega-y', 'blastoise-mega', 
    'beedrill-mega', 'pidgeot-mega', 'alakazam-mega', 'slowbro-mega', 'gengar-mega', 
    'kangaskhan-mega', 'pinsir-mega', 'gyarados-mega', 'aerodactyl-mega', 'mewtwo-mega-x', 
    'mewtwo-mega-y', 'ampharos-mega', 'steelix-mega', 'scizor-mega', 'heracross-mega', 
    'houndoom-mega', 'tyranitar-mega', 'sceptile-mega', 'blaziken-mega', 'swampert-mega', 
    'gardevoir-mega', 'sableye-mega', 'mawile-mega', 'aggron-mega', 'medicham-mega', 
    'manectric-mega', 'sharpedo-mega', 'camerupt-mega', 'altaria-mega', 'banette-mega', 
    'absol-mega', 'glalie-mega', 'salamence-mega', 'metagross-mega', 'latias-mega', 
    'latios-mega', 'rayquaza-mega', 'lopunny-mega', 'garchomp-mega', 'lucario-mega', 
    'abomasnow-mega', 'gallade-mega', 'audino-mega', 'diancie-mega'
  ];

  if ((slug.endsWith('-mega') || slug.endsWith('-mega-x') || slug.endsWith('-mega-y')) && 
      !officialMegas.includes(slug)) {
    return slug.replace(/-mega(-x|-y)?$/, '');
  }

  // Custom forms fallback
  if (slug.endsWith('-eternal') && slug !== 'floette-eternal') {
    return slug.replace('-eternal', '');
  }

  return slug;
}

/**
 * Retrieves Pokemon details (sprites, type info) from PokeAPI
 */
async function getPokemonPokeApiData(pokemonName) {
  const normalized = normalizeName(pokemonName);
  let apiData = await fetchPokeApi(`pokemon/${normalized}`);

  // Fallback to base species if the specific form (e.g. Mega Staraptor) doesn't exist
  if (!apiData) {
    const baseName = getBaseName(normalized);
    if (baseName !== normalized) {
      apiData = await fetchPokeApi(`pokemon/${baseName}`);
    }
  }

  if (!apiData) {
    let slug = pokemonName.toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
    if (slug.endsWith('-mega-y')) {
      slug = slug.replace('-mega-y', '-megay');
    } else if (slug.endsWith('-mega-x')) {
      slug = slug.replace('-mega-x', '-megax');
    }
    if (slug === 'basculegion-f') {
      slug = 'basculegion-f';
    } else if (slug === 'basculegion-m') {
      slug = 'basculegion';
    }

    return {
      spriteUrl: `https://play.pokemonshowdown.com/sprites/xyani/${slug}.gif`,
      artworkUrl: null,
      types: [],
      abilities: [],
      moves: [],
      stats: null,
      description: ''
    };
  }

  // Get species description (flavor text) prefer Italian description
  let description = '';
  const speciesData = await fetchPokeApi(`pokemon-species/${apiData.species.name}`);
  if (speciesData && speciesData.flavor_text_entries) {
    const itEntry = speciesData.flavor_text_entries.find(e => e.language.name === 'it');
    const enEntry = speciesData.flavor_text_entries.find(e => e.language.name === 'en');
    const entry = itEntry || enEntry;
    if (entry) {
      description = entry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ');
    }
  }

  return {
    id: apiData.id,
    name: apiData.name,
    spriteUrl: apiData.sprites.front_default,
    artworkUrl: apiData.sprites.other['official-artwork'].front_default || apiData.sprites.front_default,
    types: apiData.types.map(t => t.type.name),
    abilities: apiData.abilities ? apiData.abilities.map(a => a.ability.name) : [],
    moves: apiData.moves ? apiData.moves.map(m => m.move.name) : [],
    stats: apiData.stats.reduce((acc, curr) => {
      const statMap = {
        'hp': 'hp',
        'attack': 'atk',
        'defense': 'def',
        'special-attack': 'spa',
        'special-defense': 'spd',
        'speed': 'spe'
      };
      acc[statMap[curr.stat.name]] = curr.base_stat;
      return acc;
    }, {}),
    description: description
  };
}

/**
 * Fetches description of a move and translates name/description to Italian
 */
async function getMoveDetails(moveName) {
  const normalized = moveName.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');

  const data = await fetchPokeApi(`move/${normalized}`);
  if (!data) return { name: moveName, displayName: moveName, desc: 'Descrizione non disponibile.', type: '', power: null, accuracy: null };

  // Translate move name
  const itName = data.names ? data.names.find(n => n.language.name === 'it') : null;
  const displayName = itName ? `${itName.name} (${moveName})` : moveName;

  // Translate description
  let desc = 'Descrizione non disponibile.';
  if (data.flavor_text_entries && data.flavor_text_entries.length > 0) {
    const itEntry = data.flavor_text_entries.find(e => e.language.name === 'it');
    const enEntry = data.flavor_text_entries.find(e => e.language.name === 'en');
    const entry = itEntry || enEntry;
    if (entry) {
      desc = entry.flavor_text;
    }
  } else if (data.effect_entries && data.effect_entries.length > 0) {
    const itEntry = data.effect_entries.find(e => e.language.name === 'it');
    const enEntry = data.effect_entries.find(e => e.language.name === 'en');
    const entry = itEntry || enEntry;
    if (entry) {
      desc = entry.short_effect || entry.effect;
    }
  }

  desc = desc.replace(/\$effect_chance/g, data.effect_chance || '');

  return {
    name: moveName,
    displayName,
    desc: desc.replace(/\f/g, ' ').replace(/\n/g, ' '),
    type: data.type.name,
    power: data.power,
    accuracy: data.accuracy,
    pp: data.pp
  };
}

/**
 * Fetches description of an item and translates name/description to Italian
 */
async function getItemDetails(itemName) {
  const normalized = itemName.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');

  const data = await fetchPokeApi(`item/${normalized}`);
  if (!data) return { name: itemName, displayName: itemName, desc: 'Dettagli dello strumento non disponibili.' };

  // Translate item name
  const itName = data.names ? data.names.find(n => n.language.name === 'it') : null;
  const displayName = itName ? `${itName.name} (${itemName})` : itemName;

  // Translate description
  let desc = 'Dettagli dello strumento non disponibili.';
  if (data.flavor_text_entries && data.flavor_text_entries.length > 0) {
    const itEntry = data.flavor_text_entries.find(e => e.language.name === 'it');
    const enEntry = data.flavor_text_entries.find(e => e.language.name === 'en');
    const entry = itEntry || enEntry;
    if (entry) {
      desc = entry.text || entry.flavor_text;
    }
  } else if (data.effect_entries && data.effect_entries.length > 0) {
    const itEntry = data.effect_entries.find(e => e.language.name === 'it');
    const enEntry = data.effect_entries.find(e => e.language.name === 'en');
    const entry = itEntry || enEntry;
    if (entry) {
      desc = entry.short_effect || entry.effect;
    }
  }

  return {
    name: itemName,
    displayName,
    desc: desc.replace(/\f/g, ' ').replace(/\n/g, ' '),
    spriteUrl: data.sprites ? data.sprites.default : null
  };
}

/**
 * Fetches description of an ability and translates name/description to Italian
 */
async function getAbilityDetails(abilityName) {
  const normalized = abilityName.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');

  const data = await fetchPokeApi(`ability/${normalized}`);
  if (!data) return { name: abilityName, displayName: abilityName, desc: 'Dettagli dell\'abilità non disponibili.' };

  // Translate ability name
  const itName = data.names ? data.names.find(n => n.language.name === 'it') : null;
  const displayName = itName ? `${itName.name} (${abilityName})` : abilityName;

  // Translate description
  let desc = 'Dettagli dell\'abilità non disponibili.';
  if (data.flavor_text_entries && data.flavor_text_entries.length > 0) {
    const itEntry = data.flavor_text_entries.find(e => e.language.name === 'it');
    const enEntry = data.flavor_text_entries.find(e => e.language.name === 'en');
    const entry = itEntry || enEntry;
    if (entry) {
      desc = entry.flavor_text;
    }
  } else if (data.effect_entries && data.effect_entries.length > 0) {
    const itEntry = data.effect_entries.find(e => e.language.name === 'it');
    const enEntry = data.effect_entries.find(e => e.language.name === 'en');
    const entry = itEntry || enEntry;
    if (entry) {
      desc = entry.short_effect || entry.effect;
    }
  }

  return {
    name: abilityName,
    displayName,
    desc: desc.replace(/\f/g, ' ').replace(/\n/g, ' ')
  };
}

/**
 * Retrieves only basic Pokemon details (sprites, type info) to optimize bulk queries
 */
async function getPokemonBasicData(pokemonName) {
  const normalized = normalizeName(pokemonName);
  let apiData = await fetchPokeApi(`pokemon/${normalized}`);

  if (!apiData) {
    const baseName = getBaseName(normalized);
    if (baseName !== normalized) {
      apiData = await fetchPokeApi(`pokemon/${baseName}`);
    }
  }

  if (!apiData) {
    let slug = pokemonName.toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
    if (slug.endsWith('-mega-y')) {
      slug = slug.replace('-mega-y', '-megay');
    } else if (slug.endsWith('-mega-x')) {
      slug = slug.replace('-mega-x', '-megax');
    }
    if (slug === 'basculegion-f') {
      slug = 'basculegion-f';
    } else if (slug === 'basculegion-m') {
      slug = 'basculegion';
    }

    return {
      spriteUrl: `https://play.pokemonshowdown.com/sprites/xyani/${slug}.gif`,
      types: []
    };
  }

  return {
    spriteUrl: apiData.sprites.front_default,
    artworkUrl: apiData.sprites.other['official-artwork'].front_default || apiData.sprites.front_default,
    types: apiData.types.map(t => t.type.name)
  };
}

module.exports = {
  getPokemonPokeApiData,
  getPokemonBasicData,
  getMoveDetails,
  getItemDetails,
  getAbilityDetails
};
