// Retrieve stored defensive stats, entities, and schedule
let defensiveStats = JSON.parse(pm.globals.get("DefensiveStats") || "{}");
let entities = JSON.parse(pm.globals.get("Entities") || "{}");
let schedule = JSON.parse(pm.globals.get("nbaScheduleData") || "{}");

// Function to find opponent team in a game
function findOpponentTeam(playerTeamId, eventId) {
    const game = schedule.events?.find(game => game.eventId == eventId);
    if (!game) {
        // console.log(`Error: Game with eventId ${eventId} not found`);
        return null;
    }
    return playerTeamId == game.home.teamId ? game.away.teamId : game.home.teamId;
}

// Function to get a team's defensive rankings
function getTeamDefenseRankings(teamId) {
    const currentSeason = defensiveStats.content?.seasons?.find(season => season.year == '2024');
    if (!currentSeason) return null;

    const team = currentSeason.teams?.find(team => team.teamId == teamId);
    return team?.rankings?.statRankings?.overall?.defense || [];
}

// Function to find opponent defensive stats
function getOpponentDefenseRanking(playerTeamId, eventId, propType) {
    let opponentTeamId = findOpponentTeam(playerTeamId, eventId);
    if (!opponentTeamId) {
        // console.log(`Error: No opponent found for teamId: ${playerTeamId}, eventId: ${eventId}`);
        return "N/A";
    }

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

    const defenseStats = team?.rankings?.statRankings?.overall?.defense || [];

    // Determine the relevant stats to check based on the prop type
    const statMap = {
        "POINTS_REBOUNDS_ASSISTS": "points|rebounds|assists",
        "FANTASY_SCORE_PP":  "points|rebounds|assists",
        "POINTS_REBOUNDS": "points|rebounds",
        "POINTS_ASSISTS": "points|assists",
        "REBOUNDS_ASSISTS": "rebounds|assists",
        "POINTS": "points",
        "REBOUNDS": "rebounds",
        "ASSISTS": "assists",
        "BLOCKS": "blocks",
        "STEALS": "steals",
        "TURNOVERS": "turnovers",
        "THREE_POINTERS": "threePointPct",
        "FREE_THROWS": "freeThrowPct",
        "THREE_POINTERS_ATTEMPTED": "threePointsAtt",
        "FIELD_GOALS_ATTEMPTED": "twoPointsAtt",

    };

    let statKey = statMap[propType] || null;
        console.log(statKey)
    if (!statKey) return "N/A";

    // Find the stat ranking
    console.log("defenseStats", defenseStats)
    let ranking = defenseStats.find(stat => stat.stat == statKey)?.rank;
    return ranking !== undefined ? ranking : "N/A";
}


function filterProps(item, filterType) {
    let ppOdds = item.outcome.bookOdds.PRIZEPICKS?.odds;
    let bestOdds = parseFloat(item.outcome.bestOdds) || 0;
    let stats = item.stats;
    let books = item.outcome.books || [];
    let outcomeLabel = item.outcome.outcomeLabel;
    let isPrizePicks = books.includes("PRIZEPICKS");
    let isUnderDog = books.includes("UNDERDOG");
    let marketLabel = item.outcome.marketLabel;
    let prop = item.outcome.proposition;

    let hasValidOdds =
        item.outcome.bookOdds?.CAESARS?.odds !== undefined ||
        item.outcome.bookOdds?.FANDUEL?.odds !== undefined ||
        item.outcome.bookOdds?.DRAFTKINGS?.odds !== undefined ||
        item.outcome.bookOdds?.BET365?.odds !== undefined ||
        item.outcome.bookOdds?.BETMGM?.odds !== undefined;

    let strongTrendPicks = stats.h2h >= 0.5
        && stats.l10 >= 0.5
        && stats.l5 >= stats.l10
        && stats.l5 >= 0.8

    let goblinPicks = strongTrendPicks
        && stats.curSeason >= 0.73
        && outcomeLabel == "Over";

    let strongProps = strongTrendPicks
        && stats.curSeason >= 0.52;

    let easyProps = ["TURNOVERS", "STEALS", "THREE_POINTERS", "BLOCKS", "STEALS_BLOCKS"].includes(prop);
    let multiOddProps = books.length >= 2;
    let highOddsProps = bestOdds <= -119;
    let noGoblinProps = ppOdds !== "-137"
    let highPrizePicksOddsWithGoblinProps = isPrizePicks && highOddsProps && strongProps;
    let highPrizePicksOddsWithoutGoblinProps = highPrizePicksOddsWithGoblinProps && noGoblinProps;
    let chalkboardProps = strongProps && highOddsProps && bestOdds >= -400;
    
    // return marketLabel.includes("Jones - Points")  && noGoblinProps;
    switch (filterType) {
        case FilterType.GOBLIN_PROPS:
            return highPrizePicksOddsWithGoblinProps && goblinPicks;
        case FilterType.HIGH_PRIZEPICKS_ODDS_PROPS:
            return highPrizePicksOddsWithoutGoblinProps; //&& outcomeLabel == "Over";
        case FilterType.CHALKBOARD_PROPS:
            return chalkboardProps;
        default:
            return false;
    }
}

