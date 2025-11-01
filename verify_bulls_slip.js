const fs = require('fs');
const json = JSON.parse(fs.readFileSync('processed_output.json', 'utf8'));

console.log('\n🔍 Verifying NY Knicks SGP Calculation\n');

const slips = json.slips || [];
const bullsSlip = slips.find(s => s.title.includes('New York Knicks'));

if (!bullsSlip) {
  console.log('❌ Chicago Bulls slip not found');
  process.exit(1);
}

console.log(`Title: ${bullsSlip.title}`);
console.log(`Rating: ${bullsSlip.rating}/10`);
console.log(`Total Edge Gap: ${bullsSlip.totalGap}%`);
console.log(`Risk: ${bullsSlip.riskLevel}`);
console.log(`Number of legs: ${bullsSlip.legs.length}`);

console.log('\n📊 Leg Details:\n');

let totalEdge = 0;
let totalH2H = 0;
let totalL5 = 0;
let totalL10 = 0;
let totalCurSeason = 0;

bullsSlip.legs.forEach((leg, i) => {
  const edge = leg.edgeGapPct || 0;
  totalEdge += edge;
  totalH2H += leg.h2h || 0;
  totalL5 += leg.l5 || 0;
  totalL10 += leg.l10 || 0;
  totalCurSeason += leg.curSeason || 0;
  
  console.log(`${i + 1}. ${leg.player || leg.playerName}`);
  console.log(`   Edge: ${edge.toFixed(1)}%`);
  console.log(`   H2H: ${(leg.h2h * 100).toFixed(0)}% | L5: ${(leg.l5 * 100).toFixed(0)}% | L10: ${(leg.l10 * 100).toFixed(0)}% | Season: ${(leg.curSeason * 100).toFixed(0)}%`);
  console.log('');
});

const numLegs = bullsSlip.legs.length;
console.log('📈 Averages:');
console.log(`  Total Edge: ${totalEdge.toFixed(1)}%`);
console.log(`  Avg Edge per leg: ${(totalEdge / numLegs).toFixed(1)}%`);
console.log(`  Avg H2H: ${(totalH2H / numLegs * 100).toFixed(0)}%`);
console.log(`  Avg L5: ${(totalL5 / numLegs * 100).toFixed(0)}%`);
console.log(`  Avg L10: ${(totalL10 / numLegs * 100).toFixed(0)}%`);
console.log(`  Avg Season: ${(totalCurSeason / numLegs * 100).toFixed(0)}%`);

console.log('\n🧮 Manual Rating Calculation (Regular Season):');
console.log('  Weights: H2H(25%) + L5(20%) + L10(15%) + Season(10%) + Edge(20%) + Defense(10%)');

let manualScore = 0;
bullsSlip.legs.forEach(leg => {
  const h2h = leg.h2h || 0;
  const l5 = leg.l5 || 0;
  const l10 = leg.l10 || 0;
  const curSeason = leg.curSeason || 0;
  const edgeNorm = Math.min(100, Math.max(0, leg.edgeGapPct || 0)) / 100; // Normalize to 0-1
  const defRank = Number(leg.defenseRank);
  const defScore = (defRank && defRank > 0 && defRank !== 'N/A') ? Math.max(0, (30 - defRank) / 30) : 0;
  
  const legScore = (h2h * 0.25) + (l5 * 0.20) + (l10 * 0.15) + (curSeason * 0.10) + (edgeNorm * 0.20) + (defScore * 0.10);
  manualScore += legScore;
});

const avgScore = manualScore / numLegs;
const expectedRating = Math.round(avgScore * 10 * 10) / 10;

console.log(`  Total score: ${manualScore.toFixed(3)}`);
console.log(`  Avg per leg: ${avgScore.toFixed(3)}`);
console.log(`  Expected rating: ${expectedRating}/10`);
console.log(`  Actual rating: ${bullsSlip.rating}/10`);

if (Math.abs(expectedRating - bullsSlip.rating) < 0.2) {
  console.log('\n✅ Rating calculation is CORRECT');
} else {
  console.log('\n❌ Rating calculation MISMATCH');
  console.log(`   Difference: ${Math.abs(expectedRating - bullsSlip.rating).toFixed(1)}`);
}

console.log('\n🎲 Risk Level Calculation:');
console.log(`  Avg H2H: ${(totalH2H / numLegs).toFixed(2)} (need > 0.75 for LOW)`);
console.log(`  Avg L10: ${(totalL10 / numLegs).toFixed(2)} (need > 0.65 for LOW)`);
console.log(`  Avg Edge: ${(totalEdge / numLegs).toFixed(1)}% (need > 12% for LOW)`);

if ((totalH2H / numLegs) > 0.75 && (totalL10 / numLegs) > 0.65 && (totalEdge / numLegs) > 12) {
  console.log(`  Expected: LOW ✅`);
} else if ((totalH2H / numLegs) > 0.65 && (totalL5 / numLegs) > 0.6 && (totalEdge / numLegs) > 8) {
  console.log(`  Expected: MEDIUM`);
} else {
  console.log(`  Expected: HIGH`);
}
console.log(`  Actual: ${bullsSlip.riskLevel}`);
