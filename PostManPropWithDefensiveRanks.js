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
    /* Scroll container so header can stick and bottom content isn't blocked */
    .table-wrap {
      max-height: 80vh;        /* adjust as needed */
      overflow: auto;
      position: relative;
      padding-bottom: 72px;    /* room so last rows aren't covered */
    }

    table {
      width: 100%;
      border-collapse: collapse;   /* if borders glitch, switch to 'separate' + border-spacing: 0 */
      table-layout: auto;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
      word-break: break-word;
      background: #fff;            /* ensures sticky cells cover content underneath */
    }

    th {
      background-color: #f4f4f4;
    }

    /* Sticky header */
    thead th {
      position: sticky;
      top: 0;
      z-index: 3;
    }

    /* Optional: pin first column too (uncomment if you want it) */
    /*
    thead th:first-child, tbody td:first-child {
      position: sticky;
      left: 0;
      z-index: 4;
      background: #fff;
    }
    */

    /* Extra spacer after the last row as additional safety */
    tbody::after {
      content: "";
      display: block;
      height: 72px;                /* matches .table-wrap padding-bottom */
    }

    /* Try to nuke common bottom fade/overlays inside our container */
    .table-wrap::after,
    .table-wrap::before {
      content: none !important;
      display: none !important;
    }

    .dark-green-text { color: green; font-weight: bold; }
    .green-text { color: green; }
    .dark-red-text { color: red; font-weight: bold; }
    .red-text { color: red; }
    .orange-text { color: orange; }
  </style>

  <div class="table-wrap">
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
          {{#unless isPlayoffs}}<th>Szn25</th>{{/unless}}
          {{#unless isPlayoffs}}<th>Szn24</th>{{/unless}}
          {{#unless isPlayoffs}}<th>DRank</th>{{/unless}}
          <th>ODDS</th>
          <!--
          <th>FD</th>
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
          <td class="{{favorableColor}}">{{player}}</td>
          <td>{{type}}</td>
          <td>{{line}}</td>
          {{#unless ../isPlayoffs}}<td class="{{l20Color}}">{{l20}}</td>{{/unless}}
          <td class="{{l10Color}}">{{l10}}</td>
          <td class="{{l5Color}}">{{l5}}</td>
          <td class="{{h2hColor}}">{{h2h}}</td>
          {{#unless ../isPlayoffs}}<td class="{{curSeasonColor}}">{{curSeason}}</td>{{/unless}}
          {{#unless ../isPlayoffs}}<td class="{{prevSeasonColor}}">{{prevSeason}}</td>{{/unless}}
          {{#unless ../isPlayoffs}}<td class="{{defenseClass}}">{{defenseRank}}</td>{{/unless}}
          <td>{{AVG_ODDS}}</td>
          <!--
          <td>{{FANDUEL_odds}}</td>
          <td>{{DK_odds}}</td>
          <td>{{CAESARS_odds}}</td>
          <td>{{BET365_odds}}</td>
          <td>{{MGM_odds}}</td>
          -->
        </tr>
        {{/each}}
      </tbody>
    </table>
  </div>
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

// ---------- Config ----------

// Basketball props that should evaluate opponent OFFENSE ranks instead of DEFENSE
const OFFENSE_PROPS_BASKETBALL = new Set([
    "STEALS",
    "STEALS_BLOCKS",
    "BLOCKS",
    "DEFENSIVE_REBOUNDS",
    "TURNOVERS"
]);

// Stat maps per league
const STAT_MAP_BASKETBALL = {
    "POINTS_REBOUNDS_ASSISTS": "points|rebounds|assists",
    "FANTASY_SCORE_PP": "points|rebounds|assists",  // special handling below also uses steals|blocks
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
    "PERSONAL_FOULS": ""
};

const STAT_MAP_SOCCER = {
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

const STAT_MAP_NFL = {
    // QB
    PASSING_YARDS: "passingYards",
    PASSING_ATTEMPTS: "passingAttempts",
    PASSING_TDS: "passingTouchdowns",
    INTERCEPTIONS_THROWN: "interceptionsThrown",
    PASS_RUSH_YARDS: "passingYards|rushingYards",
    // RB
    RUSHING_YARDS: "rushingYards",
    RUSH_ATTEMPTS: "rushingAttempts",
    RUSHING_TDS: "rushingTouchdowns",
    RUSH_REC_YARDS: "rushingYards|receivingYards",
    // WR TE
    RECEIVING_YARDS: "receivingYards",
    RECEPTIONS: "receptions",
    TARGETS: "recTargets",
    RECEIVING_TDS: "receivingTouchdowns",
    // Pressure and situational
    SACKS_TAKEN: "passerSacks",
    SACKS: "sacks",
    QB_HITS: "qbHits",
    POINTS: "points",
    TOUCHDOWNS: "touchdowns",
    REDZONE_EFF: "redzoneEff",
    THIRD_DOWN_CONV: "thirdDownConv",
    // Kicking
    KICKING_POINTS: "kickingPoints",
    FIELD_GOALS: "fieldGoals",
    EXTRA_POINTS: "extraPoints"
};

// League registry
const LEAGUE_CONFIGS = {
    NBA: {
        type: "basketball",
        seasonEnv: "nbaSeasonYear",
        defaultYear: "2024",
        statMap: STAT_MAP_BASKETBALL,
        offenseProps: OFFENSE_PROPS_BASKETBALL,
        teamCountFallback: 30,
        thresholds: { heavy: 20, midHigh: 16, midLow: 10 }  // legacy style
    },
    WNBA: {
        type: "basketball",
        seasonEnv: "wnbaSeasonYear",
        defaultYear: "2025",
        statMap: STAT_MAP_BASKETBALL,
        offenseProps: OFFENSE_PROPS_BASKETBALL,
        teamCountFallback: 13,  // auto from data when available
        thresholds: "dynamic_tertiles"  // use team count dynamic coloring
    },
    NFL: {
        type: "nfl",
        seasonEnv: "nflSeasonYear",
        defaultYear: "2024",
        statMap: STAT_MAP_NFL,
        offenseProps: new Set(), // NFL always look at opponent defense for player props
        teamCountFallback: 32,
        thresholds: { heavy: 24, midHigh: 20, midLow: 12 }
    },
    NHL: {
        type: "hockey",
        seasonEnv: "nhlSeasonYear",
        defaultYear: "2024",
        statMap: STAT_MAP_BASKETBALL, // reuse if your ranks use similar keys, else swap to an NHL map
        offenseProps: new Set(),
        teamCountFallback: 32,
        thresholds: { heavy: 22, midHigh: 17, midLow: 10 }
    },
    SOCCER: {
        type: "soccer",
        seasonEnv: "soccerSeasonYear",
        defaultYear: "2024",
        statMap: STAT_MAP_SOCCER,
        offenseProps: new Set(),
        teamCountFallback: 20,
        thresholds: "dynamic_tertiles"  // per competition team count
    }
};

// ---------- Helpers ----------

function findOpponentTeam(playerTeamId, eventId) {
    const game = schedule?.events?.find(g => g.eventId == eventId);
    if (!game) return null;
    if (game?.home?.teamId == null || game?.away?.teamId == null) return "N/A";
    return playerTeamId == game.home.teamId ? game.away.teamId : game.home.teamId;
}

function getLeagueConfig(leagueType) {
    return LEAGUE_CONFIGS[leagueType] || LEAGUE_CONFIGS.NBA;
}

function pickSeasonFromContent(leagueType, content, competitionId, preferredYear) {
    if (!content) return null;
    if (leagueType === "SOCCER" && competitionId) {
        const comp = content.competitions?.find(c => c.competitionId === competitionId);
        const seasons = comp?.seasons || [];
        if (!seasons.length) return null;
        return seasons.find(s => s.year == preferredYear) || latestSeason(seasons);
    }
    const seasons = content.seasons || [];
    if (!seasons.length) return null;
    return seasons.find(s => s.year == preferredYear) || latestSeason(seasons);
}

function latestSeason(seasons) {
    return seasons.reduce((a, b) => (+b.year > +a.year ? b : a));
}

function getTeamFromSeason(season, teamId) {
    return season?.teams?.find(t => t.teamId == teamId) || null;
}

function getStatArrayForLeague(team, league, propType) {
    const overall = team?.rankings?.statRankings?.overall;
    if (!overall) return [];
    if (league.type === "basketball") {
        // some props invert to opponent offense ranks
        return league.offenseProps.has(propType) ? (overall.offense || []) : (overall.defense || []);
    }
    // NFL, Soccer, Hockey use defense for player props by default
    return overall.defense || [];
}

function rankForStatKey(stats, key) {
    if (!key) return "N/A";
    if (key.includes("|")) {
        const parts = key.split("|");
        const vals = parts
            .map(k => stats.find(s => s.stat === k)?.rank)
            .filter(v => typeof v === "number");
        if (!vals.length) return "N/A";
        return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    }
    const hit = stats.find(s => s.stat === key);
    return typeof hit?.rank === "number" ? hit.rank : "N/A";
}

function fantasyScoreRankBasketball(stats) {
    const pra = stats.find(s => s.stat === "points|rebounds|assists")?.rank;
    const sb = stats.find(s => s.stat === "steals|blocks")?.rank;
    if (typeof pra === "number" && typeof sb === "number") return Math.round((pra + sb) / 2);
    if (typeof pra === "number") return pra;
    if (typeof sb === "number") return sb;
    return "N/A";
}

// ---------- Main: unified ranking ----------
function getOpponentDefenseRanking(playerTeamId, eventId, propType) {
    const opponentTeamId = findOpponentTeam(playerTeamId, eventId);
    if (!opponentTeamId) return "N/A";

    const league = getLeagueConfig(leagueType);
    const envYear = pm.environment.get(league.seasonEnv);
    const preferredYear = envYear || league.defaultYear;

    const season = pickSeasonFromContent(leagueType, defensiveStats?.content, competitionId, preferredYear);
    if (!season) return "N/A";

    const team = getTeamFromSeason(season, opponentTeamId);
    if (!team) return "N/A";

    const stats = getStatArrayForLeague(team, league, propType);

    // Special for basketball fantasy score
    if (league.type === "basketball" && propType === "FANTASY_SCORE_PP") {
        return fantasyScoreRankBasketball(stats);
    }

    const statKey =
        (league.statMap && league.statMap[propType]) ||
        (STAT_MAP_BASKETBALL[propType]) || // fallback
        null;

    return rankForStatKey(stats, statKey);
}

// ---------- Color helper for all leagues ----------
function defenseClassForRank(rank, isOver, leagueType) {
    const r = parseFloat(rank);
    if (isNaN(r)) return "";

    const league = getLeagueConfig(leagueType);

    // Dynamic tertiles for WNBA and Soccer or when asked
    if (league.thresholds === "dynamic_tertiles") {
        const teamCount =
            (defensiveStats?.content && currentSeasonTeamCount(defensiveStats.content, leagueType, competitionId)) ||
            league.teamCountFallback;
        const greenMax = Math.ceil(teamCount / 3);
        const orangeMax = Math.ceil((teamCount * 2) / 3);

        if (isOver) {
            if (r <= greenMax) return "red-text";
            if (r <= orangeMax) return "orange-text";
            return "green-text";
        } else {
            if (r <= greenMax) return "green-text";
            if (r <= orangeMax) return "orange-text";
            return "red-text";
        }
    }

    // Legacy threshold style
    const { heavy, midHigh, midLow } = league.thresholds || LEAGUE_CONFIGS.NBA.thresholds;

    if ((isOver && r >= heavy) || (!isOver && r <= midLow)) return "dark-green-text";
    if ((isOver && r <= midLow) || (!isOver && r >= heavy)) return "dark-red-text";
    if ((!isOver && r <= midHigh) || (isOver && r >= midHigh)) return "green-text";
    return "red-text";
}

function currentSeasonTeamCount(content, leagueType, competitionId) {
    if (leagueType === "SOCCER" && competitionId) {
        const comp = content.competitions?.find(c => c.competitionId === competitionId);
        const seasons = comp?.seasons || [];
        const season = latestSeason(seasons);
        return season?.teams?.length || 0;
    }
    const seasons = content.seasons || [];
    const season = latestSeason(seasons);
    return season?.teams?.length || 0;
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

// Trend colors (0–.39 red, .4–.59 orange, .6–1 green)
function trendClass(v) {
    const n = parseFloat(v);
    if (isNaN(n)) return "";
    if (n >= 0.6) return "green-text";
    if (n >= 0.38) return "orange-text";
    return "red-text";
}

function mapProps(item, filterType) {
    const { outcome, stats } = item;
    const isPrizePicks = outcome.bookOdds.PRIZEPICKS !== undefined;
    const isSleeper = outcome.bookOdds.SLEEPER !== undefined;
    const allowedDFS = showPrizePicksOnly ? isPrizePicks : (isPrizePicks || isSleeper);
    const includeItem = allowedDFS || (outcome.periodLabel == "2H" || outcome.periodLabel == "4Q" || outcome.periodLabel == "1Q");

    // Opponent team
    const opponentTeamId = findOpponentTeam(outcome.teamId, outcome.eventId);
    let opponentTeamName = "Unknown Team";
    if (opponentTeamId) {
        const t = entities.content.teams.find(x => x.team.teamId === opponentTeamId);
        if (t) opponentTeamName = t.team.fullName;
    }

    // Defense rank and class (uses your new unified logic)
    const opponentDefenseRank = getOpponentDefenseRanking(outcome.teamId, outcome.eventId, outcome.proposition);
    const isOver = outcome.outcomeLabel === "Over";
    const defenseClass = defenseClassForRank(opponentDefenseRank, isOver, leagueType);

    // If we truly know nothing about opponent, skip
    if (opponentDefenseRank == "N/A" && opponentTeamName === "Unknown Team") return null;

    // Trend colors
    const l20Color = trendClass(stats.l20);
    const l10Color = trendClass(stats.l10);
    const l5Color = trendClass(stats.l5);
    const h2hColor = trendClass(stats.h2h);
    const curSeasonColor = trendClass(stats.curSeason);
    const prevSeasonColor = trendClass(stats.prevSeason);
    const favorableColor = trendClass(item.orfScore);

    const playerPrefix = isPrizePicks ? "PP: " : (isSleeper ? "SL: " : "");

    return includeItem ? {
        player: `${playerPrefix}${outcome.marketLabel} vs ${opponentTeamName} (${item.orfScore})`,
        type: outcome.outcomeLabel,
        line: outcome.line,

        // raw values
        l20: stats.l20,
        l10: stats.l10,
        l5: stats.l5,
        h2h: stats.h2h,
        curSeason: stats.curSeason,
        prevSeason: stats.prevSeason,

        // classes
        l20Color,
        l10Color,
        l5Color,
        h2hColor,
        curSeasonColor,
        prevSeasonColor,
        defenseRank: opponentDefenseRank,
        defenseClass,
        favorableColor,

        // odds
        CAESARS_odds: outcome.bookOdds.CAESARS?.odds,
        FANDUEL_odds: outcome.bookOdds.FANDUEL?.odds,
        DK_odds: outcome.bookOdds.DRAFTKINGS?.odds,
        BET365_odds: outcome.bookOdds.BET365?.odds,
        MGM_odds: outcome.bookOdds.BETMGM?.odds,
        PP_odds: outcome.bookOdds.PRIZEPICKS?.odds,
        UD_odds: outcome.bookOdds.UNDERDOG?.odds,
        SleeperOdds: outcome.bookOdds.SLEEPER?.odds,
        AVG_ODDS: getAvgOdds(item)
    } : null;
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
    if (stats.curSeason < .54 || stats.h2h == null || stats.h2h < 0.2 || (stats.l5 < stats.l10 || stats.l10 < (stats.l20 * .9))) return 0;

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

function isSafeRegularPlayoffs(stats) {
    if (stats.h2h <= 0.5 || stats.curSeason <= 0.5) return 0;

    let hits = 0;

    if (stats.l10 >= 0.6) hits++;
    if (stats.l5 >= 0.6) hits++;
    if (stats.h2h >= 0.6) hits++;

    return hits >= 1;
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
    const safeRegularPlayoffs = noGoblinProps && isSafeRegularPlayoffs(stats);
    const safeGoblin = isGoblin && isSafeGoblin(stats, avgOdds);

    if (showOnlyGoblins) {
        return safeGoblin;
    } else if (showOnly2ndHalf) {
        return safe2ndHalf;
    } else if (isPlayoffs) {
        return safeRegularPlayoffs;
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
