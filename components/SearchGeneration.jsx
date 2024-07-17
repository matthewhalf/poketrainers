import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const SearchGeneration = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [types, setTypes] = useState([]);
  const [generations, setGenerations] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState('');
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
        return 'type-psychic'; // Fix this line to 'type-fairy'
      case 'fighting':
        return 'type-fighting';
      case 'rock':
        return 'type-ground';
      default:
        return 'type-default';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetching Pokemon data
        const pokemonResponse = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=800');
        const pokemonData = pokemonResponse.data.results;

        // Fetching types data
        const typesResponse = await axios.get('https://pokeapi.co/api/v2/type');
        const typesData = typesResponse.data.results;

        // Fetching generations data
        const generationsResponse = await axios.get('https://pokeapi.co/api/v2/generation');
        const generationsData = generationsResponse.data.results;

        // Updating state with fetched data
        setPokemonList(pokemonData);
        setTypes(typesData);
        setGenerations(generationsData);

        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("There was an error fetching the Pokémon data!", error);
        setLoading(false); // Stop loading if there's an error
      }
    };

    fetchData(); // Call fetchData function on component mount
  }, []); // Empty dependency array to run effect only once

  useEffect(() => {
    // Function to filter pokemon based on selected type and generation
    const filterPokemon = () => {
      let filtered = pokemonList;

      if (selectedType) {
        filtered = filtered.filter(pokemon =>
          pokemon.types && pokemon.types.some(type => type.type.name === selectedType)
        );
      }

      if (selectedGeneration) {
        const generationId = parseInt(selectedGeneration);
        filtered = filtered.filter(pokemon =>
          pokemon.generation && parseInt(pokemon.generation.url.split('/').slice(-2, -1)[0]) === generationId
        );
      }

      setFilteredPokemon(filtered); // Update filteredPokemon state
    };

    filterPokemon(); // Call filterPokemon function whenever selectedType or selectedGeneration changes
  }, [selectedType, selectedGeneration, pokemonList]); // Dependency array with selectedType, selectedGeneration, and pokemonList

  return (
    <div className='fixed top-[18vh] left-1/2 transform -translate-x-1/2 w-[80%]'>
      <h1 className='text-center font-extrabold text-4xl mt-2'>Cerca Pokémon</h1>
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
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
        onChange={(e) => setSelectedGeneration(e.target.value)}
        className='py-2 rounded-full text-center bg-[#eee] w-full mt-3'
      >
        <option value="">Seleziona generazione</option>
        {generations.map((generation, index) => (
          <option key={index} value={generation.url.split('/')[generation.url.split('/').length - 2]}>
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

export default SearchGeneration;
