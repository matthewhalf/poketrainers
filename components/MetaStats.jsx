"use client";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  translateAbility, 
  translateItem, 
  translateMove, 
  translateNature, 
  translateType, 
  preloadTranslations 
} from '@/data/translator';
import { IoSearchOutline, IoClose } from 'react-icons/io5';
import { GiBarbedCoil, GiSwordsEmblem } from 'react-icons/gi';

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
    case 'dragon': return 'bg-purple-100 text-purple-605 border-purple-300';
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
  'walking-wake-gmax': 'Acquashock Giga',
  'ogerpon-wellspring': 'Ogerpon (Maschera Pozzo)',
  'ogerpon-hearthflame': 'Ogerpon (Maschera Focolare)',
  'ogerpon-cornerstone': 'Ogerpon (Maschera Fondamenta)',
  'calyrex-ice': 'Calyrex (Cavaliere Glaciale)',
  'calyrex-shadow': 'Calyrex (Cavaliere Spettrale)',
  'ursaluna-bloodmoon': 'Ursaluna (Luna Cremisi)'
};

const getPokeApiSlug = (name) => {
  if (!name) return '';
  const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  if (slug === 'ogerpon-wellspring') return 'ogerpon-wellspring-mask';
  if (slug === 'ogerpon-hearthflame') return 'ogerpon-hearthflame-mask';
  if (slug === 'ogerpon-cornerstone') return 'ogerpon-cornerstone-mask';
  return slug;
};

const formatEnglishName = (name) => {
  return name.split('-').map(w => w.charAt(0).toUpperCase() + wordSlice(w)).join(' ');
};

const wordSlice = (word) => {
  return word.slice(1);
};

const topMetaPokemon = [
  { name: 'incineroar', displayName: 'Incineroar', spriteId: 727, type: 'fire', usage: '64.8%' },
  { name: 'calyrex-ice', displayName: 'Calyrex (Cav. Glaciale)', spriteId: 10193, type: 'ice', usage: '48.2%' },
  { name: 'flutter-mane', displayName: 'Crinealato', spriteId: 987, type: 'ghost', usage: '44.5%' },
  { name: 'rillaboom', displayName: 'Rillaboom', spriteId: 812, type: 'grass', usage: '41.1%' },
  { name: 'urshifu-rapid-strike', displayName: 'Urshifu (Pluricolpo)', spriteId: 10162, type: 'water', usage: '35.6%' },
  { name: 'amoonguss', displayName: 'Amoonguss', spriteId: 591, type: 'grass', usage: '32.4%' },
  { name: 'raging-bolt', displayName: 'Furiapulsante', spriteId: 1021, type: 'electric', usage: '28.9%' },
  { name: 'miraidon', displayName: 'Miraidon', spriteId: 1008, type: 'electric', usage: '25.3%' },
  { name: 'koraidon', displayName: 'Koraidon', spriteId: 1007, type: 'fighting', usage: '24.1%' },
  { name: 'gholdengo', displayName: 'Gholdengo', spriteId: 1000, type: 'steel', usage: '22.8%' },
  { name: 'great-tusk', displayName: 'Grandizanne', spriteId: 984, type: 'ground', usage: '21.5%' },
  { name: 'kingambit', displayName: 'Kingambit', spriteId: 983, type: 'dark', usage: '19.8%' }
];

