const fs = require('fs');
const path = require('path');

// Mock Postman environment
const environment = {
    isPlayoffs: false,
    leagueType: "NBA",
    nbaEarlySeason: false,
    nbaEarlyGamesCutoff: 12,
    showOnlyGoblins: false,
    showOnly2ndHalf: false,
    showPrizePicksOnly: true,  // Changed to true to match your data
    maxRegularPairs: 100
};

// Mock pm.environment.get function
function getEnvValue(key) {
    return environment[key]?.toString() || null;
}

// Mock pm.globals.get function
function getGlobalValue(key) {
    const statFiles = {
        'NBADefensiveStats': './DefensiveStats.json',
        'NBAEntities': './Entities.json',
        'NBASchedule': './Schedule.json'
    };
    
    if (statFiles[key]) {
        try {
            return fs.readFileSync(statFiles[key], 'utf8');
        } catch (err) {
            console.error(`Error reading ${key} file:`, err);
            return "{}";
        }
    }
    return "{}";
}

// Mock Postman's pm object
global.pm = {
    environment: {
        get: getEnvValue
    },
    globals: {
        get: getGlobalValue
    },
    visualizer: {
        set: (template, data) => {
            // Store the processed data in a file for inspection
            const result = typeof data === 'function' ? data() : data;
            fs.writeFileSync('processed_output.json', JSON.stringify(result, null, 2));
            console.log('\n✅ Output written to processed_output.json');
            console.log(`📊 Processed ${result.filteredData?.length || 0} props`);
            console.log(`🎰 Generated ${result.slips?.length || 0} slips`);
        }
    },
    response: {
        json: () => {
            try {
                return JSON.parse(fs.readFileSync('./PlayerProps.json', 'utf8'));
            } catch (err) {
                console.error('Error reading PlayerProps.json:', err);
                return { props: [] };
            }
        }
    }
};

// Debug: Check what data we're loading
console.log('\n🔍 Debugging Information:');
try {
    const playerProps = JSON.parse(fs.readFileSync('./PlayerProps.json', 'utf8'));
    console.log(`📁 PlayerProps.json loaded: ${playerProps.props?.length || 0} props found`);
    if (playerProps.props && playerProps.props.length > 0) {
        console.log(`📋 First prop example:`, JSON.stringify(playerProps.props[0], null, 2).substring(0, 500));
    }
    
    // Check defensive stats
    const defensiveStats = JSON.parse(fs.readFileSync('./DefensiveStats.json', 'utf8'));
    const season2025 = defensiveStats?.content?.seasons?.find(s => s.year === "2025");
    console.log(`\n🛡️ DefensiveStats.json:`);
    console.log(`   Total seasons: ${defensiveStats?.content?.seasons?.length || 0}`);
    console.log(`   2025 season found: ${!!season2025}`);
    if (season2025) {
        const teamsWithRankings = season2025.teams.filter(t => t.rankings && Object.keys(t.rankings).length > 0);
        const teamsWithStatRankings = season2025.teams.filter(t => t.rankings?.statRankings?.overall);
        console.log(`   2025 teams: ${season2025.teams.length}`);
        console.log(`   Teams with rankings object: ${teamsWithRankings.length}`);
        console.log(`   Teams with statRankings data: ${teamsWithStatRankings.length}`);
        
        // Check first team's ranking structure
        const firstTeam = season2025.teams[0];
        console.log(`   First team (${firstTeam.alias}) rankings keys:`, Object.keys(firstTeam.rankings || {}));
        if (firstTeam.rankings?.statRankings?.overall) {
            console.log(`   Has defense stats:`, !!firstTeam.rankings.statRankings.overall.defense);
            console.log(`   Defense stats count:`, firstTeam.rankings.statRankings.overall.defense?.length || 0);
        }
        
        if (teamsWithStatRankings.length === 0) {
            console.log(`   ⚠️ WARNING: No teams have statRankings data for 2025 season!`);
            console.log(`   Defense ranks will show as "N/A"`);
        }
    }
    
    // Check schedule
    const schedule = JSON.parse(fs.readFileSync('./Schedule.json', 'utf8'));
    console.log(`\n📅 Schedule.json:`);
    console.log(`   Total events: ${schedule?.events?.length || 0}`);
    
    // Check entities
    const entities = JSON.parse(fs.readFileSync('./Entities.json', 'utf8'));
    console.log(`\n👥 Entities.json:`);
    console.log(`   Total teams: ${entities?.content?.teams?.length || 0}`);
    
} catch (err) {
    console.error('❌ Error loading files:', err.message);
}

// Enable debug mode for filtering
global.DEBUG_FILTER = true;

// Now import and run the main script
console.log('\n🚀 Running main script...\n');
require('./PostManPropWithDefensiveRanks.js');

// Print filter debug summary
if (global.printFilterDebug) {
    global.printFilterDebug();
}