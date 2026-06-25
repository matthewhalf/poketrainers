import Link from 'next/link';
import PokemonImage from '../../PokemonImage';
import { getPokemonMetaStats } from '../../lib/pikalytics';
import { getPokemonPokeApiData, getMoveDetails, getItemDetails, getAbilityDetails } from '../../lib/pokeapi';
import { getTypeEffectiveness } from '../../lib/typechart';
import { ArrowLeft, Swords, Sparkles, BookOpen, Heart, Activity } from 'lucide-react';

export const revalidate = 86400; // Cache details for 24h

// Helper to format EV Spread to standard Showdown format
function formatEvSpread(spread) {
  if (!spread) return 'N/D';
  const parts = spread.split('/').map(Number);
  if (parts.length !== 6) return spread;

  const stats = ['HP', 'Att', 'Dif', 'Att.Sp', 'Dif.Sp', 'Vel'];
  const evs = parts.map(v => {
    if (v === 32) return 252;
    if (v === 31) return 244;
    if (v === 30) return 236;
    if (v > 0) return Math.min(252, v * 8 - 4);
    return 0;
  });

  const formatted = [];
  for (let i = 0; i < 6; i++) {
    if (evs[i] > 0) {
      formatted.push(`${evs[i]} ${stats[i]}`);
    }
  }
  return formatted.join(' / ');
}

// Formats Pikalytics sprite names matching the CDN structure
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
  if (!name) return 'N/D';
  const normalized = name.toLowerCase();
  return natureTranslations[normalized] ? `${name} (${natureTranslations[normalized]})` : name;
};

const statTranslations = {
  hp: 'HP',
  atk: 'Attacco',
  def: 'Difesa',
  spa: 'Att. Sp.',
  spd: 'Dif. Sp.',
  spe: 'Velocità'
};

