const fs = require('fs');

// Load processed output
const data = JSON.parse(fs.readFileSync('processed_output.json', 'utf8'));

// Find all goblin props
const goblins = data.filteredData.filter(p => p.approvalTag && p.approvalTag.includes('Goblin'));

console.log('\n════════════════════════════════════════════════════════════════════════');
console.log('🎃 FIRST 15 GOBLINS (Sorted by Safety)');
console.log('════════════════════════════════════════════════════════════════════════\n');

goblins.slice(0, 15).forEach((prop, i) => {
  const h2h = Math.round(prop.h2h * 100);
  const l10 = Math.round(prop.l10 * 100);
  const l5 = Math.round(prop.l5 * 100);
  const edge = prop.edgeGapPct.toFixed(1);
  
  // Calculate safety score (same formula used in sort)
  const safetyScore = (prop.h2h * 0.4) + (prop.l10 * 0.3) + (prop.l5 * 0.2) + (Math.min(100, prop.edgeGapPct) / 100 * 0.1);
  
  console.log(`${i + 1}. ${prop.player}`);
  console.log(`   📊 Stats: H2H ${h2h}% | L10 ${l10}% | L5 ${l5}% | Edge ${edge}%`);
  console.log(`   🛡️  Safety Score: ${safetyScore.toFixed(3)}`);
  console.log(`   ${prop.approvalTag}`);
  console.log('');
});

console.log('════════════════════════════════════════════════════════════════════════');
console.log('Safety Score Formula: (H2H × 0.4) + (L10 × 0.3) + (L5 × 0.2) + (Edge/100 × 0.1)');
console.log('Higher score = Safer pick');
console.log('════════════════════════════════════════════════════════════════════════\n');
