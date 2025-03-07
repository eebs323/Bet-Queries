var template = `
    <style>
        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: auto;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            word-break: break-word;
        }
        th {
            background-color: #f4f4f4;
        }
        .dark-green-text { color: green; font-weight: bold; }
        .green-text { color: green; }
        .dark-red-text { color: red; font-weight: bold; }
        .red-text { color: red; }
    </style>
    <table>
        <thead>
            <tr>
                <th>Player</th>
                <th>Type</th>
                <th>Line</th>
                <th>L10</th>
                <th>L5</th>
                <th>H2H</th>
                <th>Szn</th>
                <th>D Rank</th>
                <th>ODDS</th>
                <th>PP</th>
                <th>SL</th>
                <th>UD</th>
                <th>FD</th>
                <th>DK</th>
                <th>CSRS</th>
                <th>365</th>
                <th>MGM</th>
            </tr>
        </thead>
        <tbody>
            {{#each filteredData}}
            <tr>
                <td>{{player}}</td>
                <td>{{type}}</td>
                <td>{{line}}</td>
                <td>{{l10}}</td>
                <td>{{l5}}</td>
                <td>{{h2h}}</td>
                <td>{{curSeason}}</td>
                <td class="{{defenseClass}}">{{defenseRank}}</td>
                <td>{{AVG_ODDS}}</td>
                <td>{{PP_odds}}</td>
                <td>{{SleeperOdds}}</td>
                <td>{{UD_odds}}</td>
                <td>{{FANDUEL_odds}}</td>
                <td>{{DK_odds}}</td>
                <td>{{CAESARS_odds}}</td>
                <td>{{BET365_odds}}</td>
                <td>{{MGM_odds}}</td>
            </tr>
            {{/each}}
        </tbody>
    </table>
`;

// Retrieve stored defensive stats, entities, and schedule
let defensiveStats = JSON.parse(pm.globals.get("DefensiveStats") || "{}");
let entities = JSON.parse(pm.globals.get("Entities") || "{}");
let schedule = JSON.parse(pm.globals.get("nbaScheduleData") || "{}");

// Function to find opponent team in a game
function findOpponentTeam(playerTeamId, eventId) {
    const game = schedule?.events?.find(game => game.eventId == eventId);
    if (!game) return null;
    if (game?.home?.teamId == null || game?.away?.teamId == null) return "N/A"
    return playerTeamId == game.home.teamId ? game.away.teamId : game.home.teamId;
}

function getOpponentDefenseRanking(playerTeamId, eventId, propType) {
    let opponentTeamId = findOpponentTeam(playerTeamId, eventId);
    if (!opponentTeamId) return "N/A";

    const currentSeason = defensiveStats.content?.seasons?.find(season => season.year == '2024');
    if (!currentSeason) {
        console.log(`Error: No currentSeason found for season.year: ${season.year}`);
        return "N/A";
    }

    const team = currentSeason.teams?.find(team => team.teamId == opponentTeamId);
    if (!team) {
        console.log(`Error: No team found for teamId: ${playerTeamId}, eventId: ${eventId}`);
        return "N/A";
    }

    //const defenseStats = team?.rankings?.statRankings?.overall?.defense || [];
    const defenseStats = (
        propType === "STEALS" 
        || propType === "STEALS_BLOCKS" 
        || propType === "BLOCKS"
        || propType === "DEFENSIVE_REBOUNDS"
        || propType === "TURNOVERS"
    ) 
        ? team?.rankings?.statRankings?.overall?.offense
        : team?.rankings?.statRankings?.overall?.defense 
        || [];

    // Define stat mappings
    const statMap = {
        "POINTS_REBOUNDS_ASSISTS": "points|rebounds|assists",
        "FANTASY_SCORE_PP": "points|rebounds|assists", // Updated logic below for FANTASY_SCORE_PP
        "POINTS_REBOUNDS": "points|rebounds",
        "POINTS_ASSISTS": "points|assists",
        "REBOUNDS_ASSISTS": "rebounds|assists",
        "POINTS": "points",
        "REBOUNDS": "rebounds",
        "ASSISTS": "assists",
        "BLOCKS": "blocks",
        "STEALS": "steals",
        "STEALS_BLOCKS": "steals|blocks",
        "TURNOVERS": "turnovers",
        "THREE_POINTERS": "threePointPct",
        "FREE_THROWS": "ftMade",
        "THREE_POINTERS_ATTEMPTED": "threePointsAtt",
        "FIELD_GOALS_ATTEMPTED": "twoPointsAtt",
        "DEFENSIVE_REBOUNDS": "defRebounds",
        "OFFENSIVE_REBOUNDS": "offRebounds",
        "MADE_FIELD_GOALS": "fieldGoalPct"
    };

    // If the propType is FANTASY_SCORE_PP, calculate the average rank of "points|rebounds|assists" and "steals|blocks"
    if (propType === "FANTASY_SCORE_PP") {
        let primaryStat = defenseStats.find(stat => stat.stat === "points|rebounds|assists")?.rank;
        let secondaryStat = defenseStats.find(stat => stat.stat === "steals|blocks")?.rank;

        if (primaryStat !== undefined && secondaryStat !== undefined) {
            return Math.round((primaryStat + secondaryStat) / 2); // Average both values
        }
        return primaryStat !== undefined ? primaryStat : secondaryStat !== undefined ? secondaryStat : "N/A";
    }

    // Normal ranking retrieval for other prop types
    let statKey = statMap[propType] || null;
    if (!statKey) return "N/A";

    let ranking = defenseStats.find(stat => stat.stat == statKey)?.rank;
    return ranking !== undefined ? ranking : "N/A";
}

