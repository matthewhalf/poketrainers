"use client";
import React, { useState, useRef, useEffect } from 'react';
import axiosHttp from 'axios';
import { 
  translateAbility, 
  translateItem, 
  translateMove, 
  translateNature, 
  translateType, 
  preloadTranslations 
} from '@/data/translator';
import { getDefensiveModifiers, allTypes } from '@/data/typeMatchups';
import { FaTrash, FaCheck, FaBoxOpen } from 'react-icons/fa';
import { GiShield, GiSwordsEmblem } from 'react-icons/gi';
import { IoSearchOutline } from 'react-icons/io5';

// Type mapping helper for styling badges (light versions)
const getTypeBadgeClass = (type) => {
  switch (type.toLowerCase()) {
    case 'normal': return 'bg-neutral-100 text-neutral-600 border-neutral-300';
    case 'fire': return 'bg-orange-100 text-orange-655 border-orange-300';
    case 'water': return 'bg-blue-100 text-blue-650 border-blue-300';
    case 'grass': return 'bg-emerald-100 text-emerald-650 border-emerald-300';
    case 'electric': return 'bg-yellow-105 text-yellow-650 border-yellow-300';
    case 'ice': return 'bg-cyan-100 text-cyan-650 border-cyan-300';
    case 'fighting': return 'bg-red-100 text-red-650 border-red-300';
    case 'poison': return 'bg-fuchsia-100 text-fuchsia-605 border-fuchsia-300';
    case 'ground': return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'flying': return 'bg-violet-100 text-violet-605 border-violet-350';
    case 'psychic': return 'bg-pink-100 text-pink-605 border-pink-300';
    case 'bug': return 'bg-lime-105 text-lime-650 border-lime-300';
    case 'rock': return 'bg-stone-100 text-stone-605 border-stone-300';
    case 'ghost': return 'bg-indigo-100 text-indigo-605 border-indigo-300';
    case 'dragon': return 'bg-purple-100 text-purple-650 border-purple-300';
    case 'dark': return 'bg-neutral-200 text-neutral-700 border-neutral-400';
    case 'steel': return 'bg-slate-100 text-slate-650 border-slate-350';
    case 'fairy': return 'bg-rose-100 text-rose-650 border-rose-300';
    default: return 'bg-slate-100 text-slate-600 border-slate-300';
  }
};

const getTypeColor = (type) => {
  switch (type.toLowerCase()) {
    case 'normal': return 'bg-neutral-400 text-white';
    case 'fire': return 'bg-orange-500 text-white';
    case 'water': return 'bg-blue-500 text-white';
    case 'grass': return 'bg-emerald-500 text-white';
    case 'electric': return 'bg-yellow-400 text-slate-800 font-bold';
    case 'ice': return 'bg-cyan-400 text-slate-850 font-bold';
    case 'fighting': return 'bg-red-500 text-white';
    case 'poison': return 'bg-fuchsia-500 text-white';
    case 'ground': return 'bg-amber-500 text-white';
    case 'flying': return 'bg-violet-400 text-white';
    case 'psychic': return 'bg-pink-500 text-white';
    case 'bug': return 'bg-lime-500 text-slate-850 font-bold';
    case 'rock': return 'bg-stone-400 text-white';
    case 'ghost': return 'bg-indigo-500 text-white';
    case 'dragon': return 'bg-purple-500 text-white';
    case 'dark': return 'bg-neutral-700 text-white';
    case 'steel': return 'bg-slate-400 text-slate-800 font-bold';
    case 'fairy': return 'bg-rose-400 text-slate-800 font-bold';
    default: return 'bg-slate-400 text-white';
  }
};

const getPokeApiSlug = (name) => {
  if (!name) return '';
  const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  if (slug === 'ogerpon-wellspring') return 'ogerpon-wellspring-mask';
  if (slug === 'ogerpon-hearthflame') return 'ogerpon-hearthflame-mask';
  if (slug === 'ogerpon-cornerstone') return 'ogerpon-cornerstone-mask';
  return slug;
};

const convertEvsToSp = (evs) => {
  const statsKeys = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];
  const statsNames = { HP: 'PS', Atk: 'Attacco', Def: 'Difesa', SpA: 'Att. Sp.', SpD: 'Dif. Sp.', Spe: 'Velocità' };
  
  const totalEv = statsKeys.reduce((sum, key) => sum + evs[key], 0);
  if (totalEv === 0) {
    return '11 PS / 11 Attacco / 11 Difesa / 11 Att. Sp. / 11 Dif. Sp. / 11 Velocità (66 SP Bilanciati)';
  }

  let spAlloc = {};
  let currentTotal = 0;
  
  // Calculate points using the Pokémon Champions formula: Points = (EV + 4) / 8 for EV > 0
  statsKeys.forEach(key => {
    const ev = evs[key] || 0;
    let val = ev > 0 ? Math.round((ev + 4) / 8) : 0;
    if (val > 32) val = 32; // Cap is 32 per stat in Pokémon Champions
    spAlloc[key] = val;
    currentTotal += val;
  });

  // Adjust to exactly 66 SP if there are leftover points (e.g. 65 points from 252/252/4)
  let attempts = 0;
  while (currentTotal !== 66 && attempts < 20) {
    attempts++;
    if (currentTotal < 66) {
      // Find a stat that has investment (>0 EV) and is not at max cap (<32 SP)
      let candidate = null;
      let maxEv = -1;
      statsKeys.forEach(key => {
        if (evs[key] > 0 && spAlloc[key] < 32) {
          if (evs[key] > maxEv) {
            maxEv = evs[key];
            candidate = key;
          }
        }
      });
      if (candidate) {
        spAlloc[candidate]++;
        currentTotal++;
      } else {
        // If all invested stats are already at 32 (or no invested stats can be increased), add to any stat < 32
        const fallbackKey = statsKeys.find(key => spAlloc[key] < 32);
        if (fallbackKey) {
          spAlloc[fallbackKey]++;
          currentTotal++;
        } else {
          break;
        }
      }
    } else {
      // currentTotal > 66 (should be extremely rare, adjust down from lowest invested stat)
      let candidate = null;
      let minEv = Infinity;
      statsKeys.forEach(key => {
        if (spAlloc[key] > 0) {
          if (evs[key] < minEv) {
            minEv = evs[key];
            candidate = key;
          }
        }
      });
      if (candidate) {
        spAlloc[candidate]--;
        currentTotal--;
      } else {
        break;
      }
    }
  }

  const formatted = [];
  statsKeys.forEach(key => {
    if (spAlloc[key] > 0) {
      formatted.push(`${spAlloc[key]} ${statsNames[key]}`);
    }
  });

  return formatted.join(' / ') + ' (Totale: 66 SP)';
};

