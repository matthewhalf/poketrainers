"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { metaTeams } from '@/data/meta_teams';
import { 
  translateAbility, 
  translateItem, 
  translateMove, 
  translateNature, 
  translateType, 
  preloadTranslations 
} from '@/data/translator';
import { FaUsers } from 'react-icons/fa';

// Type mapping helper for styling badges (light versions)
const getTypeBadgeClass = (type) => {
  switch (type.toLowerCase()) {
    case 'normal': return 'bg-neutral-100 text-neutral-655 border-neutral-300';
    case 'fire': return 'bg-orange-100 text-orange-650 border-orange-300';
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

const getPokeApiSlug = (name) => {
  if (!name) return '';
  const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  // Form-specific API endpoint mappings
  if (slug === 'ogerpon-wellspring') return 'ogerpon-wellspring-mask';
  if (slug === 'ogerpon-hearthflame') return 'ogerpon-hearthflame-mask';
  if (slug === 'ogerpon-cornerstone') return 'ogerpon-cornerstone-mask';
  if (slug === 'tornadus') return 'tornadus-incarnate';
  if (slug === 'landorus') return 'landorus-incarnate';
  if (slug === 'thundurus') return 'thundurus-incarnate';
  if (slug === 'urshifu') return 'urshifu-single-strike';
  if (slug === 'zamazenta-crowned') return 'zamazenta-crowned';
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

const getRecommendedNature = (baseStats) => {
  if (!baseStats) return 'Seria (Neutra)';
  const stats = {
    hp: baseStats.hp || 0,
    atk: baseStats.atk || 0,
    def: baseStats.def || 0,
    spa: baseStats.spa || 0,
    spd: baseStats.spd || 0,
    spe: baseStats.spe || 0
  };
  
  if (stats.atk > 95 && stats.spe > 85) {
    return 'Allegra (+Velocità, -Att. Sp.) o Decisa (+Attacco, -Att. Sp.)';
  }
  if (stats.spa > 95 && stats.spe > 85) {
    return 'Timida (+Velocità, -Attacco) o Modesta (+Att. Sp., -Attacco)';
  }
  if (stats.atk > 105 && stats.hp > 80) {
    return 'Decisa (+Attacco, -Att. Sp.) o Audace (+Attacco, -Velocità)';
  }
  if (stats.spa > 105 && stats.hp > 80) {
    return 'Modesta (+Att. Sp., -Attacco) o Quieta (+Att. Sp., -Velocità)';
  }
  if (stats.hp > 90 && (stats.def > 90 || stats.spd > 90)) {
    if (stats.def > stats.spd) {
      return 'Sicura (+Difesa, -Attacco) o Scaltra (+Difesa, -Att. Sp.)';
    } else {
      return 'Calma (+Dif. Sp., -Attacco) o Cautela (+Dif. Sp., -Att. Sp.)';
    }
  }
  if (stats.spe > 100 && (stats.atk > 80 || stats.spa > 80)) {
    if (stats.atk > stats.spa) {
      return 'Allegra (+Velocità, -Att. Sp.)';
    } else {
      return 'Timida (+Velocità, -Attacco)';
    }
  }
  return 'Seria (Neutra)';
};

const getEvDescription = (spreadStr, baseStats) => {
  if (!spreadStr || spreadStr === 'Bilanciati') {
    if (baseStats) {
      const stats = {
        HP: baseStats.hp || 0,
        Atk: baseStats.atk || 0,
        Def: baseStats.def || 0,
        SpA: baseStats.spa || 0,
        SpD: baseStats.spd || 0,
        Spe: baseStats.spe || 0
      };
      
      // Propose stats based on the base stats of the Pokémon
      // 1. Sweeper Fisico (Atk e Spe alti)
      if (stats.Atk > 95 && stats.Spe > 80) {
        return '32 Attacco / 32 Velocità / 2 PS (Totale: 66 SP)';
      }
      // 2. Sweeper Speciale (SpA e Spe alti)
      if (stats.SpA > 95 && stats.Spe > 80) {
        return '32 Att. Sp. / 32 Velocità / 2 PS (Totale: 66 SP)';
      }
      // 3. Bulky Fisico Attaccante (es: Calyrex-Ice)
      if (stats.Atk > 105 && stats.HP > 80) {
        return '32 PS / 32 Attacco / 2 Difesa (Totale: 66 SP)';
      }
      // 4. Bulky Speciale Attaccante (es: Ursaluna-Bloodmoon)
      if (stats.SpA > 105 && stats.HP > 80) {
        return '32 PS / 32 Att. Sp. / 2 Dif. Sp. (Totale: 66 SP)';
      }
      // 5. Tank Fisico
      if (stats.Def > stats.SpD) {
        return '32 PS / 32 Difesa / 2 Dif. Sp. (Totale: 66 SP)';
      }
      // 6. Tank Speciale / Supporto
      return '32 PS / 32 Dif. Sp. / 2 Difesa (Totale: 66 SP)';
    }
    return '11 PS / 11 Attacco / 11 Difesa / 11 Att. Sp. / 11 Dif. Sp. / 11 Velocità (66 SP Bilanciati)';
  }
  
  const evs = { HP: 0, Atk: 0, Def: 0, SpA: 0, SpD: 0, Spe: 0 };
  const parts = spreadStr.split('/');
  parts.forEach(p => {
    const trimmed = p.trim();
    const subParts = trimmed.split(/\s+/);
    if (subParts.length === 2) {
      const val = parseInt(subParts[0]) || 0;
      const stat = subParts[1].trim();
      if (evs[stat] !== undefined) {
        evs[stat] = val;
      }
    }
  });

  return convertEvsToSp(evs);
};

const parseShowdownSet = (exportText) => {
  if (!exportText) return [];
  const paragraphs = exportText.split('\n\n').filter(p => p.trim());
  return paragraphs.map(para => {
    const lines = para.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;
    
    let nameLine = lines[0];
    let name = nameLine;
    let item = 'Nessuno';
    if (nameLine.includes('@')) {
      const parts = nameLine.split('@');
      name = parts[0].trim();
      item = parts[1].trim();
    }
    
    let ability = 'Standard';
    let evs = 'Bilanciati';
    let nature = 'Seria';
    const moves = [];
    
    lines.forEach(line => {
      if (line.startsWith('Ability:')) {
        ability = line.replace('Ability:', '').trim();
      } else if (line.startsWith('EVs:')) {
        evs = line.replace('EVs:', '').trim();
      } else if (line.includes('Nature')) {
        nature = line.replace('Nature', '').trim();
      } else if (line.startsWith('-')) {
        moves.push(line.replace('-', '').trim());
      }
    });
    
    return { name, item, ability, evs, nature, moves };
  }).filter(Boolean);
};

const teamStrategies = {
  "calyrex-ice reg m-b balance": {
    leads: "Incineroar + Amoonguss (Controllo e Disturbo) oppure Pelipper + Urshifu (Pressione sotto pioggia).",
    combo: "Incineroar usa Bruciapelo + Monito per ridurre l'attacco avversario, Amoonguss attira gli attacchi con Polverabbia, permettendo a Calyrex-Ghiaccio di attivare Distortozona (Trick Room) in sicurezza.",
    tip: "Usa Calyrex come tua condizione di vittoria principale. Una volta attiva la Distortozona, Lancia Glaciale infligge danni devastanti a entrambi gli avversari contemporaneamente."
  },
  "koraidon sun offense": {
    leads: "Whimsicott + Koraidon (Ventoincoda immediato) oppure Koraidon + Chi-Yu (Pressione offensiva estrema).",
    combo: "Koraidon attiva il Sole. Flutter Mane e Raging Bolt guadagnano un potenziamento immediato del 30% alle loro statistiche principali (Velocità o Attacco Speciale) grazie all'abilità Paleosintesi.",
    tip: "Usa Chi-Yu in combinazione con Koraidon per ridurre la Difesa Speciale nemica del 25% (grazie a Turbinio di Rovina), massimizzando i danni speciali di Flutter Mane."
  },
  "miraidon e-terrain speed control": {
    leads: "Miraidon + Farigiraf (Protezione da mosse con priorità) oppure Miraidon + Iron Bundle (Velocità estrema).",
    combo: "Miraidon attiva il Campo Elettrico. Iron Hands e Iron Moth guadagnano un incremento immediato alle statistiche grazie a Carica Quark, rendendoli tank formidabili.",
    tip: "Farigiraf impedisce mosse come Bruciapelo (Fake Out) o Extrarapido grazie a Coda Armatura. Usa questo vantaggio per sferrare attacchi Elettro devastanti con Miraidon."
  },
  "zamazenta crowned balance": {
    leads: "Zamazenta + Chien-Pao (Aumento dei danni fisici) oppure Rillaboom + Entei (Pressione di priorità).",
    combo: "Zamazenta aumenta la Difesa con Scudo Saldo e usa Ferroforza (Iron Defense). Successivamente sferra Body Press che infligge ingenti danni fisici potenziati dall'abilità Spada della Rovina di Chien-Pao.",
    tip: "Entei è immune a Bruciapelo e alla diminuzione delle statistiche (grazie a Fuocodentro). Usalo per minacciare i tipi Erba avversari e coprire le debolezze di Zamazenta."
  },
  "calyrex-shadow ghost offense": {
    leads: "Whimsicott + Calyrex-Shadow (Ventoincoda istantaneo per forzare danni immediati).",
    combo: "L'abilità Turbinio di Rovina di Chi-Yu riduce la Difesa Speciale avversaria del 25%, permettendo alle Schegge Astrali (Astral Barrage) di Calyrex-Shadow di spazzare via il team avversario.",
    tip: "Usa Monito di Incineroar per far entrare in sicurezza i tuoi Pokémon offensivi fragili, riducendo l'attacco speciale e fisico dei nemici."
  },
  "kyogre rain offense": {
    leads: "Tornadus + Kyogre (Pressione meteo immediata) oppure Tornadus + Archaludon (Pressione difensiva e velocità).",
    combo: "Tornadus imposta la pioggia. Sotto pioggia, Elettroraggio di Archaludon si carica in un solo turno aumentando il suo Attacco Speciale, mentre Kyogre infligge ingenti danni ad area con Zampillo.",
    tip: "Usa Amoonguss per reindirizzare gli attacchi Elettro o Erba nemici diretti a Kyogre, addormentando le minacce chiave con Spora."
  },
  "terapagos stellar balance": {
    leads: "Incineroar + Rillaboom (Doppio controllo di Bruciapelo per guadagnare turni gratuiti) oppure Tornadus + Terapagos.",
    combo: "Terapagos usa Calmamente per aumentare le sue statistiche. Una volta Teracristallizzato in forma Stellare, Terascoppio Stellare (Tera Starstorm) colpisce entrambi i nemici superando ogni resistenza.",
    tip: "Sfrutta l'abilità Teramorfosi (Tera Shift) all'entrata in campo per cambiare il meteo e i campi attivi, vanificando le strategie basate sul Sole o Campo Elettrico avversari."
  },
  "gholdengo + great tusk hazard stack": {
    leads: "Gliscor oppure Great Tusk per piazzare subito Levitoroccia (Stealth Rock).",
    combo: "Gholdengo ha l'abilità Corpo Dorato che blocca tutte le mosse di stato avversarie, comprese quelle per rimuovere le trappole dal campo (come Scacciabruma).",
    tip: "Accumula danni passivi forzando lo switch dell'avversario tramite Boato o mosse di disturbo, mentre Great Tusk rimuove le trappole dal tuo lato con Rapigiro."
  }
};

const MetaTeams = ({ format, setFormat }) => {
  const [selectedPokemon, setSelectedPokemon] = useState({}); // { [teamIdx]: selectedPkIdx }
  const [activePanels, setActivePanels] = useState({}); // { [teamIdx]: 'build' | 'strategy' }
  const [pokemonDetails, setPokemonDetails] = useState({}); // Cache dynamic details from PokéAPI
  const [loadingTeams, setLoadingTeams] = useState(false);

  const currentTeams = metaTeams[format] || [];

  // Fetch basic details (sprites and types) from PokéAPI v2 for the active format's teams
  useEffect(() => {
    let active = true;
    const fetchDetails = async () => {
      setLoadingTeams(true);
      const namesToFetch = [];
      currentTeams.forEach(team => {
        team.pokemon.forEach(name => {
          if (!pokemonDetails[name] && !namesToFetch.includes(name)) {
            namesToFetch.push(name);
          }
        });
      });

      // Gather all abilities, items, and moves to preload translations
      const movesToPreload = [];
      const itemsToPreload = [];
      const abilitiesToPreload = [];
      const naturesToPreload = [];

      currentTeams.forEach(team => {
        const parsedSets = parseShowdownSet(team.showdownExport);
        parsedSets.forEach(set => {
          if (set.ability) abilitiesToPreload.push(set.ability);
          if (set.item) itemsToPreload.push(set.item);
          if (set.nature) naturesToPreload.push(set.nature);
          if (set.moves) movesToPreload.push(...set.moves);
        });
      });

      const tempCache = { ...pokemonDetails };
      try {
        await Promise.all([
          ...namesToFetch.map(async (name) => {
            try {
              const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${getPokeApiSlug(name)}`);
              const data = res.data;

              let displayName = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              try {
                const speciesRes = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${data.species.name}`);
                const itName = speciesRes.data.names.find(n => n.language.name === 'it')?.name;
                if (itName) displayName = itName;
              } catch (e) {}

              tempCache[name] = {
                sprite: data.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
                displayName,
                types: data.types.map(t => t.type.name),
                stats: {
                  hp: data.stats[0].base_stat,
                  atk: data.stats[1].base_stat,
                  def: data.stats[2].base_stat,
                  spa: data.stats[3].base_stat,
                  spd: data.stats[4].base_stat,
                  spe: data.stats[5].base_stat
                }
              };
            } catch (e) {
              console.error(`Failed to load ${name} details:`, e.message);
              tempCache[name] = {
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png`,
                displayName: name,
                types: ['normal']
              };
            }
          }),
          preloadTranslations({
            abilities: abilitiesToPreload,
            items: itemsToPreload,
            moves: movesToPreload,
            natures: naturesToPreload
          })
        ]);
        if (active) {
          setPokemonDetails(tempCache);
        }
      } catch (err) {
        console.error("Error batch loading team stats and translations:", err.message);
      } finally {
        if (active) {
          setLoadingTeams(false);
        }
      }
    };

    fetchDetails();
    return () => { active = false; };
  }, [format]);

  const getPkInfo = (name) => {
    return pokemonDetails[name.toLowerCase()] || {
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png`,
      displayName: name,
      types: ['???']
    };
  };

  const formatNames = {
    gen9vgc2026regi: 'VGC 2026 - Reg M-B (Doppio)',
    gen9ou: 'Overused (OU - Singolo)'
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Squadre Consigliate nel Meta
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Esplora le migliori combinazioni per capire quali Pokémon ingaggiare, le loro build ideali ed i consigli per giocarli al meglio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:inline">Formato:</label>
          <select 
            value={format} 
            onChange={(e) => setFormat(e.target.value)}
            className="bg-white border border-slate-300 focus:border-[#0075BE] rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none cursor-pointer hover:bg-slate-55 transition-colors shadow-sm"
          >
            {Object.entries(formatNames).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {loadingTeams ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 flex flex-col justify-center items-center shadow-sm h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0075BE] border-t-transparent mb-4"></div>
          <span className="text-sm font-bold text-slate-500">Recupero informazioni squadre da PokéAPI v2...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {currentTeams.map((team, idx) => (
            <div 
              key={idx}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Ambient Yellow Background Accent */}
              <div className="absolute top-0 left-0 w-3 h-full bg-[#FFCF11]"></div>

              <div className="flex flex-col lg:flex-row justify-between gap-6 pl-2">
                
                {/* Left Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-850">
                      {team.name}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-1.5 leading-relaxed">
                      {team.description}
                    </p>
                  </div>

                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                    Seleziona un Pokémon per vederne la scheda di allenamento:
                  </p>

                  {/* Team Pokémon List */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                    {team.pokemon.map((name, pIdx) => {
                      const info = getPkInfo(name);
                      const isSelected = (selectedPokemon[idx] ?? 0) === pIdx;
                      return (
                        <div 
                          key={pIdx}
                          onClick={() => setSelectedPokemon({...selectedPokemon, [idx]: pIdx})}
                          className={`border rounded-2xl p-3 flex flex-col items-center text-center shadow-sm hover:scale-[1.02] transition-transform cursor-pointer ${
                            isSelected
                              ? 'border-[#0075BE] ring-2 ring-[#0075BE]/20 bg-[#0075BE]/5'
                              : 'border-slate-200/60 bg-slate-50'
                          }`}
                        >
                          <div className="w-14 h-14 flex items-center justify-center p-1 bg-white rounded-xl mb-2 border border-slate-100">
                            <img src={info.sprite} alt={name} className="max-h-full max-w-full object-contain" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 truncate w-full mb-1">
                            {info.displayName}
                          </span>
                          <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
                            {info.types.map(t => (
                              <span 
                                key={t} 
                                className={`text-[8px] font-black px-1.5 py-0.2 rounded border capitalize ${getTypeBadgeClass(t)}`}
                              >
                                {translateType(t)}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Strategy & Build Info Panel */}
                <div className="w-full lg:w-80 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between min-h-[300px]">
                  <div>
                    <div className="flex border-b border-slate-200 mb-3">
                      <button
                        onClick={() => setActivePanels({...activePanels, [idx]: 'build'})}
                        className={`flex-1 pb-2 text-xs font-bold transition-all border-b-2 ${
                          (activePanels[idx] ?? 'build') === 'build'
                            ? 'border-[#0075BE] text-[#0075BE]'
                            : 'border-transparent text-slate-400 hover:text-slate-655'
                        }`}
                      >
                        Build Allenamento
                      </button>
                      <button
                        onClick={() => setActivePanels({...activePanels, [idx]: 'strategy'})}
                        className={`flex-1 pb-2 text-xs font-bold transition-all border-b-2 ${
                          (activePanels[idx] ?? 'build') === 'strategy'
                            ? 'border-[#0075BE] text-[#0075BE]'
                            : 'border-transparent text-slate-400 hover:text-slate-655'
                        }`}
                      >
                        Guida Strategica
                      </button>
                    </div>

                    {(activePanels[idx] ?? 'build') === 'build' ? (
                      <div>
                        {/* Active Pokemon build parsed from showdownExport */}
                        {(() => {
                          const parsedSets = parseShowdownSet(team.showdownExport);
                          const activePkIdx = selectedPokemon[idx] ?? 0;
                          const activeSet = parsedSets[activePkIdx] || parsedSets[0];
                          if (!activeSet) return <p className="text-xs text-slate-400">Nessuna build disponibile.</p>;
                          
                          const pkInfo = getPkInfo(activeSet.name);
                          const itItem = translateItem(activeSet.item);
                          const itAbility = translateAbility(activeSet.ability);
                          let itNature = translateNature(activeSet.nature);
                          if (!activeSet.nature || activeSet.nature === 'Seria') {
                            itNature = getRecommendedNature(pkInfo.stats);
                          }
                          const itEvs = getEvDescription(activeSet.evs, pkInfo.stats);
                          const itMoves = activeSet.moves.map(translateMove);

                          return (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/50">
                                <img src={pkInfo.sprite} alt={activeSet.name} className="w-8 h-8 object-contain" />
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Allenamento: {pkInfo.displayName}</h4>
                              </div>
                              
                              <div className="space-y-2 text-[11px] font-medium text-slate-650">
                                <div>
                                  <span className="text-[9px] text-slate-400 font-semibold block uppercase">Abilità Consigliata:</span>
                                  <span className="text-slate-850 font-bold">{itAbility}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 font-semibold block uppercase">Strumento Consigliato:</span>
                                  <span className="text-slate-850 font-bold">{itItem}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 font-semibold block uppercase">Natura Ideale:</span>
                                  <span className="text-slate-855 font-bold">{itNature}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 font-semibold block uppercase">Distribuzione Punti (EVs):</span>
                                  <span className="text-slate-850 font-bold">{itEvs}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 font-semibold block uppercase">Mosse Consigliate:</span>
                                  <div className="flex flex-wrap gap-1 mt-0.5">
                                    {itMoves.map((m, mIdx) => (
                                      <span key={mIdx} className="bg-[#0075BE]/5 text-[#0075BE] px-1.5 py-0.5 rounded border border-[#0075BE]/10 text-[9px] font-bold">
                                        {m}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="space-y-3 text-xs leading-relaxed">
                        {(() => {
                          const stratKey = team.name.toLowerCase().trim();
                          const matchedStrat = teamStrategies[stratKey] || Object.entries(teamStrategies).find(([k]) => stratKey.includes(k))?.[1] || {
                            leads: "Qualsiasi Pokémon di supporto combinato con un attaccante principale.",
                            combo: "Combina mosse di controllo della velocità (Ventoincoda, Distortozona) per attaccare sempre per primo.",
                            tip: "Usa le debolezze di tipo a tuo vantaggio e proteggi i tuoi membri chiave con mosse di reindirizzamento (come Sonoqui/Polverabbia)."
                          };
                          return (
                            <>
                              <div>
                                <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider">Lead di Partenza:</span>
                                <p className="text-slate-700 font-semibold mt-0.5 leading-relaxed">{matchedStrat.leads}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider">Sinergie Chiave:</span>
                                <p className="text-slate-700 font-semibold mt-0.5 leading-relaxed">{matchedStrat.combo}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider">{"Consigli d'Uso:"}</span>
                                <p className="text-slate-700 font-semibold mt-0.5 leading-relaxed">{matchedStrat.tip}</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MetaTeams;
