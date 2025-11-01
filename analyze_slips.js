const data = require('./processed_output.json');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         SLIP ANALYSIS - Quality Over Quantity              ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log(`Total Slips: ${data.slips.length}\n`);

// Group by bucket
const byBucket = {};
data.slips.forEach(s => {
    const bucket = s.bucket || 'Other';
    if (!byBucket[bucket]) byBucket[bucket] = [];
    byBucket[bucket].push(s);
});

Object.entries(byBucket).forEach(([bucket, slips]) => {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📦 ${bucket.toUpperCase()} (${slips.length} slips)`);
    console.log('═'.repeat(60));
    
    slips.forEach(slip => {
        console.log(`\n${slip.title}`);
        console.log(`  Size: ${slip.size} picks | Rating: ${slip.rating}/10 | Risk: ${slip.riskLevel}`);
        console.log(`  Edge: ${slip.totalGap}% total | Win%: ${slip.pctWin}%`);
        console.log(`  Why: ${slip.why}`);
        
        if (slip.legs.length <= 6) {
            console.log(`  Legs:`);
            slip.legs.forEach(leg => {
                console.log(`    - ${leg.playerName} ${leg.type} ${leg.line} vs ${leg.opponentName}`);
            });
        } else {
            console.log(`  First 3 legs:`);
            slip.legs.slice(0, 3).forEach(leg => {
                console.log(`    - ${leg.playerName} ${leg.type} ${leg.line} vs ${leg.opponentName}`);
            });
            console.log(`    ... and ${slip.legs.length - 3} more`);
        }
    });
});

console.log('\n' + '═'.repeat(60));
console.log('SUMMARY STATS');
console.log('═'.repeat(60));
console.log(`Total unique props in slips: ${[...new Set(data.slips.flatMap(s => s.legs.map(l => l.playerName)))].length}`);
console.log(`Average slip size: ${(data.slips.reduce((sum, s) => sum + s.size, 0) / data.slips.length).toFixed(1)} picks`);
console.log(`Average rating: ${(data.slips.reduce((sum, s) => sum + s.rating, 0) / data.slips.length).toFixed(1)}/10`);
