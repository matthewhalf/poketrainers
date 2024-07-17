import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

const SearchGeneration = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [types, setTypes] = useState([]);
  const [generations, setGenerations] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState('');
  const [loading, setLoading] = useState(true);

  const getTypeClass = (type) => {
    const typeClasses = {
      normal: 'type-normal',
      fire: 'type-fire',
      water: 'type-water',
      grass: 'type-grass',
      electric: 'type-electric',
      bug: 'type-bug',
      poison: 'type-poison',
      ground: 'type-ground',
      psychic: 'type-psychic',
      fairy: 'type-psychic',
      fighting: 'type-fighting',
      rock: 'type-ground'
    };
    return typeClasses[type] || 'type-default';
  };

  const fetchPokemonDetails = useCallback(async (url) => {
    try {
      const response = await axios.get(url);
      const pokemon = response.data;
      const speciesResponse = await axios.get(pokemon.species.url);
      return {
        id: pokemon.id,
        name: pokemon.name,
        types: pokemon.types.map(t => t.type.name),
        generation: speciesResponse.data.generation.name,
        sprite: pokemon.sprites.front_default
      };
    } catch (error) {
      console.error(`Error fetching details for ${url}:`, error);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesResponse, generationsResponse, pokemonResponse] = await Promise.all([
          axios.get('https://pokeapi.co/api/v2/type'),
          axios.get('https://pokeapi.co/api/v2/generation'),
          axios.get('https://pokeapi.co/api/v2/pokemon?limit=800')
        ]);

        setTypes(typesResponse.data.results);
        setGenerations(generationsResponse.data.results);

        const pokemonData = pokemonResponse.data.results;
        const detailedPokemon = await Promise.all(
          pokemonData.map(pokemon => fetchPokemonDetails(pokemon.url))
        );

        setPokemonList(detailedPokemon.filter(Boolean));
        setFilteredPokemon(detailedPokemon.filter(Boolean));
        setLoading(false);
      } catch (error) {
        console.error("There was an error fetching the Pokémon data!", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchPokemonDetails]);

  useEffect(() => {
    let filtered = pokemonList;

    if (selectedType) {
      filtered = filtered.filter(pokemon => pokemon.types.includes(selectedType));
    }

    if (selectedGeneration) {
      filtered = filtered.filter(pokemon => pokemon.generation === selectedGeneration);
    }

    setFilteredPokemon(filtered);
  }, [selectedType, selectedGeneration, pokemonList]);

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handleGenerationChange = (e) => {
    setSelectedGeneration(e.target.value);
  };

  return (
    <div className='fixed top-[13vh] left-1/2 transform -translate-x-1/2 w-[80%]'>
      <h1 className='text-center font-extrabold text-4xl mt-2'>Cerca Pokémon</h1>
      <select
        value={selectedType}
        onChange={handleTypeChange}
        className='py-2 rounded-full text-center bg-[#eee] w-full mt-3'
      >
        <option value="">Seleziona il tipo</option>
        {types.map((type, index) => (
          <option key={index} value={type.name}>
            {type.name}
          </option>
        ))}
      </select>
      <select
        value={selectedGeneration}
        onChange={handleGenerationChange}
        className='py-2 rounded-full text-center bg-[#eee] w-full mt-3'
      >
        <option value="">Seleziona generazione</option>
        {generations.map((generation, index) => (
          <option key={index} value={generation.name}>
            {generation.name}
          </option>
        ))}
      </select>
      <div className='grid grid-cols-2 gap-4 justify-center items-center mt-6 max-h-[40vh] overflow-y-auto'>
        {loading ? (
          <div className='loader absolute left-1/2 transform -translate-x-1/2 mt-8'></div>
        ) : (
          filteredPokemon.length > 0 ? (
            filteredPokemon.map((pokemon, index) => (
              <div
                key={index}
                className={`text-center ${pokemon.types[0] ? getTypeClass(pokemon.types[0]) : 'type-default'} rounded-lg mt-4`}
              >
                <Link href={`/pokemon/${pokemon.id}`}>
                  <div className='flex flex-col items-center justify-center pb-4'>
                    {pokemon.sprite && (
                      <img
                        src={pokemon.sprite}
                        alt={pokemon.name}
                        width={100}
                      />
                    )}
                    <p className='text-white font-semibold capitalize'>{pokemon.name}</p>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <p className='text-center text-gray-500 mt-4 absolute left-1/2 transform -translate-x-1/2'>Nessun Pokémon trovato.</p>
          )
        )}
      </div>
    </div>
  );
};

export default SearchGeneration;