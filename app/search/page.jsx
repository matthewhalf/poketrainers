"use client"
import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);

  useEffect(() => {
    // Carica la lista dei Pokémon al caricamento della pagina
    axios.get('https://pokeapi.co/api/v2/pokemon?limit=151')
      .then(response => {
        setPokemonList(response.data.results);
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
      setFilteredPokemon([]);
    }
  }, [searchTerm, pokemonList]);

  return (
    <div>
      <h1>Search Pokémon</h1>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for a Pokémon..."
      />
      <ul>
        {filteredPokemon.map((pokemon, index) => (
          <li key={index}>
            <Link href={`/pokemon/${pokemon.url.split('/')[pokemon.url.split('/').length - 2]}`}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url.split('/')[pokemon.url.split('/').length - 2]}.png`}
                  alt={pokemon.name}
                  style={{ marginRight: '10px' }}
                />
                {pokemon.name}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <ul>
        {pokemonList.map((pokemon, index) => (
          <li key={index}>
            <Link href={`/pokemon/${index + 1}`}>
              {pokemon.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;