function sortProps(a, b, sortingType) {
    let bestOddsA = parseFloat(a.outcome.bestOdds) || 0;
    let bestOddsB = parseFloat(b.outcome.bestOdds) || 0;
    let seasonA = parseFloat(a.stats.curSeason) || 0;
    let seasonB = parseFloat(b.stats.curSeason) || 0;
    let defenseRankA = parseFloat(getOpponentDefenseRanking(a.outcome.teamId, a.outcome.eventId, a.outcome.proposition)) || 30; // Default to worst rank
    let defenseRankB = parseFloat(getOpponentDefenseRanking(b.outcome.teamId, b.outcome.eventId, b.outcome.proposition)) || 30;

    if (sortingType == SortingType.CUR_SEASON_FIRST) {
        if (seasonB !== seasonA) return seasonB - seasonA;
        return bestOddsA - bestOddsB;
    } 

    if (sortingType == SortingType.BEST_ODDS_FIRST) {
        if (bestOddsA !== bestOddsB) return bestOddsA - bestOddsB;
        return seasonB - seasonA;
    }

    if (sortingType == SortingType.DEFENSE_RANK_FIRST) {
        return defenseRankA - defenseRankB; // Lower rank means stronger defense
    }

    return 0; // Default case (no sorting)
}


function mapProps(item, index, array) {
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
    if (opponentDefenseRank === "N/A" && opponentTeamName === "Unknown Team") {
        return null;
    }

    let isOver = item.outcome.outcomeLabel === "Over";

    // Apply color logic based on Over/Under prop type
    let defenseClass = "";
    if (opponentDefenseRank !== "N/A") {
        if ((isOver && opponentDefenseRank >= 20) || (!isOver && opponentDefenseRank <= 10)) {
            defenseClass = "dark-green-text";  // Heavy Favorable matchup
        } else if ((isOver && opponentDefenseRank <= 10) || (!isOver && opponentDefenseRank >= 20)) {
            defenseClass = "dark-red-text";  // Heavy Unfavorable matchup
            return null;
        } else if ((!isOver && opponentDefenseRank <= 15) || (isOver && opponentDefenseRank >= 15)) {
            defenseClass = "green-text";  // Medium favorable matchup
        } else if ((isOver && opponentDefenseRank <= 15) || (!isOver && opponentDefenseRank >= 15)) {
            defenseClass = "red-text";  // Medium unfavorable matchup
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
              UD_odds: item.outcome.bookOdds.UNDERDOG?.odds
          }
        : null;
}


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
                <th>PP</th>
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
                <td>{{PP_odds}}</td>
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


const SortingType = {
    CUR_SEASON_FIRST: "CurSeasonFirst",  // Sort by curSeason → bestOdds
    BEST_ODDS_FIRST: "BestOddsFirst"     // Sort by bestOdds → curSeason
};

const FilterType = {
    GOBLIN_PROPS: "GoblinProps",
    HIGH_PRIZEPICKS_ODDS_PROPS: "highPrizePicksOddsWithoutGoblinProps", // NEW: Combines PrizePicks, High Odds, and Strong Props
    CHALKBOARD_PROPS: "ChalkboardProps" // NEW: Strong Picks + High Odds + Best Odds >= -400
};

function constructVisualizerPayload(filterType, sortingType) {
    var responseData = pm.response.json();
    var filteredData = responseData.props
        .filter(item => filterProps(item, filterType))
        .sort((a, b) => sortProps(a, b, sortingType))
        .map(mapProps)
        .filter(item => item !== null); // Remove null values
    return { filteredData };
}

pm.visualizer.set(
    template, 
    constructVisualizerPayload(FilterType.HIGH_PRIZEPICKS_ODDS_PROPS,  SortingType.CUR_SEASON_FIRST)
);