function sortProps(a, b, sortingType) {
    let bestOddsA = getAvgOdds(a) || 0;
    let bestOddsB = getAvgOdds(b) || 0;
    let seasonA = parseFloat(a.stats.curSeason) || 0;
    let seasonB = parseFloat(b.stats.curSeason) || 0;
    let defenseRankA = parseFloat(getOpponentDefenseRanking(a.outcome.teamId, a.outcome.eventId, a.outcome.proposition)) || 30; // Default to worst rank
    let defenseRankB = parseFloat(getOpponentDefenseRanking(b.outcome.teamId, b.outcome.eventId, b.outcome.proposition)) || 30;
    let l10A = parseFloat(a.stats.l10) || 0;
    let l10B = parseFloat(b.stats.l10) || 0;
    let l5A = parseFloat(a.stats.l5) || 0;
    let l5B = parseFloat(b.stats.l5) || 0;

    if (sortingType === SortingType.DEFENSE_RANK_FIRST) {
        if (defenseRankA !== defenseRankB) return  defenseRankB - defenseRankA; // Lower rank = better defense (higher priority)
        if (seasonB !== seasonA) return seasonB - seasonA; // If Defense Rank is the same, sort by curSeason (Descending)
        return bestOddsA - bestOddsB; // If both are the same, sort by bestOdds (Ascending)
    }

    if (sortingType === SortingType.CUR_SEASON_FIRST) {
        if (seasonB !== seasonA) return seasonB - seasonA;
        return bestOddsA - bestOddsB;
    } 

    if (sortingType === SortingType.SORT_ODDS_FIRST) {
        if (bestOddsA !== bestOddsB) return bestOddsA - bestOddsB;
        return seasonB - seasonA;
    }

    if (sortingType === SortingType.TREND_FIRST) {
        let trendA = l10A + l5A;
        let trendB = l10B + l5B;
        if (trendB !== trendA) return trendB - trendA;
        return seasonB - seasonA;
    }

    return 0; // Default case (no sorting)
}

function mapProps(item, filterType) {
    let isPrizePicks = item.outcome.bookOdds.PRIZEPICKS !== undefined;
    let includeItem = isPrizePicks;

    // Find opponent team ID
    let opponentTeamId = findOpponentTeam(item.outcome.teamId, item.outcome.eventId);
    let opponentTeamName = "Unknown Team";

    if (opponentTeamId) {
        let opponentTeam = entities.content.teams.find(team => team.team.teamId === opponentTeamId);
        if (opponentTeam) {
            opponentTeamName = opponentTeam.team.fullName; // Use full team name
        }
    }

    // Get defensive ranking
    let opponentDefenseRank = getOpponentDefenseRanking(item.outcome.teamId, item.outcome.eventId, item.outcome.proposition);
    
    // **🚨 Filter out props with "N/A" defense ranking or "Unknown Team" opponent 🚨**
    if (opponentDefenseRank == "N/A" && opponentTeamName == "Unknown Team") {
        // return null;
    }

    let isOver = item.outcome.outcomeLabel === "Over";
    let defenseClass = "";
    if (opponentDefenseRank !== "N/A") {
        if ((isOver && opponentDefenseRank >= 20) || (!isOver && opponentDefenseRank <= 10)) {
            defenseClass = "dark-green-text";  // Heavy Favorable matchup
        } else if ((isOver && opponentDefenseRank <= 10) || (!isOver && opponentDefenseRank >= 20)) {
            defenseClass = "dark-red-text";  // Heavy Unfavorable matchup
            return null;
        } else if ((!isOver && opponentDefenseRank <= 15) || (isOver && opponentDefenseRank >= 15)) {
            defenseClass = "green-text";  // Medium favorable matchup
            // return null;
        } else if ((isOver && opponentDefenseRank <= 15) || (!isOver && opponentDefenseRank >= 15)) {
            defenseClass = "red-text";  // Medium unfavorable matchup
            // return null;
        }
    }

    return includeItem
        ? {
              player: `${item.outcome.marketLabel} vs ${opponentTeamName}`, // Updated player column
              type: item.outcome.outcomeLabel,
              line: item.outcome.line,
              l10: item.stats.l10,
              l5: item.stats.l5,
              h2h: item.stats.h2h,
              curSeason: item.stats.curSeason,
              defenseRank: opponentDefenseRank,
              defenseClass,
              CAESARS_odds: item.outcome.bookOdds.CAESARS?.odds,
              FANDUEL_odds: item.outcome.bookOdds.FANDUEL?.odds,
              DK_odds: item.outcome.bookOdds.DRAFTKINGS?.odds,
              BET365_odds: item.outcome.bookOdds.BET365?.odds,
              MGM_odds: item.outcome.bookOdds.BETMGM?.odds,
              PP_odds: item.outcome.bookOdds.PRIZEPICKS?.odds,
              UD_odds: item.outcome.bookOdds.UNDERDOG?.odds,
              SleeperOdds:  item.outcome.bookOdds.SLEEPER?.odds,
              AVG_ODDS: getAvgOdds(item)
          }
        : null;
}

