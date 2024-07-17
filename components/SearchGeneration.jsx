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
  const [page, setPage] = useState(1);
  const pokemonPerPage = 20;

  const getTypeClass = (type) => {
    switch (type) {
      case 'normal':
        return 'type-normal';
      case 'fire':
        return 'type-fire';
      case 'water':
        return 'type-water';
      case 'grass':
        return 'type-grass';
      case 'electric':
        return 'type-electric';
      case 'bug':
        return 'type-bug';
      case 'poison':
        return 'type-poison';
      case 'ground':
        return 'type-ground';
      case 'psychic':
        return 'type-psychic';
      case 'fairy':
        return 'type-psychic';
      case 'fighting':
        return 'type-fighting';
      case 'rock':
        return 'type-ground';
      default:
        return 'type-default';
    }
  };

  const fetchPokemonDetails = useCallback(async (url) => {
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
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesResponse, generationsResponse] = await Promise.all([
          axios.get('https://pokeapi.co/api/v2/type'),
          axios.get('https://pokeapi.co/api/v2/generation')
        ]);

        setTypes(typesResponse.data.results);
        setGenerations(generationsResponse.data.results);

        const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=800`);
        const pokemonData = pokemonResponse.data.results;

        setPokemonList(pokemonData);
        setLoading(false);
      } catch (error) {
        console.error("There was an error fetching the Pokémon data!", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filterAndPaginatePokemon = async () => {
      setLoading(true);
      let filtered = pokemonList;

      if (selectedType || selectedGeneration) {
        const detailedPokemon = await Promise.all(
          filtered.slice(0, page * pokemonPerPage).map(fetchPokemonDetails)
        );

        if (selectedType) {
          filtered = detailedPokemon.filter(pokemon => pokemon.types.includes(selectedType));
        }

        if (selectedGeneration) {
          filtered = filtered.filter(pokemon => pokemon.generation === selectedGeneration);
        }
      } else {
        filtered = filtered.slice(0, page * pokemonPerPage);
      }

      setFilteredPokemon(filtered);
      setLoading(false);
    };

    filterAndPaginatePokemon();
  }, [selectedType, selectedGeneration, pokemonList, page, fetchPokemonDetails]);

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setPage(1);
  };

  const handleGenerationChange = (e) => {
    setSelectedGeneration(e.target.value);
    setPage(1);
  };

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <div className='fixed top-[18vh] left-1/2 transform -translate-x-1/2 w-[80%]'>
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
                className={`text-center ${pokemon.types && pokemon.types[0] ? getTypeClass(pokemon.types[0]) : 'type-default'} rounded-lg mt-4`}
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
      {filteredPokemon.length > 0 && filteredPokemon.length % pokemonPerPage === 0 && (
        <button onClick={loadMore} className='mt-4 bg-blue-500 text-white p-2 rounded'>
          Carica altri
        </button>
      )}
    </div>
  );
};

export default SearchGeneration;