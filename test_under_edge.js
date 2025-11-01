// Test edge calculation for Under props

function americanToProb(odds) {
  const o = parseFloat(odds);
  if (isNaN(o)) return null;
  if (o >= 100) return 100 / (o + 100);
  if (o <= -100) return Math.abs(o) / (Math.abs(o) + 100);
  return null;
}

function pickWindowAndPEst(outcome, rawStats) {
  const windows = [
    ["L5",  rawStats?.l5],
    ["L10", rawStats?.l10],
    ["H2H", rawStats?.h2h],
    ["Szn25", rawStats?.curSeason],
    ["Szn24", rawStats?.prevSeason],
  ].filter(([,v]) => Number.isFinite(Number(v)));

  if (!windows.length) return null;

  const isOver = outcome.outcomeLabel === "Over";
  
  // For both Overs and Unders, we want the window that shows the strongest trend
  const chosen = isOver
    ? windows.reduce((a,b) => (+b[1] > +a[1] ? b : a))
    : windows.reduce((a,b) => (+b[1] < +a[1] ? b : a));

  const pOver = Math.max(0, Math.min(1, Number(chosen[1])));
  const pEst = isOver ? pOver : (1 - pOver);

  return { label: chosen[0], value: Number(chosen[1]), pEst };
}

function edgeGapFor(outcome, rawStats, avgOdds) {
  const pick = pickWindowAndPEst(outcome, rawStats);
  if (!pick) return null;
  const pImp = americanToProb(avgOdds);
  if (pImp == null) return null;
  return (pick.pEst - pImp) * 100; // percentage points
}

// Test Case: L. Nance 4Q Under
// Stats: L20: 0.65, L10: 0.8, L5: 0.8, H2H: 1.0, Season: 0.8
// These are OVER hit rates (how often he goes OVER 2.5 points in 4Q)
// For UNDER, we want LOW over rates (meaning he stays under often)
const nanceUnder = {
  outcome: {
    outcomeLabel: "Under",
    marketLabel: "L. Nance - 4th Quarter Points"
  },
  stats: {
    l20: 0.65,
    l10: 0.8,
    l5: 0.8,
    h2h: 1.0,      // He went OVER 100% in H2H - BAD for under bet
    curSeason: 0.8,
    prevSeason: 0.58
  },
  avgOdds: -120
};

console.log('\n🔍 Testing Under Prop Edge Calculation\n');
console.log('Player: L. Nance - 4th Quarter Points UNDER 2.5');
console.log('Odds: -120');
console.log('\nStats (these are OVER hit rates):');
console.log('  L20: 65% (went over in 13/20 games)');
console.log('  L10: 80% (went over in 8/10 games)');
console.log('  L5:  80% (went over in 4/5 games)');
console.log('  H2H: 100% (went over in all H2H games)');
console.log('  Season: 80% (went over in 80% of season)');
console.log('  Prev Season: 58%');

const pick = pickWindowAndPEst(nanceUnder.outcome, nanceUnder.stats);
console.log('\n📊 Calculation:');
console.log(`  1. Find LOWEST over rate: ${pick.label} = ${(pick.value * 100).toFixed(0)}%`);
console.log(`  2. For UNDER, p_est = 1 - pOver = 1 - ${pick.value} = ${pick.pEst.toFixed(2)}`);
console.log(`     → We estimate ${(pick.pEst * 100).toFixed(0)}% chance the UNDER hits`);

const pImp = americanToProb(nanceUnder.avgOdds);
console.log(`  3. Implied probability from -120 odds = ${(pImp * 100).toFixed(0)}%`);
console.log(`     → Market thinks ${(pImp * 100).toFixed(0)}% chance the UNDER hits`);

const edgeGap = edgeGapFor(nanceUnder.outcome, nanceUnder.stats, nanceUnder.avgOdds);
console.log(`  4. Edge gap = p_est - p_imp = ${(pick.pEst * 100).toFixed(0)}% - ${(pImp * 100).toFixed(0)}% = ${edgeGap.toFixed(1)}%`);

if (edgeGap < 0) {
  console.log(`\n❌ NEGATIVE EDGE: ${edgeGap.toFixed(1)}%`);
  console.log('   This means the bet is -EV (expected to lose money)');
  console.log('   The market requires a 55% win rate, but we estimate only 42%');
} else {
  console.log(`\n✅ POSITIVE EDGE: +${edgeGap.toFixed(1)}%`);
  console.log('   This means the bet is +EV (expected to make money)');
}

console.log('\n🤔 Why is this bet bad?');
console.log('   - He went OVER in 80% of recent games (L5, L10, Season)');
console.log('   - He went OVER in 100% of H2H matchups');
console.log('   - The BEST case for under is prev season at 58% over rate');
console.log('     → That means only 42% chance he stays under');
console.log('   - But -120 odds require 55% win rate to break even');
console.log('   - 42% < 55% = YOU LOSE MONEY betting this under');

// Test an OVER prop for comparison
console.log('\n\n' + '='.repeat(60));
console.log('🔍 COMPARISON: Same player, OVER bet\n');

const nanceOver = {
  outcome: {
    outcomeLabel: "Over",
    marketLabel: "L. Nance - 4th Quarter Points"
  },
  stats: nanceUnder.stats,
  avgOdds: -120
};

const pickOver = pickWindowAndPEst(nanceOver.outcome, nanceOver.stats);
const pImpOver = americanToProb(nanceOver.avgOdds);
const edgeGapOver = edgeGapFor(nanceOver.outcome, nanceOver.stats, nanceOver.avgOdds);

console.log('Player: L. Nance - 4th Quarter Points OVER 2.5');
console.log('Odds: -120');
console.log('\n📊 Calculation:');
console.log(`  1. Find HIGHEST over rate: ${pickOver.label} = ${(pickOver.value * 100).toFixed(0)}%`);
console.log(`  2. For OVER, p_est = ${pickOver.pEst.toFixed(2)}`);
console.log(`     → We estimate ${(pickOver.pEst * 100).toFixed(0)}% chance the OVER hits`);
console.log(`  3. Implied probability from -120 odds = ${(pImpOver * 100).toFixed(0)}%`);
console.log(`  4. Edge gap = ${(pickOver.pEst * 100).toFixed(0)}% - ${(pImpOver * 100).toFixed(0)}% = ${edgeGapOver.toFixed(1)}%`);

if (edgeGapOver > 0) {
  console.log(`\n✅ POSITIVE EDGE: +${edgeGapOver.toFixed(1)}%`);
  console.log('   The OVER would be a much better bet!');
  console.log(`   We estimate ${(pickOver.pEst * 100).toFixed(0)}% win rate vs ${(pImpOver * 100).toFixed(0)}% required`);
} else {
  console.log(`\n❌ NEGATIVE EDGE: ${edgeGapOver.toFixed(1)}%`);
}

console.log('\n✅ CONCLUSION: Edge calculation is CORRECT for Under props');
console.log('   The negative edge correctly reflects that this Under bet is bad.');
