"use client"

// app/pokemon/[id]/page.js

import axios from 'axios';
import { useEffect, useState } from 'react';

const Pokemon = ({ params }) => {
  const { id } = params;
  const [pokemon, setPokemon] = useState(null);

  useEffect(() => {
    if (id) {
      // Effettua la chiamata API quando l'ID è disponibile
      axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(response => {
          setPokemon(response.data);
        })
        .catch(error => {
          console.error("There was an error fetching the Pokémon data!", error);
        });
    }
  }, [id]);

  if (!pokemon) return <div>Loading...</div>;

  return (
    <div>
      <h1>{pokemon.name}</h1>
      <img src={pokemon.sprites.front_default} alt={pokemon.name} />
      <p>Height: {pokemon.height}</p>
      <p>Weight: {pokemon.weight}</p>
      <p>Type: {pokemon.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
    </div>
  );
};

export default Pokemon;

