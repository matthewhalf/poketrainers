const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', (err) => { reject(err); });
  });
}

/**
 * Parses the Pikalytics format index page (markdown)
 */
function parseFormatIndex(markdown) {
  const data = {
    formatName: 'Pokemon Champions VGC 2026 Regulation Set M-B',
    formatCode: 'battledataregmbs3',
    cores2: [],
    cores3: [],
    cores4: [],
    topTeams: [],
    pokemonList: []
  };

  if (!markdown) return data;

  const formatNameMatch = markdown.match(/-\s+\*\*Format\*\*:\s*([^\n]+)/);
  if (formatNameMatch) data.formatName = formatNameMatch[1].trim();

  const formatCodeMatch = markdown.match(/-\s+\*\*Format Code\*\*:\s*`([^`]+)`/);
  if (formatCodeMatch) data.formatCode = formatCodeMatch[1].trim();

  const lines = markdown.split('\n');
  let currentSection = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('## ') || line.startsWith('### ')) {
      currentSection = line.replace(/#/g, '').trim();
      continue;
    }

    if (line.startsWith('|') && !line.includes('Rank |') && !line.includes('---|')) {
      // Replace escaped pipes \| to prevent splitting column cells incorrectly
      const cleanLine = line.replace(/\\\|/g, '—');
      const parts = cleanLine.split('|').map(p => p.trim());
      
      if (currentSection === '2-Pokemon Cores' && parts.length >= 5) {
        data.cores2.push({
          rank: parseInt(parts[1], 10),
          pokemon: parts[2].split(',').map(p => p.trim()),
          teams: parseInt(parts[3], 10),
          usage: parts[4]
        });
      } else if (currentSection === '3-Pokemon Cores' && parts.length >= 5) {
        data.cores3.push({
          rank: parseInt(parts[1], 10),
          pokemon: parts[2].split(',').map(p => p.trim()),
          teams: parseInt(parts[3], 10),
          usage: parts[4]
        });
      } else if (currentSection === '4-Pokemon Cores' && parts.length >= 5) {
        data.cores4.push({
          rank: parseInt(parts[1], 10),
          pokemon: parts[2].split(',').map(p => p.trim()),
          teams: parseInt(parts[3], 10),
          usage: parts[4]
        });
      } else if (currentSection === 'Recent Top Teams' && parts.length >= 6) {
        data.topTeams.push({
          rank: parseInt(parts[1], 10),
          author: parts[2],
          record: parts[3],
          tournament: parts[4],
          pokemon: parts[5].split(',').map(p => p.trim())
        });
      } else if (currentSection === 'Best 50 Pokemon by Usage' && parts.length >= 6) {
        data.pokemonList.push({
          rank: parseInt(parts[1], 10),
          name: parts[2].replace(/\*\*/g, '').trim(),
          usage: parts[3],
          winrate: parts[4],
          record: parts[5]
        });
      }
    }
  }

  return data;
}

/**
 * Parses the HTML content of a Pokemon's standard detail page on Pikalytics
 */
function parsePokemonHtml(html, name) {
  const data = {
    name: name,
    types: [],
    winrate: 'N/A',
    rank: 'N/A',
    moves: [],
    items: [],
    abilities: [],
    natures: [],
    evSpreads: [],
    teammates: []
  };

  if (!html) return data;

  // Parse Name
  const nameMatch = html.match(/<h1 class="pokedex-header-name">([^<]+)<\/h1>/);
  data.name = nameMatch ? nameMatch[1].trim() : name;

  // Parse Types
  const typesSection = html.match(/<span class="inline-block pokedex-header-types"[^>]*>([\s\S]*?)<\/span>\s*<\/span>/);
  if (typesSection) {
    const typeMatches = typesSection[1].matchAll(/<span class="type ([^"]+)"[^>]*>/g);
    for (const match of typeMatches) {
      data.types.push(match[1].trim());
    }
  }

  // Parse Winrate
  const winrateMatch = html.match(/<div class="pokemon-ind-summary-title">Winrate<\/div>\s*<div class="pokemon-ind-summary-text[^"]*">([^<]+)<span/);
  data.winrate = winrateMatch ? winrateMatch[1].trim() + '%' : 'N/A';

  // Parse Rank
  const rankMatch = html.match(/<div class="pokemon-ind-summary-title">Rank<\/div>\s*<div class="pokemon-ind-summary-text[^"]*"><span[^>]*>#<\/span>([^<]+)<\/div>/) ||
                    html.match(/<div class="pokemon-ind-summary-title">Monthly Rank<\/div>\s*<div class="pokemon-ind-summary-text[^"]*"><span[^>]*>#<\/span>([^<]+)<\/div>/);
  data.rank = rankMatch ? parseInt(rankMatch[1].trim(), 10) : 'N/A';

  // Helper for progress/move entries (name + percentage)
  function parseEntries(wrapperId) {
    const regex = new RegExp(`id="${wrapperId}"[\\s\\S]*?<\\/div>\\s*<\\/div>\\s*<\\/div>`, 'i');
    const section = html.match(regex);
    if (!section) return [];

    const entries = [];
    const entryMatches = section[0].matchAll(/<div class="pokedex-move-entry-new">[\s\S]*?<div class="pokedex-inline-text(?:-offset)?">([^<]+)<\/div>[\s\S]*?<div class="pokedex-inline-right">([^<]+)%?<\/div>/g);
    for (const match of entryMatches) {
      entries.push({
        name: match[1].trim(),
        percent: parseFloat(match[2].trim())
      });
    }
    return entries;
  }

  data.moves = parseEntries('moves_wrapper');
  data.items = parseEntries('items_wrapper');
  data.abilities = parseEntries('abilities_wrapper');
  data.natures = parseEntries('dex_natures_wrapper');

  // Parse EV Spreads
  const spreadsSection = html.match(/id="dex_spreads_wrapper"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
  if (spreadsSection) {
    const spreadEntries = spreadsSection[0].matchAll(/<div class="pokedex-move-entry-new">([\s\S]*?)<div class="pokedex-inline-right">([^<]+)%?<\/div>/g);
    for (const match of spreadEntries) {
      const parts = match[1].matchAll(/<div class="pokedex-inline-text">([^<]+)<\/div>/g);
      const evs = [];
      for (const p of parts) {
        evs.push(p[1].replace('/', '').trim());
      }
      if (evs.length === 6) {
        data.evSpreads.push({
          spread: evs.join('/'),
          percent: parseFloat(match[2].trim())
        });
      }
    }
  }

  // Parse Teammates
  const teammateSection = html.match(/id="teammate_wrapper"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
  if (teammateSection) {
    const teammateMatches = teammateSection[0].matchAll(/<a class="teammate_entry[^"]*"[^>]*data-name="([^"]+)"[\s\S]*?<div class="pokedex-inline-right">#([^<]+)<\/div>/g);
    for (const match of teammateMatches) {
      data.teammates.push({
        name: match[1].trim(),
        rank: parseInt(match[2].trim(), 10)
      });
    }
  }

  return data;
}

/**
 * Parses the AI Pokemon details page (markdown) for featured teams and sets
 */
function parsePokemonAiMarkdown(markdown) {
  const teams = [];
  if (!markdown) return teams;

  const teamsSection = markdown.match(/## Featured Teams with[\s\S]*?## FAQ/);
  if (!teamsSection) return teams;

  const teamBlocks = teamsSection[0].split('### Team ').slice(1);
  for (const block of teamBlocks) {
    const lines = block.split('\n');
    const team = {
      author: '',
      record: '',
      event: '',
      pokemon: [],
      set: {
        ability: '',
        item: '',
        moves: []
      }
    };

    // Parse Author and Rank
    const titleLine = lines[0].trim();
    const authorMatch = titleLine.match(/\d+ by (.*)/);
    team.author = authorMatch ? authorMatch[1].trim() : titleLine;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('*Record:')) {
        team.record = trimmed.replace(/\*/g, '').replace('Record:', '').trim();
      } else if (trimmed.startsWith('*Event:')) {
        team.event = trimmed.replace(/\*/g, '').replace('Event:', '').trim();
      } else if (trimmed.startsWith('**Pokemon**:')) {
        team.pokemon = trimmed.replace('**Pokemon**:', '').split(',').map(p => p.trim());
      } else if (trimmed.startsWith('- **Ability**:')) {
        team.set.ability = trimmed.replace('- **Ability**:', '').trim();
      } else if (trimmed.startsWith('- **Item**:')) {
        team.set.item = trimmed.replace('- **Item**:', '').trim();
      } else if (trimmed.startsWith('- **Moves**:')) {
        team.set.moves = trimmed.replace('- **Moves**:', '').split(',').map(m => m.trim());
      }
    }

    if (team.author && team.pokemon.length > 0) {
      teams.push(team);
    }
  }

  return teams;
}

/**
 * Public function to fetch metagame data
 */
async function getMetagameIndex(formatCode = 'battledataregmbs3') {
  const url = `https://www.pikalytics.com/ai/pokedex/${formatCode}`;
  try {
    const md = await fetchUrl(url);
    return parseFormatIndex(md);
  } catch (err) {
    console.error(`Error loading metagame index for ${formatCode}:`, err);
    // Fallback static data if fetching fails (so app never crashes)
    return {
      formatName: 'Pokemon Champions VGC 2026 Reg M-B S3 Ranked Battle Data',
      formatCode,
      cores2: [],
      cores3: [],
      cores4: [],
      topTeams: [],
      pokemonList: []
    };
  }
}

/**
 * Public function to fetch detailed stats for a specific Pokemon
 */
async function getPokemonMetaStats(pokemonName, formatCode = 'battledataregmbs3') {
  const htmlUrl = `https://www.pikalytics.com/pokedex/${formatCode}/${pokemonName}`;
  const aiUrl = `https://www.pikalytics.com/ai/pokedex/${formatCode}/${pokemonName}`;

  try {
    const [html, md] = await Promise.all([
      fetchUrl(htmlUrl).catch(e => { console.error('HTML fetch error:', e); return ''; }),
      fetchUrl(aiUrl).catch(e => { console.error('MD fetch error:', e); return ''; })
    ]);

    const stats = parsePokemonHtml(html, pokemonName);
    stats.featuredTeams = parsePokemonAiMarkdown(md);
    return stats;
  } catch (err) {
    console.error(`Error loading stats for ${pokemonName} in ${formatCode}:`, err);
    return {
      name: pokemonName,
      types: [],
      winrate: 'N/A',
      rank: 'N/A',
      moves: [],
      items: [],
      abilities: [],
      natures: [],
      evSpreads: [],
      teammates: [],
      featuredTeams: []
    };
  }
}

module.exports = {
  getMetagameIndex,
  getPokemonMetaStats
};
