const fs = require('fs');
const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', (err) => { reject(err); });
  });
}

async function main() {
  try {
    console.log('Fetching all Pokemon names from PokeAPI...');
    // Limit to 1500 to get all species and forms
    const dataStr = await fetchUrl('https://pokeapi.co/api/v2/pokemon?limit=1500');
    const data = JSON.parse(dataStr);
    
    const names = data.results.map(r => {
      // Format names nicely (e.g. roaring-moon -> Roaring Moon, urshifu-single-strike -> Urshifu Single Strike)
      return r.name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    });

    // Remove duplicates and sort alphabetically
    const uniqueNames = Array.from(new Set(names)).sort();
    
    const fileContent = `// Static list of all Pokemon names from PokeAPI for offline capability and instant search
export const pokemonNames = ${JSON.stringify(uniqueNames, null, 2)};
`;

    fs.writeFileSync('/home/matteo/dev/poketrainers/app/lib/pokemonNames.js', fileContent);
    console.log(`Successfully saved ${uniqueNames.length} Pokemon names to app/lib/pokemonNames.js`);
  } catch (error) {
    console.error('Error fetching names:', error);
  }
}

main();
