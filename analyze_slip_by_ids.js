const fs = require('fs');

// Load the processed data
const json = JSON.parse(fs.readFileSync('processed_output.json', 'utf8'));
const allProps = json.filteredData || [];

// Get leg numbers from command line args
const legNumbers = process.argv.slice(2).map(n => parseInt(n));

if (legNumbers.length === 0) {
  console.log('\n❌ Usage: node analyze_slip_by_ids.js <row1> <row2> <row3> ...');
  console.log('\nExample: node analyze_slip_by_ids.js 1 5 10 15 20');
  console.log('\nTo see row numbers, check your processed_output.json table or run:');
  console.log('  node -e "const fs=require(\'fs\'); const j=JSON.parse(fs.readFileSync(\'processed_output.json\',\'utf8\')); j.filteredData.slice(0,20).forEach((p,i)=>console.log(`${i+1}. ${p.player} ${p.type} ${p.line}`))"');
  process.exit(1);
}

// Helper functions
function calculateSlipRating(legs, isEarlySeason = false) {
  let totalScore = 0;
  
  for (const leg of legs) {
    const h2h = Number(leg.h2h) || 0;
    const l5 = Number(leg.l5) || 0;
    const l10 = Number(leg.l10) || 0;
    const curSeason = Number(leg.curSeason) || 0;
    const prevSeason = Number(leg.prevSeason) || 0;
    
    const edgeGap = Math.min(100, Math.max(0, leg.edgeGapPct || 0)) / 100;
    const defRank = Number(leg.defenseRank);
    const defScore = (defRank && defRank > 0 && !isNaN(defRank)) ? Math.max(0, (30 - defRank) / 30) : 0;
    
    let legScore = 0;
    
    if (isEarlySeason) {
      legScore += h2h * 0.30;
      legScore += l5 * 0.25;
      legScore += prevSeason * 0.20;
      legScore += edgeGap * 0.20;
      legScore += defScore * 0.05;
    } else {
      legScore += h2h * 0.25;
      legScore += l5 * 0.20;
      legScore += l10 * 0.15;
      legScore += curSeason * 0.10;
      legScore += edgeGap * 0.20;
      legScore += defScore * 0.10;
    }
    
    totalScore += legScore;
  }
  
  const avgScore = totalScore / legs.length;
  const rating = Math.round(avgScore * 10 * 10) / 10;
  
  let ratingClass = 'low';
  if (isEarlySeason) {
    if (rating >= 8) ratingClass = 'high';
    else if (rating >= 6) ratingClass = 'medium';
  } else {
    if (rating >= 7) ratingClass = 'high';
    else if (rating >= 5) ratingClass = 'medium';
  }
  
  return { rating, ratingClass };
}

function getRiskLevel(legs, isEarlySeason = false) {
  const avgStats = legs.reduce((acc, leg) => {
    acc.h2h += Number(leg.h2h) || 0;
    acc.prevSeason += Number(leg.prevSeason) || 0;
    acc.l5 += Number(leg.l5) || 0;
    acc.l10 += Number(leg.l10) || 0;
    acc.edgeGap += Number(leg.edgeGapPct) || 0;
    return acc;
  }, { h2h: 0, prevSeason: 0, l5: 0, l10: 0, edgeGap: 0 });
  
  const len = legs.length;
  avgStats.h2h /= len;
  avgStats.prevSeason /= len;
  avgStats.l5 /= len;
  avgStats.l10 /= len;
  avgStats.edgeGap /= len;
  
  let riskLevel, riskClass;
  
  if (isEarlySeason) {
    if (avgStats.h2h > 0.85 && avgStats.prevSeason > 0.7 && avgStats.l5 >= avgStats.prevSeason) {
      riskLevel = "LOW";
      riskClass = "high";
    } else if (avgStats.h2h > 0.75 && avgStats.prevSeason > 0.6 && avgStats.l5 > 0.6) {
      riskLevel = "MEDIUM";
      riskClass = "medium";
    } else {
      riskLevel = "HIGH";
      riskClass = "low";
    }
  } else {
    if (avgStats.h2h > 0.75 && avgStats.l10 > 0.65 && avgStats.edgeGap > 12) {
      riskLevel = "LOW";
      riskClass = "high";
    } else if (avgStats.h2h > 0.65 && avgStats.l5 > 0.6 && avgStats.edgeGap > 8) {
      riskLevel = "MEDIUM";
      riskClass = "medium";
    } else {
      riskLevel = "HIGH";
      riskClass = "low";
    }
  }
  
  return { riskLevel, riskClass, avgStats };
}

// Get the legs
const legs = [];
const notFound = [];

legNumbers.forEach(num => {
  const index = num - 1; // Convert to 0-based index
  if (index >= 0 && index < allProps.length) {
    legs.push(allProps[index]);
  } else {
    notFound.push(num);
  }
});