export default async function PokemonDetailsPage({ params }) {
  const { name } = await params;
  
  // Decode name if URL-encoded
  const pokemonName = decodeURIComponent(name);

  // Fetch competitive and PokeAPI data in parallel
  const [metaStats, apiData] = await Promise.all([
    getPokemonMetaStats(pokemonName, 'battledataregmbs3'),
    getPokemonPokeApiData(pokemonName)
  ]);

  // Combine types
  const finalTypes = apiData.types && apiData.types.length > 0 ? apiData.types : metaStats.types;

  // Combine Stats
  const baseStats = apiData.stats || {
    hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100
  };
  const bst = Object.values(baseStats).reduce((a, b) => a + b, 0);

  // Calculate Type Effectiveness
  const typeEffectiveness = getTypeEffectiveness(finalTypes);

  // Fetch descriptions in parallel for Top 6 moves, Top 4 items, Top 2 abilities
  const topMoves = metaStats.moves && metaStats.moves.length > 0
    ? metaStats.moves.slice(0, 6)
    : (apiData.moves || []).slice(0, 6).map(m => ({ name: m, percent: 0 }));
    
  const topItems = metaStats.items.slice(0, 4);
  
  const topAbilities = metaStats.abilities && metaStats.abilities.length > 0
    ? metaStats.abilities.slice(0, 2)
    : (apiData.abilities || []).slice(0, 2).map(a => ({ name: a, percent: 0 }));

  const [movesWithDetails, itemsWithDetails, abilitiesWithDetails] = await Promise.all([
    Promise.all(topMoves.map(async (m) => {
      const details = await getMoveDetails(m.name);
      return { ...m, ...details };
    })),
    Promise.all(topItems.map(async (i) => {
      const details = await getItemDetails(i.name);
      return { ...i, ...details };
    })),
    Promise.all(topAbilities.map(async (a) => {
      const details = await getAbilityDetails(a.name);
      return { ...a, ...details };
    }))
  ]);

  // Translate featured teams set info (item, ability, moves) to Italian
  if (metaStats.featuredTeams && metaStats.featuredTeams.length > 0) {
    await Promise.all(
      metaStats.featuredTeams.map(async (team) => {
        if (team.set) {
          const promises = [];
          
          if (team.set.item && team.set.item !== 'N/D') {
            promises.push(
              getItemDetails(team.set.item).then((details) => {
                if (details && details.displayName) {
                  team.set.itemDisplayName = details.displayName;
                }
              })
            );
          }
          
          if (team.set.ability && team.set.ability !== 'N/D') {
            promises.push(
              getAbilityDetails(team.set.ability).then((details) => {
                if (details && details.displayName) {
                  team.set.abilityDisplayName = details.displayName;
                }
              })
            );
          }
          
          if (team.set.moves && team.set.moves.length > 0) {
            team.set.movesDisplayNames = [...team.set.moves];
            team.set.moves.forEach((move, mIdx) => {
              promises.push(
                getMoveDetails(move).then((details) => {
                  if (details && details.displayName) {
                    team.set.movesDisplayNames[mIdx] = details.displayName;
                  }
                })
              );
            });
          }
          
          await Promise.all(promises);
        }
      })
    );
  }

  return (
    <div className="pokemon-details-wrapper">
      {/* Back button */}
      <Link href="/" className="nav-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '28px', fontSize: '0.95rem' }}>
        <ArrowLeft size={16} />
        Torna alla Dashboard
      </Link>

      {/* Main Profile Header */}
      <div className="pokemon-profile-header">
        <div className="profile-artwork-box">
          <PokemonImage
            src={apiData.artworkUrl}
            fallbackSrc={getPkmSprite(pokemonName)}
            alt={pokemonName}
            className="profile-artwork"
          />
        </div>
        <div className="profile-info">
          <div className="profile-meta-row">
            <h1 className="profile-name">{pokemonName}</h1>
            <div className="profile-badge-group">
              <span className="profile-winrate">Tasso Vittorie: {metaStats.winrate}</span>
              <span className="profile-rank">Classifica: #{metaStats.rank}</span>
            </div>
          </div>
          <div className="types-list" style={{ marginBottom: '8px' }}>
            {finalTypes.map(t => (
              <span key={t} className={`type-badge type-${t}`} style={{ fontSize: '0.8rem', padding: '6px 16px' }}>
                {typeTranslations[t] || t}
              </span>
            ))}
          </div>
          <p className="profile-desc">
            {apiData.description || `${pokemonName} è attualmente al Rank #${metaStats.rank} nel metagame competitivo di Pokémon Champions Regulation Set M-B, registrando un tasso di vittoria globale del ${metaStats.winrate}.`}
          </p>
        </div>
      </div>

      {/* Stats & Moves Details Grid */}
      <div className="details-grid">
        {/* Column 1: Stats & Type Effectiveness */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Base Stats Panel */}
          <div className="glass-card bstats-panel">
            <h2 className="bstats-title">
              <span>Statistiche Base (PokeAPI)</span>
              <span className="bst-sum">Totale: {bst}</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(baseStats).map(([stat, val]) => {
                const maxVal = stat === 'hp' ? 255 : 190; // Approx max values
                const pct = (val / maxVal) * 100;
                return (
                  <div key={stat} className="stat-row">
                    <span className="stat-label">{statTranslations[stat] || stat.toUpperCase()}</span>
                    <span className="stat-val">{val}</span>
                    <div className="progress-bar-container">
                      <div
                        className={`progress-bar-fill bst-fill-${stat}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
              <Activity size={16} style={{ flexShrink: 0, color: 'var(--primary)' }} />
              <span>
                Le statistiche base influenzano il ruolo del Pokémon. Un alto attacco/attacco speciale indica un attaccante, mentre difese alte indicano un ruolo difensivo o di supporto.
              </span>
            </div>
          </div>

          {/* Type Effectiveness Panel */}
          <div className="glass-card">
            <h2 className="detail-section-title">Efficacia dei Tipi</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Offense */}
              <div>
                <h3 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                  Forte in Attacco (STAB Danni x2)
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {typeEffectiveness.offensiveStrengths.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nessuno</span>
                  ) : (
                    typeEffectiveness.offensiveStrengths.map(t => (
                      <span key={t} className={`type-badge type-${t}`} style={{ fontSize: '0.68rem', padding: '2px 10px' }}>
                        {typeTranslations[t] || t}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Weaknesses */}
              <div>
                <h3 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                  Debolezze in Difesa (Danni subiti)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {typeEffectiveness.weak4x.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.15)', padding: '2px 6px', borderRadius: '4px', minWidth: '32px', textAlign: 'center' }}>x4</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {typeEffectiveness.weak4x.map(t => (
                          <span key={t} className={`type-badge type-${t}`} style={{ fontSize: '0.68rem', padding: '2px 10px' }}>
                            {typeTranslations[t] || t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {typeEffectiveness.weak2x.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 6px', borderRadius: '4px', minWidth: '32px', textAlign: 'center' }}>x2</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {typeEffectiveness.weak2x.map(t => (
                          <span key={t} className={`type-badge type-${t}`} style={{ fontSize: '0.68rem', padding: '2px 10px' }}>
                            {typeTranslations[t] || t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {typeEffectiveness.weak4x.length === 0 && typeEffectiveness.weak2x.length === 0 && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nessuna debolezza (ottimo profilo difensivo!)</span>
                  )}
                </div>
              </div>

              {/* Resistances & Immunities */}
              <div>
                <h3 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                  Resistenze e Immunità (Danni subiti)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {typeEffectiveness.immune.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '4px', minWidth: '32px', textAlign: 'center' }}>x0</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {typeEffectiveness.immune.map(t => (
                          <span key={t} className={`type-badge type-${t}`} style={{ fontSize: '0.68rem', padding: '2px 10px' }}>
                            {typeTranslations[t] || t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(typeEffectiveness.resist05x.length > 0 || typeEffectiveness.resist025x.length > 0) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#a5b4fc', background: 'rgba(165, 180, 252, 0.15)', padding: '2px 6px', borderRadius: '4px', minWidth: '32px', textAlign: 'center' }}>Resist</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {typeEffectiveness.resist025x.map(t => (
                          <span key={t} className={`type-badge type-${t}`} style={{ fontSize: '0.68rem', padding: '2px 10px', border: '1px solid rgba(255,255,255,0.2)' }} title="Resistenza doppia (danno x0.25)">
                            {typeTranslations[t] || t} (x0.25)
                          </span>
                        ))}
                        {typeEffectiveness.resist05x.map(t => (
                          <span key={t} className={`type-badge type-${t}`} style={{ fontSize: '0.68rem', padding: '2px 10px' }} title="Resistenza semplice (danno x0.5)">
                            {typeTranslations[t] || t} (x0.5)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {typeEffectiveness.immune.length === 0 && typeEffectiveness.resist05x.length === 0 && typeEffectiveness.resist025x.length === 0 && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nessuna resistenza</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Common Moves Panel */}
        <div className="glass-card">
          <h2 className="detail-section-title">Mosse più Usate</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {movesWithDetails.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nessuna mossa registrata.</div>
            ) : (
              movesWithDetails.map((m) => (
                <div key={m.name} className="stat-entry-row tooltip-trigger">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`type-badge type-${m.type || 'normal'}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                      {typeTranslations[m.type] || m.type || 'N/D'}
                    </span>
                    <span className="stat-entry-name">{m.displayName || m.name}</span>
                  </div>
                  {m.percent > 0 && <span className="stat-entry-pct">{m.percent}%</span>}

                  {/* Tooltip Content */}
                  <div className="tooltip-content">
                    <div style={{ fontWeight: '700', marginBottom: '4px', color: '#fff' }}>{m.displayName || m.name}</div>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', fontSize: '0.72rem', color: 'var(--primary)' }}>
                      {m.power ? <span>Potenza: {m.power}</span> : null}
                      {m.accuracy ? <span>Precisione: {m.accuracy}%</span> : null}
                      {m.pp ? <span>PP: {m.pp}</span> : null}
                    </div>
                    <div>{m.desc || 'Informazioni sulla mossa non disponibili.'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Items, Abilities, Natures, Spreads Grid */}
      <div className="details-grid">
        {/* Held Items & Abilities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Held Items */}
          <div className="glass-card">
            <h2 className="detail-section-title">Strumenti (Held Items)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {itemsWithDetails.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nessuno strumento registrato.</div>
              ) : (
                itemsWithDetails.map((i) => (
                  <div key={i.name} className="stat-entry-row tooltip-trigger">
                    <span className="stat-entry-name">{i.displayName || i.name}</span>
                    {i.percent > 0 && <span className="stat-entry-pct">{i.percent}%</span>}

                    {/* Tooltip Content */}
                    <div className="tooltip-content">
                      <div style={{ fontWeight: '700', marginBottom: '4px', color: '#fff' }}>{i.displayName || i.name}</div>
                      <div>{i.desc || 'Dettagli dello strumento non disponibili.'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Abilities */}
          <div className="glass-card">
            <h2 className="detail-section-title">Abilità più Usate</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {abilitiesWithDetails.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nessuna abilità registrata.</div>
              ) : (
                abilitiesWithDetails.map((a) => (
                  <div key={a.name} className="stat-entry-row tooltip-trigger">
                    <span className="stat-entry-name">{a.displayName || a.name}</span>
                    {a.percent > 0 && <span className="stat-entry-pct">{a.percent}%</span>}

                    {/* Tooltip Content */}
                    <div className="tooltip-content">
                      <div style={{ fontWeight: '700', marginBottom: '4px', color: '#fff' }}>{a.displayName || a.name}</div>
                      <div>{a.desc || 'Dettagli dell\'abilità non disponibili.'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Natures & EV Spreads */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Natures */}
          <div className="glass-card">
            <h2 className="detail-section-title">Nature Consigliate</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {metaStats.natures.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nessuna natura registrata.</div>
              ) : (
                metaStats.natures.slice(0, 4).map((n) => (
                  <div key={n.name} className="stat-entry-row">
                    <span className="stat-entry-name">{getNatureTranslation(n.name)}</span>
                    <span className="stat-entry-pct">{n.percent}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* EV Spreads */}
          <div className="glass-card">
            <h2 className="detail-section-title">Distribuzioni EV (EV Spreads)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {metaStats.evSpreads.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nessun EV Spread registrato.</div>
              ) : (
                metaStats.evSpreads.slice(0, 4).map((s) => (
                  <div key={s.spread} className="stat-entry-row tooltip-trigger">
                    <div>
                      <div className="stat-entry-name" style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{s.spread}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {formatEvSpread(s.spread)}
                      </div>
                    </div>
                    <span className="stat-entry-pct">{s.percent}%</span>

                    {/* Tooltip Content */}
                    <div className="tooltip-content">
                      <div style={{ fontWeight: '700', marginBottom: '4px', color: '#fff' }}>Spiegazione EV Spread</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--primary)', marginBottom: '8px' }}>
                        Ordine: HP / Attacco / Difesa / Att. Sp. / Dif. Sp. / Velocità
                      </div>
                      <p>
                        Rappresenta l'assegnazione degli Effort Values (EV) nel gioco. Gli EV aumentano i punti statistici del Pokémon. Consigliamo ai principianti di copiare lo spread più comune ({metaStats.evSpreads[0]?.spread}).
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Best Teammates */}
      <div className="glass-card animate-fade-in" style={{ marginBottom: '40px' }}>
        <h2 className="detail-section-title">Migliori Alleati (Sinergie)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Pokémon usati più di frequente nello stesso team. Clicca su uno di essi per vederne le statistiche.
        </p>
        <div className="teammate-grid-card">
          {metaStats.teammates.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Dati alleati non disponibili.</div>
          ) : (
            metaStats.teammates.map((t) => (
              <Link href={`/pokemon/${t.name}`} key={t.name} className="teammate-card">
                <div className="teammate-sprite">
                  <PokemonImage src={getPkmSprite(t.name)} alt={t.name} />
                </div>
                <div className="teammate-info">
                  <span className="teammate-name">{t.name}</span>
                  <span className="teammate-rank">Rank Sinergia #{t.rank}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Featured Teams with this Pokemon */}
      <div className="glass-card animate-fade-in">
        <h2 className="detail-section-title">Squadre di Esempio con {pokemonName}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
          Prendi ispirazione da queste squadre reali per costruire il tuo team.
        </p>

        <div className="teams-grid">
          {metaStats.featuredTeams.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '20px 0' }}>
              Nessuna squadra di esempio registrata per questo Pokémon.
            </div>
          ) : (
            metaStats.featuredTeams.map((team, idx) => (
              <div key={idx} className="team-container-card">
                <div className="team-card-header">
                  <span className="team-card-author">{team.author}</span>
                  <div className="team-card-meta">
                    <span className="team-card-record">{team.record}</span>
                    <span className="team-card-event">{team.event}</span>
                  </div>
                </div>
                <div className="team-pokemon-grid">
                  {team.pokemon.map((member, mIdx) => {
                    const isTarget = member.toLowerCase() === pokemonName.toLowerCase();
                    return (
                      <div
                        key={mIdx}
                        className="team-pkm-member"
                        style={isTarget ? { background: 'rgba(129, 140, 248, 0.08)', boxShadow: 'inset 0 0 10px rgba(129, 140, 248, 0.15)' } : {}}
                      >
                        <Link href={`/pokemon/${member}`} className="team-pkm-sprite" title={member}>
                          <PokemonImage src={getPkmSprite(member)} alt={member} />
                        </Link>
                        <span className="team-pkm-name">{member}</span>

                        {isTarget ? (
                          <div className="team-pkm-setinfo">
                            <div>
                              <span className="team-pkm-label">Strumento:</span> <span className="team-pkm-val" title={team.set.item}>{team.set.itemDisplayName || team.set.item || 'N/D'}</span>
                            </div>
                            <div>
                              <span className="team-pkm-label">Abilità:</span> <span className="team-pkm-val" title={team.set.ability}>{team.set.abilityDisplayName || team.set.ability || 'N/D'}</span>
                            </div>
                            <div className="team-pkm-moves">
                              {(team.set.movesDisplayNames || team.set.moves).map((mv, mvIdx) => {
                                const origMove = team.set.moves[mvIdx] || mv;
                                return (
                                  <span key={mvIdx} className="team-pkm-move" title={origMove}>{mv}</span>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            <Link href={`/pokemon/${member}`} style={{ color: 'var(--primary)' }}>Vedi Build ↗</Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
