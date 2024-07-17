import axios from 'axios';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const SearchPokemon = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    // Carica la lista dei Pokémon al caricamento della pagina
    axios.get('https://pokeapi.co/api/v2/pokemon?limit=800')
      .then(response => {
        const results = response.data.results;
        const pokemonDetailsPromises = results.map(pokemon =>
          axios.get(pokemon.url).then(res => res.data)
        );

        Promise.all(pokemonDetailsPromises)
          .then(pokemonDetails => {
            setPokemonList(pokemonDetails);
            setFilteredPokemon(pokemonDetails); // Mostra tutti i Pokémon all'avvio
            setLoading(false);
          })
          .catch(error => {
            console.error("There was an error fetching the Pokémon details!", error);
            setLoading(false);
          });
      })
      .catch(error => {
        console.error("There was an error fetching the Pokémon list!", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Filtra i Pokémon in base al termine di ricerca
    if (searchTerm) {
      setFilteredPokemon(pokemonList.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredPokemon(pokemonList);
    }
  }, [searchTerm, pokemonList]);

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
              <div
                key={index}
                className={`text-center ${pokemon.types && pokemon.types[0] ? getTypeClass(pokemon.types[0].type.name) : 'type-default'} rounded-lg mt-4`}
              >
                <Link href={`/pokemon/${pokemon.id}`}>
                  <div className='flex flex-col items-center justify-center pb-4'>
                    {pokemon.sprites && pokemon.sprites.front_default && (
                      <img
                        src={pokemon.sprites.front_default}
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

export default SearchPokemon;
