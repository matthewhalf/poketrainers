import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

const SearchPokemon = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pokemonPerPage = 20;

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
      return {
        id: pokemon.id,
        name: pokemon.name,
        types: pokemon.types?.map(t => t.type.name) || [],
        sprite: pokemon.sprites?.front_default || ''
      };
    } catch (error) {
      console.error(`Error fetching details for ${url}:`, error);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=800`);
        const results = response.data.results;
        setPokemonList(results);
        setLoading(false);
      } catch (error) {
        console.error("There was an error fetching the Pokémon list!", error);
        setLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  useEffect(() => {
    const filterAndLoadPokemon = async () => {
      setLoading(true);
      let filtered = pokemonList;

      if (searchTerm) {
        filtered = filtered.filter(pokemon => 
          pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      const paginatedPokemon = filtered.slice(0, page * pokemonPerPage);
      const detailedPokemon = await Promise.all(
        paginatedPokemon.map(pokemon => fetchPokemonDetails(pokemon.url))
      );

      setFilteredPokemon(detailedPokemon.filter(Boolean));
      setLoading(false);
    };

    filterAndLoadPokemon();
  }, [searchTerm, pokemonList, page, fetchPokemonDetails]);

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <div className='fixed top-[13vh] left-1/2 transform -translate-x-1/2 w-[80%]'>
      <h1 className='text-center text-slate-800 font-extrabold text-4xl mt-2'>Pokèdex</h1>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Cerca Pokémon..."
        className='py-2 rounded-full text-center bg-[#eee] w-full mt-3'
      />
      <div className='grid grid-cols-2 gap-4 justify-center items-center mt-6 max-h-[55vh] overflow-y-auto'>
        {loading ? (
          <div className='loader absolute left-1/2 transform -translate-x-1/2 mt-8'></div>
        ) : (
          filteredPokemon.length > 0 ? (
            filteredPokemon.map((pokemon, index) => (
              pokemon && (
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
              )
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

export default SearchPokemon;