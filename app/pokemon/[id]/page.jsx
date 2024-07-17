"use client"

import axios from 'axios';
import { useEffect, useState } from 'react';
import BottomNavbar from '@/components/BottomNavbar';
import { FaArrowLeft } from "react-icons/fa";
import Link from 'next/link';

const Pokemon = ({ params }) => {
  const { id } = params;
  const [pokemon, setPokemon] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [movesInItalian, setMovesInItalian] = useState([]);

  const getTypeClass = (type) => {
    switch (type) {
      case 'normal':
        return 'type-normal badge-normal';
      case 'fire':
        return 'type-fire badge-fire';
      case 'water':
        return 'type-water badge-water';
      case 'grass':
        return 'type-grass badge-grass';
      case 'electric':
        return 'type-electric badge-electric';
      case 'bug':
          return 'type-bug badge-bug';
      case 'poison':
          return 'type-poison badge-poison';
      case 'ground':
          return 'type-ground badge-ground';
      case 'psychic':
            return 'type-psychic badge-psychic';
      case 'fairy':
            return 'type-psychic badge-psychic';
      case 'fighting':
            return 'type-fighting badge-fighting';
      case 'rock':
            return 'type-ground badge-ground';
      case 'ghost':
            return 'type-poison badge-poison';     
      default:
        return 'type-default badge-default';
    }
  };

  useEffect(() => {
    if (id) {
      // Effettua la chiamata API per ottenere i dettagli del Pokémon
      axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(response => {
          console.log(response.data)
          setPokemon(response.data);
          return axios.get(response.data.species.url); // Ottiene l'URL della specie per ottenere la catena evolutiva
        })
        .then(response => {
          return axios.get(response.data.evolution_chain.url); // Ottiene l'URL della catena evolutiva
        })
        .then(response => {
          const evolutions = [];
          let currentEvolution = response.data.chain;
        

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
    <div className={`${getTypeClass(pokemon.types[0].type.name)} pt-4`}>
        <Link href="/"><FaArrowLeft size={20} className='ml-6 mt-4'/></Link>
        <div className='flex flex-col justify-between items-center'>
          <div className='flex justify-between gap-3 items-center pt-8'>
            <h1 className='text-3xl font-extrabold text-white capitalize'>{pokemon.name}</h1>
            <p># {pokemon.id}</p>
          </div>

          <span className={`rounded-lg px-6 mt-2 border border-solid font-semibold ${getTypeClass(pokemon.types[0].type.name)}`}>{pokemon.types.map(typeInfo => typeInfo.type.name).join(' - ')}</span>
          
          <img src={pokemon.sprites.front_default} alt={pokemon.name} width={200}/>  
        </div>


        <div className='bg-white text-slate-800 pt-6 px-8 pb-[15vh] rounded-t-[50px] -mt-20'>
          <h2 className='font-bold text-xl pt-8 pb-2'>Descrizione</h2>
          <p><span className='text-slate-500 font-semibold mr-[3vw]'>Altezza:</span> {pokemon.height / 10} m</p>
          <p><span className='text-slate-500 font-semibold mr-[3vw]'>Peso:</span>  {pokemon.weight / 10} kg</p>

          <h2 className='font-bold text-xl pt-8 pb-2'>Statistiche</h2>
          <ul>
          {pokemon.stats.map(stat => (
            <li key={stat.stat.name}>
             <span className='text-slate-500 font-semibold mr-[3vw]'>{stat.stat.name}:</span>  {stat.base_stat}
            </li>
          ))}
        </ul>
          
        <h2 className='font-bold text-xl pt-8 pb-2'>Evoluzioni</h2>
          <ul className='flex gap-4 mt-2 mb-8'>
            {evolutionChain.map((evolution, index) => (
              <li key={evolution.id} className='text-center overflow-hidden pr-4 border-r-2 text-sm'>
                <p className='capitalize'>{evolution.name}</p>
                <img 
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolution.id}.png`} 
                  alt={evolution.name}
                />
                {index > 0 && evolutionChain[index - 1].evolves_to.length > 0 && evolutionChain[index - 1].evolves_to[0].evolution_details.length > 0 && (
                  <div className='font-bold'>
                    <p>Lv: {evolutionChain[index - 1].evolves_to[0].evolution_details[0].min_level}</p>
                    {evolutionChain[index - 1].evolves_to[0].evolution_details[0].item && (
                      <p>{evolutionChain[index - 1].evolves_to[0].evolution_details[0].item.name}</p>
                    )}
                    {evolutionChain[index - 1].evolves_to[0].evolution_details[0].trigger && evolutionChain[index - 1].evolves_to[0].evolution_details[0].trigger.name === 'trade' && (
                      <p>Si evolve tramite scambio</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>

        <h2 className='font-bold text-xl pt-8 pb-2'>Mosse che impara</h2>
        <ul>
        {Object.keys(movesWithVersions).map(moveName => (
          <li key={moveName}>
            <span className='bg-slate-100 px-6 rounded-lg text-slate-600 border-solid border-2 border-slate-200 font-bold'>{moveName}</span>
            <div className='my-6'>
              <ul>
                {movesWithVersions[moveName].map((v, index) => (
                  <li key={index}>
                   <span className='capitalize font-bold'>{v.version}:</span>  ( Livello: {v.level})
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>

      
      </div>    
      <BottomNavbar />
    </div>
  );
};

export default Pokemon;
