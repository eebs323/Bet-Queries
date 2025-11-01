const fs = require('fs');

// Load data
const data = JSON.parse(fs.readFileSync('processed_output.json', 'utf8'));

// Get the two legs
const leg1 = data.filteredData[21]; // Giannis Reb+Ast 18.5
const leg2 = data.filteredData[195]; // Sengun Stl+Blk 1.5

// Parse odds (handle -120* format)
const parseOdds = (o) => typeof o === 'string' ? parseInt(o.replace('*', '')) : o;

const odds1 = parseOdds(leg1.AVG_ODDS);
const odds2 = parseOdds(leg2.AVG_ODDS);

// Convert to decimal odds
const toDecimal = (americanOdds) => {
  if (americanOdds < 0) {
    return 1 + (100 / Math.abs(americanOdds));
  } else {
    return 1 + ((americanOdds - 100) / 100);
  }
};

const dec1 = toDecimal(odds1);
const dec2 = toDecimal(odds2);

// Calculate parlay
const parlayDecimal = dec1 * dec2;
const parlayAmerican = parlayDecimal >= 2 
  ? (parlayDecimal - 1) * 100 
  : (-100 / (parlayDecimal - 1));

// Calculate combined metrics
const avgEdge = (leg1.edgeGapPct + leg2.edgeGapPct) / 2;
const avgH2H = (leg1.h2h + leg2.h2h) / 2;
const avgL5 = (leg1.l5 + leg2.l5) / 2;
const avgL10 = (leg1.l10 + leg2.l10) / 2;
const avgSeason = (leg1.curSeason + leg2.curSeason) / 2;

// Calculate rating (simplified version from PostManPropWithDefensiveRanks.js)
const h2hWeight = 0.25;
const l5Weight = 0.20;
const l10Weight = 0.15;
const seasonWeight = 0.10;
const edgeWeight = 0.20;
const defWeight = 0.10;

const normalizedEdge1 = Math.min(100, leg1.edgeGapPct) / 100;
const normalizedEdge2 = Math.min(100, leg2.edgeGapPct) / 100;
const avgNormalizedEdge = (normalizedEdge1 + normalizedEdge2) / 2;

const rating = (
  (avgH2H * h2hWeight) +
  (avgL5 * l5Weight) +
  (avgL10 * l10Weight) +
  (avgSeason * seasonWeight) +
  (avgNormalizedEdge * edgeWeight) +
  (0.5 * defWeight) // Assuming mid-range defense contribution
) * 10;

// Determine risk level
const riskLevel = 
  avgH2H > 0.75 && avgL10 > 0.65 && avgEdge > 12 ? 'LOW' :
  avgH2H > 0.65 && avgL5 > 0.60 && avgEdge > 8 ? 'MEDIUM' :
  'HIGH';

// Output
console.log('\n════════════════════════════════════════════════════════════════════════');
console.log('📊 2-LEG PARLAY CALCULATION');
console.log('════════════════════════════════════════════════════════════════════════\n');

console.log('🏀 LEG 1: Giannis Antetokounmpo');
console.log('  Prop: Rebounds + Assists Over 18.5');
console.log('  Opponent: Sacramento Kings');
console.log('  Odds:', odds1, '(Decimal:', dec1.toFixed(3) + ')');
console.log('  Edge:', leg1.edgeGapPct.toFixed(1) + '%');
console.log('  Stats: H2H', Math.round(leg1.h2h * 100) + '% | L5', Math.round(leg1.l5 * 100) + '% | L10', Math.round(leg1.l10 * 100) + '% | Season', Math.round(leg1.curSeason * 100) + '%');
console.log('  Approval:', leg1.approvalTag);

console.log('\n🏀 LEG 2: Alperen Sengun');
console.log('  Prop: Steals + Blocks Over 1.5');
console.log('  Opponent: Boston Celtics');
console.log('  Odds:', odds2, '(Decimal:', dec2.toFixed(3) + ')');
console.log('  Edge:', leg2.edgeGapPct.toFixed(1) + '%');
console.log('  Stats: H2H', Math.round(leg2.h2h * 100) + '% | L5', Math.round(leg2.l5 * 100) + '% | L10', Math.round(leg2.l10 * 100) + '% | Season', Math.round(leg2.curSeason * 100) + '%');
console.log('  Approval:', leg2.approvalTag);

console.log('\n════════════════════════════════════════════════════════════════════════');
console.log('💰 PARLAY ODDS');
console.log('════════════════════════════════════════════════════════════════════════');
console.log('  Combined Decimal:', parlayDecimal.toFixed(3));
console.log('  American Odds:', parlayAmerican > 0 ? '+' + Math.round(parlayAmerican) : Math.round(parlayAmerican));
console.log('  $100 bet returns: $' + Math.round(parlayDecimal * 100));
console.log('  Profit on $100: $' + Math.round((parlayDecimal - 1) * 100));

console.log('\n════════════════════════════════════════════════════════════════════════');
console.log('📈 COMBINED SLIP METRICS');
console.log('════════════════════════════════════════════════════════════════════════');
console.log('  ⭐ Rating:', rating.toFixed(1) + '/10');
console.log('  🎲 Risk Level:', riskLevel);
console.log('  📊 Total Edge:', (leg1.edgeGapPct + leg2.edgeGapPct).toFixed(1) + '%');
console.log('  📊 Avg Edge per leg:', avgEdge.toFixed(1) + '%');
console.log('  📊 Avg H2H:', Math.round(avgH2H * 100) + '%');
console.log('  📊 Avg L5:', Math.round(avgL5 * 100) + '%');
console.log('  📊 Avg L10:', Math.round(avgL10 * 100) + '%');
console.log('  📊 Avg Season:', Math.round(avgSeason * 100) + '%');

console.log('\n════════════════════════════════════════════════════════════════════════');
console.log('✅ RECOMMENDATION: STRONG PLAY');
console.log('════════════════════════════════════════════════════════════════════════\n');
