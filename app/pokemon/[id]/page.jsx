"use client"

import axios from 'axios';
import { useEffect, useState } from 'react';

const Pokemon = ({ params }) => {
  const { id } = params;
  const [pokemon, setPokemon] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [movesInItalian, setMovesInItalian] = useState([]);

  useEffect(() => {
    if (id) {
      // Effettua la chiamata API per ottenere i dettagli del Pokémon
      axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(response => {
          setPokemon(response.data);
          return axios.get(response.data.species.url); // Ottiene l'URL della specie per ottenere la catena evolutiva
        })
        .then(response => {
          return axios.get(response.data.evolution_chain.url); // Ottiene l'URL della catena evolutiva
        })
        .then(response => {
          const evolutions = [];
          let currentEvolution = response.data.chain;
          console.log(response.data.chain)

          // Itera attraverso la catena evolutiva e raccoglie le informazioni sulle evoluzioni
          while (currentEvolution) {
            const speciesUrlParts = currentEvolution.species.url.split('/');
            const speciesId = speciesUrlParts[speciesUrlParts.length - 2];
            evolutions.push({
              name: currentEvolution.species.name,
              id: speciesId,
              evolves_to: currentEvolution.evolves_to
            });
            currentEvolution = currentEvolution.evolves_to.length > 0 ? currentEvolution.evolves_to[0] : null;
          }

          setEvolutionChain(evolutions);
        })
        .catch(error => {
          console.error("C'è stato un errore nel recupero dei dati del Pokémon!", error);
        });
    }
  }, [id]);

  useEffect(() => {
    if (pokemon) {
      // Effettua chiamate API per ottenere i nomi delle mosse in italiano
      const movePromises = pokemon.moves
        .filter(move => move.version_group_details.some(version => version.move_learn_method.name === 'level-up'))
        .map(move =>
          axios.get(move.move.url)
            .then(response => {
              const italianName = response.data.names.find(name => name.language.name === 'it');
              return {
                name: italianName ? italianName.name : move.move.name,
                version_group_details: move.version_group_details
                  .filter(version => version.move_learn_method.name === 'level-up')
              };
            })
            .catch(error => {
              console.error(`C'è stato un errore nel recupero dei dati per la mossa ${move.move.name}!`, error);
              return {
                name: move.move.name,
                version_group_details: move.version_group_details
                  .filter(version => version.move_learn_method.name === 'level-up')
              };
            })
        );

      Promise.all(movePromises).then(results => setMovesInItalian(results));
    }
  }, [pokemon]);

  if (!pokemon) return <div>Caricamento...</div>;

  // Aggrega le mosse con le loro versioni
  const movesWithVersions = movesInItalian.reduce((acc, move) => {
    if (!acc[move.name]) {
      acc[move.name] = [];
    }
    move.version_group_details.forEach(version => {
      if (version.version_group) {
        acc[move.name].push({
          version: version.version_group.name,
          level: version.level_learned_at
        });
      }
    });
    return acc;
  }, {});

  return (
    <div>
      <div className='bg-blue-800 p-10 w-fit'>
        <h1>{pokemon.name}</h1>
        <img src={pokemon.sprites.front_default} alt={pokemon.name} />
        <p>Height: {pokemon.height / 10} m</p>
        <p>Weight: {pokemon.weight / 10} kg</p>
        <p>Type: {pokemon.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
        <h2>Statistics</h2>
        <ul>
          {pokemon.stats.map(stat => (
            <li key={stat.stat.name}>
              {stat.stat.name}: {stat.base_stat}
            </li>
          ))}
        </ul>
      </div>
      
      <div className='bg-blue-300 p-10 w-fit'>
          <h2>Evolutions</h2>
          <ul className='flex gap-4'>
            {evolutionChain.map((evolution, index) => (
              <li key={evolution.id}>
                <p>{evolution.name}</p>
                <img 
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolution.id}.png`} 
                  alt={evolution.name}
                />
                {index > 0 && evolutionChain[index - 1].evolves_to.length > 0 && evolutionChain[index - 1].evolves_to[0].evolution_details.length > 0 && (
                  <div>
                    <p>Lv: {evolutionChain[index - 1].evolves_to[0].evolution_details[0].min_level}</p>
                    {evolutionChain[index - 1].evolves_to[0].evolution_details[0].item && (
                      <p>Oggetto necessario: {evolutionChain[index - 1].evolves_to[0].evolution_details[0].item.name}</p>
                    )}
                    {evolutionChain[index - 1].evolves_to[0].evolution_details[0].trigger && evolutionChain[index - 1].evolves_to[0].evolution_details[0].trigger.name === 'trade' && (
                      <p>Si evolve tramite scambio</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
      </div>


      
      <div className='bg-red-900 p-10 w-fit'>
        <h2>Mosse che può imparare</h2>
        <ul>
          {Object.keys(movesWithVersions).map(moveName => (
            <li key={moveName} className='bg-slate-800 border border-solid border-black-200'>
              {moveName}
              <div>
                <p>Versions: {movesWithVersions[moveName].map(v => `${v.version} (Level ${v.level})`).join(', ')}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Pokemon;
