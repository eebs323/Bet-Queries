const jsonData = require('./PlayerProps.json');
const data = jsonData.props || jsonData;

console.log('Total props:', data.length);

// Check for PrizePicks odds
const ppProps = data.filter(p => p.outcome.bookOdds && p.outcome.bookOdds.PRIZEPICKS);
console.log('\nProps with PRIZEPICKS:', ppProps.length);

if (ppProps.length > 0) {
    console.log('\n=== Sample PRIZEPICKS odds ===');
    ppProps.slice(0, 10).forEach(p => {
        console.log(`${p.outcome.marketLabel}: ${p.outcome.bookOdds.PRIZEPICKS.odds}`);
    });

    // Check for goblin odds
    const goblinProps = ppProps.filter(p => p.outcome.bookOdds.PRIZEPICKS.odds === '-137');
    console.log('\n=== Goblin Detection ===');
    console.log('Props with PP odds === "-137":', goblinProps.length);
    
    if (goblinProps.length > 0) {
        console.log('\nFirst goblin prop:');
        console.log(JSON.stringify(goblinProps[0], null, 2));
    }

    // Show unique odds
    const uniqueOdds = [...new Set(ppProps.map(p => p.outcome.bookOdds.PRIZEPICKS.odds))];
    console.log('\n=== All unique PRIZEPICKS odds values ===');
    console.log(uniqueOdds.sort());
}