if (notFound.length > 0) {
  console.log(`\n⚠️ Warning: Row numbers not found: ${notFound.join(', ')}`);
  console.log(`   Valid range: 1-${allProps.length}\n`);
}

if (legs.length === 0) {
  console.log('\n❌ No valid props found. Exiting.\n');
  process.exit(1);
}

// Calculate slip metrics
console.log('\n' + '═'.repeat(70));
console.log(`📊 CUSTOM SLIP ANALYSIS (${legs.length}-pick)`);
console.log('═'.repeat(70));

const totalGap = legs.reduce((sum, leg) => sum + (leg.edgeGapPct || 0), 0);
const { rating, ratingClass } = calculateSlipRating(legs);
const { riskLevel, riskClass, avgStats } = getRiskLevel(legs);

console.log(`\n🎲 Overall Metrics:`);
console.log(`  Rating: ${rating}/10 (${ratingClass})`);
console.log(`  Total Edge Gap: ${totalGap.toFixed(1)}%`);
console.log(`  Avg Edge per leg: ${(totalGap / legs.length).toFixed(1)}%`);
console.log(`  Risk Level: ${riskLevel} (${riskClass})`);

console.log(`\n📈 Average Stats:`);
console.log(`  H2H: ${(avgStats.h2h * 100).toFixed(0)}%`);
console.log(`  L5: ${(avgStats.l5 * 100).toFixed(0)}%`);
console.log(`  L10: ${(avgStats.l10 * 100).toFixed(0)}%`);
console.log(`  Season: ${(legs.reduce((s, l) => s + (l.curSeason || 0), 0) / legs.length * 100).toFixed(0)}%`);

console.log(`\n📋 Individual Legs:\n`);

legs.forEach((leg, i) => {
  const trend = leg.l5 > leg.l10 * 1.1 ? '↑' : (leg.l5 < leg.l10 * 0.9 ? '↓' : '→');
  console.log(`${i + 1}. ${trend} ${leg.player}`);
  console.log(`   Line: ${leg.type} ${leg.line} (${leg.periodLabel})`);
  console.log(`   Edge: ${leg.edgeGapPct?.toFixed(1)}% | ${leg.edgeNote}`);
  console.log(`   Stats: H2H ${(leg.h2h * 100).toFixed(0)}% | L5 ${(leg.l5 * 100).toFixed(0)}% | L10 ${(leg.l10 * 100).toFixed(0)}% | Season ${(leg.curSeason * 100).toFixed(0)}%`);
  console.log(`   Defense Rank: ${leg.defenseRank} | Approval: ${leg.approvalTag}`);
  console.log('');
});

console.log('═'.repeat(70));
console.log('\n💡 Rating Breakdown:');
console.log('  Weights (Regular Season):');
console.log('    - H2H: 25%');
console.log('    - L5: 20%');
console.log('    - L10: 15%');
console.log('    - Current Season: 10%');
console.log('    - Edge Gap: 20% (normalized to 0-1 scale)');
console.log('    - Defense Rank: 10% (30-rank)/30');

console.log('\n🎲 Risk Criteria (Regular Season):');
console.log('  LOW: H2H > 75% AND L10 > 65% AND Edge > 12%');
console.log('  MEDIUM: H2H > 65% AND L5 > 60% AND Edge > 8%');
console.log('  HIGH: Everything else');

console.log(`\n✓ Your Slip:`);
console.log(`  H2H: ${(avgStats.h2h * 100).toFixed(0)}% ${avgStats.h2h > 0.75 ? '✅' : (avgStats.h2h > 0.65 ? '⚠️' : '❌')} (${avgStats.h2h > 0.75 ? 'LOW' : (avgStats.h2h > 0.65 ? 'MED' : 'HIGH')})`);
console.log(`  L10: ${(avgStats.l10 * 100).toFixed(0)}% ${avgStats.l10 > 0.65 ? '✅' : (avgStats.l10 > 0.6 ? '⚠️' : '❌')} (${avgStats.l10 > 0.65 ? 'LOW' : (avgStats.l10 > 0.6 ? 'MED' : 'HIGH')})`);
console.log(`  L5: ${(avgStats.l5 * 100).toFixed(0)}% ${avgStats.l5 > 0.6 ? '✅' : '❌'} (${avgStats.l5 > 0.6 ? 'PASS' : 'FAIL'})`);
console.log(`  Edge: ${(avgStats.edgeGap).toFixed(1)}% ${avgStats.edgeGap > 12 ? '✅' : (avgStats.edgeGap > 8 ? '⚠️' : '❌')} (${avgStats.edgeGap > 12 ? 'LOW' : (avgStats.edgeGap > 8 ? 'MED' : 'HIGH')})`);
console.log(`  Result: ${riskLevel}\n`);

console.log('═'.repeat(70));
console.log('\n💡 Tip: To find row numbers, look at the table in your processed_output');
console.log('   or run: node list_props.js\n');