const getEvDescription = (spreadStr) => {
  if (!spreadStr) return '11 PS / 11 Attacco / 11 Difesa / 11 Att. Sp. / 11 Dif. Sp. / 11 Velocità (66 SP Bilanciati)';
  
  let rawValues = spreadStr;
  if (spreadStr.includes(':')) {
    rawValues = spreadStr.split(':')[1];
  }
  const values = rawValues.split('/').map(Number);
  if (values.length !== 6) {
    return '11 PS / 11 Attacco / 11 Difesa / 11 Att. Sp. / 11 Dif. Sp. / 11 Velocità (66 SP Bilanciati)';
  }

  const evs = {
    HP: values[0],
    Atk: values[1],
    Def: values[2],
    SpA: values[3],
    SpD: values[4],
    Spe: values[5]
  };

  return convertEvsToSp(evs);
};

const formatEnglishName = (name) => {
  return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const paradoxTranslations = {
  'great-tusk': 'Grandizanne',
  'scream-tail': 'Codaurlante',
  'brute-bonnet': 'Fungofurioso',
  'flutter-mane': 'Crinealato',
  'slither-wing': 'Alasacco',
  'sandy-shocks': 'Peldisabbia',
  'iron-treads': 'Solcoferreo',
  'iron-bundle': 'Saccoferreo',
  'iron-hands': 'Maniferree',
  'iron-jugulis': 'Colloferreo',
  'iron-moth': 'Falenaferrea',
  'iron-thorns': 'Spinaferrea',
  'roaring-moon': 'Alaruggente',
  'iron-valiant': 'Eroeferreo',
  'walking-wake': 'Acquashock',
  'iron-leaves': 'Fogliaferrea',
  'gouging-fire': 'Vampefuriose',
  'raging-bolt': 'Furiapulsante',
  'iron-boulder': 'Massoferreo',
  'iron-crown': 'Coronaferrea',
  'ogerpon-wellspring': 'Ogerpon (Maschera Pozzo)',
  'ogerpon-hearthflame': 'Ogerpon (Maschera Focolare)',
  'ogerpon-cornerstone': 'Ogerpon (Maschera Fondamenta)',
  'calyrex-ice': 'Calyrex (Cavaliere Glaciale)',
  'calyrex-shadow': 'Calyrex (Cavaliere Spettrale)',
  'ursaluna-bloodmoon': 'Ursaluna (Luna Cremisi)'
};

const formatNames = {
  gen9vgc2026regi: 'VGC 2026 - Reg M-B (Doppio)',
  gen9ou: 'Overused (OU - Singolo)'
};

const generateTeamStrategy = (pokemonList) => {
  if (!pokemonList || pokemonList.length === 0) return {
    leads: "In attesa della generazione del team...",
    combo: "In attesa della generazione del team...",
    tip: "In attesa della generazione del team..."
  };

  const names = pokemonList.map(p => p.name.toLowerCase());
  
  // Specific competitive templates
  if (names.includes('calyrex-ice')) {
    return {
      leads: "Calyrex-Ice + Incineroar / Amoonguss (Apertura classica per impostare la Distortozona).",
      combo: "Incineroar usa Bruciapelo + Monito per ridurre i danni avversari, permettendo a Calyrex-Ghiaccio di attivare Distortozona (Trick Room) e colpire per primo.",
      tip: "Una volta attiva la Distortozona, Lancia Glaciale infligge danni colossali a entrambi gli avversari contemporaneamente."
    };
  }

  if (names.includes('koraidon')) {
    return {
      leads: "Koraidon + Flutter Mane / Whimsicott (Ventoincoda o pressione offensiva immediata sotto Sole).",
      combo: "Koraidon attiva la Siccità (Sole) che potenzia immediatamente la Paleosintesi dei Pokémon paradosso e incrementa del 50% i danni delle mosse Fuoco.",
      tip: "Sfrutta la velocità e la forza fisica di Koraidon come ariete principale, mantenendo il sole attivo per potenziarne le coperture."
    };
  }

  if (names.includes('miraidon')) {
    return {
      leads: "Miraidon + Iron Hands / Farigiraf (Pressione fisica ed elettrica immediata sotto Campo Elettrico).",
      combo: "Miraidon attiva il Campo Elettrico, che aumenta del 30% la forza delle mosse Elettro e attiva istantaneamente la Carica Quark dei Pokémon paradosso futuri.",
      tip: "Farigiraf protegge il team da mosse di priorità (come Bruciapelo), lasciando Miraidon libero di lanciare Saetta Dinamica."
    };
  }

  const hasIncineroar = names.includes('incineroar');
  const hasAmoonguss = names.includes('amoonguss');
  if (hasIncineroar && hasAmoonguss) {
    return {
      leads: "Incineroar + Amoonguss (Controllo perfetto del campo tramite Bruciapelo ed intimidazione).",
      combo: "Incineroar riduce l'Attacco con Prepotenza e usa Monito per scendere in sicurezza, mentre Amoonguss controlla il sonno nemico con Spora.",
      tip: "Usa questo core difensivo per logorare il team avversario e preparare la strada per i tuoi attaccanti principali."
    };
  }

  // Type core analysis
  let hasFire = false;
  let hasWater = false;
  let hasGrass = false;
  pokemonList.forEach(p => {
    const types = p.types || [];
    if (types.includes('fire')) hasFire = true;
    if (types.includes('water')) hasWater = true;
    if (types.includes('grass')) hasGrass = true;
  });

  if (hasFire && hasWater && hasGrass) {
    return {
      leads: "Apertura con pivot (es: membro di tipo Fuoco o Erba) per forzare switch favorevoli.",
      combo: "Sfrutta la sinergia difensiva perfetta del core FWG (Fuoco-Acqua-Erba) effettuando switch continui per assorbire qualsiasi mossa avversaria.",
      tip: "Fai attenzione a non perdere prematuramente uno dei tre membri elementali, poiché sono vitali per contenere le resistenze del team."
    };
  }

  // Dynamic Fallback based on stats
  const sortedBySpe = [...pokemonList].sort((a, b) => {
    const aSpe = a.stats?.spe || 0;
    const bSpe = b.stats?.spe || 0;
    return bSpe - aSpe;
  });
  
  const sortedByDef = [...pokemonList].sort((a, b) => {
    const aBulk = (a.stats?.hp || 0) + (a.stats?.def || 0) + (a.stats?.spd || 0);
    const bBulk = (b.stats?.hp || 0) + (b.stats?.def || 0) + (b.stats?.spd || 0);
    return bBulk - aBulk;
  });

  const fastPk = sortedBySpe[0]?.displayName || "l'attaccante veloce";
  const bulkyPk = sortedByDef[0]?.displayName || "il difensore del team";

  return {
    leads: `${fastPk} + ${bulkyPk} (Apertura bilanciata con pressione immediata e solida presenza difensiva).`,
    combo: `${bulkyPk} assorbe i colpi e applica alterazioni di stato o pivot, aprendo varchi sicuri affinché ${fastPk} possa infliggere KO.`,
    tip: "Esamina la tabella delle debolezze in basso: effettua switch mirati per coprire le vulnerabilità elementali comuni di questo team."
  };
};

const BoxBuilder = ({ format, setFormat }) => {
  const [box, setBox] = useState([]);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [generatedTeam, setGeneratedTeam] = useState(null);
  const [activeInputTab, setActiveInputTab] = useState('search'); // 'search' | 'import'
  const [importText, setImportText] = useState('');
  const [importFeedback, setImportFeedback] = useState(null);
  const [loadingPokemon, setLoadingPokemon] = useState(false);
  const [allPokemonList, setAllPokemonList] = useState([]);

  const autocompleteRef = useRef(null);

  // Close suggestions on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch full list of all pokemon names from PokéAPI to allow searching anything in existence
  useEffect(() => {
    const fetchAllNames = async () => {
      try {
        const res = await axiosHttp.get('https://pokeapi.co/api/v2/pokemon?limit=1500');
        if (res.data && res.data.results) {
          const mapped = res.data.results.map((item, idx) => {
            const id = idx + 1;
            const displayName = paradoxTranslations[item.name] || formatEnglishName(item.name);
            return {
              id,
              name: item.name,
              displayName,
              url: item.url
            };
          });
          setAllPokemonList(mapped);
        }
      } catch (err) {
        console.error("Failed to load all pokemon names from PokéAPI:", err.message);
      }
    };
    fetchAllNames();
  }, []);

  const handleSearchChange = (val) => {
    setSearch(val);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }

    const query = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    const apiMatches = allPokemonList.filter(item => 
      item.displayName.toLowerCase().replace(/[^a-z0-9]/g, '').includes(query) ||
      item.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(query)
    ).slice(0, 10);

    setSuggestions(apiMatches);
  };

  const addToBox = async (p) => {
    if (box.some(item => item.name === p.name)) {
      setSearch('');
      setSuggestions([]);
      return; // prevent duplicates
    }

    setLoadingPokemon(true);
    try {
      console.log(`Fetching details for ${p.name} from PokéAPI...`);
      const res = await axiosHttp.get(`https://pokeapi.co/api/v2/pokemon/${getPokeApiSlug(p.name)}`);
      const data = res.data;

      // Get Italian name translation from species details
      let displayName = p.displayName;
      try {
        const speciesRes = await axiosHttp.get(`https://pokeapi.co/api/v2/pokemon-species/${data.species.name}`);
        const itName = speciesRes.data.names.find(n => n.language.name === 'it')?.name;
        if (itName) {
          displayName = itName;
        }
      } catch (e) {}

      // Recommend moves, ability, items, nature based on stats
      const highestStat = [
        { name: 'hp', val: data.stats[0].base_stat },
        { name: 'atk', val: data.stats[1].base_stat },
        { name: 'def', val: data.stats[2].base_stat },
        { name: 'spa', val: data.stats[3].base_stat },
        { name: 'spd', val: data.stats[4].base_stat },
        { name: 'spe', val: data.stats[5].base_stat }
      ].sort((a, b) => b.val - a.val)[0].name;

      let recNature = 'jolly';
      let recItem = 'sitrusberry';
      let recSpread = 'Jolly:252/0/4/0/0/252';

      if (highestStat === 'atk') {
        recNature = 'adamant';
        recItem = 'choiceband';
        recSpread = 'Adamant:252/252/0/0/0/4';
      } else if (highestStat === 'spa') {
        recNature = 'modest';
        recItem = 'choicespecs';
        recSpread = 'Modest:4/0/0/252/0/252';
      } else if (highestStat === 'def' || highestStat === 'spd' || highestStat === 'hp') {
        recNature = 'relaxed';
        recItem = 'leftovers';
        recSpread = 'Relaxed:252/0/252/0/4/0';
      }

      const rawMoves = data.moves.slice(0, 4).map(m => m.move.name);

      // Preload translations for this pokemon's custom moves, item, ability, and nature
      await preloadTranslations({
        abilities: [data.abilities[0]?.ability.name],
        items: [recItem],
        moves: rawMoves,
        natures: [recNature]
      });

      const newPk = {
        name: data.name,
        displayName,
        types: data.types.map(t => t.type.name),
        stats: {
          hp: data.stats[0].base_stat,
          atk: data.stats[1].base_stat,
          def: data.stats[2].base_stat,
          spa: data.stats[3].base_stat,
          spd: data.stats[4].base_stat,
          spe: data.stats[5].base_stat
        },
        sprite: data.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
        // Recommended setup
        ability: translateAbility(data.abilities[0]?.ability.name),
        item: translateItem(recItem),
        spread: recSpread,
        moves: rawMoves.map(translateMove)
      };

      setBox([...box, newPk]);
    } catch (err) {
      console.error(`Failed to fetch details for ${p.name}:`, err.message);
    } finally {
      setLoadingPokemon(false);
    }

    setSearch('');
    setSuggestions([]);
    setGeneratedTeam(null);
    setImportFeedback(null);
  };

  const removeFromBox = (name) => {
    setBox(box.filter(item => item.name !== name));
    setGeneratedTeam(null);
  };

  // Mass copy paste import
  const handleMassImport = async (text) => {
    if (!text || !text.trim()) return;

    setLoadingPokemon(true);
    setImportFeedback({ type: 'info', message: 'Importazione in corso, recupero dettagli da PokéAPI...' });

    const lines = text.split(/[\n,;]+/);
    const addedList = [];
    const alreadyInBox = [];
    const notFoundList = [];

    // Filter lines to extract names
    const targetNames = [];
    lines.forEach(line => {
      let cleanLine = line.trim();
      if (!cleanLine) return;

      if (cleanLine.includes('Ability:') || 
          cleanLine.includes('Level:') || 
          cleanLine.includes('EVs:') || 
          cleanLine.includes('IVs:') || 
          cleanLine.startsWith('-') || 
          cleanLine.includes('Nature') || 
          cleanLine.includes('Shiny:')) {
        return;
      }

      if (cleanLine.includes('@')) {
        cleanLine = cleanLine.split('@')[0].trim();
      }

      cleanLine = cleanLine.replace(/\([MF]\)/g, '').trim();
      if (cleanLine && !targetNames.includes(cleanLine)) {
        targetNames.push(cleanLine);
      }
    });

    // Loop through extracted names
    const rawFetchedData = [];
    for (const rawName of targetNames) {
      const normalizedQuery = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      
      const apiMatch = allPokemonList.find(item => 
        item.name.toLowerCase() === normalizedQuery ||
        item.name.toLowerCase().replace(/-/g, '') === normalizedQuery.replace(/-/g, '')
      );

      if (apiMatch) {
        if (box.some(item => item.name === apiMatch.name) || addedList.some(item => item.name === apiMatch.name)) {
          alreadyInBox.push(apiMatch.displayName);
        } else {
          try {
            const res = await axiosHttp.get(`https://pokeapi.co/api/v2/pokemon/${getPokeApiSlug(apiMatch.name)}`);
            const data = res.data;

            let displayName = apiMatch.displayName;
            try {
              const speciesRes = await axiosHttp.get(`https://pokeapi.co/api/v2/pokemon-species/${data.species.name}`);
              const itName = speciesRes.data.names.find(n => n.language.name === 'it')?.name;
              if (itName) {
                displayName = itName;
              }
            } catch (e) {}

            // Recommended setup based on stats
            const highestStat = [
              { name: 'hp', val: data.stats[0].base_stat },
              { name: 'atk', val: data.stats[1].base_stat },
              { name: 'def', val: data.stats[2].base_stat },
              { name: 'spa', val: data.stats[3].base_stat },
              { name: 'spd', val: data.stats[4].base_stat },
              { name: 'spe', val: data.stats[5].base_stat }
            ].sort((a, b) => b.val - a.val)[0].name;

            let recNature = 'jolly';
            let recItem = 'sitrusberry';
            let recSpread = 'Jolly:252/0/4/0/0/252';

            if (highestStat === 'atk') {
              recNature = 'adamant';
              recItem = 'choiceband';
              recSpread = 'Adamant:252/252/0/0/0/4';
            } else if (highestStat === 'spa') {
              recNature = 'modest';
              recItem = 'choicespecs';
              recSpread = 'Modest:4/0/0/252/0/252';
            } else if (highestStat === 'def' || highestStat === 'spd' || highestStat === 'hp') {
              recNature = 'relaxed';
              recItem = 'leftovers';
              recSpread = 'Relaxed:252/0/252/0/4/0';
            }

            const recMoves = data.moves.slice(0, 4).map(m => m.move.name);

            rawFetchedData.push({
              data,
              displayName,
              recItem,
              recSpread,
              recMoves,
              recNature
            });
          } catch (err) {
            console.error(`Failed to fetch dynamic pokemon ${apiMatch.name} in mass import:`, err.message);
            notFoundList.push(rawName);
          }
        }
      } else {
        notFoundList.push(rawName);
      }
    }

    if (rawFetchedData.length > 0) {
      // Gather all abilities, items, moves and natures to preload translations
      const abilitiesToPreload = rawFetchedData.map(x => x.data.abilities[0]?.ability.name).filter(Boolean);
      const itemsToPreload = rawFetchedData.map(x => x.recItem).filter(Boolean);
      const movesToPreload = rawFetchedData.flatMap(x => x.recMoves).filter(Boolean);
      const naturesToPreload = rawFetchedData.map(x => x.recNature).filter(Boolean);

      try {
        await preloadTranslations({
          abilities: abilitiesToPreload,
          items: itemsToPreload,
          moves: movesToPreload,
          natures: naturesToPreload
        });
      } catch (err) {
        console.error("Error preloading translations in mass import:", err);
      }

      // Map rawFetchedData to addedList
      rawFetchedData.forEach(x => {
        const data = x.data;
        const newPk = {
          name: data.name,
          displayName: x.displayName,
          types: data.types.map(t => t.type.name),
          stats: {
            hp: data.stats[0].base_stat,
            atk: data.stats[1].base_stat,
            def: data.stats[2].base_stat,
            spa: data.stats[3].base_stat,
            spd: data.stats[4].base_stat,
            spe: data.stats[5].base_stat
          },
          sprite: data.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
          ability: translateAbility(data.abilities[0]?.ability.name),
          item: translateItem(x.recItem),
          spread: x.recSpread,
          moves: x.recMoves.map(translateMove)
        };
        addedList.push(newPk);
      });
    }

    if (addedList.length > 0) {
      setBox(prev => [...prev, ...addedList]);
      setGeneratedTeam(null);
    }

    setLoadingPokemon(false);

    // Set feedback
    const totalAdded = addedList.length;
    if (totalAdded > 0) {
      setImportFeedback({
        type: 'success',
        message: `Aggiunti con successo ${totalAdded} Pokémon al Box! (${addedList.map(p => p.displayName).join(', ')})`
      });
      setImportText('');
    } else if (alreadyInBox.length > 0) {
      setImportFeedback({
        type: 'warning',
        message: `Nessun nuovo Pokémon aggiunto. I Pokémon indicati erano già nel tuo Box.`
      });
    } else {
      setImportFeedback({
        type: 'error',
        message: `Nessun Pokémon riconosciuto. Verifica i nomi inseriti.`
      });
    }
  };

  // Helper: Generates all combinations of size K from array
  const getCombinations = (arr, k) => {
    const results = [];
    const helper = (start, combo) => {
      if (combo.length === k) {
        results.push(combo);
        return;
      }
      for (let i = start; i < arr.length; i++) {
        helper(i + 1, [...combo, arr[i]]);
      }
    };
    helper(0, []);
    return results;
  };

  // Evaluate and generate team
  const generateTeam = async () => {
    if (box.length === 0) return;

    let finalSix = [];
    let fillerText = '';

    // Case 1: Less than 6 Pokémon in box. Fill with best popular partners!
    if (box.length < 6) {
      const fillersNeeded = 6 - box.length;
      finalSix = [...box];

      // A simple fallback list of top meta pokemon slugs
      const popularKeys = [
        'incineroar', 'flutter-mane', 'amoonguss', 'rillaboom', 'gholdengo', 
        'great-tusk', 'urshifu-rapid-strike', 'calyrex-shadow', 'ogerpon-wellspring', 
        'chien-pao', 'kingambit', 'raging-bolt', 'iron-hands', 'landorus-therian', 
        'pelipper'
      ];

      const chosenFillers = [];
      for (const key of popularKeys) {
        if (chosenFillers.length >= fillersNeeded) break;
        if (!box.some(p => p.name.toLowerCase() === key)) {
          // Fetch its details from PokéAPI dynamically to keep it 100% stable
          try {
            const res = await axiosHttp.get(`https://pokeapi.co/api/v2/pokemon/${getPokeApiSlug(key)}`);
            const data = res.data;

            let displayName = key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            try {
              const speciesRes = await axiosHttp.get(`https://pokeapi.co/api/v2/pokemon-species/${data.species.name}`);
              const itName = speciesRes.data.names.find(n => n.language.name === 'it')?.name;
              if (itName) displayName = itName;
            } catch (e) {}

            // Recommended build setup
            const highestStat = [
              { name: 'hp', val: data.stats[0].base_stat },
              { name: 'atk', val: data.stats[1].base_stat },
              { name: 'def', val: data.stats[2].base_stat },
              { name: 'spa', val: data.stats[3].base_stat },
              { name: 'spd', val: data.stats[4].base_stat },
              { name: 'spe', val: data.stats[5].base_stat }
            ].sort((a, b) => b.val - a.val)[0].name;

            let recNature = 'jolly';
            let recItem = 'sitrusberry';
            let recSpread = 'Jolly:252/0/4/0/0/252';

            if (highestStat === 'atk') {
              recNature = 'adamant';
              recItem = 'choiceband';
              recSpread = 'Adamant:252/252/0/0/0/4';
            } else if (highestStat === 'spa') {
              recNature = 'modest';
              recItem = 'choicespecs';
              recSpread = 'Modest:4/0/0/252/0/252';
            } else if (highestStat === 'def' || highestStat === 'spd' || highestStat === 'hp') {
              recNature = 'relaxed';
              recItem = 'leftovers';
              recSpread = 'Relaxed:252/0/252/0/4/0';
            }

            const recMoves = data.moves
              .slice(0, 4)
              .map(m => translateMove(m.move.name));

            chosenFillers.push({
              name: data.name,
              displayName,
              types: data.types.map(t => t.type.name),
              stats: {
                hp: data.stats[0].base_stat,
                atk: data.stats[1].base_stat,
                def: data.stats[2].base_stat,
                spa: data.stats[3].base_stat,
                spd: data.stats[4].base_stat,
                spe: data.stats[5].base_stat
              },
              sprite: data.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
              ability: translateAbility(data.abilities[0]?.ability.name),
              item: translateItem(recItem),
              spread: recSpread,
              moves: recMoves
            });
          } catch (e) {
            console.error(`Failed to load filler ${key}:`, e.message);
          }
        }
      }

      finalSix = [...finalSix, ...chosenFillers];
      
      const fillerNames = chosenFillers.map(f => f.displayName).join(', ');
      fillerText = `Il tuo Box conteneva solo ${box.length} Pokémon. Per completare la squadra abbiamo aggiunto i migliori ${fillersNeeded} partner competitivi del meta: [${fillerNames}].`;
    } 
    // Case 2: 6 or more Pokémon in box. Find the absolute best combination of 6!
    else {
      const combos = getCombinations(box, 6);
      let bestCombo = combos[0];
      let maxScore = -Infinity;

      combos.forEach(combo => {
        let score = 100;

        // 1. Core Check: FWG Core (Fire + Water + Grass)
        const types = combo.flatMap(p => p.types.map(t => t.toLowerCase()));
        if (types.includes('fire') && types.includes('water') && types.includes('grass')) {
          score += 40;
        }

        // 2. Core Check: Fantasy Core (Steel + Fairy + Dragon)
        if (types.includes('steel') && types.includes('fairy') && types.includes('dragon')) {
          score += 35;
        }

        // 3. Defensive Weaknesses Penalty
        const modifiers = {};
        for (const type of allTypes) {
          modifiers[type] = { weak: 0, resist: 0, immune: 0 };
        }

        combo.forEach(p => {
          const mods = getDefensiveModifiers(p.types);
          for (const [type, mult] of Object.entries(mods)) {
            if (mult > 1) modifiers[type].weak++;
            else if (mult > 0 && mult < 1) modifiers[type].resist++;
            else if (mult === 0) modifiers[type].immune++;
          }
        });

        for (const [type, counts] of Object.entries(modifiers)) {
          const net = counts.weak - (counts.resist + counts.immune);
          if (net >= 2) {
            score -= (15 * net);
          }
        }

        if (score > maxScore) {
          maxScore = score;
          bestCombo = combo;
        }
      });

      finalSix = bestCombo;
      fillerText = `Analizzate tutte le combinazioni possibili del tuo Box. Questa è la squadra di 6 Pokémon che esprime la massima sinergia difensiva ed elementale.`;
    }

    // Compute synergy matrix for final team
    const finalMatrix = {};
    for (const type of allTypes) {
      finalMatrix[type] = { weak: 0, resist: 0, immune: 0 };
    }
    finalSix.forEach(p => {
      const mods = getDefensiveModifiers(p.types);
      for (const [type, mult] of Object.entries(mods)) {
        if (mult > 1) finalMatrix[type].weak++;
        else if (mult > 0 && mult < 1) finalMatrix[type].resist++;
        else if (mult === 0) finalMatrix[type].immune++;
      }
    });

    // Form advisory report
    const finalReports = [];
    const finalTypes = finalSix.flatMap(p => p.types.map(t => t.toLowerCase()));
    
    // Core check
    if (finalTypes.includes('fire') && finalTypes.includes('water') && finalTypes.includes('grass')) {
      finalReports.push({ type: 'success', text: 'Core elementale Fuoco-Acqua-Erba attivo!' });
    }
    if (finalTypes.includes('steel') && finalTypes.includes('fairy') && finalTypes.includes('dragon')) {
      finalReports.push({ type: 'success', text: 'Core difensivo Fantasy (Acciaio-Folletto-Drago) attivo!' });
    }

    // Defensive check
    for (const [type, counts] of Object.entries(finalMatrix)) {
      if (counts.weak >= 3 && counts.resist === 0 && counts.immune === 0) {
        finalReports.push({ type: 'danger', text: `Attenzione: Forte debolezza di gruppo al tipo [${type.toUpperCase()}] senza alcuna resistenza.` });
      }
    }

    setGeneratedTeam({
      pokemon: finalSix,
      matrix: finalMatrix,
      reports: finalReports,
      fillerText
    });
  };

  return (
    <div className="w-full">
      {/* Header with Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Generatore Team da Box
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Carica la lista dei Pokémon di cui disponi (il tuo Box) e l'algoritmo genererà la migliore squadra da 6 basata sulle sinergie elementali del gioco.
          </p>
        </div>

        {format && setFormat && (
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:inline">Formato:</label>
            <select 
              value={format} 
              onChange={(e) => {
                setFormat(e.target.value);
                setGeneratedTeam(null);
                setImportFeedback(null);
              }}
              className="bg-white border border-slate-300 focus:border-[#0075BE] rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
            >
              {Object.entries(formatNames).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Input & Box List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-805 mb-3">Caricamento Rapido Box</h2>
            
            {/* Tabs for Add Methods */}
            <div className="flex border-b border-slate-100 mb-4">
              <button
                disabled={loadingPokemon}
                onClick={() => { setActiveInputTab('search'); setImportFeedback(null); }}
                className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 disabled:opacity-50 ${
                  activeInputTab === 'search'
                    ? 'border-[#0075BE] text-[#0075BE]'
                    : 'border-transparent text-slate-400 hover:text-slate-655'
                }`}
              >
                Cerca Singolo
              </button>
              <button
                disabled={loadingPokemon}
                onClick={() => { setActiveInputTab('import'); setImportFeedback(null); }}
                className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 disabled:opacity-50 ${
                  activeInputTab === 'import'
                    ? 'border-[#0075BE] text-[#0075BE]'
                    : 'border-transparent text-slate-400 hover:text-slate-655'
                }`}
              >
                Copia/Incolla Testo
              </button>
            </div>

            {/* Render active input tab */}
            {activeInputTab === 'search' ? (
              <div ref={autocompleteRef} className="relative">
                <div className="relative">
                  <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input 
                    type="text" 
                    value={search}
                    disabled={loadingPokemon}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder={loadingPokemon ? "Caricamento dettagli..." : "Digita nome Pokémon..."}
                    className="w-full bg-slate-50 border border-slate-255 focus:border-[#0075BE] rounded-xl pl-11 pr-10 py-2.5 text-sm font-semibold text-slate-800 outline-none shadow-inner disabled:opacity-60"
                  />
                  {loadingPokemon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0075BE] border-t-transparent"></div>
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl overflow-hidden z-20 shadow-2xl">
                    {suggestions.map(p => (
                      <div 
                        key={p.name}
                        onClick={() => addToBox(p)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-55 cursor-pointer border-b border-slate-100 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center p-0.5">
                          <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} alt={p.displayName} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="flex-1 flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-850">{p.displayName}</span>
                          <span className="text-[9px] text-[#0075BE] font-semibold bg-[#0075BE]/5 border border-[#0075BE]/10 px-2 py-0.5 rounded">PokéAPI</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={4}
                  value={importText}
                  disabled={loadingPokemon}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Incolla qui una lista di Pokémon (es: Squirtle, Pikachu, Lugia, Incineroar) o interi file esportati da Pokémon Showdown..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700 outline-none shadow-inner resize-none placeholder:text-slate-400 disabled:opacity-60"
                />
                <button
                  disabled={loadingPokemon}
                  onClick={() => handleMassImport(importText)}
                  className="w-full bg-[#0075BE] text-white py-2.5 rounded-xl text-xs font-black hover:bg-[#0075BE]/90 shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loadingPokemon && (
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                  )}
                  Importa Box
                </button>

                {importFeedback && (
                  <div className={`text-[10px] font-semibold p-2.5 rounded-lg border ${
                    importFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-800'
                      : importFeedback.type === 'info'
                      ? 'bg-blue-50 border-blue-200 text-[#0075BE]'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    {importFeedback.message}
                  </div>
                )}
              </div>
            )}

            {/* Genera Trigger */}
            <button
              onClick={generateTeam}
              disabled={box.length === 0 || loadingPokemon}
              className={`w-full py-3 mt-6 rounded-xl text-sm font-black shadow-md transition-all flex items-center justify-center gap-2 ${
                box.length === 0 || loadingPokemon
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#FFCF11] text-black hover:bg-[#FFCF11]/90 shadow-yellow-500/10'
              }`}
            >
              <GiSwordsEmblem className="text-lg" />
              Genera Squadra Sinergica
            </button>
          </div>

          {/* Box Display */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Il tuo Box</h2>
              <div className="flex items-center gap-2">
                {box.length > 0 && (
                  <button
                    disabled={loadingPokemon}
                    onClick={() => { setBox([]); setGeneratedTeam(null); setImportFeedback(null); }}
                    className="text-[10px] font-black text-red-500 hover:text-red-650 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1 transition-all disabled:opacity-60"
                  >
                    Svuota tutto
                  </button>
                )}
                <span className="text-xs font-black px-2.5 py-1 bg-slate-100 rounded-full border border-slate-200 text-slate-650">
                  {box.length} Pokémon
                </span>
              </div>
            </div>

            {box.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-medium">
                Il tuo box è vuoto. Carica file Showdown o scrivi i nomi dei Pokémon per iniziare.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
                {box.map(p => (
                  <div 
                    key={p.name}
                    className="flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-xl p-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={p.sprite} alt={p.displayName} className="w-8 h-8 object-contain" />
                      <span className="text-xs font-bold text-slate-800 truncate">{p.displayName}</span>
                    </div>
                    <button 
                      disabled={loadingPokemon}
                      onClick={() => removeFromBox(p.name)}
                      className="text-slate-400 hover:text-red-500 p-1 disabled:opacity-50"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-2">
          {generatedTeam ? (
            <div className="space-y-6">
              {/* Squadra Generata Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-2">
                  Squadra Consigliata Generata
                </h2>
                <p className="text-xs font-semibold text-[#0075BE] leading-relaxed bg-[#0075BE]/5 border border-[#0075BE]/10 rounded-xl p-3 mb-6">
                  {generatedTeam.fillerText}
                </p>

                {/* The 6 Pokemon Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {generatedTeam.pokemon.map((p, idx) => (
                    <div 
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center text-center shadow-inner hover:-translate-y-0.5 transition-transform"
                    >
                      <div className="w-16 h-16 bg-white rounded-xl border border-slate-150 flex items-center justify-center p-1 mb-2">
                        <img src={p.sprite} alt={p.displayName} className="max-h-full max-w-full object-contain" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate w-full mb-1">{p.displayName}</span>
                      <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                        {p.types.map(t => (
                          <span key={t} className={`text-[8px] font-black px-1.5 py-0.2 rounded border capitalize ${getTypeBadgeClass(t)}`}>
                            {translateType(t)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Training Sheet & Synergy Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Scheda di Allenamento */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[340px]">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Build di Allenamento</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mb-3">Abilità, strumenti, nature e punti statistica consigliati per la squadra.</p>
                    
                    <div className="space-y-3 overflow-y-auto pr-1 h-[220px]">
                      {generatedTeam.pokemon.map((p, idx) => {
                        const rawItem = p.item || 'Baccacedro';
                        const rawAbility = p.ability || 'Prepotenza';
                        const spread = p.spread || 'Jolly:252/0/4/0/0/252';
                        const rawMoves = p.moves || ['Frana', 'Protezione', 'Bruciapelo', 'Privazione'];
                        
                        let natureName = 'Allegra';
                        if (spread.includes(':')) {
                          const natKey = spread.split(':')[0].toLowerCase();
                          natureName = translateNature(natKey);
                        }
                        
                        const evDesc = getEvDescription(spread);

                        return (
                          <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex gap-3 items-start">
                            <img src={p.sprite} alt={p.displayName} className="w-10 h-10 object-contain bg-white rounded-lg p-0.5 border" />
                            <div className="flex-1 text-[11px] leading-tight">
                              <h4 className="font-bold text-slate-800">{p.displayName}</h4>
                              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 text-slate-600 font-medium">
                                <p><span className="text-[9px] text-slate-400 block font-semibold uppercase">Abilità:</span> {translateAbility(rawAbility)}</p>
                                <p><span className="text-[9px] text-slate-400 block font-semibold uppercase">Strumento:</span> {translateItem(rawItem)}</p>
                                <p><span className="text-[9px] text-slate-400 block font-semibold uppercase">Natura:</span> {natureName}</p>
                                <p><span className="text-[9px] text-slate-400 block font-semibold uppercase">Statistiche:</span> {evDesc}</p>
                              </div>
                              <div className="mt-1.5 pt-1.5 border-t border-slate-200/50">
                                <span className="text-[9px] text-slate-400 block font-semibold uppercase mb-0.5">Mosse consigliate:</span>
                                <div className="flex flex-wrap gap-1">
                                  {rawMoves.map((m, mIdx) => (
                                    <span key={mIdx} className="bg-[#0075BE]/5 text-[#0075BE] px-1.5 py-0.5 rounded border border-[#0075BE]/10 text-[9px] font-bold">
                                      {translateMove(m)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Strategy Guide Cards */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between z-10">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 mb-4">
                      Guida Strategica del Team
                    </h3>
                    
                    {(() => {
                      const strategy = generateTeamStrategy(generatedTeam.pokemon);
                      return (
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-black uppercase text-[#0075BE] block mb-0.5 tracking-wider">Leads Consigliati (Apertura)</span>
                            <p className="text-xs text-slate-800 font-bold leading-relaxed">{strategy.leads}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-[#0075BE] block mb-0.5 tracking-wider">Combo Principale</span>
                            <p className="text-xs text-slate-800 font-bold leading-relaxed">{strategy.combo}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-[#0075BE] block mb-0.5 tracking-wider">Suggerimento d'Uso (Tip)</span>
                            <p className="text-xs text-slate-800 font-bold leading-relaxed">{strategy.tip}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] text-slate-400 font-semibold leading-relaxed">
                    *Strategia generata dinamicamente in base alle sinergie elementali e alle statistiche dei Pokémon scelti dal box.
                  </div>
                </div>

              </div>

              {/* Weakness Matrix */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-4">
                  Copertura Tipi del Team Consigliato
                </h3>
                
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {allTypes.map(type => {
                    const matrix = generatedTeam.matrix[type];
                    let bgStyle = 'bg-slate-50 border-slate-200';
                    let indicator = '0';
                    let labelColor = 'text-slate-400';

                    if (matrix.weak > 0 || matrix.resist > 0 || matrix.immune > 0) {
                      const net = matrix.weak - (matrix.resist + matrix.immune);
                      if (net > 0) {
                        bgStyle = 'bg-red-50/50 border-red-200';
                        indicator = `+${net}`;
                        labelColor = 'text-red-650 font-black';
                      } else if (net < 0) {
                        bgStyle = 'bg-emerald-50/50 border-emerald-200';
                        indicator = `${net}`;
                        labelColor = 'text-emerald-650 font-black';
                      } else {
                        bgStyle = 'bg-slate-100 border-slate-200';
                        indicator = 'Pari';
                        labelColor = 'text-slate-700 font-bold';
                      }
                    }

                    return (
                      <div key={type} className={`border rounded-xl p-2.5 text-center flex flex-col justify-between transition-all ${bgStyle}`}>
                        <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded ${getTypeColor(type)}`}>
                          {translateType(type)}
                        </span>
                        
                        <div className="my-1.5 text-[10px] text-slate-500 font-semibold space-y-0.5">
                          {matrix.weak > 0 && <p className="text-red-650">Deb: {matrix.weak}</p>}
                          {matrix.resist > 0 && <p className="text-emerald-700">Res: {matrix.resist}</p>}
                          {matrix.immune > 0 && <p className="text-[#0075BE]">Imm: {matrix.immune}</p>}
                        </div>

                        <div className="pt-1.5 border-t border-slate-200/60 flex justify-between items-center text-[9px] text-slate-400">
                          <span>Bilancio</span>
                          <span className={labelColor}>{indicator}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            /* Empty output state */
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-400 font-medium h-[480px] flex flex-col justify-center items-center shadow-sm">
              <GiSwordsEmblem className="text-[#0075BE]/20 text-6xl mb-4" />
              <span>{"Carica il tuo Box Pokémon e clicca su \"Genera Squadra Sinergica\" per visualizzare i risultati dell'analisi competitiva."}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BoxBuilder;
