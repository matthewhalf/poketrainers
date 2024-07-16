"use client"
import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Home = () => {
  const [pokemonList, setPokemonList] = useState([]);

  useEffect(() => {
    axios.get('https://pokeapi.co/api/v2/pokemon?limit=151')
      .then(response => {
        setPokemonList(response.data.results);
      })
      .catch(error => {
        console.error("There was an error fetching the Pokémon list!", error);
      });
  }, []);

  return (
    <div>
      <h1>Pokémon List</h1>
      <Link href="/search">Go to Search Page</Link>
    </div>
  );
};

export default Home;
