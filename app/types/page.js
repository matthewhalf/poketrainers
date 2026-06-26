import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { typeChart, allTypes } from '../lib/typechart';

export const metadata = {
  title: "Tabella Efficacia Tipi Pokémon | Poketrainers VGC",
  description: "La guida essenziale e minimal alle efficacie dei tipi Pokémon. Punti di forza, debolezze, resistenze e immunità.",
};

const typeTranslations = {
  normal: 'Normale',
  fire: 'Fuoco',
  water: 'Acqua',
  grass: 'Erba',
  electric: 'Elettro',
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
  dark: 'Buio',
  fairy: 'Folletto'
};

function getMatchups(type) {
  const defWeak = [];
  const defResist = [];
  const defImmune = [];

  const offSuper = [...typeChart[type].strong];

  // Calculate defensive profile from other attacking types
  for (const attacker of allTypes) {
    const chart = typeChart[type];
    if (chart.immune.includes(attacker)) {
      defImmune.push(attacker);
    } else if (chart.weak.includes(attacker)) {
      defWeak.push(attacker);
    } else if (chart.resist.includes(attacker)) {
      defResist.push(attacker);
    }
  }

  return {
    strong: offSuper,
    weak: defWeak,
    resist: defResist,
    immune: defImmune
  };
}

export default function TypesPage() {
  return (
    <div>
      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <Link href="/" className="nav-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Torna alla Dashboard
        </Link>
        
        <h1 className="dashboard-title" style={{ fontSize: '2.2rem', fontWeight: 800 }}>
          Tabella Efficacia Tipi
        </h1>
        <p className="dashboard-subtitle">
          Guida minimal ed essenziale alle relazioni offensive e difensive dei tipi Pokémon.
        </p>
      </div>

      <div className="glass-card" style={{ padding: '0px', overflow: 'hidden' }}>
        <div className="types-table-wrapper">
          <table className="types-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Tipo</th>
                <th style={{ width: '21.25%' }}>Super Efficace (Attacco)</th>
                <th style={{ width: '21.25%' }}>Debolezze (Difesa)</th>
                <th style={{ width: '21.25%' }}>Resistenze (Difesa)</th>
                <th style={{ width: '21.25%' }}>Immunità (Difesa)</th>
              </tr>
            </thead>
            <tbody>
              {allTypes.map(type => {
                const matchups = getMatchups(type);
                return (
                  <tr key={type}>
                    {/* Column 1: Type badge */}
                    <td>
                      <span className={`type-badge type-${type}`}>
                        {typeTranslations[type]}
                      </span>
                    </td>
                    
                    {/* Column 2: Offense (2x) */}
                    <td data-label="Super Efficace (Attacco 2x)">
                      <div className="badge-list">
                        {matchups.strong.length > 0 ? (
                          matchups.strong.map(t => (
                            <span key={t} className={`type-badge type-${t}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                              {typeTranslations[t]}
                            </span>
                          ))
                        ) : (
                          <span className="empty-badge-text">—</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Column 3: Defense Weaknesses (2x) */}
                    <td data-label="Debolezze (Difesa 2x)">
                      <div className="badge-list">
                        {matchups.weak.length > 0 ? (
                          matchups.weak.map(t => (
                            <span key={t} className={`type-badge type-${t}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                              {typeTranslations[t]}
                            </span>
                          ))
                        ) : (
                          <span className="empty-badge-text">—</span>
                        )}
                      </div>
                    </td>

                    {/* Column 4: Defense Resistances (0.5x) */}
                    <td data-label="Resistenze (Difesa 0.5x)">
                      <div className="badge-list">
                        {matchups.resist.length > 0 ? (
                          matchups.resist.map(t => (
                            <span key={t} className={`type-badge type-${t}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                              {typeTranslations[t]}
                            </span>
                          ))
                        ) : (
                          <span className="empty-badge-text">—</span>
                        )}
                      </div>
                    </td>

                    {/* Column 5: Defense Immunities (0x) */}
                    <td data-label="Immunità (Difesa 0x)">
                      <div className="badge-list">
                        {matchups.immune.length > 0 ? (
                          matchups.immune.map(t => (
                            <span key={t} className={`type-badge type-${t}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                              {typeTranslations[t]}
                            </span>
                          ))
                        ) : (
                          <span className="empty-badge-text">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
