'use client';

import { useState, useEffect } from 'react';
import PokemonImage from './PokemonImage';
import { Search, Plus, Trash2, Sparkles, Shield, Sword, Play, Zap, RotateCcw, AlertTriangle } from 'lucide-react';
import { pokemonNames } from './lib/pokemonNames';
import Link from 'next/link';

// Italian translations mapping for types
const typeTranslations = {
  normal: 'Normale',
  fire: 'Fuoco',
  water: 'Acqua',
  electric: 'Elettro',
  grass: 'Erba',
  ice: 'Ghiaccio',
  fighting: 'Lotta',
  poison: 'Veleno',
  ground: 'Terra',
  flying: 'Volante',
  psychic: 'Psico',
  bug: 'Coleottero',
  rock: 'Roccia',
  ghost: 'Spettro',
  dragon: 'Drago',
  steel: 'Acciaio',
  fairy: 'Folletto',
  dark: 'Buio'
};

// Italian translations mapping for natures
const natureTranslations = {
  jolly: 'Allegra',
  adamant: 'Decisa',
  modest: 'Modesta',
  timid: 'Timida',
  bold: 'Sicura',
  impish: 'Scaltra',
  calm: 'Calma',
  careful: 'Cauta',
  quiet: 'Quieta',
  brave: 'Audace',
  relaxed: 'Placida',
  sassy: 'Vivace',
  naughty: 'Birbona',
  hardy: 'Ardita',
  docile: 'Docile',
  serious: 'Seria',
  bashful: 'Schiva',
  quirky: 'Bizzarra',
  lonely: 'Schiva',
  mild: 'Mite',
  rash: 'Ardente',
  gentle: 'Gentile',
  lax: 'Fiacca',
  hasty: 'Lesta',
  naive: 'Ingenua'
};

const getNatureTranslation = (name) => {
  if (!name) return 'Decisa (Adamant)';
  const normalized = name.toLowerCase().trim();
  return natureTranslations[normalized] ? `${name} (${natureTranslations[normalized]})` : name;
};

// Helper to get Showdown Sprite URL
const getPkmSprite = (name) => {
  if (!name) return '';
  let slug = name.toLowerCase().trim()
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

  return `https://play.pokemonshowdown.com/sprites/xyani/${slug}.gif`;
};

// List of status/support moves to identify Support role
const supportMoves = [
  'tailwind', 'ventoincoda', 'trick room', 'distortozona', 'fake out', 'bruciapelo', 
  'spore', 'spora', 'reflect', 'riflesso', 'light screen', 'schermoluce', 
  'follow me', 'sonoqui', 'rage powder', 'polverabbia', 'helping hand', 'aiutino', 
  'will-o-wisp', 'fuocofatuo', 'thunder wave', 'tuononda', 'yawn', 'sbadiglio',
  'protect', 'protezione', 'spiky shield', 'agopugnale', 'baneful bunker', 'scudo tossico',
  'wide guard', 'anticipoprotezione', 'quick guard', 'scudo reale', 'ally switch', 'scambio alleato'
];

const typeChart = {
  normal: { weak: ['fighting'], resist: [], immune: ['ghost'], strong: [] },
  fire: { weak: ['water', 'ground', 'rock'], resist: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immune: [], strong: ['grass', 'ice', 'bug', 'steel'] },
  water: { weak: ['grass', 'electric'], resist: ['fire', 'water', 'ice', 'steel'], immune: [], strong: ['fire', 'ground', 'rock'] },
  grass: { weak: ['fire', 'ice', 'poison', 'flying', 'bug'], resist: ['water', 'grass', 'electric', 'ground'], immune: [], strong: ['water', 'ground', 'rock'] },
  electric: { weak: ['ground'], resist: ['electric', 'flying', 'steel'], immune: [], strong: ['water', 'flying'] },
  ice: { weak: ['fire', 'fighting', 'rock', 'steel'], resist: ['ice'], immune: [], strong: ['grass', 'ground', 'flying', 'dragon'] },
  fighting: { weak: ['flying', 'psychic', 'fairy'], resist: ['bug', 'rock', 'dark'], immune: [], strong: ['normal', 'ice', 'rock', 'dark', 'steel'] },
  poison: { weak: ['ground', 'psychic'], resist: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immune: [], strong: ['grass', 'fairy'] },
  ground: { weak: ['water', 'grass', 'ice'], resist: ['poison', 'rock'], immune: ['electric'], strong: ['fire', 'electric', 'poison', 'rock', 'steel'] },
  flying: { weak: ['electric', 'ice', 'rock'], resist: ['grass', 'fighting', 'bug'], immune: ['ground'], strong: ['grass', 'fighting', 'bug'] },
  psychic: { weak: ['bug', 'ghost', 'dark'], resist: ['fighting', 'psychic'], immune: [], strong: ['fighting', 'poison'] },
  bug: { weak: ['fire', 'flying', 'rock'], resist: ['grass', 'fighting', 'ground'], immune: [], strong: ['grass', 'psychic', 'dark'] },
  rock: { weak: ['water', 'grass', 'fighting', 'ground', 'steel'], resist: ['normal', 'fire', 'poison', 'flying'], immune: [], strong: ['fire', 'ice', 'flying', 'bug'] },
  ghost: { weak: ['ghost', 'dark'], resist: ['poison', 'bug'], immune: ['normal', 'fighting'], strong: ['psychic', 'ghost'] },
  dragon: { weak: ['ice', 'dragon', 'fairy'], resist: ['fire', 'water', 'grass', 'electric'], immune: [], strong: ['dragon'] },
  steel: { weak: ['fire', 'fighting', 'ground'], resist: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immune: ['poison'], strong: ['ice', 'rock', 'fairy'] },
  dark: { weak: ['fighting', 'bug', 'fairy'], resist: ['ghost', 'dark'], immune: ['psychic'], strong: ['psychic', 'ghost'] },
  fairy: { weak: ['poison', 'steel'], resist: ['fighting', 'bug', 'dark'], immune: ['dragon'], strong: ['fighting', 'dragon', 'dark'] }
};