const getCompetitiveDetails = (name, data) => {
  const metaDb = {
    'calyrex-ice': {
      items: ['Clear Amulet', 'Weakness Policy'],
      moves: ['Glacial Lance', 'High Horsepower', 'Trick Room', 'Protect'],
      synergies: 'Amoonguss, Incineroar, Pelipper, Urshifu-Rapid-Strike (supportano la Trick Room e coprono le debolezze di tipo Fuoco).'
    },
    'incineroar': {
      items: ['Sitrus Berry', 'Safety Goggles'],
      moves: ['Fake Out', 'Parting Shot', 'Flare Blitz', 'Knock Off'],
      synergies: 'Calyrex-Ice, Rillaboom, Flutter Mane, Urshifu-Rapid-Strike (creano un eccellente controllo di pivot e priorità).'
    },
    'rillaboom': {
      items: ['Assault Vest', 'Miracle Seed'],
      moves: ['Grassy Glide', 'Wood Hammer', 'U-turn', 'Fake Out'],
      synergies: 'Incineroar, Urshifu-Rapid-Strike, Koraidon (ottimo pivot nel core Fuoco-Acqua-Erba).'
    },
    'urshifu-rapid-strike': {
      items: ['Focus Sash', 'Choice Band'],
      moves: ['Surging Strikes', 'Close Combat', 'Aqua Jet', 'Detect'],
      synergies: 'Pelipper (sotto pioggia), Rillaboom, Incineroar (spazza via i difensori fisici nemici).'
    },
    'amoonguss': {
      items: ['Rocky Helmet', 'Sitrus Berry'],
      moves: ['Spore', 'Rage Powder', 'Pollen Puff', 'Protect'],
      synergies: 'Calyrex-Ice, Urshifu, Miraidon (reindirizzamento degli attacchi e controllo del sonno).'
    },
    'flutter-mane': {
      items: ['Booster Energy', 'Choice Specs'],
      moves: ['Moonblast', 'Dazzling Gleam', 'Shadow Ball', 'Protect'],
      synergies: 'Koraidon (attiva Paleosintesi), Chi-Yu, Whimsicott (altissima pressione offensiva speciale).'
    },
    'koraidon': {
      items: ['Choice Band', 'Life Orb'],
      moves: ['Collision Course', 'Flare Blitz', 'U-turn', 'Wild Charge'],
      synergies: 'Flutter Mane, Raging Bolt, Chi-Yu (attiva il Sole potenziando l\'intero team).'
    },
    'miraidon': {
      items: ['Choice Specs', 'Life Orb'],
      moves: ['Electro Drift', 'Draco Meteor', 'Volt Switch', 'Overheat'],
      synergies: 'Iron Hands, Iron Moth, Farigiraf (attiva il Campo Elettrico potenziando le abilità Quark Drive).'
    },
    'raging-bolt': {
      items: ['Assault Vest', 'Booster Energy'],
      moves: ['Thunderclap', 'Draco Meteor', 'Thunderbolt', 'Snarl'],
      synergies: 'Koraidon (sotto sole), Whimsicott, Incineroar (ottima priorità speciale contro pivot nemici).'
    },
    'gholdengo': {
      items: ['Air Balloon', 'Leftovers'],
      moves: ['Make It Rain', 'Shadow Ball', 'Nasty Plot', 'Recover'],
      synergies: 'Great Tusk, Gliscor, Kingambit (blocca la rimozione delle trappole grazie a Corpo Dorato).'
    },
    'great-tusk': {
      items: ['Leftovers', 'Booster Energy'],
      moves: ['Rapid Spin', 'Earthquake', 'Knock Off', 'Stealth Rock'],
      synergies: 'Gholdengo, Gliscor, Kingambit (ottimo setter di trappole e rimozione di quelle nemiche).'
    },
    'kingambit': {
      items: ['Black Glasses', 'Assault Vest'],
      moves: ['Kowtow Cleave', 'Sucker Punch', 'Iron Head', 'Swords Dance'],
      synergies: 'Gholdengo, Great Tusk, Gliscor (win condition a fine partita grazie a Generale Supremo).'
    }
  };

  if (metaDb[name]) {
    return metaDb[name];
  }

  const primaryType = data.types[0].type.name;
  const stats = {
    hp: data.stats[0].base_stat,
    atk: data.stats[1].base_stat,
    def: data.stats[2].base_stat,
    spa: data.stats[3].base_stat,
    spd: data.stats[4].base_stat,
    spe: data.stats[5].base_stat
  };

  let items = ['Life Orb', 'Focus Sash'];
  if (stats.atk > 90 && stats.spe > 90) {
    items = ['Choice Band', 'Life Orb', 'Focus Sash'];
  } else if (stats.spa > 90 && stats.spe > 95) {
    items = ['Choice Specs', 'Life Orb', 'Focus Sash'];
  } else if (stats.hp > 90 || stats.def > 90 || stats.spd > 90) {
    items = ['Leftovers', 'Rocky Helmet', 'Assault Vest', 'Sitrus Berry'];
  }

  const moves = data.moves.slice(0, 4).map(m => m.move.name);
  if (moves.length > 3) {
    moves[3] = 'protect';
  }

  let synergies = `Sinergia ottimale con Pokémon che coprono le debolezze del tipo ${translateType(primaryType)}.`;
  if (['fire', 'water', 'grass'].includes(primaryType)) {
    synergies = `Ottima sinergia per completare il core elementare Fuoco-Acqua-Erba (es: accoppiando con Incineroar, Rillaboom o Urshifu).`;
  } else if (['steel', 'fairy', 'dragon'].includes(primaryType)) {
    synergies = `Ottima sinergia nel core competitivo Acciaio-Folletto-Drago (es: in combinazione con Gholdengo, Kingambit o Eroeferreo).`;
  }

  return { items, moves, synergies };
};

