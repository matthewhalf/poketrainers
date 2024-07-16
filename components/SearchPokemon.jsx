import axios from 'axios';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const SearchPokemon = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);

  useEffect(() => {
    // Carica la lista dei Pokémon al caricamento della pagina
    axios.get('https://pokeapi.co/api/v2/pokemon?limit=540')
      .then(response => {
        setPokemonList(response.data.results);
        setFilteredPokemon(response.data.results); // Mostra tutti i Pokémon all'avvio
      })
      .catch(error => {
        console.error("There was an error fetching the Pokémon list!", error);
      });
  }, []);

  useEffect(() => {
    // Filtra i Pokémon in base al termine di ricerca
    if (searchTerm) {
      setFilteredPokemon(pokemonList.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      // Mostra tutti i Pokémon quando non c'è ricerca attiva
      setFilteredPokemon(pokemonList);
    }
  }, [searchTerm, pokemonList]);

  return (
    <div className='fixed top-[18vh] left-[10vw] w-[80%]'>
      <h1 className='text-center font-extrabold text-4xl mt-2'>Pokedex</h1>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Cerca Pokémon..."
        className='py-2 rounded-full text-center bg-[#eee] w-full mt-3'
      />
      <div className='grid grid-cols-2 gap-4 justify-center items-center mt-6 max-h-[60vh] overflow-y-auto'>
        {filteredPokemon.length > 0 ? (
          filteredPokemon.map((pokemon, index) => (
            <div key={index} className='text-center bg-[#5CB387] rounded-lg mt-4'>
              <Link href={`/pokemon/${pokemon.url.split('/')[pokemon.url.split('/').length - 2]}`}>
                <div className='flex flex-col items-center justify-center pb-4'>
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url.split('/')[pokemon.url.split('/').length - 2]}.png`}
                    alt={pokemon.name} width={100}
                  />
                  <p className='text-white font-semibold'>{pokemon.name}</p>
                </div>
              </Link>
            </div>
          ))
        ) : (
          // Mostra un messaggio se non ci sono risultati
            <p className='text-center text-gray-500 mt-4 absolute left-[12vw]'>Nessun Pokémon trovato.</p>
        )}
      </div>
    </div>
  );
};

export default SearchPokemon;
