const CompetitionId = {
    GBR_EPL: "GBR_EPL",             // English Premier League
    ESP_LA_LIGA: "ESP_LA_LIGA",     // Spanish La Liga
    GER_BUNDESLIGA: "GER_BUNDESLIGA", // German Bundesliga
    ITA_SERIE_A: "ITA_SERIE_A",     // Italian Serie A
    FRA_LIGUE_1: "FRA_LIGUE_1",     // French Ligue 1
    USA_MLS: "USA_MLS"              // Major League Soccer (MLS)
};

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

let leagueType = pm.environment.get("leagueType") || "NBA";
let defensiveStatsKey = `${leagueType}DefensiveStats`;
let entitiesKey = `${leagueType}Entities`;
let scheduleKey = `${leagueType}Schedule`;

let defensiveStats = JSON.parse(pm.globals.get(defensiveStatsKey) || "{}");
let entities = JSON.parse(pm.globals.get(entitiesKey) || "{}");
let schedule = JSON.parse(pm.globals.get(scheduleKey) || "{}");
let competitionId = pm.environment.get("competitionId")

console.log(`Loaded data for league: ${leagueType}`);
console.log(`Defensive Stats Key: ${defensiveStats}`);
console.log(`Entities Key: ${entities}`);
console.log(`Schedule Data Key: ${schedule}`);

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

    let defenseStats;
    if (leagueType === "SOCCER" && competitionId) {
        const competition = defensiveStats.content?.competitions?.find(comp => comp.competitionId === competitionId);
        if (!competition) return "N/A";

        const leagueSeason = competition.seasons?.find(season => season.year == '2024');
        if (!leagueSeason) return "N/A";

        const team = leagueSeason.teams?.find(team => team.teamId === opponentTeamId);
        if (!team) return "N/A";
        
        defenseStats = team?.rankings?.statRankings?.overall?.defense || [];
    } else {
        const currentSeason = defensiveStats.content?.seasons?.find(season => season.year == '2024');
        if (!currentSeason) return "N/A";

        const team = currentSeason.teams?.find(team => team.teamId == opponentTeamId);
        if (!team) return "N/A";

        defenseStats = (
            propType === "STEALS" 
            || propType === "STEALS_BLOCKS" 
            || propType === "BLOCKS"
            || propType === "DEFENSIVE_REBOUNDS"
            || propType === "TURNOVERS"
        ) 
            ? team?.rankings?.statRankings?.overall?.offense
            : team?.rankings?.statRankings?.overall?.defense 
            || [];
    }

    // Define stat mappings for Basketball & Soccer
    const statMap = {
        // Basketball Stats
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
        "THREE_POINTERS": "threePointsMade",
        "FREE_THROWS": "ftMade",
        "THREE_POINTERS_ATTEMPTED": "threePointsAtt",
        "FIELD_GOALS_ATTEMPTED": "twoPointsAtt",
        "DEFENSIVE_REBOUNDS": "defRebounds",
        "OFFENSIVE_REBOUNDS": "offRebounds",
        "MADE_FIELD_GOALS": "fieldGoalPct",

        // Soccer Stats
        "SHOTS_ON_GOAL": "shotsOnGoal",
        "FOULS": "fouls",
        "GOALS": "goals",
        "ASSISTS_SOCCER": "assists",
        "YELLOW_CARDS": "yellowCards",
        "RED_CARDS": "redCards",
        "SHOT_ATTEMPTS": "shotAttempts",
        "DEFENSIVE_TACKLES": "totalTackles",
        "PASSING_ATTEMPTS": "totalPasses",
        "SAVES": "saves",
        "DRIBBLE_ATTEMPTS": "totalDribbleAtt",
        "CLEARANCES": "totalClearances"
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
    let defenseRankA = parseFloat(getOpponentDefenseRanking(a.outcome.teamId, a.outcome.eventId, a.outcome.proposition)) || 30;
    let defenseRankB = parseFloat(getOpponentDefenseRanking(b.outcome.teamId, b.outcome.eventId, b.outcome.proposition)) || 30;
    let trendA = (parseFloat(a.stats.l10) || 0) + (parseFloat(a.stats.l5) || 0);
    let trendB = (parseFloat(b.stats.l10) || 0) + (parseFloat(b.stats.l5) || 0);

    switch (sortingType) {
        case SortingType.SORT_DEFENSE_RANK:
            return defenseRankA !== defenseRankB ? defenseRankB - defenseRankA
                : seasonB !== seasonA 
                    ? seasonB - seasonA
                    : bestOddsA - bestOddsB;

        case SortingType.SORT_SEASON:
            return seasonB !== seasonA 
                    ? seasonB - seasonA
                    : bestOddsA - bestOddsB;

        case SortingType.SORT_ODDS:
            return bestOddsA !== bestOddsB 
                    ? bestOddsA - bestOddsB
                    : trendB !== trendA 
                        ? trendB - trendA
                        : seasonB - seasonA;

        case SortingType.SORT_TREND:
            return trendB !== trendA 
                    ? trendB - trendA
                    : seasonB - seasonA;

        default:
            return 0;
    }
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
    if (opponentDefenseRank !== "N/A" && filterType !== FilterType.FILTER_GOBLINS) {
        const leagueThresholds = {
            NBA: { heavy: 20, midHigh: 16, midLow: 10 },
            NHL: { heavy: 22, midHigh: 17, midLow: 10 },
            SOCCER: { heavy: 8, medium: 7 }
        };

        const { heavy, midHigh, midLow } = leagueThresholds[leagueType] || leagueThresholds["NBA"]; // Default to NBA

        if ((isOver && opponentDefenseRank >= heavy) || (!isOver && opponentDefenseRank <= midLow)) {
            defenseClass = "dark-green-text";  // Heavy Favorable matchup
        } else if ((isOver && opponentDefenseRank <= midLow) || (!isOver && opponentDefenseRank >= heavy)) {
            defenseClass = "dark-red-text";  // Heavy Unfavorable matchup
            return null;
        } else if ((!isOver && opponentDefenseRank <= midHigh) || (isOver && opponentDefenseRank >= midHigh)) {
            defenseClass = "green-text";  // Medium Favorable matchup
        } else {
            defenseClass = "red-text";  // Medium Unfavorable matchup
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
        item.outcome.bookOdds?.SLEEPER?.odds
    ].map(odds => parseFloat(odds)).filter(odds => !isNaN(odds)); // Convert to numbers & remove NaN values

    if (sportsbookOdds.length > 0) {
       let averageOdds = Math.round(sportsbookOdds.reduce((sum, odds) => sum + odds, 0) / sportsbookOdds.length)
       return averageOdds
    } else {
        return null
    }
}

function constructVisualizerPayload(filterType, sortingType) {
    var responseData = pm.response.json();
    var filteredData = responseData.props
        .filter(item => filterProps(item, filterType))
        .sort((a, b) => sortProps(a, b, sortingType))
        .map(mapProps, filterType)
        .filter(item => item !== null); // Remove null values
    return { filteredData };
}


function filterProps(item, filterType) {
    // return marketLabel.includes("Bruce Brown")  && noGoblinProps;
    let outcomeLabel = item.outcome.outcomeLabel;
    let isOver = outcomeLabel == "Over"
    let isUnder = outcomeLabel == "Under"
    if ((filterType == FilterType.FILTER_HIGH_TREND_OVERS || filterType == FilterType.FILTER_HIGH_ODDS_OVERS) && isUnder) return false;
    if ((filterType == FilterType.FILTER_HIGH_TREND_UNDERS || filterType == FilterType.FILTER_HIGH_ODDS_UNDERS) && isOver) return false;

    let stats = item.stats;
    let lowTrendProps = stats.l10 <= 0.4 && stats.l5 <= 0.4
    let midTrendProps = stats.l10 <= 0.5 && stats.l5 <= 0.6
    let inflatedProps = stats.l10 >= 0.8 && stats.l5 >= 0.8 && !isOver
    if (
        lowTrendProps 
    || inflatedProps
    || midTrendProps
    ) {
        return false;
    }
    
    let ppOdds =  parseFloat(item.outcome.bookOdds.PRIZEPICKS?.odds);
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
        && stats.l5 >= stats.l10
    
    if (leagueType == "SOCCER"){
        return (goblinPicks || goblinOdds) && highTrendPicks;
    }
    switch (filterType) {
        case FilterType.FILTER_GOBLINS:
            return  goblinPicks || goblinOdds;
        case FilterType.FILTER_HIGH_TREND_UNDERS:
        case FilterType.FILTER_HIGH_TREND_OVERS:
        case FilterType.FILTER_HIGH_TREND:
            return highTrendPicks;
        case FilterType.FILTER_HIGH_ODDS_UNDERS:
        case FilterType.FILTER_HIGH_ODDS_OVERS:
        case FilterType.FILTER_HIGH_ODDS:
            return hasFavorableOdds && noGoblinProps //&& stats.h2h >= 0.75;
        default:
            return false;
    }
}

const SortingType = {
    SORT_SEASON: "CurSeasonFirst",  // Sort by curSeason → bestOdds
    SORT_ODDS: "SORT_ODDS",    // Sort by bestOdds → curSeason
    SORT_DEFENSE_RANK: "SORT_DEFENSE_RANK", // Sort by opponent defense ranking (Ascending: Easier Matchups First)
    SORT_TREND: "SORT_TREND"
};

const FilterType = {
    FILTER_GOBLINS: "FILTER_GOBLINS",
    FILTER_HIGH_ODDS: "FILTER_HIGH_ODDS",
    FILTER_HIGH_ODDS_OVERS: "FILTER_HIGH_ODDS_OVERS", // NEW: Show only "Over" props
    FILTER_HIGH_ODDS_UNDERS: "FILTER_HIGH_ODDS_UNDERS", // NEW: Show only "Under" props
    FILTER_HIGH_TREND: "FILTER_HIGH_TREND",
    FILTER_HIGH_TREND_OVERS: "FILTER_HIGH_TREND_OVERS", // NEW: Show only "Over" props
    FILTER_HIGH_TREND_UNDERS: "FILTER_HIGH_TREND_UNDERS", // NEW: Show only "Under" props
};

pm.visualizer.set(
    template, 
    constructVisualizerPayload(
        FilterType.FILTER_HIGH_ODDS_OVERS,  
        SortingType.SORT_ODDS
    )
);
