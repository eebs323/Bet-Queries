const fs = require('fs');

// Load the processed data
const json = JSON.parse(fs.readFileSync('processed_output.json', 'utf8'));
const allProps = json.filteredData || [];

// Get filter from command line (optional)
const filter = process.argv[2]?.toLowerCase() || '';
const limit = parseInt(process.argv[3]) || 50;

console.log('\n📋 Available Props (first ' + limit + ')');
console.log('═'.repeat(80));
console.log('Row | Player | Type | Line | Period | Edge | Approval\n');

let count = 0;
allProps.forEach((prop, i) => {
  if (count >= limit) return;
  
  // Apply filter if provided
  if (filter && !prop.player.toLowerCase().includes(filter)) {
    return;
  }
  
  const rowNum = (i + 1).toString().padStart(4, ' ');
  const edge = prop.edgeGapPct ? `${prop.edgeGapPct.toFixed(0)}%`.padStart(5) : '  N/A';
  const approval = prop.approvalTag || '';
  
  console.log(`${rowNum} | ${prop.player}`);
  console.log(`     | ${prop.type} ${prop.line} (${prop.periodLabel}) | Edge: ${edge} | ${approval}`);
  console.log('');
  count++;
});

console.log('═'.repeat(80));
console.log(`\nShowing ${count} of ${allProps.length} total props`);

if (filter) {
  console.log(`Filter: "${filter}"`);
}

console.log('\nUsage:');
console.log('  node list_props.js [player_name] [limit]');
console.log('\nExamples:');
console.log('  node list_props.js                    # Show first 50 props');
console.log('  node list_props.js lebron            # Filter by player name');
console.log('  node list_props.js curry 20          # Show 20 Curry props');
console.log('\nTo analyze a slip:');
console.log('  node analyze_slip_by_ids.js 1 5 10   # Analyze rows 1, 5, 10\n');