function getAvgOdds(item) {
    let sportsbookOdds = [
        item.outcome.bookOdds?.CAESARS?.odds,
        item.outcome.bookOdds?.FANDUEL?.odds,
        item.outcome.bookOdds?.DRAFTKINGS?.odds,
        item.outcome.bookOdds?.BET365?.odds,
        item.outcome.bookOdds?.BETMGM?.odds,
        // item.outcome.bookOdds?.PRIZEPICKS?.odds,
        item.outcome.bookOdds?.UNDERDOG?.odds,
        item.outcome.bookOdds?.SLEEPER?.odds,
    ].map(odds => parseFloat(odds)).filter(odds => !isNaN(odds)); // Convert to numbers & remove NaN values

    let averageOdds = sportsbookOdds.length > 0 
        ? Math.round(sportsbookOdds.reduce((sum, odds) => sum + odds, 0) / sportsbookOdds.length) 
        : null;
    
    return averageOdds;
}

function constructVisualizerPayload(filterType, sortingType) {
    var responseData = pm.response.json();
    // if (filterType === FilterType.FILTER_GOBLINS) {
    //     sortingType = SortingType.CUR_SEASON_FIRST;
    // }
    var filteredData = responseData.props
        .filter(item => filterProps(item, filterType))
        .sort((a, b) => sortProps(a, b, sortingType))
        .map(mapProps, filterType)
        .filter(item => item !== null); // Remove null values
    return { filteredData };
}


function filterProps(item, filterType) {
    // return marketLabel.includes("Bruce Brown")  && noGoblinProps;
    let isOver = item.outcome.outcomeLabel === "Over";
    if (!isOver) return null;

    let stats = item.stats;
    let lowTrendProps = stats.l10 <= 0.4 && stats.l5 <= 0.4
    let inflatedProps = stats.l10 >= 0.8 && stats.l5 >= 0.8 && !isOver
    if (
        lowTrendProps 
    || inflatedProps
    ) {
        return false;
    }
    
    let ppOdds =  parseFloat(item.outcome.bookOdds.PRIZEPICKS?.odds);
    let outcomeLabel = item.outcome.outcomeLabel;
    let noGoblinProps = ppOdds !== -137
    let averageOdds = getAvgOdds(item)
    let hasFavorableOdds = averageOdds !== null && averageOdds <= -125;

    let goblinOdds = averageOdds !== null && averageOdds <= -400
    let goblinPicks = true 
        && stats.h2h >= 0.75
        && stats.l10 >= 0.7
        && stats.l5 >= stats.l10
        && stats.curSeason >= 0.75
        && outcomeLabel == "Over";
    
    let highTrendPicks = noGoblinProps
        && stats.h2h >= 0.75
        && stats.l5 > stats.l10

    let highTrendOddsProps = highTrendPicks && hasFavorableOdds;

    switch (filterType) {
        case FilterType.FILTER_GOBLINS:
            return  goblinPicks || goblinOdds;
        case FilterType.FILTER_HIGH_TREND:
            return highTrendOddsProps;
        case FilterType.FILTER_HIGH_ODDS:
            return hasFavorableOdds && noGoblinProps;
        default:
            return false;
    }
}

const SortingType = {
    CUR_SEASON_FIRST: "CurSeasonFirst",  // Sort by curSeason → bestOdds
    SORT_ODDS_FIRST: "BestOddsFirst",    // Sort by bestOdds → curSeason
    DEFENSE_RANK_FIRST: "DefenseRankFirst", // Sort by opponent defense ranking (Ascending: Easier Matchups First)
    TREND_FIRST: "TrendFirst"
};

const FilterType = {
    FILTER_GOBLINS: "FILTER_GOBLINS",
    FILTER_HIGH_ODDS: "FILTER_HIGH_ODDS", // NEW: Combines PrizePicks, High Odds, and Strong Props
    FILTER_HIGH_TREND: "FILTER_HIGH_TREND"
};

pm.visualizer.set(
    template, 
    constructVisualizerPayload(
        FilterType.FILTER_HIGH_ODDS,  
        SortingType.SORT_ODDS_FIRST
    )
);
