'use client';

import { useState } from 'react';
import Link from 'next/link';
import PokemonImage from './PokemonImage';
import { Search, Info, Users, ShieldAlert, Award, ChevronRight, Zap } from 'lucide-react';
import BoxBuilder from './BoxBuilder';
import { pokemonNames } from './lib/pokemonNames';

export default function DashboardClient({ formatData, allPokemonNames = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCoreTab, setActiveCoreTab] = useState('2');
  const [activeTab, setActiveTab] = useState('meta');

  const { formatName, formatCode, cores2, cores3, cores4, topTeams, pokemonList } = formatData;

  // Filter Pokemon List by search query (Top 50 + Global Search matches)
  let filteredPokemon = [];
  
  if (searchQuery.trim().length > 0) {
    const queryLower = searchQuery.toLowerCase().trim();
    const sourceList = (allPokemonNames && allPokemonNames.length > 0) ? allPokemonNames : pokemonNames;
    
    // 1. Matches in Top 50 (pokemonList)
    const topMatches = pokemonList.filter(p =>
      p.name.toLowerCase().includes(queryLower)
    );
    
    // Sort top matches: prioritize startsWith
    topMatches.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(queryLower);
      const bStarts = b.name.toLowerCase().startsWith(queryLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.rank - b.rank; // otherwise keep rank order
    });

    // 2. Matches in Global list (sourceList) that aren't in the Top 50 matching list
    const globalMatches = sourceList
      .filter(name => 
        name.toLowerCase().includes(queryLower) && 
        !pokemonList.some(p => p.name.toLowerCase() === name.toLowerCase())
      );
      
    // Sort global matches: prioritize startsWith
    globalMatches.sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(queryLower);
      const bStarts = b.toLowerCase().startsWith(queryLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.localeCompare(b);
    });

    // Take top 15 global matches
    const extraPkmList = globalMatches.slice(0, 15).map(name => ({
      rank: '-',
      name: name,
      types: [],
      winrate: '-',
      record: '-',
      isGlobal: true
    }));

    filteredPokemon = [...topMatches, ...extraPkmList];
  } else {
    filteredPokemon = pokemonList;
  }

  // Get active cores
  const activeCores = activeCoreTab === '2' ? cores2 : activeCoreTab === '3' ? cores3 : cores4;

  // Helper to format winrate color
  const getWinrateClass = (wrString) => {
    const val = parseFloat(wrString.replace('%', ''));
    if (isNaN(val)) return 'winrate-avg';
    if (val >= 52) return 'winrate-good';
    if (val <= 48) return 'winrate-bad';
    return 'winrate-avg';
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

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header animate-fade-in">
        <h1 className="dashboard-title">{formatName}</h1>
        <p className="dashboard-subtitle">
          Statistiche sul competitivo di Pokémon Champions. Dati aggiornati basati sui match online e tornei.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-container animate-fade-in" style={{ marginBottom: '28px', animationDelay: '0.05s' }}>
        <button
          className={`tab-btn ${activeTab === 'meta' ? 'active' : ''}`}
          onClick={() => setActiveTab('meta')}
          style={{ padding: '12px 24px' }}
        >
          Analisi Meta & Regolamento
        </button>
        <button
          className={`tab-btn ${activeTab === 'box' ? 'active' : ''}`}
          onClick={() => setActiveTab('box')}
          style={{ padding: '12px 24px' }}
        >
          Crea Team da Box
        </button>
      </div>

      {activeTab === 'meta' ? (
        <div className="dashboard-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {/* Left Column: Top Pokemon List */}
        <div>
          <div className="glass-card" style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: '1.4rem' }}>Top Pokémon del Meta</h2>
              <span className="badge-vgc" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
                {filteredPokemon.length} Pokémon trovati
              </span>
            </div>

            {/* Search Bar */}
            <div className="search-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Cerca un Pokémon (es. Garchomp, Whimsicott...)"
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Table */}
            <div className="pokemon-table-container">
              {filteredPokemon.length === 0 ? (
                <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <p style={{ marginBottom: '16px', fontSize: '0.95rem' }}>Nessun Pokémon corrisponde alla ricerca nella Top 50.</p>
                  {searchQuery.trim().length > 0 && (
                    <Link
                      href={`/pokemon/${encodeURIComponent(searchQuery.trim())}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                        color: '#000',
                        fontWeight: '800',
                        borderRadius: '10px',
                        fontSize: '0.88rem',
                        boxShadow: '0 4px 15px rgba(129, 140, 248, 0.25)',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <Search size={16} />
                      Analizza "{searchQuery.trim()}" nel Pokedex ↗
                    </Link>
                  )}
                </div>
              ) : (
                <table className="pokemon-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Pokémon</th>
                      <th>Tipi</th>
                      <th style={{ textAlign: 'right' }}>Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPokemon.map((p) => (
                      <tr key={p.name}>
                        <td className="rank-cell">
                          <span className={`rank-badge ${p.rank === 1 ? 'rank-1' : p.rank === 2 ? 'rank-2' : p.rank === 3 ? 'rank-3' : 'rank-other'}`}>
                            {p.rank}
                          </span>
                        </td>
                        <td>
                          <Link href={`/pokemon/${p.name}`} className="pokemon-name-cell">
                            <div className="pokemon-sprite-wrapper">
                              <PokemonImage
                                src={getPkmSprite(p.name)}
                                fallbackSrc={p.spriteUrl || `https://play.pokemonshowdown.com/sprites/dex/${p.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`}
                                alt={p.name}
                                className="pokemon-sprite-img"
                              />
                            </div>
                            <span className="pokemon-name-title">{p.name}</span>
                          </Link>
                        </td>
                        <td>
                          <div className="types-list">
                            {p.types && p.types.length > 0 ? (
                              p.types.map(t => (
                                <span key={t} className={`type-badge type-${t}`}>
                                  {typeTranslations[t] || t}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>N/D</span>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`winrate-val ${getWinrateClass(p.winrate)}`}>
                            {p.winrate}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Cores & Teams */}
        <div className="sidebar-panel">
          {/* Cores Card */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} style={{ color: 'var(--secondary)' }} />
              Core più Comuni
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Combinazioni di Pokémon che vengono usate insieme nei team vincenti.
            </p>

            <div className="tab-container">
              <button
                className={`tab-btn ${activeCoreTab === '2' ? 'active' : ''}`}
                onClick={() => setActiveCoreTab('2')}
              >
                2 Pokémon
              </button>
              <button
                className={`tab-btn ${activeCoreTab === '3' ? 'active' : ''}`}
                onClick={() => setActiveCoreTab('3')}
              >
                3 Pokémon
              </button>
              <button
                className={`tab-btn ${activeCoreTab === '4' ? 'active' : ''}`}
                onClick={() => setActiveCoreTab('4')}
              >
                4 Pokémon
              </button>
            </div>

            <div className="cores-list">
              {activeCores.length === 0 ? (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dati core non disponibili.</span>
              ) : (
                activeCores.map((core) => (
                  <div key={core.rank} className="core-row">
                    <div className="core-pokemon-group">
                      {core.pokemon.map((pkmName) => (
                        <Link href={`/pokemon/${pkmName}`} key={pkmName} className="core-pkm-icon" title={pkmName}>
                          <PokemonImage src={getPkmSprite(pkmName)} alt={pkmName} />
                        </Link>
                      ))}
                    </div>
                    <div className="core-stats">
                      <span className="core-usage-pct">{core.usage}</span>
                      <span className="core-teams-count">{core.teams} team</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Teams Card */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} style={{ color: 'var(--primary)' }} />
              Team Competitivi Recenti
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Team reali usati in tornei recenti dai migliori giocatori.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topTeams.slice(0, 5).map((team) => (
                <div
                  key={team.rank}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.015)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#fff' }}>
                      {team.author}
                    </span>
                    <span className="team-card-record" style={{ background: 'var(--success)', color: '#000', fontSize: '0.7rem', padding: '1px 6px', fontWeight: '800', borderRadius: '4px' }}>
                      {team.record}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {team.pokemon.map((pkm) => (
                      <Link href={`/pokemon/${pkm}`} key={pkm} style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={pkm}>
                        <PokemonImage src={getPkmSprite(pkm)} alt={pkm} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                      </Link>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {team.tournament}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      ) : (
        <div className="animate-fade-in">
          <BoxBuilder pokemonList={pokemonList} />
        </div>
      )}
    </div>
  );
}
