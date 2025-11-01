const fs = require('fs');
const json = JSON.parse(fs.readFileSync('processed_output.json', 'utf8'));

console.log('\n📊 Odds Availability Analysis\n');

const allProps = json.filteredData || [];

let withRealOdds = 0;
let withoutRealOdds = 0;
let positiveEdgeNoOdds = 0;
let safetyPassNoOdds = 0;

const noOddsExamples = [];

allProps.forEach(prop => {
  const hasOdds = prop.AVG_ODDS !== "N/A" && prop.AVG_ODDS !== null;
  const edgeNote = prop.edgeNote || "";
  const isNoOddsNote = edgeNote.includes("No sportsbook odds");
  
  if (hasOdds && !isNoOddsNote) {
    withRealOdds++;
  } else {
    withoutRealOdds++;
    
    // Check if it would have been a good prop
    const isSafe = prop.approvalTag?.includes("✅");
    if (isSafe) {
      safetyPassNoOdds++;
    }
    
    // Store examples
    if (noOddsExamples.length < 10) {
      noOddsExamples.push({
        player: prop.player,
        period: prop.periodLabel,
        approval: prop.approvalTag,
        edgeNote: prop.edgeNote,
        ppOdds: prop.PP_odds
      });
    }
  }
});

console.log('Props with real sportsbook odds:', withRealOdds);
console.log('Props WITHOUT real sportsbook odds:', withoutRealOdds);
console.log(`  - Of those, ${safetyPassNoOdds} passed safety filters (✅)`);
console.log(`  - Percentage missing odds: ${((withoutRealOdds / allProps.length) * 100).toFixed(1)}%`);

console.log('\n\n📋 Examples of props WITHOUT sportsbook odds:\n');
noOddsExamples.forEach((ex, i) => {
  console.log(`${i + 1}. ${ex.player}`);
  console.log(`   Period: ${ex.period}`);
  console.log(`   Approval: ${ex.approval}`);
  console.log(`   Edge: ${ex.edgeNote}`);
  console.log(`   PP Odds: ${ex.ppOdds}`);
  console.log('');
});

console.log('\n💡 Impact on Recommended Slips:');
console.log('   - Props without real sportsbook odds are now EXCLUDED from slips');
console.log('   - Edge calculations require actual market odds to be meaningful');
console.log(`   - This removed ~${safetyPassNoOdds} safe props that lacked proper odds`);
console.log('   - PrizePicks-only lines (no comparison) are filtered out');

// Check the slips
const slips = json.slips || [];
console.log(`\n\n🎰 Current Recommended Slips: ${slips.length} slips`);

let totalLegs = 0;
let periodsInSlips = {};

slips.forEach(slip => {
  totalLegs += slip.legs?.length || 0;
  slip.legs?.forEach(leg => {
    const period = leg.periodLabel || 'Unknown';
    periodsInSlips[period] = (periodsInSlips[period] || 0) + 1;
  });
});

console.log(`Total legs across all slips: ${totalLegs}`);
console.log('\nPeriod distribution in slips:');
Object.entries(periodsInSlips)
  .sort((a, b) => b[1] - a[1])
  .forEach(([period, count]) => {
    const pct = ((count / totalLegs) * 100).toFixed(1);
    console.log(`  ${period}: ${count} (${pct}%)`);
  });
