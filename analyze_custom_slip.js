const fs = require('fs');
const readline = require('readline');

// Load the processed data
const json = JSON.parse(fs.readFileSync('processed_output.json', 'utf8'));
const allProps = json.filteredData || [];

// Create a searchable index
const propIndex = new Map();
allProps.forEach(prop => {
  const key = `${prop.player}|${prop.type}|${prop.line}|${prop.periodLabel}`.toLowerCase();
  propIndex.set(key, prop);
});

// Helper functions (copied from PostManPropWithDefensiveRanks.js)
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

function searchProp(searchText) {
  searchText = searchText.toLowerCase().trim();
  
  // Try exact match first
  for (const [key, prop] of propIndex.entries()) {
    if (key.includes(searchText)) {
      return prop;
    }
  }
  
  // Try fuzzy match
  const matches = [];
  for (const prop of allProps) {
    const propText = `${prop.player} ${prop.type} ${prop.line} ${prop.periodLabel}`.toLowerCase();
    if (propText.includes(searchText)) {
      matches.push(prop);
    }
  }
  
  return matches.length > 0 ? matches[0] : null;
}

async function main() {
  console.log('\n🎯 Custom Slip Analyzer');
  console.log('═'.repeat(60));
  console.log('\nEnter your props one at a time. Type "done" when finished.\n');
  console.log('Examples:');
  console.log('  - "Karl-Anthony Towns - Rebounds - Over 9.5"');
  console.log('  - "Josh Hart assists over 2.5"');
  console.log('  - "KAT rebounds o9.5"\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const legs = [];
  let legNum = 1;
  
  const askForProp = () => {
    return new Promise((resolve) => {
      rl.question(`Leg ${legNum}: `, (answer) => {
        resolve(answer.trim());
      });
    });
  };
  
  while (true) {
    const input = await askForProp();
    
    if (input.toLowerCase() === 'done' || input.toLowerCase() === 'exit' || input === '') {
      break;
    }
    
    // Search for the prop
    const foundProp = searchProp(input);
    
    if (foundProp) {
      legs.push(foundProp);
      console.log(`  ✅ Found: ${foundProp.player} (${foundProp.type} ${foundProp.line})`);
      console.log(`     Edge: ${foundProp.edgeGapPct?.toFixed(1)}% | H2H: ${(foundProp.h2h * 100).toFixed(0)}% | L5: ${(foundProp.l5 * 100).toFixed(0)}%\n`);
      legNum++;
    } else {
      console.log(`  ❌ Not found. Try a different search.\n`);
    }
  }
  
  rl.close();
  
  if (legs.length === 0) {
    console.log('\n❌ No props added. Exiting.\n');
    return;
  }
  
  // Calculate slip metrics
  console.log('\n\n' + '═'.repeat(60));
  console.log(`📊 SLIP ANALYSIS (${legs.length}-pick)`);
  console.log('═'.repeat(60));
  
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
    console.log(`   Edge: ${leg.edgeGapPct?.toFixed(1)}%`);
    console.log(`   Stats: H2H ${(leg.h2h * 100).toFixed(0)}% | L5 ${(leg.l5 * 100).toFixed(0)}% | L10 ${(leg.l10 * 100).toFixed(0)}% | Season ${(leg.curSeason * 100).toFixed(0)}%`);
    console.log(`   Defense Rank: ${leg.defenseRank}`);
    console.log('');
  });
  
  console.log('═'.repeat(60));
  console.log('\n💡 Rating Breakdown:');
  console.log('  Weights (Regular Season):');
  console.log('    - H2H: 25%');
  console.log('    - L5: 20%');
  console.log('    - L10: 15%');
  console.log('    - Current Season: 10%');
  console.log('    - Edge Gap: 20%');
  console.log('    - Defense Rank: 10%');
  
  console.log('\n🎲 Risk Criteria (Regular Season):');
  console.log('  LOW: H2H > 75% AND L10 > 65% AND Edge > 12%');
  console.log('  MEDIUM: H2H > 65% AND L5 > 60% AND Edge > 8%');
  console.log('  HIGH: Everything else');
  
  // Show why it got this risk level
  console.log(`\n✓ Your Slip:`);
  console.log(`  H2H: ${(avgStats.h2h * 100).toFixed(0)}% ${avgStats.h2h > 0.75 ? '✅' : '❌'} (need > 75% for LOW)`);
  console.log(`  L10: ${(avgStats.l10 * 100).toFixed(0)}% ${avgStats.l10 > 0.65 ? '✅' : '❌'} (need > 65% for LOW)`);
  console.log(`  Edge: ${(avgStats.edgeGap).toFixed(1)}% ${avgStats.edgeGap > 12 ? '✅' : '❌'} (need > 12% for LOW)`);
  console.log(`  Result: ${riskLevel}\n`);
}

main().catch(console.error);
