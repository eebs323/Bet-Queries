const fs = require('fs');
const json = JSON.parse(fs.readFileSync('processed_output.json', 'utf8'));

console.log('\n📊 Period Analysis in Recommended Slips:\n');

const slips = json.slips || [];
const periodCounts = {};
let totalProps = 0;

slips.forEach((slip, idx) => {
  console.log(`\n${slip.title}:`);
  const periods = {};
  
  slip.legs.forEach(leg => {
    // Get period label from leg object
    const period = leg.periodLabel || 'Unknown';
    periods[period] = (periods[period] || 0) + 1;
    periodCounts[period] = (periodCounts[period] || 0) + 1;
    totalProps++;
  });
  
  Object.entries(periods).forEach(([period, count]) => {
    console.log(`  - ${period}: ${count} props`);
  });
});

console.log('\n\n📈 Overall Period Distribution:');
Object.entries(periodCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([period, count]) => {
    const pct = ((count / totalProps) * 100).toFixed(1);
    console.log(`  ${period}: ${count} (${pct}%)`);
  });

console.log(`\nTotal props in slips: ${totalProps}`);
