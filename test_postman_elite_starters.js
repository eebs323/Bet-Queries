// POSTMAN PRE-REQUEST SCRIPT TEST
// Copy and paste this into your Postman request's "Pre-request Script" tab
// to verify the EliteStarters global variable is set up correctly

console.log('═'.repeat(60));
console.log('🧪 TESTING ELITE STARTERS SETUP');
console.log('═'.repeat(60));

// Test 1: Check if global variable exists
const eliteStartersRaw = pm.globals.get('EliteStarters');
if (!eliteStartersRaw) {
    console.log('❌ FAIL: EliteStarters global variable NOT found');
    console.log('');
    console.log('📝 To fix:');
    console.log('1. Go to Environments (gear icon) → Globals');
    console.log('2. Add variable: EliteStarters');
    console.log('3. Paste the JSON array from eliteStarters_array.json');
    console.log('4. Save');
} else {
    console.log('✅ PASS: EliteStarters global variable found');
    
    // Test 2: Check if it's valid JSON
    try {
        const eliteStarters = JSON.parse(eliteStartersRaw);
        console.log('✅ PASS: Valid JSON format');
        
        // Test 3: Check if it's an array
        if (!Array.isArray(eliteStarters)) {
            console.log('❌ FAIL: EliteStarters is not an array');
        } else {
            console.log('✅ PASS: Is an array');
            
            // Test 4: Check array length
            if (eliteStarters.length === 0) {
                console.log('❌ FAIL: Array is empty');
            } else {
                console.log(`✅ PASS: Contains ${eliteStarters.length} players`);
                
                // Test 5: Check structure of first player
                const first = eliteStarters[0];
                if (!first.player || !first.team || !first.tier) {
                    console.log('⚠️  WARNING: First player missing required fields');
                    console.log('   Expected: player, team, tier');
                    console.log('   Found:', Object.keys(first));
                } else {
                    console.log('✅ PASS: Player structure looks good');
                    console.log('');
                    console.log('📊 First player example:');
                    console.log('   Name:', first.player);
                    console.log('   Team:', first.team);
                    console.log('   Tier:', first.tier);
                }
                
                // Show tier breakdown
                console.log('');
                console.log('📊 Tier Breakdown:');
                const sTier = eliteStarters.filter(p => p.tier === 'S');
                const aTier = eliteStarters.filter(p => p.tier === 'A');
                const bTier = eliteStarters.filter(p => p.tier === 'B');
                console.log(`   S-Tier: ${sTier.length} players`);
                console.log(`   A-Tier: ${aTier.length} players`);
                console.log(`   B-Tier: ${bTier.length} players`);
                
                // Show sample S-tier players
                if (sTier.length > 0) {
                    console.log('');
                    console.log('🌟 S-Tier Players:');
                    sTier.slice(0, 5).forEach(p => {
                        console.log(`   • ${p.player} (${p.team})`);
                    });
                    if (sTier.length > 5) {
                        console.log(`   ... and ${sTier.length - 5} more`);
                    }
                }
            }
        }
    } catch (e) {
        console.log('❌ FAIL: Could not parse JSON');
        console.log('   Error:', e.message);
        console.log('');
        console.log('📝 To fix:');
        console.log('1. Validate your JSON at https://jsonlint.com/');
        console.log('2. Make sure it starts with [ and ends with ]');
        console.log('3. Re-run: node convert_elite_starters_for_postman.js');
    }
}

console.log('═'.repeat(60));
console.log('🎯 Test complete! Check results above.');
console.log('═'.repeat(60));
