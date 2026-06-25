import { getMetagameIndex } from './lib/pikalytics';
import { getPokemonBasicData } from './lib/pokeapi';
import DashboardClient from './DashboardClient';

export const revalidate = 86400; // Revalidate page data once a day

export default async function Home() {
  // Fetch competitive data from Pikalytics AI endpoint
  const formatData = await getMetagameIndex('battledataregmbs3');

  // Fetch basic PokeAPI data (sprites and types) for the top 50 list in parallel
  if (formatData && formatData.pokemonList && formatData.pokemonList.length > 0) {
    formatData.pokemonList = await Promise.all(
      formatData.pokemonList.map(async (p) => {
        try {
          const apiData = await getPokemonBasicData(p.name);
          return {
            ...p,
            types: apiData ? apiData.types : [],
            spriteUrl: apiData && apiData.spriteUrl ? apiData.spriteUrl : null
          };
        } catch (err) {
          console.error(`Error loading basic data for ${p.name}:`, err);
          return {
            ...p,
            types: [],
            spriteUrl: null
          };
        }
      })
    );
  }

  // Fetch all Pokemon names from PokeAPI for global search
  let allPokemonNames = [];
  try {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1300', { next: { revalidate: 86400 } });
    if (res.ok) {
      const data = await res.json();
      allPokemonNames = data.results.map(r => {
        // Format names nicely (e.g. roaring-moon -> Roaring Moon)
        return r.name
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      });
    }
  } catch (err) {
    console.error('Error fetching all Pokemon names:', err);
  }

  return <DashboardClient formatData={formatData} allPokemonNames={allPokemonNames} />;
}