const customPokemonGuides = {
  garchomp: "È il tuo attaccante fisico principale. Usalo per lanciare forti Terremoti. Ricorda che Terremoto colpisce anche il tuo compagno di squadra, quindi affiancalo a un Pokémon di tipo Volante, con Levitazione (es. Cresselia) o usa la mossa Protezione sul secondo Pokémon.",
  whimsicott: "Il tuo principale Pokémon di supporto per il controllo della velocità. La sua abilità Burla (Prankster) gli permette di usare mosse di stato con priorità alta. Usa Ventoincoda (Tailwind) al primo turno per garantire che i tuoi attaccanti colpiscano per primi.",
  incineroar: "Il pilastro indiscutibile del formato VGC. Quando entra in campo, la sua abilità Prepotenza (Intimidate) riduce l'Attacco fisico degli avversari. Usa Bruciapelo (Fake Out) al primo turno per far tentennare un nemico e bloccarlo, e Monito (Parting Shot) per scambiarlo con un compagno riducendone ulteriormente le statistiche offensive.",
  amoonguss: "Incredibile tank di supporto. La mossa Spora (Spore) addormenta i nemici con precisione al 100%, mettendoli fuori gioco per diversi turni. Usa Polverabbia (Rage Powder) per attirare gli attacchi nemici su di sé e proteggere gli attaccanti più fragili del tuo team.",
  kingambit: "Un formidabile attaccante fisico da fine partita. La sua abilità Generale Supremo lo rende più forte per ogni alleato andato KO. Usa Sbigoattacco (Sucker Punch) per attaccare con priorità assoluta quando prevedi che l'avversario stia per attaccare.",
  gholdengo: "Un eccezionale attaccante speciale. La sua mossa Corsa all'Oro (Make It Rain) colpisce entrambi gli avversari infliggendo enormi danni d'acciaio. La sua abilità Corpo Aureo (Good as Gold) lo rende totalmente immune a tutte le mosse di stato nemiche (es. Spora o Fuocofatuo).",
  rillaboom: "Imposta il Campo Erboso (Grassy Terrain) all'entrata, curando i tuoi Pokémon e potenziando le mosse Erba. Usa Erbascivolata (Grassy Glide) che attacca con priorità assoluta all'interno del campo erboso, utilissima per finire avversari già indeboliti.",
  urshifu: "Un attaccante inarrestabile. La sua abilità Pugni Invisibili gli permette di superare mosse protettive come Protezione o Individua. Usa Pugni a Raffica (Surging Strikes) se Stile Pluricolpo o Pugnodombra (Wicked Blow) se Stile Singolcolpo per infliggere sempre brutti colpi.",
  'crinealato': "Un attaccante speciale velocissimo e letale. Sfrutta Palla Ombra (Shadow Ball) e Forza Lunare (Moonblast) per fare ingenti danni speciali. È fragile fisicamente, quindi proteggilo dai forti attacchi fisici nemici.",
  'flutter mane': "Un attaccante speciale velocissimo e letale. Sfrutta Palla Ombra (Shadow Ball) e Forza Lunare (Moonblast) per fare ingenti danni speciali. È fragile fisicamente, quindi proteggilo dai forti attacchi fisici nemici.",
  pelipper: "Imposta la Pioggia all'entrata in campo, potenziando le mosse Acqua e dimezzando quelle Fuoco. Sinergizza perfettamente con Pokémon con l'abilità Nuotovelox (Swift Swim) come Archaludon o Basculegion, raddoppiandone la velocità.",
  archaludon: "Estremamente forte sotto la Pioggia. La sua mossa Elettrotramoggia (Electro Shot) si carica istantaneamente sotto pioggia e aumenta il suo Attacco Speciale. Sfrutta la sua alta difesa fisica e l'abilità Vigore per resistere a lungo.",
  torkoal: "Imposta il Sole all'entrata. Questo potenzia le mosse Fuoco e attiva l'abilità Paleosintesi (Protosynthesis) di Pokémon del passato come Crinealato. Usa Eruzione (Eruption) a pieni HP per infliggere danni devastanti.",
  dragonite: "Grazie all'abilità Compensazione (Multiscale), subisce metà dei danni se è a pieni HP. Sfrutta Extrarapido (Extreme Speed) potenziato dal Teracristal Normale per infliggere danni prioritari devastanti.",
  regieleki: "Il Pokémon più veloce del gioco. Usa Elettrogabbia (Electroweb) per rallentare entrambi i nemici e l'abilità Transistor per infliggere grandissimi danni di tipo Elettro."
};

function getPokemonWeaknesses(types) {
  const weaknesses = [];
  const resistances = [];
  const immunities = [];

  Object.keys(typeChart).forEach(attackType => {
    let multiplier = 1;
    types.forEach(defType => {
      const chart = typeChart[defType];
      if (!chart) return;
      if (chart.weak.includes(attackType)) {
        multiplier *= 2;
      } else if (chart.resist.includes(attackType)) {
        multiplier *= 0.5;
      } else if (chart.immune.includes(attackType)) {
        multiplier *= 0;
      }
    });

    if (multiplier > 1) {
      weaknesses.push({ type: attackType, value: multiplier });
    } else if (multiplier === 0) {
      immunities.push(attackType);
    } else if (multiplier < 1) {
      resistances.push({ type: attackType, value: multiplier });
    }
  });

  return { weaknesses, resistances, immunities };
}

