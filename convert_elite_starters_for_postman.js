const fs = require('fs');

// Read the JSONL file
const content = fs.readFileSync('eliteStarters.json', 'utf8');

// Parse JSONL (one JSON object per line) into an array
const eliteStarters = content.trim().split('\n').map(line => JSON.parse(line));

// Remove duplicates by player name (keep first occurrence)
const seen = new Set();
const unique = eliteStarters.filter(player => {
  if (seen.has(player.player)) {
    return false;
  }
  seen.add(player.player);
  return true;
});

console.log('════════════════════════════════════════════════════════════');
console.log('📋 ELITE STARTERS FOR POSTMAN GLOBAL VARIABLE');
console.log('════════════════════════════════════════════════════════════\n');

console.log('Total players:', unique.length);
console.log('Duplicates removed:', eliteStarters.length - unique.length);
console.log('\n1️⃣ In Postman, go to: Environments → Globals');
console.log('2️⃣ Add a new variable named: EliteStarters');
console.log('3️⃣ Set TYPE to: default');
console.log('4️⃣ Copy the JSON below and paste it as the VALUE:\n');

console.log('════════════════════════════════════════════════════════════');
console.log(JSON.stringify(unique, null, 2));
console.log('════════════════════════════════════════════════════════════\n');

console.log('✅ Done! The script will now load from Postman globals.');
console.log('   If running locally (Node.js), it falls back to eliteStarters.json file.\n');

// Also save as a regular JSON array for easier Postman import
fs.writeFileSync('eliteStarters_array.json', JSON.stringify(unique, null, 2));
console.log('💾 Also saved as eliteStarters_array.json for easy copy/paste');
