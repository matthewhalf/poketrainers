import { getPokemonMetaStats } from '../../lib/pikalytics';
import { getPokemonPokeApiData, getMoveDetails, getItemDetails, getAbilityDetails } from '../../lib/pokeapi';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  if (!name) {
    return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 });
  }

  try {
    const [metaStats, apiData] = await Promise.all([
      getPokemonMetaStats(name, 'battledataregmbs3'),
      getPokemonPokeApiData(name)
    ]);

    // Enrich top moves, items, abilities with details (including translations)
    const topMoves = metaStats.moves.slice(0, 6);
    const topItems = metaStats.items.slice(0, 4);
    const topAbilities = metaStats.abilities.slice(0, 2);

    const [movesWithDetails, itemsWithDetails, abilitiesWithDetails] = await Promise.all([
      Promise.all(topMoves.map(async (m) => {
        const details = await getMoveDetails(m.name);
        return { ...m, ...details };
      })),
      Promise.all(topItems.map(async (i) => {
        const details = await getItemDetails(i.name);
        return { ...i, ...details };
      })),
      Promise.all(topAbilities.map(async (a) => {
        const details = await getAbilityDetails(a.name);
        return { ...a, ...details };
      }))
    ]);

    metaStats.enrichedMoves = movesWithDetails;
    metaStats.enrichedItems = itemsWithDetails;
    metaStats.enrichedAbilities = abilitiesWithDetails;

    return NextResponse.json({ metaStats, apiData });
  } catch (error) {
    console.error('Error fetching data in API route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