export default function BoxBuilder({ pokemonList }) {
  const [box, setBox] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');

  const [savedTeams, setSavedTeams] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    const loaded = localStorage.getItem('vgc_saved_teams');
    if (loaded) {
      try {
        setSavedTeams(JSON.parse(loaded));
      } catch (e) {
        console.error('Failed loading saved teams:', e);
      }
    }
  }, []);

  const startSaveTeam = () => {
    setIsSaving(true);
    const names = recommendations.team.map(t => t.name).join(', ');
    setTeamName(`Team - ${names.substring(0, 30)}${names.length > 30 ? '...' : ''}`);
  };

  const confirmSaveTeam = () => {
    if (!teamName.trim()) return;

    const newTeamObj = {
      id: Date.now().toString(),
      name: teamName.trim(),
      team: recommendations.team,
      leads: recommendations.leads,
      tips: recommendations.tips,
      beginnerGuide: recommendations.beginnerGuide
    };

    const updated = [newTeamObj, ...savedTeams];
    setSavedTeams(updated);
    localStorage.setItem('vgc_saved_teams', JSON.stringify(updated));
    setIsSaving(false);
    setRecommendations(null); // Scompare da sotto dopo il salvataggio
  };

  const loadSavedTeam = (saved) => {
    setRecommendations({
      team: saved.team,
      leads: saved.leads,
      tips: saved.tips,
      beginnerGuide: saved.beginnerGuide
    });
    // Ripopola il box con i Pokémon del team caricato
    setBox(saved.team.map(t => t.name));
  };

  const deleteSavedTeam = (id) => {
    const updated = savedTeams.filter(t => t.id !== id);
    setSavedTeams(updated);
    localStorage.setItem('vgc_saved_teams', JSON.stringify(updated));
  };

  // Handle autocomplete input change
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.trim().length > 0) {
      const queryLower = val.toLowerCase().trim();
      
      // Find matching meta Pokemon first
      const metaMatches = pokemonList.filter(p => 
        p.name.toLowerCase().includes(queryLower) && !box.includes(p.name)
      );
      
      // Find matching global Pokemon that aren't already matched in meta
      const globalMatches = pokemonNames
        .filter(name => 
          name.toLowerCase().includes(queryLower) && 
          !box.includes(name) &&
          !metaMatches.some(m => m.name.toLowerCase() === name.toLowerCase())
        );

      // Combine them, prioritizing meta matches
      const allMatches = [
        ...metaMatches,
        ...globalMatches.map(name => ({ name, rank: '-', winrate: '-', record: '-' }))
      ];
      
      // Sort matches to prioritize ones that START with the search query
      allMatches.sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(queryLower);
        const bStarts = b.name.toLowerCase().startsWith(queryLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.name.localeCompare(b.name);
      });

      setSuggestions(allMatches.slice(0, 8)); // Suggest up to 8 matching pokemon
    } else {
      setSuggestions([]);
    }
  };

  // Add Pokémon to box
  const addToBox = (name) => {
    const capitalized = name.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (box.includes(capitalized)) {
      setError('Pokémon già presente nel box.');
      return;
    }
    setBox([...box, capitalized]);
    setSearchQuery('');
    setSuggestions([]);
    setError('');
  };

  // Remove Pokémon from box
  const removeFromBox = (name) => {
    setBox(box.filter(p => p !== name));
  };

  // Quick select meta pokemon
  const quickMeta = pokemonList.slice(0, 12);

  // Generate competitive VGC team
  const generateTeam = async () => {
    if (box.length === 0) {
      setError('Inserisci almeno un Pokémon nel box per iniziare.');
      return;
    }

    setIsLoading(true);
    setError('');
    setRecommendations(null);

    try {
      // Step 1: Fetch stats for all Box Pokemon in parallel
      setLoadingStep('Analisi dei Pokémon nel tuo Box...');
      const boxDetails = await Promise.all(
        box.map(async (pkmName) => {
          try {
            const res = await fetch(`/api/pokemon?name=${encodeURIComponent(pkmName)}`);
            if (!res.ok) return null;
            return await res.json();
          } catch (e) {
            console.error(`Errore caricamento dati per ${pkmName}`, e);
            return null;
          }
        })
      );

      const validBoxData = boxDetails.filter(Boolean);
      if (validBoxData.length === 0) {
        throw new Error('Impossibile caricare i dati dei Pokémon inseriti nel box.');
      }

      setLoadingStep('Calcolo delle sinergie del metagame...');
      
      // Step 2: Select the team members (exactly 6)
      let finalTeamData = [];
      let boxChosen = [];

      if (validBoxData.length >= 6) {
        // Greedy selection of 6 best from box based on rank & mutual synergies
        // Sort box by rank first (lower rank number = more common)
        const sortedBox = [...validBoxData].sort((a, b) => {
          const rA = a.metaStats.rank === 'N/A' ? 999 : parseInt(a.metaStats.rank, 10);
          const rB = b.metaStats.rank === 'N/A' ? 999 : parseInt(b.metaStats.rank, 10);
          return rA - rB;
        });

        // Initialize with top meta rank pokemon
        finalTeamData.push(sortedBox[0]);
        boxChosen.push(sortedBox[0].metaStats.name);

        while (finalTeamData.length < 6) {
          let bestNext = null;
          let bestScore = -9999;

          for (const pkm of sortedBox) {
            if (boxChosen.includes(pkm.metaStats.name)) continue;

            // Compute synergy score with currently selected team
            let synergyScore = 0;
            for (const member of finalTeamData) {
              const ATeammate = pkm.metaStats.teammates.find(t => t.name.toLowerCase() === member.metaStats.name.toLowerCase());
              const BTeammate = member.metaStats.teammates.find(t => t.name.toLowerCase() === pkm.metaStats.name.toLowerCase());
              if (ATeammate) synergyScore += (100 - ATeammate.rank);
              if (BTeammate) synergyScore += (100 - BTeammate.rank);
            }

            // Small bonus for overall rank
            const rankVal = pkm.metaStats.rank === 'N/A' ? 999 : parseInt(pkm.metaStats.rank, 10);
            synergyScore += (100 - rankVal / 2);

            if (synergyScore > bestScore) {
              bestScore = synergyScore;
              bestNext = pkm;
            }
          }

          if (bestNext) {
            finalTeamData.push(bestNext);
            boxChosen.push(bestNext.metaStats.name);
          } else {
            break;
          }
        }
      } else {
        // We have K < 6 Pokémon. We select all of them and complete the team with top teammates
        finalTeamData = [...validBoxData];
        boxChosen = validBoxData.map(d => d.metaStats.name);

        // Aggregate top teammates of box members
        const teammatesMap = {};
        validBoxData.forEach(member => {
          member.metaStats.teammates.forEach(teammate => {
            const name = teammate.name;
            if (boxChosen.includes(name)) return; // Don't re-add box members
            
            if (!teammatesMap[name]) {
              teammatesMap[name] = {
                name: name,
                occurrences: 0,
                accumulatedScore: 0,
                rankSum: 0
              };
            }
            teammatesMap[name].occurrences += 1;
            teammatesMap[name].accumulatedScore += (100 - teammate.rank);
            teammatesMap[name].rankSum += teammate.rank;
          });
        });

        // Convert to array and sort candidates
        const candidates = Object.values(teammatesMap).sort((a, b) => {
          // Prioritize teammates that synergize with MULTIPLE box members, then by synergy rank score
          if (a.occurrences !== b.occurrences) {
            return b.occurrences - a.occurrences;
          }
          return b.accumulatedScore - a.accumulatedScore;
        });

        // Add top candidates to fill up to 6 members
        const metaAdded = [];
        let cIdx = 0;
        while (finalTeamData.length < 6 && cIdx < candidates.length) {
          const cand = candidates[cIdx];
          cIdx++;

          // Fetch candidate meta data
          setLoadingStep(`Recupero dettagli per ${cand.name} (consigliato per il meta)...`);
          try {
            const res = await fetch(`/api/pokemon?name=${encodeURIComponent(cand.name)}`);
            if (res.ok) {
              const data = await res.json();
              finalTeamData.push(data);
              metaAdded.push(cand.name);
            }
          } catch (e) {
            console.error(`Errore caricamento dati per candidato ${cand.name}`, e);
          }
        }

        // Fallback: if we still don't have 6 (e.g. no teammates found), fill with top meta pokemon
        let metaListIdx = 0;
        while (finalTeamData.length < 6 && metaListIdx < pokemonList.length) {
          const fallbackName = pokemonList[metaListIdx].name;
          metaListIdx++;
          if (boxChosen.includes(fallbackName) || metaAdded.includes(fallbackName)) continue;

          try {
            const res = await fetch(`/api/pokemon?name=${encodeURIComponent(fallbackName)}`);
            if (res.ok) {
              const data = await res.json();
              finalTeamData.push(data);
            }
          } catch (e) {
            console.error(`Errore caricamento per fallback ${fallbackName}`, e);
          }
        }
      }

      // Step 3: Map data to a displayable structure and define builds
      const formatName = (str) => {
        if (!str) return 'N/D';
        return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      };

      const teamDetails = finalTeamData.map(pkm => {
        const isFromBox = box.includes(pkm.metaStats.name);
        
        // Find best items
        const bestItem = pkm.metaStats.enrichedItems && pkm.metaStats.enrichedItems[0]
          ? pkm.metaStats.enrichedItems[0].displayName
          : pkm.metaStats.items && pkm.metaStats.items[0]?.name
            ? formatName(pkm.metaStats.items[0].name)
            : 'Baccacedro (Sitrus Berry)'; // Fallback

        // Find best ability
        const bestAbility = pkm.metaStats.enrichedAbilities && pkm.metaStats.enrichedAbilities[0]
          ? pkm.metaStats.enrichedAbilities[0].displayName
          : pkm.metaStats.abilities && pkm.metaStats.abilities[0]?.name
            ? formatName(pkm.metaStats.abilities[0].name)
            : pkm.apiData.abilities && pkm.apiData.abilities[0]
              ? formatName(pkm.apiData.abilities[0])
              : 'N/D';

        // Find best nature
        const bestNature = pkm.metaStats.natures && pkm.metaStats.natures[0]?.name
          ? getNatureTranslation(pkm.metaStats.natures[0].name)
          : 'Decisa (Adamant)';

        // Find best EV spread
        const rawSpread = pkm.metaStats.evSpreads && pkm.metaStats.evSpreads[0]?.spread;
        let formattedSpread = '252 HP / 4 Def / 252 SpD (Bilanciato)';
        if (rawSpread) {
          const parts = rawSpread.split('/').map(Number);
          if (parts.length === 6) {
            const statsAbbrev = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];
            const evs = parts.map(v => {
              if (v === 32) return 252;
              if (v === 31) return 244;
              if (v === 30) return 236;
              if (v > 0) return Math.min(252, v * 8 - 4);
              return 0;
            });
            const spreadArr = [];
            for (let i = 0; i < 6; i++) {
              if (evs[i] > 0) spreadArr.push(`${evs[i]} ${statsAbbrev[i]}`);
            }
            formattedSpread = spreadArr.join(' / ');
          }
        }

        // Find top 4 moves
        let moves = [];
        if (pkm.metaStats.enrichedMoves && pkm.metaStats.enrichedMoves.length > 0) {
          moves = pkm.metaStats.enrichedMoves.slice(0, 4).map(m => ({
            name: m.displayName || m.name,
            type: m.type || 'normal'
          }));
        } else if (pkm.metaStats.moves && pkm.metaStats.moves.length > 0) {
          moves = pkm.metaStats.moves.slice(0, 4).map(m => ({
            name: formatName(m.name),
            type: 'normal'
          }));
        } else if (pkm.apiData.moves && pkm.apiData.moves.length > 0) {
          moves = pkm.apiData.moves.slice(0, 4).map(mName => ({
            name: formatName(mName),
            type: 'normal'
          }));
        } else {
          moves = [
            { name: 'Azione (Tackle)', type: 'normal' },
            { name: 'Ruggito (Growl)', type: 'normal' }
          ];
        }

        // Determine Role
        let role = 'Attaccante Fisico';
        const stats = pkm.apiData.stats || { hp: 80, atk: 80, def: 80, spa: 80, spd: 80, spe: 80 };
        
        // Check if support moves exist
        const pkmMovesLower = (pkm.metaStats.moves || []).map(m => m.name.toLowerCase());
        const hasSupportMoves = pkmMovesLower.some(move => supportMoves.some(sm => move.includes(sm)));

        if (hasSupportMoves || stats.spe > 105 && stats.atk < 90 && stats.spa < 90) {
          role = 'Supporto / Utility';
        } else if (stats.spa > stats.atk) {
          role = 'Attaccante Speciale';
        } else if (stats.def > 105 || stats.spd > 105) {
          role = 'Tank / Difensivo';
        }

        return {
          name: pkm.metaStats.name,
          types: pkm.apiData.types && pkm.apiData.types.length > 0 ? pkm.apiData.types : pkm.metaStats.types,
          isFromBox,
          role,
          item: bestItem,
          ability: bestAbility,
          nature: bestNature,
          evSpread: formattedSpread,
          moves,
          apiStats: stats
        };
      });

      // Step 4: Strategic Recommendations & Analysis
      // Find supports and attackers
      const supports = teamDetails.filter(t => t.role.includes('Supporto'));
      const attackers = teamDetails.filter(t => !t.role.includes('Supporto'));

      // Calculate weaknesses and strengths for each pokemon
      teamDetails.forEach(member => {
        const { weaknesses, resistances, immunities } = getPokemonWeaknesses(member.types);
        member.weaknesses = weaknesses;
        member.resistances = resistances;
        member.immunities = immunities;

        // Individual guide text
        const nameLower = member.name.toLowerCase();
        let customGuide = customPokemonGuides[nameLower];
        if (!customGuide) {
          // Try fuzzy matching
          const matchedKey = Object.keys(customPokemonGuides).find(k => nameLower.includes(k) || k.includes(nameLower));
          if (matchedKey) {
            customGuide = customPokemonGuides[matchedKey];
          }
        }

        if (!customGuide) {
          if (member.role.includes('Supporto')) {
            customGuide = `È un Pokémon di supporto. Il suo ruolo principale è controllare il ritmo del match e aiutare i compagni usando mosse di stato, alterando la velocità o indebolendo i nemici. Evita di esporlo ad attacchi pesanti senza protezione.`;
          } else if (member.role.includes('Speciale')) {
            customGuide = `È il tuo attaccante speciale principale. Sfrutta il suo alto Attacco Speciale per aggirare le difese fisiche dei nemici. Proteggilo dai forti colpi fisici.`;
          } else if (member.role.includes('Difensivo') || member.role.includes('Tank')) {
            customGuide = `Un solido difensore. Può assorbire molti colpi dai nemici e logorarli nel tempo, offrendo una safe-switch (cambio sicuro) per i tuoi attaccanti fragili.`;
          } else {
            customGuide = `È il tuo attaccante fisico principale. Usalo per infliggere danni ingenti con le sue mosse fisiche. Attento a non farti scottare o intimidire dall'abilità Prepotenza dei nemici, che dimezza il tuo attacco.`;
          }
        }
        member.guideText = customGuide;

        // Offensive coverage
        const offensiveStrength = [];
        member.moves.forEach(move => {
          const mType = move.type;
          const chart = typeChart[mType];
          if (chart && chart.strong) {
            chart.strong.forEach(t => {
              const itT = typeTranslations[t] || t;
              if (!offensiveStrength.includes(itT)) {
                offensiveStrength.push(itT);
              }
            });
          }
        });
        member.offensiveStrength = offensiveStrength;
      });

      // Calculate shared weaknesses
      const sharedWeaknessCounts = {};
      teamDetails.forEach(member => {
        member.weaknesses.forEach(w => {
          const typeIt = typeTranslations[w.type] || w.type;
          sharedWeaknessCounts[typeIt] = (sharedWeaknessCounts[typeIt] || 0) + 1;
        });
      });

      const commonWeaknesses = Object.entries(sharedWeaknessCounts)
        .filter(([type, count]) => count >= 2)
        .map(([type, count]) => ({ type, count }));

      // Matchups / Counter guide (Cosa mettere contro cosa)
      const matchups = [];
      
      // Look for Intimidate/Prepotenza
      const hasIntimidate = teamDetails.some(t => t.ability.toLowerCase().includes('prepotenza') || t.ability.toLowerCase().includes('intimidate'));
      if (hasIntimidate) {
        const pkmName = teamDetails.find(t => t.ability.toLowerCase().includes('prepotenza') || t.ability.toLowerCase().includes('intimidate')).name;
        matchups.push({
          threat: "Contro attaccanti fisici pesanti (es. Garchomp, Dragonite, Kingambit, Ogerpon)",
          advice: `Porta in campo **${pkmName}**! La sua abilità **Prepotenza** ridurrà immediatamente del 50% l'attacco dei nemici all'entrata. Puoi sostituirlo e rimandarlo in campo per ripetere l'effetto.`
        });
      }

      // Look for Tailwind
      const hasTailwind = teamDetails.some(t => t.moves.some(m => m.name.toLowerCase().includes('tailwind') || m.name.toLowerCase().includes('ventoincoda')));
      if (hasTailwind) {
        const pkmName = teamDetails.find(t => t.moves.some(m => m.name.toLowerCase().includes('tailwind') || m.name.toLowerCase().includes('ventoincoda'))).name;
        matchups.push({
          threat: "Contro team molto veloci (es. basati su Regieleki, Flutter Mane o altri team Tailwind)",
          advice: `Usa subito **Ventoincoda (Tailwind)** con **${pkmName}** al turno 1. Questo raddoppierà la velocità della tua squadra per 4 turni, impedendo all'avversario di attaccare prima.`
        });
      }

      // Look for Amoonguss / Spore
      const hasSpore = teamDetails.some(t => t.name.toLowerCase() === 'amoonguss' || t.moves.some(m => m.name.toLowerCase().includes('spore') || m.name.toLowerCase().includes('spora')));
      if (hasSpore) {
        const pkmName = teamDetails.find(t => t.name.toLowerCase() === 'amoonguss' || t.moves.some(m => m.name.toLowerCase().includes('spore') || m.name.toLowerCase().includes('spora'))).name;
        matchups.push({
          threat: "Contro minacce pericolose da fermare subito (es. Sweeper nemici potenziati)",
          advice: `Usa la mossa **Spora (Spore)** con **${pkmName}** per addormentare istantaneamente l'avversario pericoloso (precisione 100%). Funziona benissimo anche per fermare i nemici sotto Distortozona.`
        });
      }

      // Look for Trick Room
      const hasTrickRoom = teamDetails.some(t => t.moves.some(m => m.name.toLowerCase().includes('trick room') || m.name.toLowerCase().includes('distortozona')));
      if (hasTrickRoom) {
        const pkmName = teamDetails.find(t => t.moves.some(m => m.name.toLowerCase().includes('trick') || m.name.toLowerCase().includes('distorto'))).name;
        matchups.push({
          threat: "Contro team iper-offensivi basati su Tailwind o Pokémon velocissimi",
          advice: `Usa **Distortozona (Trick Room)** con **${pkmName}**. Questa mossa inverte l'ordine di attacco, facendo attaccare per primi i Pokémon più lenti del gioco. Ottimo se i tuoi alleati sono lenti.`
        });
      }

      // Add common weakness matchups
      commonWeaknesses.forEach(w => {
        const resister = teamDetails.find(member => {
          return member.resistances.some(r => typeTranslations[r.type] === w.type) || member.immunities.some(imm => typeTranslations[imm] === w.type);
        });

        if (resister) {
          matchups.push({
            threat: `Contro Pokémon nemici di tipo ${w.type} (debolezza comune a ${w.count} membri)`,
            advice: `Fai switch difensivo su **${resister.name}**! Essendo resistente o immune a ${w.type}, assorbirà il colpo subendo danni minimi o nulli.`
          });
        } else {
          matchups.push({
            threat: `Contro Pokémon nemici di tipo ${w.type} (debolezza comune a ${w.count} membri)`,
            advice: `Usa la meccanica **Teracristal** sul tuo Pokémon sotto attacco per cambiare tipo in un tipo difensivo (es. Fuoco, Acqua o Erba) e neutralizzare il colpo super efficace.`
          });
        }
      });

      if (matchups.length < 3) {
        matchups.push({
          threat: "Contro Pokémon che usano mosse protettive (Protezione / Individua)",
          advice: "Usa mosse di posizionamento o aumenta le tue statistiche (es. Danzaspada / Congiura) in quel turno, oppure attacca l'altro Pokémon avversario non protetto."
        });
        matchups.push({
          threat: "Quando subisci una mossa super efficace inevitabile",
          advice: "Usa la mossa Protezione per stallare un turno e far colpire il nemico a vuoto, mentre il tuo partner mette KO la minaccia."
        });
      }

      const beginnerGuide = {
        pokemonGuides: teamDetails.map(t => ({
          name: t.name,
          role: t.role,
          guideText: t.guideText,
          weaknesses: t.weaknesses.map(w => `${typeTranslations[w.type] || w.type} (x${w.value})`),
          offensiveStrength: t.offensiveStrength
        })),
        commonWeaknesses,
        matchups
      };

      // Suggest leads
      const suggestedLeads = [];
      if (supports.length > 0 && attackers.length > 0) {
        suggestedLeads.push({
          duo: [supports[0], attackers[0]],
          desc: `Lead Standard bilanciato. Usa ${supports[0].name} per controllare la velocità con Ventoincoda/supporto o Fake Out, proteggendo e posizionando ${attackers[0].name} per sferrare attacchi pesanti.`
        });
        if (supports.length > 1) {
          suggestedLeads.push({
            duo: [supports[1], attackers[0]],
            desc: `Opzione di supporto alternativa. Sfrutta le abilità specifiche di ${supports[1].name} per contrastare le minacce specifiche dell'avversario.`
          });
        } else if (attackers.length > 1) {
          suggestedLeads.push({
            duo: [attackers[0], attackers[1]],
            desc: `Lead offensivo e aggressivo. Ideale quando l'avversario ha un team passivo: esercita una pressione enorme fin dal primo turno con due attaccanti pesanti.`
          });
        }
      } else {
        suggestedLeads.push({
          duo: [teamDetails[0], teamDetails[1]],
          desc: `Apertura consigliata. Massimizza l'efficacia offensiva immediata cercando di coprire i rispettivi punti deboli dei tipi.`
        });
      }

      const tacticalTips = [
        "Cura il posizionamento: Nel formato VGC (Lotte in Doppio), supportare l'attaccante principale è cruciale. Non esitare a sacrificare o richiamare un Pokémon di supporto se questo garantisce una posizione di vantaggio al tuo Sweeper.",
        "Gestisci la velocità (Speed Control): Identifica subito se la squadra ha mosse come Ventoincoda (Tailwind) o Distortozona (Trick Room). Ottenere il controllo dell'ordine di attacco decide il 70% dei match.",
        "Usa la Meccanica Teracristal in modo difensivo: Spesso cambiare il tipo del tuo attaccante principale nel tipo difensivo perfetto (es. Erba per evitare Spora, o Fuoco per evitare scottature) è meglio che usarlo solo per aumentare i danni."
      ];

      setRecommendations({
        team: teamDetails,
        leads: suggestedLeads,
        tips: tacticalTips,
        beginnerGuide
      });

    } catch (e) {
      console.error(e);
      setError(e.message || 'Si è verificato un errore durante la generazione della squadra.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearBox = () => {
    setBox([]);
    setRecommendations(null);
    setError('');
  };

  return (
    <div className="box-builder-container">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', background: 'linear-gradient(to right, #fff, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Crea Squadra VGC da Box
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Inserisci i Pokémon che possiedi nel tuo Box. Il nostro algoritmo analizzerà le sinergie di metagame, la Regulation M-B e i tipi per consigliarti la squadra da 6 migliore, con le build più usate e suggerimenti per giocarla.
        </p>
      </div>

      {/* Saved Teams List */}
      {savedTeams.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Squadre Salvate ({savedTeams.length})</span>
          </h3>
          <div className="box-member-grid">
            {savedTeams.map((saved, sIdx) => (
              <div
                key={sIdx}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.015)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <button
                    onClick={() => loadSavedTeam(saved)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontWeight: '800',
                      fontSize: '0.92rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    {saved.name}
                  </button>
                  <button
                    onClick={() => deleteSavedTeam(saved.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    title="Elimina squadra salvata"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {saved.team.map((member, mIdx) => (
                    <div key={mIdx} style={{ width: '28px', height: '28px' }} title={member.name}>
                      <PokemonImage src={getPkmSprite(member.name)} alt={member.name} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card" style={{ marginBottom: '32px' }}>
        {/* Search & Add Section */}
        <div className="box-search-grid">
          {/* Box Search Input */}
          <div style={{ position: 'relative' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '12px', color: '#fff' }}>Aggiungi Pokémon al Box</h3>
            <div className="search-container" style={{ margin: 0 }}>
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Cerca Pokémon..."
                className="search-input"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#14141c',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                zIndex: 10,
                marginTop: '4px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                overflow: 'hidden'
              }}>
                {suggestions.map(p => (
                  <button
                    key={p.name}
                    onClick={() => addToBox(p.name)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.9rem',
                      borderBottom: '1px solid rgba(255,255,255,0.02)'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center' }}>
                      <PokemonImage src={getPkmSprite(p.name)} alt={p.name} />
                    </div>
                    <span>{p.name}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>Rank #{p.rank}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add from Meta */}
          <div>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '12px', color: '#fff' }}>Aggiunta Rapida dal Meta</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {quickMeta.map(p => {
                const inBox = box.includes(p.name);
                return (
                  <button
                    key={p.name}
                    onClick={() => !inBox && addToBox(p.name)}
                    disabled={inBox}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: inBox ? 'rgba(255,255,255,0.02)' : 'rgba(129, 140, 248, 0.08)',
                      border: '1px solid',
                      borderColor: inBox ? 'rgba(255,255,255,0.05)' : 'rgba(129, 140, 248, 0.2)',
                      borderRadius: '8px',
                      color: inBox ? 'var(--text-muted)' : '#fff',
                      fontSize: '0.82rem',
                      cursor: inBox ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { if(!inBox) { e.target.style.background = 'rgba(129, 140, 248, 0.15)'; e.target.style.borderColor = 'rgba(129, 140, 248, 0.4)'; } }}
                    onMouseLeave={(e) => { if(!inBox) { e.target.style.background = 'rgba(129, 140, 248, 0.08)'; e.target.style.borderColor = 'rgba(129, 140, 248, 0.2)'; } }}
                  >
                    <Plus size={14} style={{ display: inBox ? 'none' : 'block' }} />
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Box List */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', color: '#fff' }}>I tuoi Pokémon nel Box ({box.length})</h3>
            {box.length > 0 && (
              <button
                onClick={clearBox}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--danger)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={14} /> Svuota Box
              </button>
            )}
          </div>

          {box.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', fontSize: '0.9rem' }}>
              Nessun Pokémon nel box. Inserisci i tuoi Pokémon digitandone il nome o usa l'Aggiunta Rapida.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              <style>{`
                .box-sprite-container:hover .delete-badge {
                  opacity: 1 !important;
                }
              `}</style>
              {box.map(name => (
                <div
                  key={name}
                  className="box-sprite-container"
                  onClick={() => removeFromBox(name)}
                  title={`Clicca per rimuovere ${name}`}
                  style={{
                    position: 'relative',
                    width: '64px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PokemonImage src={getPkmSprite(name)} alt={name} />
                  </div>
                  {/* Subtle delete indicator on hover */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      background: 'var(--danger)',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      pointerEvents: 'none'
                    }}
                    className="delete-badge"
                  >
                    ✕
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        {box.length > 0 && !isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <button
              onClick={generateTeam}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontWeight: '800',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(129, 140, 248, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              <Sparkles size={16} />
              Genera Team Competitivo
            </button>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(129, 140, 248, 0.1)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '16px'
            }} />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            <span style={{ fontSize: '0.95rem', color: '#fff', fontWeight: '600' }}>{loadingStep}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>Questo processo può richiedere alcuni secondi per caricare i dati.</span>
          </div>
        )}
      </div>

      {/* Recommendations Results */}
      {recommendations && (
        <div className="animate-fade-in">
          {/* Team Grid */}
          <div className="glass-card" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Zap size={20} style={{ color: 'var(--secondary)' }} />
                Squadra Consigliata (6 Pokémon)
              </h3>
              
              {/* Save Team button & interface */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isSaving ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Nome del team..."
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      style={{
                        padding: '6px 12px',
                        background: '#1c1c28',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '0.85rem',
                        outline: 'none',
                        fontFamily: 'var(--font-sans)',
                        flex: 1,
                        minWidth: '140px'
                      }}
                    />
                    <button
                      onClick={confirmSaveTeam}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--success)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#000',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Salva
                    </button>
                    <button
                      onClick={() => setIsSaving(false)}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Annulla
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startSaveTeam}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '8px',
                      color: 'var(--success)',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.18)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; }}
                  >
                    Salva Squadra 💾
                  </button>
                )}
              </div>
            </div>
            
            <div className="box-team-cards-grid">
              {recommendations.team.map((member, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    background: 'rgba(20, 20, 28, 0.4)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Header card info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                    <Link 
                      href={`/pokemon/${encodeURIComponent(member.name)}`} 
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '16px', color: 'inherit' }}
                      onMouseEnter={(e) => {
                        const title = e.currentTarget.querySelector('.card-pkm-title');
                        const img = e.currentTarget.querySelector('.card-pkm-img-box');
                        if (title) title.style.color = 'var(--primary)';
                        if (img) img.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        const title = e.currentTarget.querySelector('.card-pkm-title');
                        const img = e.currentTarget.querySelector('.card-pkm-img-box');
                        if (title) title.style.color = '#fff';
                        if (img) img.style.transform = 'scale(1)';
                      }}
                    >
                      <div className="card-pkm-img-box" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}>
                        <PokemonImage src={getPkmSprite(member.name)} alt={member.name} />
                      </div>
                      <div>
                        <h4 className="card-pkm-title" style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {member.name} <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>↗</span>
                        </h4>
                        <div className="types-list" style={{ marginTop: '4px' }}>
                          {member.types.map(t => (
                            <span key={t} className={`type-badge type-${t}`} style={{ fontSize: '0.62rem', padding: '2px 8px' }}>
                              {typeTranslations[t] || t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>

                    <span style={{
                      marginLeft: 'auto',
                      fontSize: '0.68rem',
                      fontWeight: '800',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: member.isFromBox ? 'rgba(16, 185, 129, 0.15)' : 'rgba(129, 140, 248, 0.15)',
                      color: member.isFromBox ? 'var(--success)' : 'var(--primary)',
                      border: '1px solid',
                      borderColor: member.isFromBox ? 'rgba(16, 185, 129, 0.3)' : 'rgba(129, 140, 248, 0.3)'
                    }}>
                      {member.isFromBox ? 'BOX' : 'META'}
                    </span>
                  </div>

                  {/* Body card info */}
                  <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>Ruolo:</span>
                      <strong style={{ color: '#fff' }}>{member.role}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>Strumento:</span>
                      <strong style={{ color: '#fff', textAlign: 'right' }}>{member.item}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>Abilità:</span>
                      <strong style={{ color: '#fff', textAlign: 'right' }}>{member.ability}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>Natura:</span>
                      <strong style={{ color: '#fff' }}>{member.nature}</strong>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>Distribuzione EV:</span>
                      <strong style={{ color: 'var(--primary)', fontFamily: 'monospace', letterSpacing: '0.02em' }}>{member.evSpread}</strong>
                    </div>

                    {/* Moves */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Mosse consigliate:</span>
                      <div className="box-moves-grid">
                        {member.moves.map((move, mIdx) => (
                          <div
                            key={mIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '5px 8px',
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              color: '#e4e4e7'
                            }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{move.name}</span>
                            <span className={`type-badge type-${move.type}`} style={{ width: '8px', height: '8px', borderRadius: '50%', padding: 0, textIndent: '-9999px', flexShrink: 0, marginLeft: '4px' }} title={typeTranslations[move.type]} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy section */}
          <div className="box-strategy-grid">
            {/* Leads card */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={18} style={{ color: 'var(--primary)' }} />
                Duo di Apertura Consigliati (Leads)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recommendations.leads.map((lead, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.015)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      {lead.duo.map((member, mIdx) => (
                        <Link 
                          href={`/pokemon/${encodeURIComponent(member.name)}`}
                          key={mIdx} 
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'inherit' }}
                          onMouseEnter={(e) => {
                            const title = e.currentTarget.querySelector('.lead-pkm-title');
                            const img = e.currentTarget.querySelector('.lead-pkm-img-box');
                            if (title) title.style.color = 'var(--primary)';
                            if (img) img.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            const title = e.currentTarget.querySelector('.lead-pkm-title');
                            const img = e.currentTarget.querySelector('.lead-pkm-img-box');
                            if (title) title.style.color = '#fff';
                            if (img) img.style.transform = 'scale(1)';
                          }}
                        >
                          <div className="lead-pkm-img-box" style={{ width: '28px', height: '28px', transition: 'transform 0.2s' }}>
                            <PokemonImage src={getPkmSprite(member.name)} alt={member.name} />
                          </div>
                          <span className="lead-pkm-title" style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            {member.name} <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>↗</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      {lead.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tactical tips card */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield style={{ color: 'var(--success)' }} size={18} />
                Consigli su come usare la Squadra
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {recommendations.tips.map((tip, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '10px', fontSize: '0.88rem', lineHeight: '1.5', color: '#d1d5db' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: '800', flexShrink: 0 }}>{idx + 1}.</span>
                    <div>{tip}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Detailed Beginner Guide section */}
          {recommendations.beginnerGuide && (
            <div className="glass-card animate-fade-in" style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={22} style={{ color: 'var(--secondary)' }} />
                Guida per Principianti & Matchup ("Cosa mettere contro cosa")
              </h3>

              {/* Shared Weaknesses Alert */}
              {recommendations.beginnerGuide.commonWeaknesses.length > 0 && (
                <div style={{
                  padding: '16px',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '12px',
                  marginBottom: '28px',
                  fontSize: '0.88rem',
                  lineHeight: '1.5',
                  color: '#f59e0b',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
                    <AlertTriangle size={18} />
                    <span>Debolezze Comuni Rilevate nella Squadra:</span>
                  </div>
                  <div>
                    La tua squadra ha più Pokémon deboli ai seguenti tipi: {recommendations.beginnerGuide.commonWeaknesses.map((w, idx) => (
                      <span key={idx} style={{ fontWeight: 'bold' }}>
                        {w.type} ({w.count} Pokémon){idx < recommendations.beginnerGuide.commonWeaknesses.length - 1 ? ', ' : ''}
                      </span>
                    ))}. Controlla la sezione matchups qui sotto per sapere come gestirle!
                  </div>
                </div>
              )}

              {/* Cosa Mettere Contro Cosa (Matchups) */}
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sword size={18} style={{ color: 'var(--danger)' }} />
                  Cosa Mettere Contro Cosa (Strategia di Gioco)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  {recommendations.beginnerGuide.matchups.map((matchup, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px',
                        background: 'rgba(255,255,255,0.015)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>
                        ⚠️ {matchup.threat}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        {matchup.advice}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Pokemon guides */}
              <div>
                <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={18} style={{ color: 'var(--success)' }} />
                  Come Usare al Meglio Ciascun Pokémon del Team
                </h4>
                <div className="box-guides-grid">
                  {recommendations.beginnerGuide.pokemonGuides.map((guide, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px',
                        background: 'rgba(20, 20, 28, 0.3)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <Link 
                        href={`/pokemon/${encodeURIComponent(guide.name)}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}
                        onMouseEnter={(e) => {
                          const title = e.currentTarget.querySelector('.guide-pkm-title');
                          const img = e.currentTarget.querySelector('.guide-pkm-img-box');
                          if (title) title.style.color = 'var(--primary)';
                          if (img) img.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          const title = e.currentTarget.querySelector('.guide-pkm-title');
                          const img = e.currentTarget.querySelector('.guide-pkm-img-box');
                          if (title) title.style.color = '#fff';
                          if (img) img.style.transform = 'scale(1)';
                        }}
                      >
                        <div className="guide-pkm-img-box" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}>
                          <PokemonImage src={getPkmSprite(guide.name)} alt={guide.name} />
                        </div>
                        <div>
                          <strong className="guide-pkm-title" style={{ fontSize: '1rem', color: '#fff', display: 'block', transition: 'color 0.2s' }}>
                            {guide.name} <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>↗</span>
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>{guide.role}</span>
                        </div>
                      </Link>

                      <p style={{ fontSize: '0.82rem', color: '#d1d5db', lineHeight: '1.5' }}>
                        {guide.guideText}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px', marginTop: 'auto' }}>
                        <div>
                          <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Debole a: </span>
                          <span style={{ color: 'var(--text-muted)' }}>{guide.weaknesses.join(', ') || 'Nessuno'}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Forte contro i tipi: </span>
                          <span style={{ color: 'var(--text-muted)' }}>{guide.offensiveStrength.join(', ') || 'N/D'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