const MetaStats = () => {
  const [allPokemon, setAllPokemon] = useState([]);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPk, setSelectedPk] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const autocompleteRef = useRef(null);

  // Click outside to close suggestions list
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch complete pokemon list on mount for fast autocomplete search
  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1025');
        if (res.data && res.data.results) {
          // Format with English names & preloaded Italian names for paradoxes/forms
          const mapped = res.data.results.map((item, idx) => {
            const id = idx + 1;
            const engName = item.name;
            const displayName = paradoxTranslations[engName] || formatEnglishName(engName);
            return {
              id,
              name: engName,
              displayName,
              url: item.url
            };
          });
          setAllPokemon(mapped);
        }
      } catch (err) {
        console.error("Error loading pokemon index:", err.message);
      } finally {
        setLoadingList(false);
      }
    };
    fetchList();
  }, []);

  const handleSearchChange = (val) => {
    setSearch(val);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }

    const query = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    const filtered = allPokemon.filter(p => 
      p.displayName.toLowerCase().replace(/[^a-z0-9]/g, '').includes(query) ||
      p.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(query)
    ).slice(0, 10);

    setSuggestions(filtered);
  };

  const selectPokemon = async (pokemon) => {
    setSearch('');
    setSuggestions([]);
    setLoadingDetail(true);
    try {
      // 1. Fetch details
      const detailRes = await axios.get(`https://pokeapi.co/api/v2/pokemon/${getPokeApiSlug(pokemon.name)}`);
      const data = detailRes.data;

      // 2. Fetch species for Italian description and evolved display name
      let itDisplayName = pokemon.displayName;
      let itDesc = 'Nessuna descrizione disponibile.';
      let evoChainUrl = null;

      try {
        const speciesRes = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${data.species.name}`);
        const sData = speciesRes.data;
        
        // Find Italian display name
        const matchName = sData.names.find(n => n.language.name === 'it')?.name;
        if (matchName) {
          // Add back form descriptions if applicable
          if (pokemon.name.includes('-wellspring')) itDisplayName = `${matchName} (Maschera Pozzo)`;
          else if (pokemon.name.includes('-hearthflame')) itDisplayName = `${matchName} (Maschera Focolare)`;
          else if (pokemon.name.includes('-cornerstone')) itDisplayName = `${matchName} (Maschera Fondamenta)`;
          else if (pokemon.name.includes('-ice')) itDisplayName = `${matchName} (Cavaliere Glaciale)`;
          else if (pokemon.name.includes('-shadow')) itDisplayName = `${matchName} (Cavaliere Spettrale)`;
          else if (pokemon.name.includes('-bloodmoon')) itDisplayName = `${matchName} (Luna Cremisi)`;
          else itDisplayName = matchName;
        }

        // Find Italian Pokedex description
        const matchDesc = sData.flavor_text_entries.find(e => e.language.name === 'it')?.flavor_text;
        if (matchDesc) {
          itDesc = matchDesc.replace(/[\n\f\r]+/g, ' ');
        }
        
        evoChainUrl = sData.evolution_chain?.url;
      } catch (e) {
        console.log("Failed to load species translations:", e.message);
      }

      // 3. Fetch abilities details in Italian
      const abilities = await Promise.all(data.abilities.map(async (ab) => {
        let itName = formatEnglishName(ab.ability.name);
        let itEffect = 'Nessuna descrizione dell\'abilità.';
        try {
          const abRes = await axios.get(ab.ability.url);
          const nameMatch = abRes.data.names.find(n => n.language.name === 'it')?.name;
          if (nameMatch) itName = nameMatch;
          
          const effectMatch = abRes.data.flavor_text_entries.find(e => e.language.name === 'it')?.flavor_text ||
                              abRes.data.effect_entries.find(e => e.language.name === 'it')?.effect;
          if (effectMatch) itEffect = effectMatch;
        } catch (e) {}
        return {
          name: itName,
          effect: itEffect,
          isHidden: ab.is_hidden
        };
      }));

      // 4. Fetch evolution chain names in Italian if url exists
      let evolutionChain = [];
      if (evoChainUrl) {
        try {
          const evoRes = await axios.get(evoChainUrl);
          const chain = evoRes.data.chain;
          
          const parseChain = (c) => {
            const list = [];
            let curr = c;
            while (curr) {
              const engName = curr.species.name;
              const displayName = paradoxTranslations[engName] || formatEnglishName(engName);
              list.push(displayName);
              curr = curr.evolves_to?.[0]; // simple linear chain
            }
            return list;
          };
          evolutionChain = parseChain(chain);
        } catch (e) {
          console.log("Failed to load evolution chain:", e.message);
        }
      }

      // Recommend Nature, Role & Stats spread based on stats
      const stats = {
        hp: data.stats[0].base_stat,
        atk: data.stats[1].base_stat,
        def: data.stats[2].base_stat,
        spa: data.stats[3].base_stat,
        spd: data.stats[4].base_stat,
        spe: data.stats[5].base_stat
      };

      // Role Analyzer & Stat Points (SP) allocation for Pokemon Champions (66 SP total, cap 32 per stat)
      let role = 'Bilanciato';
      let natureAdvice = 'Seria (Nessun effetto)';
      let statAdvice = '11 PS / 11 Attacco / 11 Difesa / 11 Att. Sp. / 11 Dif. Sp. / 11 Velocità (66 SP Bilanciati)';

      if (stats.atk > 95 && stats.spe > 90) {
        role = 'Attaccante Fisico Veloce (Sweeper)';
        natureAdvice = 'Allegra (+Velocità, -Att. Sp.) o Decisa (+Attacco, -Att. Sp.)';
        statAdvice = '32 Attacco / 32 Velocità / 2 PS (Totale: 66 SP per Champions)';
      } else if (stats.spa > 95 && stats.spe > 90) {
        role = 'Attaccante Speciale Veloce (Sweeper)';
        natureAdvice = 'Timida (+Velocità, -Attacco) o Modesta (+Att. Sp., -Attacco)';
        statAdvice = '32 Att. Sp. / 32 Velocità / 2 PS (Totale: 66 SP per Champions)';
      } else if (stats.hp > 90 && (stats.def > 90 || stats.spd > 90)) {
        role = 'Difensore Robusto (Tank / Supporto)';
        if (stats.def > stats.spd) {
          natureAdvice = 'Sicura (+Difesa, -Attacco) o Scaltra (+Difesa, -Att. Sp.)';
          statAdvice = '32 PS / 32 Difesa / 2 Dif. Sp. (Totale: 66 SP per Champions)';
        } else {
          natureAdvice = 'Calma (+Dif. Sp., -Attacco) o Cautela (+Dif. Sp., -Att. Sp.)';
          statAdvice = '32 PS / 32 Dif. Sp. / 2 Difesa (Totale: 66 SP per Champions)';
        }
      } else if (stats.spe > 105 && (stats.atk > 80 || stats.spa > 80)) {
        role = 'Pivot Veloce / Supporto';
        if (stats.atk > stats.spa) {
          natureAdvice = 'Allegra (+Velocità, -Att. Sp.)';
          statAdvice = '32 Velocità / 32 Attacco / 2 PS (Totale: 66 SP per Champions)';
        } else {
          natureAdvice = 'Timida (+Velocità, -Attacco)';
          statAdvice = '32 Velocità / 32 Att. Sp. / 2 PS (Totale: 66 SP per Champions)';
        }
      } else {
        const sorted = Object.entries(stats).sort((a,b) => b[1] - a[1]);
        const highKey = sorted[0][0];
        const secondHighKey = sorted[1][0];
        const nameMap = { hp: 'PS', atk: 'Attacco', def: 'Difesa', spa: 'Att. Sp.', spd: 'Dif. Sp.', spe: 'Velocità' };
        
        let thirdKey = 'hp';
        if (highKey === 'hp' || secondHighKey === 'hp') {
          thirdKey = (highKey === 'def' || secondHighKey === 'def') ? 'spd' : 'def';
        }
        
        statAdvice = `32 ${nameMap[highKey]} / 32 ${nameMap[secondHighKey]} / 2 ${nameMap[thirdKey]} (Totale: 66 SP per Champions)`;
      }

      const compDetails = getCompetitiveDetails(data.name, data);

      // Preload translations for ALL items and moves we are about to display
      await preloadTranslations({
        moves: compDetails.moves,
        items: compDetails.items
      });

      setSelectedPk({
        name: data.name,
        displayName: itDisplayName,
        sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
        types: data.types.map(t => t.type.name),
        description: itDesc,
        stats,
        abilities,
        evolutionChain,
        analysis: {
          role,
          natureAdvice,
          statAdvice,
          items: compDetails.items.map(translateItem).join(', '),
          moves: compDetails.moves.map(translateMove).join(', '),
          synergies: compDetails.synergies
        }
      });
    } catch (err) {
      console.error("Failed to load pokemon details:", err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          Enciclopedia Pokémon
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          Cerca qualsiasi Pokémon esistente per analizzarne le statistiche di base, le abilità e scoprire le migliori build di allenamento per il gioco.
        </p>
      </div>

      {/* Autocomplete Search input */}
      <div ref={autocompleteRef} className="relative mb-8 z-20">
        <div className="relative">
          <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input 
            type="text" 
            value={search}
            disabled={loadingList || loadingDetail}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={loadingList ? "Caricamento database Pokémon..." : "Digita il nome di un Pokémon (es: Charizard, Crinealato, Pikachu)..."}
            className="w-full bg-white border border-slate-300 focus:border-[#0075BE] focus:ring-2 focus:ring-[#0075BE]/20 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition-all shadow-sm placeholder:text-slate-400 disabled:opacity-60"
          />
        </div>

        {/* Suggestions list */}
        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl z-30 max-h-[320px] overflow-y-auto">
            {suggestions.map(p => (
              <div 
                key={p.name}
                onClick={() => selectPokemon(p)}
                className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center p-0.5">
                  <img 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} 
                    alt={p.displayName} 
                    className="max-h-full max-w-full object-contain" 
                  />
                </div>
                <span className="text-sm font-bold text-slate-805">{p.displayName}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main details viewer */}
      {loadingDetail ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 flex flex-col justify-center items-center shadow-sm h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0075BE] border-t-transparent mb-4"></div>
          <span className="text-sm font-bold text-slate-500">Recupero dettagli in tempo reale da PokéAPI v2...</span>
        </div>
      ) : selectedPk ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left profile card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#FFCF11]"></div>
              
              <div className="w-44 h-44 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-center p-2 mb-4">
                <img src={selectedPk.sprite} alt={selectedPk.displayName} className="max-h-full max-w-full object-contain" />
              </div>

              <h2 className="text-2xl font-black text-slate-850 tracking-tight mb-2">{selectedPk.displayName}</h2>
              
              <div className="flex gap-1.5 mb-4">
                {selectedPk.types.map(t => (
                  <span key={t} className={`text-xs font-black px-3 py-1 rounded-lg border uppercase shadow-sm ${getTypeBadgeClass(t)}`}>
                    {translateType(t)}
                  </span>
                ))}
              </div>

              <p className="text-xs text-slate-500 font-semibold leading-relaxed text-center bg-slate-50 border border-slate-100 rounded-2xl p-4">
                {selectedPk.description}
              </p>
            </div>

            {/* Evolutions chain list */}
            {selectedPk.evolutionChain.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Linea Evolutiva</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedPk.evolutionChain.map((evo, index) => (
                    <React.Fragment key={index}>
                      <span className="text-xs font-black bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                        {evo}
                      </span>
                      {index < selectedPk.evolutionChain.length - 1 && (
                        <span className="text-slate-400 font-bold text-sm">➔</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right analysis card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats chart */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-4">
                Statistiche di Base
              </h3>
              
              <div className="space-y-3.5">
                {Object.entries({
                  'Punti Salute (PS)': { val: selectedPk.stats.hp, max: 255, color: 'bg-emerald-500' },
                  'Attacco': { val: selectedPk.stats.atk, max: 190, color: 'bg-red-500' },
                  'Difesa': { val: selectedPk.stats.def, max: 230, color: 'bg-blue-500' },
                  'Attacco Speciale': { val: selectedPk.stats.spa, max: 194, color: 'bg-indigo-500' },
                  'Difesa Speciale': { val: selectedPk.stats.spd, max: 230, color: 'bg-purple-500' },
                  'Velocità': { val: selectedPk.stats.spe, max: 200, color: 'bg-yellow-500' }
                }).map(([name, stat]) => {
                  const percent = Math.min((stat.val / stat.max) * 100, 100);
                  return (
                    <div key={name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-500 w-36">{name}</span>
                      <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1 h-3 bg-slate-100 rounded-full border overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${stat.color}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-black text-slate-800 w-8 text-right">{stat.val}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Champions training Advice */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-4">
                Scheda di Addestramento Consigliata (Champions)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <span className="text-[10px] text-slate-450 block font-black uppercase tracking-wider mb-1">Natura Consigliata:</span>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed">{selectedPk.analysis.natureAdvice}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <span className="text-[10px] text-slate-450 block font-black uppercase tracking-wider mb-1">Allenamento Punti (EVs):</span>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed">{selectedPk.analysis.statAdvice}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 md:col-span-2">
                  <span className="text-[10px] text-slate-450 block font-black uppercase tracking-wider mb-1">Ruolo Tattico:</span>
                  <p className="text-xs text-[#0075BE] font-black leading-relaxed">{selectedPk.analysis.role}</p>
                </div>
              </div>
            </div>

            {/* Competitive analysis advice */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-4">
                Dettagli Competitivi (Champions)
              </h3>
              
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <span className="text-[10px] text-slate-450 block font-black uppercase tracking-wider mb-1">Strumenti Consigliati:</span>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed">{selectedPk.analysis.items}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <span className="text-[10px] text-slate-450 block font-black uppercase tracking-wider mb-1">Mosse più Utilizzate:</span>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed">{selectedPk.analysis.moves}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <span className="text-[10px] text-slate-450 block font-black uppercase tracking-wider mb-1">Sinergie Consigliate:</span>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed">{selectedPk.analysis.synergies}</p>
                </div>
              </div>
            </div>

            {/* Abilities description */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-4">Abilità Pokémon</h3>
              <div className="space-y-3.5">
                {selectedPk.abilities.map((ab, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-850">{ab.name}</span>
                      {ab.isHidden && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-200 text-slate-600 uppercase">Nascosta</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">{ab.effect}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Meta Pokemon Grid */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                Pokémon più Utilizzati nel Meta (Scelta Rapida)
              </h2>
            </div>
            <p className="text-slate-500 text-xs font-semibold mb-6">
              Clicca su uno dei Pokémon dominanti del formato Regulation M-B per visualizzare istantaneamente le mosse, gli strumenti, la natura e la ripartizione dei punti SP consigliati per Pokémon Champions.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {topMetaPokemon.map(p => (
                <div 
                  key={p.name}
                  onClick={() => selectPokemon(p)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#0075BE] rounded-3xl p-4 flex flex-col items-center justify-between text-center cursor-pointer shadow-sm hover:shadow-md transition-all hover:-translate-y-1 active:scale-95 group relative overflow-hidden"
                >
                  {/* Usage percentage badge */}
                  <span className="absolute top-2 right-2 text-[9px] font-black bg-[#0075BE]/10 text-[#0075BE] px-2 py-0.5 rounded-full border border-[#0075BE]/20">
                    {p.usage}
                  </span>

                  <div className="w-20 h-20 bg-slate-50 group-hover:bg-white rounded-2xl flex items-center justify-center p-1.5 mb-3 border border-slate-100 group-hover:border-[#0075BE]/20 transition-colors mt-3">
                    <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.spriteId}.png`} 
                      alt={p.displayName} 
                      className="max-h-full max-w-full object-contain animate-fadeIn" 
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 tracking-tight group-hover:text-[#0075BE] transition-colors line-clamp-1">
                      {p.displayName}
                    </h4>
                    <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-md mt-2 border ${getTypeBadgeClass(p.type)}`}>
                      {translateType(p.type)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaStats;
