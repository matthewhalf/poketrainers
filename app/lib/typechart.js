const typeChart = {
  normal: {
    weak: ['fighting'],
    resist: [],
    immune: ['ghost'],
    strong: []
  },
  fire: {
    weak: ['water', 'ground', 'rock'],
    resist: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
    immune: [],
    strong: ['grass', 'ice', 'bug', 'steel']
  },
  water: {
    weak: ['grass', 'electric'],
    resist: ['fire', 'water', 'ice', 'steel'],
    immune: [],
    strong: ['fire', 'ground', 'rock']
  },
  grass: {
    weak: ['fire', 'ice', 'poison', 'flying', 'bug'],
    resist: ['water', 'grass', 'electric', 'ground'],
    immune: [],
    strong: ['water', 'ground', 'rock']
  },
  electric: {
    weak: ['ground'],
    resist: ['electric', 'flying', 'steel'],
    immune: [],
    strong: ['water', 'flying']
  },
  ice: {
    weak: ['fire', 'fighting', 'rock', 'steel'],
    resist: ['ice'],
    immune: [],
    strong: ['grass', 'ground', 'flying', 'dragon']
  },
  fighting: {
    weak: ['flying', 'psychic', 'fairy'],
    resist: ['bug', 'rock', 'dark'],
    immune: [],
    strong: ['normal', 'ice', 'rock', 'dark', 'steel']
  },
  poison: {
    weak: ['ground', 'psychic'],
    resist: ['grass', 'fighting', 'poison', 'bug', 'fairy'],
    immune: [],
    strong: ['grass', 'fairy']
  },
  ground: {
    weak: ['water', 'grass', 'ice'],
    resist: ['poison', 'rock'],
    immune: ['electric'],
    strong: ['fire', 'electric', 'poison', 'rock', 'steel']
  },
  flying: {
    weak: ['electric', 'ice', 'rock'],
    resist: ['grass', 'fighting', 'bug'],
    immune: ['ground'],
    strong: ['grass', 'fighting', 'bug']
  },
  psychic: {
    weak: ['bug', 'ghost', 'dark'],
    resist: ['fighting', 'psychic'],
    immune: [],
    strong: ['fighting', 'poison']
  },
  bug: {
    weak: ['fire', 'flying', 'rock'],
    resist: ['grass', 'fighting', 'ground'],
    immune: [],
    strong: ['grass', 'psychic', 'dark']
  },
  rock: {
    weak: ['water', 'grass', 'fighting', 'ground', 'steel'],
    resist: ['normal', 'fire', 'poison', 'flying'],
    immune: [],
    strong: ['fire', 'ice', 'flying', 'bug']
  },
  ghost: {
    weak: ['ghost', 'dark'],
    resist: ['poison', 'bug'],
    immune: ['normal', 'fighting'],
    strong: ['psychic', 'ghost']
  },
  dragon: {
    weak: ['ice', 'dragon', 'fairy'],
    resist: ['fire', 'water', 'grass', 'electric'],
    immune: [],
    strong: ['dragon']
  },
  steel: {
    weak: ['fire', 'fighting', 'ground'],
    resist: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'],
    immune: ['poison'],
    strong: ['ice', 'rock', 'fairy']
  },
  dark: {
    weak: ['fighting', 'bug', 'fairy'],
    resist: ['ghost', 'dark'],
    immune: ['psychic'],
    strong: ['psychic', 'ghost']
  },
  fairy: {
    weak: ['poison', 'steel'],
    resist: ['fighting', 'bug', 'dark'],
    immune: ['dragon'],
    strong: ['fighting', 'dragon', 'dark']
  }
};

const allTypes = Object.keys(typeChart);

/**
 * Calculates defense profile and offense profile for a Pokemon based on its type(s)
 * @param {string[]} types - Array of types (e.g. ['dragon', 'ground'])
 */
function getTypeEffectiveness(types) {
  if (!types || types.length === 0) {
    return {
      weak4x: [],
      weak2x: [],
      resist05x: [],
      resist025x: [],
      immune: [],
      offensiveStrengths: []
    };
  }

  // Normalize inputs
  const activeTypes = types.map(t => t.toLowerCase().trim()).filter(t => allTypes.includes(t));

  // Initialize defending multipliers
  const multipliers = {};
  for (const type of allTypes) {
    multipliers[type] = 1.0;
  }

  // Calculate defensive multipliers
  for (const pkmType of activeTypes) {
    const chart = typeChart[pkmType];
    
    // Apply weaknesses
    for (const weakType of chart.weak) {
      multipliers[weakType] *= 2.0;
    }
    // Apply resistances
    for (const resistType of chart.resist) {
      multipliers[resistType] *= 0.5;
    }
    // Apply immunities
    for (const immuneType of chart.immune) {
      multipliers[immuneType] *= 0.0;
    }
  }

  // Group defensive multipliers
  const result = {
    weak4x: [],
    weak2x: [],
    resist05x: [],
    resist025x: [],
    immune: [],
    offensiveStrengths: []
  };

  for (const [type, mult] of Object.entries(multipliers)) {
    if (mult === 4.0) {
      result.weak4x.push(type);
    } else if (mult === 2.0) {
      result.weak2x.push(type);
    } else if (mult === 0.5) {
      result.resist05x.push(type);
    } else if (mult === 0.25) {
      result.resist025x.push(type);
    } else if (mult === 0.0) {
      result.immune.push(type);
    }
  }

  // Calculate offensive strengths (union of type Chart strong categories)
  const strongSet = new Set();
  for (const pkmType of activeTypes) {
    const chart = typeChart[pkmType];
    for (const strongType of chart.strong) {
      strongSet.add(strongType);
    }
  }
  result.offensiveStrengths = Array.from(strongSet);

  return result;
}

module.exports = {
  getTypeEffectiveness
};
