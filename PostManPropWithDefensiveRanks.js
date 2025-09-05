const CompetitionId = {
    GBR_EPL: "GBR_EPL",             // English Premier League
    ESP_LA_LIGA: "ESP_LA_LIGA",     // Spanish La Liga
    GER_BUNDESLIGA: "GER_BUNDESLIGA", // German Bundesliga
    ITA_SERIE_A: "ITA_SERIE_A",     // Italian Serie A
    FRA_LIGUE_1: "FRA_LIGUE_1",     // French Ligue 1
    USA_MLS: "USA_MLS"              // Major League Soccer (MLS)
};

const isPlayoffs = pm.environment.get("isPlayoffs") === "true";

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
        .orange-text {color: orange; }
    </style>
    <table>
        <thead>
            <tr>
                <th>Player</th>
                <th>Type</th>
                <th>Line</th>
                {{#unless isPlayoffs}}<th>L20</th>{{/unless}}
                <th>L10</th>
                <th>L5</th>
                <th>H2H</th>
                {{#unless isPlayoffs}}<th>Szn</th>{{/unless}}
                {{#unless isPlayoffs}}<th>DRank</th>{{/unless}}
                <th>ODDS</th>
<!--                 <th>FD</th>
                <th>DK</th>
                <th>CSRS</th>
                <th>365</th>
                <th>MGM</th>
-->
            </tr>
        </thead>
        <tbody>
            {{#each filteredData}}
            <tr>
                <td>{{player}}</td>
                <td>{{type}}</td>
                <td>{{line}}</td>
                {{#unless ../isPlayoffs}}<td class="{{l20Color}}">{{l20}}</td>{{/unless}}
                <td class="{{l10Color}}">{{l10}}</td>
                <td class="{{l5Color}}">{{l5}}</td>
                <td class="{{h2hColor}}">{{h2h}}</td>
                {{#unless ../isPlayoffs}}<td class="{{curSeasonColor}}">{{curSeason}}</td>{{/unless}}
                {{#unless ../isPlayoffs}}<td class="{{defenseClass}}">{{defenseRank}}</td>{{/unless}}
                <td>{{AVG_ODDS}}</td>
<!--                <td>{{FANDUEL_odds}}</td>
                <td>{{DK_odds}}</td>
                <td>{{CAESARS_odds}}</td>
                <td>{{BET365_odds}}</td>
                <td>{{MGM_odds}}</td>
-->
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
let competitionId = pm.environment.get("competitionId");
let showOnlyGoblins = pm.environment.get("showOnlyGoblins") === "true";
let showOnly2ndHalf = pm.environment.get("showOnly2ndHalf") === "true";
let showPrizePicksOnly = pm.environment.get("showPrizePicksOnly") === "true";

console.log(`showOnlyGoblins: ${showOnlyGoblins}`);
console.log(`showPrizePicksOnly: ${showPrizePicksOnly}`);
console.log(`Loaded data for league: ${leagueType}`);
console.log(`Defensive Stats Key: ${defensiveStats}`);
console.log(`Entities Key: ${entities}`);
console.log(`Schedule Data Key: ${schedule}`);

function getTrendColor(value) {
    if (value >= 0.6) return 'green-text';
    if (value >= 0.4) return 'orange-text';
    return 'red-text';
}

const OFFENSE_PROPS = new Set([
  "STEALS",
  "STEALS_BLOCKS",
  "BLOCKS",
  "DEFENSIVE_REBOUNDS",
  "TURNOVERS"
]);

const STAT_MAP = {
  // Basketball
  "POINTS_REBOUNDS_ASSISTS": "points|rebounds|assists",
  "FANTASY_SCORE_PP": "points|rebounds|assists",
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
  "PERSONAL_FOULS": "",
  // Soccer
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

function findOpponentTeam(playerTeamId, eventId) {
  const game = schedule?.events?.find(g => g.eventId == eventId);
  if (!game) return null;
  if (game?.home?.teamId == null || game?.away?.teamId == null) return "N/A";
  return playerTeamId == game.home.teamId ? game.away.teamId : game.home.teamId;
}

// Pick a season year. If not found, try the latest available.
function pickSeason(content, desiredYear) {
  const seasons = content?.seasons || content?.competitions?.flatMap(c => c.seasons) || [];
  if (!seasons.length) return null;
  return seasons.find(s => s.year == desiredYear)
      || seasons.reduce((a, b) => (+b.year > +a.year ? b : a)); // latest
}

// Get team node for a given season
function getTeamFromSeason(season, teamId) {
  return season?.teams?.find(t => t.teamId == teamId) || null;
}

// Resolve the correct stats array based on sport and prop type
function pickStatArray(team, propType) {
  const overall = team?.rankings?.statRankings?.overall;
  if (!overall) return [];
  // Basketball leagues share this offense vs defense split
  if (OFFENSE_PROPS.has(propType)) return overall.offense || [];
  return overall.defense || [];
}

// Find rank for a given stat key inside a stats array
function findRank(statsArray, statKey) {
  if (!statKey) return "N/A";
  const hit = statsArray.find(s => s.stat == statKey);
  return hit?.rank ?? "N/A";
}

// Special average for FANTASY_SCORE_PP
function fantasyScoreRank(statsArray) {
  const a = statsArray.find(s => s.stat === "points|rebounds|assists")?.rank;
  const b = statsArray.find(s => s.stat === "steals|blocks")?.rank;
  if (a !== undefined && b !== undefined) return Math.round((a + b) / 2);
  if (a !== undefined) return a;
  if (b !== undefined) return b;
  return "N/A";
}

function getOpponentDefenseRanking(playerTeamId, eventId, propType) {
  const opponentTeamId = findOpponentTeam(playerTeamId, eventId);
  if (!opponentTeamId) return "N/A";

  // Season year preference per league
  const preferredYear =
    leagueType === "WNBA" ? "2025"
    : leagueType === "SOCCER" ? "2024"
    : "2024";

  // Basketball and most others use defensiveStats.content.seasons
  // Soccer path uses competitions → seasons
  const season = pickSeason(defensiveStats.content, preferredYear);
  if (!season) return "N/A";

  const team = getTeamFromSeason(season, opponentTeamId);
  if (!team) return "N/A";

  const statArray = pickStatArray(team, propType);

  if (propType === "FANTASY_SCORE_PP") {
    return fantasyScoreRank(statArray);
  }

  const statKey = STAT_MAP[propType] || null;
  return findRank(statArray, statKey);
}


function sortProps(a, b, sortingType) {
    let bestOddsA = getAvgOdds(a) || -119;
    let bestOddsB = getAvgOdds(b) || -119;
    let seasonA = parseFloat(a.stats.curSeason) || 0;
    let seasonB = parseFloat(b.stats.curSeason) || 0;
    let defenseRankA = parseFloat(getOpponentDefenseRanking(a.outcome.teamId, a.outcome.eventId, a.outcome.proposition)) || 30;
    let defenseRankB = parseFloat(getOpponentDefenseRanking(b.outcome.teamId, b.outcome.eventId, b.outcome.proposition)) || 30;
    const ah2h = parseFloat(a.stats.h2h) || 0;
    const al5 = parseFloat(a.stats.l5) || 0;
    const al10 = parseFloat(a.stats.l10) || 0;
    const bh2h = parseFloat(a.stats.h2h) || 0;
    const bl5 = parseFloat(a.stats.l5) || 0;
    const bl10 = parseFloat(a.stats.l10) || 0;
    const trendA = isPlayoffs
        ? ah2h + al5
        : (ah2h + al5 + al10);
    const trendB = isPlayoffs
        ? bh2h + bl5
        : (bh2h + bl5 + bl10);

    let sortTrend = trendB !== trendA ? trendB - trendA : seasonB - seasonA;

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
            return (bestOddsA !== bestOddsB) ? (bestOddsA + (trendA * 100)) - (bestOddsB + (trendB * 100)) : sortTrend
        case SortingType.SORT_TREND:
            return sortTrend
        default:
            return 0;
    }
}

function mapProps(item, filterType) {
    let l20Color = getTrendColor(parseFloat(item.stats.l20));
    let l10Color = getTrendColor(parseFloat(item.stats.l10));
    let l5Color = getTrendColor(parseFloat(item.stats.l5));
    let h2hColor = getTrendColor(parseFloat(item.stats.h2h));
    let curSeasonColor = getTrendColor(parseFloat(item.stats.curSeason));

    let isPrizePicks = item.outcome.bookOdds.PRIZEPICKS !== undefined;
    let isSleeper = item.outcome.bookOdds.SLEEPER !== undefined;
    let allowedDFS = showPrizePicksOnly ? isPrizePicks :  isPrizePicks || isSleeper;
    let includeItem = allowedDFS || (item.outcome.periodLabel == "2H" || item.outcome.periodLabel == "4Q");

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
        return null;
    }

    let isOver = item.outcome.outcomeLabel === "Over";
    let defenseClass = "";
    if (opponentDefenseRank != "N/A") {
        const leagueThresholds = {
            NBA: { heavy: 20, midHigh: 16, midLow: 10 },
            NHL: { heavy: 22, midHigh: 17, midLow: 10 },
            SOCCER: { heavy: 8, medium: 7 },
            WNBA: { heavy: 5, midHight: 8, midLow: 10 }
        };

        const { heavy, midHigh, midLow } = leagueThresholds[leagueType] || leagueThresholds["NBA"]; // Default to NBA

        if ((isOver && opponentDefenseRank >= heavy) || (!isOver && opponentDefenseRank <= midLow)) {
            defenseClass = "dark-green-text";  // Heavy Favorable matchup
        } else if ((isOver && opponentDefenseRank <= midLow) || (!isOver && opponentDefenseRank >= heavy)) {
            defenseClass = "dark-red-text";  // Heavy Unfavorable matchup
        } else if ((!isOver && opponentDefenseRank <= midHigh) || (isOver && opponentDefenseRank >= midHigh)) {
            defenseClass = "green-text";  // Medium Favorable matchup
        } else {
            defenseClass = "red-text";  // Medium Unfavorable matchup
        }
    }

    return includeItem
        ? {
            player: (isPrizePicks ? 'PP: ' : 'SL: ') +`${item.outcome.marketLabel} vs ${opponentTeamName}`,
            type: item.outcome.outcomeLabel,
            line: item.outcome.line,
            l20: item.stats.l20,
            l10: item.stats.l10,
            l5: item.stats.l5,
            h2h: item.stats.h2h,
            curSeason: item.stats.curSeason,
            l20Color,
            l10Color,
            l5Color,
            h2hColor,
            curSeasonColor,
            defenseRank: opponentDefenseRank,
            defenseClass,
            CAESARS_odds: item.outcome.bookOdds.CAESARS?.odds,
            FANDUEL_odds: item.outcome.bookOdds.FANDUEL?.odds,
            DK_odds: item.outcome.bookOdds.DRAFTKINGS?.odds,
            BET365_odds: item.outcome.bookOdds.BET365?.odds,
            MGM_odds: item.outcome.bookOdds.BETMGM?.odds,
            PP_odds: item.outcome.bookOdds.PRIZEPICKS?.odds,
            UD_odds: item.outcome.bookOdds.UNDERDOG?.odds,
            SleeperOdds: item.outcome.bookOdds.SLEEPER?.odds,
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
        // item.outcome.bookOdds?.UNDERDOG?.odds,
        // item.outcome.bookOdds?.SLEEPER?.odds
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
        .map(item => mapProps(item, filterType))
        .filter(item => item !== null); // Remove null values
    return {
        filteredData: filteredData,
        isPlayoffs: isPlayoffs
    };
}

function isSafeRegular(stats) {
    if (stats.curSeason < .54 || stats.h2h == null || stats.h2h < 0.8 || (stats.l5 < stats.l10 || stats.l10 < (stats.l20*.9))) return 0;

    let hits = 0;

    if (stats.l20 >= 0.5) hits++;
    if (stats.l10 >= 0.6) hits++;
    if (stats.l5 >= 0.6) hits++;
    if (stats.h2h >= 0.80) hits++;
    if (stats.curSeason >= 0.55) hits++;

    // trending up
    if (stats.l5 >= stats.l10 && stats.l10 > stats.l20) hits++;

    return hits >= 5;
}

function isSafeGoblin(stats, avgOdds) {
    let hits = 0;
    if (stats.l20 >= 0.8) hits++;
    if (stats.l10 >= 0.8) hits++;
    if (stats.l5 >= 0.8) hits++;
    if (stats.curSeason >= 0.75) hits++;
    if (stats.h2h == null || stats.h2h >= 0.7) hits++;
    else hits--;
    return hits >= 4 && avgOdds <= -300;
}

function filterProps(item, filterType) {
    const outcomeLabel = item.outcome.outcomeLabel;
    const periodLabel = item.outcome.periodLabel;
    const isOver = outcomeLabel === "Over";
    const isUnder = outcomeLabel === "Under";

    const overFilters = new Set([FilterType.FILTER_HIGH_ODDS_HIGH_TREND_OVERS]);
    const underFilters = new Set([FilterType.FILTER_HIGH_ODDS_HIGH_TREND_UNDERS]);

    if (overFilters.has(filterType) && isUnder) return false;
    if (underFilters.has(filterType) && isOver) return false;

    const stats = item.stats;
    const ppOdds = parseFloat(item.outcome.bookOdds.PRIZEPICKS?.odds);
    const noGoblinProps = ppOdds !== -137;
    const avgOdds = getAvgOdds(item);
    const hasValidStats = stats.h2h != null && stats.l10 != null;

    const isGoblin = avgOdds <= -300;

    const safeRegular = noGoblinProps && isSafeRegular(stats);
    const safeGoblin = isGoblin && isSafeGoblin(stats, avgOdds);

    if (showOnlyGoblins) {
        return safeGoblin;
    } else if (showOnly2ndHalf) {
        return safe2ndHalf;
    } else {
        return safeGoblin || safeRegular;
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
    FILTER_HIGH_ODDS_HIGH_TREND: "FILTER_HIGH_ODDS_HIGH_TREND",
    FILTER_HIGH_ODDS_HIGH_TREND_OVERS: "FILTER_HIGH_ODDS_HIGH_TREND_OVERS",
    FILTER_HIGH_ODDS_HIGH_TREND_UNDERS: "FILTER_HIGH_ODDS_HIGH_TREND_UNDERS",
};

pm.visualizer.set(
    template,
    constructVisualizerPayload(
        FilterType.FILTER_HIGH_ODDS_HIGH_TREND,
        SortingType.SORT_ODDS
    )
);
