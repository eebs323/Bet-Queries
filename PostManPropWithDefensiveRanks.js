// PostManPropWithDefensiveRanks + ALL Regular 2-pick slips + Mega slip (6→5→4→3)

// Make pm available if running in Node.js environment
if (typeof pm === 'undefined') {
    global.pm = {
        environment: { get: () => null },
        globals: { get: () => "{}" },
        visualizer: { set: () => {} },
        response: { json: () => ({ props: [] }) }
    };
}

// ---------- Leagues ----------
const CompetitionId = {
    GBR_EPL: "GBR_EPL",
    ESP_LA_LIGA: "ESP_LA_LIGA",
    GER_BUNDESLIGA: "GER_BUNDESLIGA",
    ITA_SERIE_A: "ITA_SERIE_A",
    FRA_LIGUE_1: "FRA_LIGUE_1",
    USA_MLS: "USA_MLS"
  };
  
  const isPlayoffs = pm.environment.get("isPlayoffs") === "true";
  
  // ---------- Template ----------
  var template = `
    <style>
      .table-wrap { max-height: 70vh; overflow: auto; position: relative; padding-bottom: 56px; }
      table { width: 100%; border-collapse: collapse; table-layout: auto; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; word-break: break-word; background: #fff; }
      thead th { position: sticky; top: 0; z-index: 3; background-color: #f4f4f4; }
      tbody::after { content: ""; display: block; height: 56px; }
  
      .dark-green-text { color: green; font-weight: bold; }
      .green-text { color: green; }
      .dark-red-text { color: red; font-weight: bold; }
      .red-text { color: red; }
      .orange-text { color: orange; }
      .tag { font-weight: 600; white-space: nowrap; }
  
      /* Cards */
      .cards { margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fill,minmax(320px,1fr)); gap: 12px; }
      .card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; background: #fff; }
      .card h3 { margin: 0 0 12px; font-size: 16px; display: flex; justify-content: space-between; align-items: center; }
      .card h3 .prob { font-size: 14px; color: #555; }
      .meta { font-size: 12px; color: #555; margin-bottom: 8px; }
      .legs { margin: 0; padding-left: 18px; }
      .legs li { margin: 8px 0; }
      .legs li .gap { color: #555; font-size: 12px; display: block; margin-top: 2px; }
      .legs li .detail { display: block; font-size: 12px; color: #666; margin-top: 2px; line-height: 1.4; }
      .legs li .defense { font-weight: bold; }
      .legs li .defense.green-text { color: #008000; }
      .legs li .defense.orange-text { color: #ff8c00; }
      .legs li .defense.red-text { color: #ff0000; }
      
      /* New styles */
      .card-header { margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
      .card-rating { display: flex; gap: 8px; margin-top: 4px; }
      .rating-pill { font-size: 11px; padding: 2px 8px; border-radius: 12px; background: #f5f5f5; }
      .rating-pill.high { background: #e6ffe6; color: #008000; }
      .rating-pill.medium { background: #fff3e6; color: #ff8c00; }
      .rating-pill.low { background: #ffe6e6; color: #ff0000; }
      .trend-up { color: #008000; font-weight: bold; }
      .trend-down { color: #ff0000; font-weight: bold; }
      .trend-neutral { color: #ff8c00; font-weight: bold; }
      .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 4px; margin-top: 4px; }
      .stat-item { font-size: 11px; }
    </style>
  
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Type</th>
            <th>Period</th>
            <th>Line</th>
            {{#unless isPlayoffs}}<th>L20</th>{{/unless}}
            {{#unless isPlayoffs}}<th>L10</th>{{/unless}}
            <th>L5</th>
            <th>H2H</th>
            {{#unless isPlayoffs}}<th>Szn25</th>{{/unless}}
            {{#unless isPlayoffs}}<th>Szn24</th>{{/unless}}
            {{#unless isPlayoffs}}<th>DRank</th>{{/unless}}
            <th>ODDS</th>
            <th>Approval</th>
            <th>Edge</th>
          </tr>
        </thead>
        <tbody>
          {{#each filteredData}}
          <tr>
            <td class="{{favorableColor}}">{{player}}</td>
            <td>{{type}}</td>
            <td>{{periodLabel}}</td>
            <td>{{line}}</td>
            {{#unless ../isPlayoffs}}<td class="{{l20Color}}">{{l20}}</td>{{/unless}}
            {{#unless ../isPlayoffs}}<td class="{{l10Color}}">{{l10}}</td>{{/unless}}
            <td class="{{l5Color}}">{{l5}}</td>
            <td class="{{h2hColor}}">{{h2h}}</td>
            {{#unless ../isPlayoffs}}<td class="{{curSeasonColor}}">{{curSeason}}</td>{{/unless}}
            {{#unless ../isPlayoffs}}<td class="{{prevSeasonColor}}">{{prevSeason}}</td>{{/unless}}
            {{#unless ../isPlayoffs}}<td class="{{defenseClass}}">{{defenseRank}}</td>{{/unless}}
            <td>{{AVG_ODDS}}</td>
            <td class="tag">{{approvalTag}}</td>
            <td>{{edgeNote}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
  
    {{#if slips.length}}
    <div class="cards">
      {{#each slips}}
      <div class="card">
        <div class="card-header">
          <h3>
            {{title}}
            <span class="prob">{{pctWin}}%</span>
          </h3>
          <div class="card-rating">
            <span class="rating-pill {{ratingClass}}">
              Rating: {{rating}}/10
            </span>
            <span class="rating-pill">Gap: {{totalGap}}%</span>
            <span class="rating-pill {{riskClass}}">
              Risk: {{riskLevel}}
            </span>
          </div>
        </div>
        <ol class="legs">
          {{#each legs}}
            <li>
              {{#if isGoblin}}👿 {{/if}}<span class="{{trendClass}}">{{trendIndicator}}</span> {{playerName}} - {{type}} {{line}} vs {{opponentName}}
              <span class="gap">{{edgeNote}}</span>
              <div class="detail">
                {{type}} {{line}}
                <div class="stats-grid">
                  <div class="stat-item">L20: <span class="{{l20Color}}">{{l20}}</span></div>
                  <div class="stat-item">L10: <span class="{{l10Color}}">{{l10}}</span></div>
                  <div class="stat-item">L5: <span class="{{l5Color}}">{{l5}}</span></div>
                  <div class="stat-item">H2H: <span class="{{h2hColor}}">{{h2h}}</span></div>
                  <div class="stat-item">Szn25: <span class="{{curSeasonColor}}">{{curSeason}}</span></div>
                  <div class="stat-item">Szn24: <span class="{{prevSeasonColor}}">{{prevSeason}}</span></div>
                  {{#if defenseRank}}
                  <div class="stat-item">VS: <span class="defense {{defenseClass}}">{{defenseRank}}</span></div>
                  {{/if}}
                </div>
              </div>
            </li>
          {{/each}}
        </ol>
      </div>
      {{/each}}
    </div>
    {{/if}}
  `;
  
  // ---------- Data ----------
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
  
  const MAX_REGULAR_PAIRS = Number(pm.environment.get("maxRegularPairs")) || 100;
  
  console.log(`showOnlyGoblins: ${showOnlyGoblins}`);
  console.log(`showPrizePicksOnly: ${showPrizePicksOnly}`);
  console.log(`Loaded data for league: ${leagueType}`);
  
  // ---------- Configs ----------
  const OFFENSE_PROPS_BASKETBALL = new Set([
    "STEALS", "STEALS_BLOCKS", "BLOCKS", "DEFENSIVE_REBOUNDS", "TURNOVERS"
  ]);
  
  const STAT_MAP_BASKETBALL = {
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
    PASSING_YARDS: "passingYards",
    PASSING_ATTEMPTS: "passingAttempts",
    PASSING_TDS: "passingTouchdowns",
    INTERCEPTIONS_THROWN: "interceptionsThrown",
    PASS_RUSH_YARDS: "passingYards|rushingYards",
    RUSHING_YARDS: "rushingYards",
    RUSH_ATTEMPTS: "rushingAttempts",
    RUSHING_TDS: "rushingTouchdowns",
    RUSH_REC_YARDS: "rushingYards|receivingYards",
    RECEIVING_YARDS: "receivingYards",
    RECEPTIONS: "receptions",
    TARGETS: "recTargets",
    RECEIVING_TDS: "receivingTouchdowns",
    SACKS_TAKEN: "passerSacks",
    SACKS: "sacks",
    QB_HITS: "qbHits",
    POINTS: "points",
    TOUCHDOWNS: "touchdowns",
    REDZONE_EFF: "redzoneEff",
    THIRD_DOWN_CONV: "thirdDownConv",
    KICKING_POINTS: "kickingPoints",
    FIELD_GOALS: "fieldGoals",
    EXTRA_POINTS: "extraPoints"
  };
  
  const LEAGUE_CONFIGS = {
    NBA:  { type:"basketball", seasonEnv:"nbaSeasonYear",  defaultYear:"2024", statMap:STAT_MAP_BASKETBALL, offenseProps:OFFENSE_PROPS_BASKETBALL, teamCountFallback:30, thresholds:{ heavy:20, midHigh:16, midLow:10 }},
    WNBA: { type:"basketball", seasonEnv:"wnbaSeasonYear", defaultYear:"2025", statMap:STAT_MAP_BASKETBALL, offenseProps:OFFENSE_PROPS_BASKETBALL, teamCountFallback:13, thresholds:"dynamic_tertiles" },
    NFL:  { type:"nfl",        seasonEnv:"nflSeasonYear",  defaultYear:"2024", statMap:STAT_MAP_NFL,        offenseProps:new Set(),           teamCountFallback:32, thresholds:{ heavy:24, midHigh:20, midLow:12 }},
    NHL:  { type:"hockey",     seasonEnv:"nhlSeasonYear",  defaultYear:"2024", statMap:STAT_MAP_BASKETBALL, offenseProps:new Set(),           teamCountFallback:32, thresholds:{ heavy:22, midHigh:17, midLow:10 }},
    SOCCER:{type:"soccer",     seasonEnv:"soccerSeasonYear",defaultYear:"2024",statMap:STAT_MAP_SOCCER,     offenseProps:new Set(),           teamCountFallback:20, thresholds:"dynamic_tertiles" }
  };
  
  // ---------- Helpers ----------
  function findOpponentTeam(playerTeamId, eventId) {
    const game = schedule?.events?.find(g => g.eventId == eventId);
    if (!game) return null;
    if (game?.home?.teamId == null || game?.away?.teamId == null) return "N/A";
    return playerTeamId == game.home.teamId ? game.away.teamId : game.home.teamId;
  }
  function getLeagueConfig(leagueType) { return LEAGUE_CONFIGS[leagueType] || LEAGUE_CONFIGS.NBA; }
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
  function latestSeason(seasons) { return seasons.reduce((a,b)=>(+b.year>+a.year?b:a)); }
  function getTeamFromSeason(season, teamId) { return season?.teams?.find(t => t.teamId == teamId) || null; }
  function getStatArrayForLeague(team, league, propType) {
    // Check if team has rankings data
    if (!team?.rankings?.statRankings) return [];
    
    // Get overall rankings if they exist
    const overall = team.rankings.statRankings.overall;
    if (!overall) return [];
    
    // For basketball, determine whether to use offense or defense stats
    if (league.type === "basketball") {
      // Use offense stats for offensive props (steals, blocks, etc)
      if (league.offenseProps.has(propType)) {
        return overall.offense || [];
      }
      // Use defense stats for defensive props
      return overall.defense || [];
    }
    
    // For other sports, default to defense stats
    return overall.defense || [];
  }
  function rankForStatKey(stats, key) {
    if (!key) return "N/A";
    if (key.includes("|")) {
      const parts = key.split("|");
      const vals = parts.map(k => stats.find(s => s.stat === k)?.rank).filter(v => typeof v === "number");
      if (!vals.length) return "N/A";
      return Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
    }
    const hit = stats.find(s => s.stat === key);
    return typeof hit?.rank === "number" ? hit.rank : "N/A";
  }
  function fantasyScoreRankBasketball(stats) {
    const pra = stats.find(s => s.stat === "points|rebounds|assists")?.rank;
    const sb  = stats.find(s => s.stat === "steals|blocks")?.rank;
    if (typeof pra==="number" && typeof sb==="number") return Math.round((pra+sb)/2);
    if (typeof pra==="number") return pra;
    if (typeof sb==="number") return sb;
    return "N/A";
  }
  
  // ---------- Unified ranking ----------
  function getOpponentDefenseRanking(playerTeamId, eventId, propType) {
    // Get opponent team ID
    const opponentTeamId = findOpponentTeam(playerTeamId, eventId);
    if (!opponentTeamId) return "N/A";
  
    // Get league configuration
    const league = getLeagueConfig(leagueType);
    const envYear = pm.environment.get(league.seasonEnv);
    const preferredYear = envYear || league.defaultYear;
  
    // Get current season data
    const season = pickSeasonFromContent(leagueType, defensiveStats?.content, competitionId, preferredYear);
    if (!season) return "N/A";
  
    // Find opponent team in season data
    const team = getTeamFromSeason(season, opponentTeamId);
    if (!team) return "N/A";
  
    // Skip if team has no rankings data
    if (!team.rankings || Object.keys(team.rankings).length === 0) return "N/A";
  
    // Get appropriate stats array for the prop type
    const stats = getStatArrayForLeague(team, league, propType);
    if (!stats || stats.length === 0) return "N/A";
  
    // Special handling for fantasy score in basketball
    if (league.type === "basketball" && propType === "FANTASY_SCORE_PP") {
      const fsRank = fantasyScoreRankBasketball(stats);
      if (fsRank === "N/A") return "N/A";
      return fsRank;
    }
  
    // Get the stat key for this prop type
    const statKey = (league.statMap && league.statMap[propType]) || (STAT_MAP_BASKETBALL[propType]) || null;
    return rankForStatKey(stats, statKey);
  }
  
  // ---------- Defense color ----------
  function currentSeasonTeamCount(content, leagueType, competitionId) {
    if (leagueType === "SOCCER" && competitionId) {
      const comp = content.competitions?.find(c => c.competitionId === competitionId);
      const seasons = comp?.seasons || [];
      const season = latestSeason(seasons);
      // Only count teams that have rankings data
      return season?.teams?.filter(t => t.rankings && Object.keys(t.rankings).length > 0)?.length || 0;
    }
    const seasons = content.seasons || [];
    const season = latestSeason(seasons);
    // Only count teams that have rankings data
    return season?.teams?.filter(t => t.rankings && Object.keys(t.rankings).length > 0)?.length || 0;
  }
  function defenseClassForRank(rank, isOver, leagueType) {
    const r = parseFloat(rank);
    if (isNaN(r)) return "";
  
    const league = getLeagueConfig(leagueType);
    if (league.thresholds === "dynamic_tertiles") {
      const teamCount =
        (defensiveStats?.content && currentSeasonTeamCount(defensiveStats.content, leagueType, competitionId)) ||
        league.teamCountFallback;
      const greenMax = Math.ceil(teamCount/3);
      const orangeMax = Math.ceil((teamCount*2)/3);
  
      if (isOver) { if (r<=greenMax) return "red-text"; if (r<=orangeMax) return "orange-text"; return "green-text"; }
      else { if (r<=greenMax) return "green-text"; if (r<=orangeMax) return "orange-text"; return "red-text"; }
    }
  
    const { heavy, midHigh, midLow } = league.thresholds || LEAGUE_CONFIGS.NBA.thresholds;
    if ((isOver && r >= heavy) || (!isOver && r <= midLow)) return "dark-green-text";
    if ((isOver && r <= midLow) || (!isOver && r >= heavy)) return "dark-red-text";
    if ((!isOver && r <= midHigh) || (isOver && r >= midHigh)) return "green-text";
    return "red-text";
  }
  
  // ---- Early-season blending (NBA) ----
  const isEarlySeason = (pm.environment.get("nbaEarlySeason") === "true") && (leagueType === "NBA");
  const EARLY_GAMES_CUTOFF = Number(pm.environment.get("nbaEarlyGamesCutoff")) || 12;
  
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const nz = (v, fb = 0) => (Number.isFinite(Number(v)) ? Number(v) : fb);
  
  function weightFromGames(gamesPlayed, cutoff = EARLY_GAMES_CUTOFF) { return clamp01((Number(gamesPlayed)||0)/cutoff); }
  function estimateGamesPlayed(stats) {
    const l10 = nz(stats?.l10, 0); const l5 = nz(stats?.l5, 0);
    return Math.round(Math.max(l10*10, l5*5));
  }
  function blendMetric(current, prior, w) {
    const c = Number.isFinite(Number(current)) ? Number(current) : null;
    const p = Number.isFinite(Number(prior)) ? Number(prior) : null;
    if (c==null && p==null) return 0; if (c==null) return p; if (p==null) return c;
    return (w*c) + ((1-w)*p);
  }
  function getBlendedStats(stats) {
    if (!(isEarlySeason)) {
      return { l20:nz(stats?.l20,0), l10:nz(stats?.l10,0), l5:nz(stats?.l5,0), h2h:nz(stats?.h2h,0),
               curSeason:nz(stats?.curSeason,0), prevSeason:nz(stats?.prevSeason,0), weight:1 };
    }
    const gp = estimateGamesPlayed(stats); const w = weightFromGames(gp);
    return {
      l20: blendMetric(stats?.l20, stats?.prevSeason, w),
      l10: blendMetric(stats?.l10, stats?.prevSeason, w),
      l5:  blendMetric(stats?.l5,  stats?.prevSeason, w),
      h2h: blendMetric(stats?.h2h, stats?.prevSeason, Math.min(1, w+0.2)),
      curSeason: blendMetric(stats?.curSeason, stats?.prevSeason, w),
      prevSeason: nz(stats?.prevSeason, 0),
      weight: w
    };
  }
  
  // ---------- Trend color ----------
  function trendClass(v) {
    const n = parseFloat(v);
    if (isNaN(n)) return "";
    if (n >= 0.6) return "green-text";
    if (n >= 0.38) return "orange-text";
    return "red-text";
  }
  
  // ---------- Edge helpers ----------
  function americanToProb(odds) {
    const o = Number(odds); if (!Number.isFinite(o)) return null;
    return (o < 0) ? (-o / (-o + 100)) : (100 / (o + 100));
  }
  function pickWindowAndPEst(outcome, rawStats) {
    const windows = [
      ["L5",  rawStats?.l5],
      ["L10", rawStats?.l10],
      ["H2H", rawStats?.h2h],
      ["Szn25", rawStats?.curSeason],
      ["Szn24", rawStats?.prevSeason],
    ].filter(([,v]) => Number.isFinite(Number(v)));
  
    if (!windows.length) return null;
  
    const isOver = outcome.outcomeLabel === "Over";
    
    // For both Overs and Unders, we want the window that shows the strongest trend
    const chosen = isOver
      ? windows.reduce((a,b) => (+b[1] > +a[1] ? b : a))
      : windows.reduce((a,b) => (+b[1] < +a[1] ? b : a));
  
    const pOver = Math.max(0, Math.min(1, Number(chosen[1])));
    const pEst = isOver ? pOver : (1 - pOver);
  
    return { label: chosen[0], value: Number(chosen[1]), pEst };
  }
  function edgeNoteFor(outcome, rawStats, avgOdds) {
    const pick = pickWindowAndPEst(outcome, rawStats);
    if (!pick) return "";
    const pImp = americanToProb(avgOdds);
    if (pImp == null) return "";
    const gap = (pick.pEst - pImp) * 100;
    return `p_est ${(pick.pEst*100).toFixed(0)}% vs p_imp ${(pImp*100).toFixed(0)}% ⇒ ${gap >= 0 ? "+" : ""}${Math.round(gap)}%`;
  }
  function edgeGapFor(outcome, rawStats, avgOdds) {
    const pick = pickWindowAndPEst(outcome, rawStats);
    if (!pick) return null;
    const pImp = americanToProb(avgOdds);
    if (pImp == null) return null;
    return (pick.pEst - pImp) * 100; // percentage points
  }
  
  // ---------- Sorting ----------
  function sortProps(a, b, sortingType) {
    const toNum=(v,fb=0)=>{const n=Number(v); return Number.isFinite(n)?n:fb;};
    const cmpAsc=(x,y)=>(x===y?0:(x<y?-1:1));
    const cmpDesc=(x,y)=>(x===y?0:(x>y? -1:1));
    const chain=(...ds)=>{for(const d of ds) if(d!==0) return d; return 0;};
  
    const A=getBlendedStats(a?.stats||{}), B=getBlendedStats(b?.stats||{});
    const oddsA=toNum(getAvgOdds(a), +Infinity), oddsB=toNum(getAvgOdds(b), +Infinity);
    const seasonA=A.curSeason, seasonB=B.curSeason;
    const trendA=isPlayoffs?(A.h2h+A.l5):(A.h2h+A.l5+A.l10);
    const trendB=isPlayoffs?(B.h2h+B.l5):(B.h2h+B.l5+B.l10);
    const defA=toNum(getOpponentDefenseRanking(a?.outcome?.teamId,a?.outcome?.eventId,a?.outcome?.proposition),999);
    const defB=toNum(getOpponentDefenseRanking(b?.outcome?.teamId,b?.outcome?.eventId,b?.outcome?.proposition),999);
    const orfA=toNum(a?.orfScore,-Infinity), orfB=toNum(b?.orfScore,-Infinity);
    const nameA=String(a?.outcome?.marketLabel||""), nameB=String(b?.outcome?.marketLabel||"");
  
    switch (sortingType) {
      case SortingType.SORT_DEFENSE_RANK:
        return chain(cmpDesc(defA,defB), cmpDesc(seasonA,seasonB), cmpAsc(oddsA,oddsB), nameA.localeCompare(nameB));
      case SortingType.SORT_SEASON:
        return chain(cmpDesc(seasonA,seasonB), cmpAsc(oddsA,oddsB), cmpDesc(trendA,trendB), nameA.localeCompare(nameB));
      case SortingType.SORT_ODDS:
        return chain(cmpAsc(oddsA,oddsB), cmpDesc(trendA,trendB), cmpDesc(seasonA,seasonB), nameA.localeCompare(nameB));
      case SortingType.SORT_TREND:
        return chain(cmpDesc(trendA,trendB), cmpDesc(seasonA,seasonB), cmpAsc(oddsA,oddsB), nameA.localeCompare(nameB));
      case SortingType.SORT_FAVORABLE_TREND:
        return chain(cmpDesc(orfA,orfB), cmpDesc(trendA,trendB), cmpDesc(seasonA,seasonB), cmpAsc(oddsA,oddsB), nameA.localeCompare(nameB));
      case SortingType.SORT_EDGE_GAP: {
        const gapA_raw = (typeof a?.edgeGapPct!=="undefined"&&a?.edgeGapPct!==null)?Number(a.edgeGapPct):edgeGapFor(a?.outcome,a?.stats,getAvgOdds(a));
        const gapB_raw = (typeof b?.edgeGapPct!=="undefined"&&b?.edgeGapPct!==null)?Number(b.edgeGapPct):edgeGapFor(b?.outcome,b?.stats,getAvgOdds(b));
        const posA = Number.isFinite(gapA_raw)?(gapA_raw>=0?2:1):0;
        const posB = Number.isFinite(gapB_raw)?(gapB_raw>=0?2:1):0;
        const gapA = Number.isFinite(gapA_raw)?gapA_raw:-Infinity;
        const gapB = Number.isFinite(gapB_raw)?gapB_raw:-Infinity;
        return chain(
          cmpDesc(posA,posB),        // positives → negatives/unknowns
          cmpDesc(gapA,gapB),        // larger positive first
          cmpDesc(trendA,trendB),
          cmpDesc(seasonA,seasonB),
          cmpAsc(oddsA,oddsB),
          nameA.localeCompare(nameB)
        );
      }
      default: return 0;
    }
  }
  
  // ---------- Approval ----------
  function isSafeRegular(stats) {
    // Early disqualification for null H2H
    if (stats.h2h == null) return 0;
    
    // Strong trend check - if recent performance is exceptional
    const hasStrongTrend = stats.l5 >= 0.8 && stats.l10 >= 0.8;
    
    // If we have a strong recent trend, be more lenient with other checks
    if (hasStrongTrend && stats.h2h >= 0.6) {
        return true;
    }
    
    // Regular checks for non-strong-trend cases
    if (stats.curSeason < .54 || stats.h2h < 0.66) return 0;
    
    let hits = 0;
    if (stats.l20 >= 0.5) hits++;
    if (stats.l10 >= 0.6) hits++;
    if (stats.l5 >= 0.6) hits++;
    if (stats.h2h >= 0.80) hits++;
    if (stats.curSeason >= 0.55) hits++;
    
    // Trend direction check
    if (stats.l5 >= stats.l10 && stats.l10 >= stats.l20) hits++;
    
    // Check for extreme low values only if we don't have a strong trend
    if (!hasStrongTrend) {
        const hasExtremeLow = [stats.l5, stats.l10, stats.l20, stats.curSeason].some(val => val < 0.3);
        if (hasExtremeLow) return 0;
    }
    
    return hits >= 5;
  }
  function isSafeRegularPlayoffs(item) { let s=item.stats; return !(s.l5<.6 || s.h2h<=.6); }
  function isSafeGoblin(stats) {
    let hits=0;
    if (stats.l20 >= 0.7) hits++;
    if (stats.l10 >= 0.7) hits++;
    if (stats.l5 >= 0.7) hits++;
    if (stats.curSeason >= 0.7) hits++;
    if (stats.h2h == null || stats.h2h >= 0.7) hits++; else hits--;
    return hits >= 4;
  }
  function isSafeGoblinPlayoffs(item) { let s=item.stats; return !(s.l5<.6 || s.h2h<.9); }
  function isSafe2ndHalf(stats, periodLabel) { return (periodLabel=="2H"||periodLabel=="4Q"||periodLabel=="1Q"); }
  
  function approvalTagFor(item) {
    const blended = getBlendedStats(item.stats || {});
    const isGoblin = isGoblinProp(item.outcome);
    
    if (isGoblin && isSafeGoblin(blended)) return "✅ Goblin";
    if (!isGoblin && (isPlayoffs ? isSafeRegularPlayoffs(item) : isSafeRegular(blended))) return "✅ Regular";
    
    // Show why it didn't pass
    if (isGoblin) return "⚠️ Goblin (Low Hit%)";
    
    // For regulars, give more detail
    if (!item.stats?.h2h) return "❌ No H2H Data";
    if (blended.curSeason < 0.54) return "⚠️ Low Season";
    if (blended.h2h < 0.66) return "⚠️ Low H2H";
    
    return "⚠️ Mixed Trends";
  }
  
// Helper function to check if a prop is a goblin
let goblinCheckCount = 0;
function isGoblinProp(outcome) {
    // Check for goblin indicators in PrizePicks odds
    const isPPGoblin = outcome?.bookOdds?.PRIZEPICKS?.identifier?.bookProps?.odds_type === "goblin" || 
                      outcome?.bookOdds?.PRIZEPICKS?.identifier?.bookProps?.odds_label === "👿";
    
    // Also check the odds value itself
    const ppOdds = parseFloat(outcome?.bookOdds?.PRIZEPICKS?.odds);
    const isGoblinOdds = ppOdds === -137;
    
    const result = isPPGoblin || isGoblinOdds;
    
    // Debug first few goblin checks
    if (DEBUG_MODE && goblinCheckCount < 5 && result) {
        goblinCheckCount++;
        console.log(`🔍 isGoblinProp called for ${outcome.marketLabel}:`);
        console.log(`   isPPGoblin: ${isPPGoblin}, isGoblinOdds: ${isGoblinOdds}`);
        console.log(`   PP odds: "${outcome?.bookOdds?.PRIZEPICKS?.odds}" | parsed: ${ppOdds}`);
        console.log(`   odds_type: "${outcome?.bookOdds?.PRIZEPICKS?.identifier?.bookProps?.odds_type}"`);
    }
    
    return result;
}

// ---------- Map props ----------
let mapPropsDebugCount = 0;
function mapProps(item, filterType) {
    const { outcome, stats: raw } = item;
    const stats = getBlendedStats(raw);
    const isPrizePicks = outcome.bookOdds.PRIZEPICKS !== undefined;
    const isSleeper    = outcome.bookOdds.SLEEPER   !== undefined;
    const allowedDFS   = showPrizePicksOnly ? isPrizePicks : (isPrizePicks || isSleeper);
    const includeItem  = allowedDFS || (outcome.periodLabel == "2H" || outcome.periodLabel == "4Q" || outcome.periodLabel == "1Q");
  
    const opponentTeamId = findOpponentTeam(outcome.teamId, outcome.eventId);
    let opponentTeamName = "Unknown Team";
    if (opponentTeamId) {
      const t = entities.content.teams.find(x => x.team.teamId === opponentTeamId);
      if (t) opponentTeamName = t.team.fullName;
    }
  
    const opponentDefenseRank = getOpponentDefenseRanking(outcome.teamId, outcome.eventId, outcome.proposition);
    const isOver = outcome.outcomeLabel === "Over";
    const defenseClass = defenseClassForRank(opponentDefenseRank, isOver, leagueType);
    
    // Debug mode: allow props even if we can't find opponent team/defense rank
    const ALLOW_MISSING_OPPONENT = DEBUG_MODE;
    
    if (!ALLOW_MISSING_OPPONENT && opponentDefenseRank == "N/A" && opponentTeamName === "Unknown Team") {
      if (DEBUG_MODE && mapPropsDebugCount < 3) {
        mapPropsDebugCount++;
        console.log(`❌ mapProps returned null: ${outcome.marketLabel}`);
        console.log(`   opponentTeamId: ${opponentTeamId}, opponentTeamName: ${opponentTeamName}`);
        console.log(`   opponentDefenseRank: ${opponentDefenseRank}`);
        console.log(`   entities loaded: ${entities?.content?.teams?.length || 0} teams`);
        console.log(`   schedule loaded: ${schedule?.events?.length || 0} events`);
      }
      return null;
    }
    
    // Use "vs TBD" if we can't find opponent in debug mode
    if (ALLOW_MISSING_OPPONENT && opponentTeamName === "Unknown Team") {
      opponentTeamName = "TBD";
    }
  
    const l20Color = trendClass(stats.l20), l10Color=trendClass(stats.l10), l5Color=trendClass(stats.l5),
          h2hColor=trendClass(stats.h2h), curSeasonColor=trendClass(stats.curSeason), prevSeasonColor=trendClass(raw?.prevSeason),
          favorableColor = trendClass(item.orfScore);
  
    const isGoblin = item.outcome.bookOdds.PRIZEPICKS?.identifier?.bookProps?.odds_type === "goblin" || 
                     item.outcome.bookOdds.PRIZEPICKS?.identifier?.bookProps?.odds_label === "👿";
    const goblinPrefix = isGoblin ? "👿 " : "";
    const bookPrefix = isPrizePicks ? "" : (isSleeper ? "SL: " : "O:");
    const typePrefix = `[${outcome.outcomeLabel}] `;
    const periodLabel  = outcome.periodLabel || "Full";
    const approvalTag  = approvalTagFor(item);
    const avgOdds = getAvgOdds(item);
    const hasOdds = hasRealOdds(item);
    const edgeNote = edgeNoteFor(outcome, raw || {}, avgOdds);
    const edgeGapPct = edgeGapFor(outcome, raw || {}, avgOdds); // numeric for sorting/slips
  
    return includeItem ? {
      // display
      player: `${goblinPrefix}${bookPrefix}${typePrefix}${outcome.marketLabel} vs ${opponentTeamName}`,
      type: outcome.outcomeLabel,
      periodLabel,
      line: outcome.line,
  
      // raw stats
      l20: raw?.l20, l10: raw?.l10, l5: raw?.l5, h2h: raw?.h2h,
      curSeason: raw?.curSeason, prevSeason: raw?.prevSeason,
  
      // classes
      l20Color, l10Color, l5Color, h2hColor, curSeasonColor, prevSeasonColor,
      defenseRank: opponentDefenseRank, defenseClass, favorableColor,
  
      // approval/edge
      approvalTag, edgeNote, edgeGapPct,
  
      // odds
      CAESARS_odds: outcome.bookOdds.CAESARS?.odds,
      FANDUEL_odds: outcome.bookOdds.FANDUEL?.odds,
      DK_odds:      outcome.bookOdds.DRAFTKINGS?.odds,
      BET365_odds:  outcome.bookOdds.BET365?.odds,
      MGM_odds:     outcome.bookOdds.BETMGM?.odds,
      PP_odds:      outcome.bookOdds.PRIZEPICKS?.odds,
      UD_odds:      outcome.bookOdds.UNDERDOG?.odds,
      SleeperOdds:  outcome.bookOdds.SLEEPER?.odds,
      AVG_ODDS:     hasOdds ? avgOdds : `${avgOdds}*`,
  
      // hidden helpers for mixing/diversity
      _teamId: outcome.teamId,
      _isOver: isOver ? 1 : 0,
      _isGoblin: isGoblin,  // Store goblin status for slip building
      _hasRealOdds: hasOdds,  // Track if we have real odds or not (for display purposes)
      
      // Keep a reference to stats and outcome for slip building
      stats: raw,
      outcome: outcome  // Keep full outcome for slip building logic
    } : null;
  }
  
  // ---------- Odds average ----------
  function getAvgOdds(item) {
    let sportsbookOdds = [
      item.outcome.bookOdds?.CAESARS?.odds,
      item.outcome.bookOdds?.FANDUEL?.odds,
      item.outcome.bookOdds?.DRAFTKINGS?.odds,
      item.outcome.bookOdds?.BET365?.odds,
      item.outcome.bookOdds?.BETMGM?.odds
    ].map(odds => parseFloat(odds)).filter(odds => !isNaN(odds));
    if (sportsbookOdds.length > 0) {
      let averageOdds = Math.round(sportsbookOdds.reduce((sum, odds) => sum + odds, 0) / sportsbookOdds.length);
      return averageOdds;
    } else {
      return -120; // Default to -120 odds when no valid odds are available
    }
  }
  
  // Check if we have real sportsbook odds (not PrizePicks/Underdog only)
  function hasRealOdds(item) {
    const sportsbookOdds = [
      item.outcome.bookOdds?.CAESARS?.odds,
      item.outcome.bookOdds?.FANDUEL?.odds,
      item.outcome.bookOdds?.DRAFTKINGS?.odds,
      item.outcome.bookOdds?.BET365?.odds,
      item.outcome.bookOdds?.BETMGM?.odds
    ].map(odds => parseFloat(odds)).filter(odds => !isNaN(odds));
    return sportsbookOdds.length > 0;
  }
  
  // ---------- Filters ----------
  // Debug counters (only active when running locally)
  const DEBUG_MODE = typeof global !== 'undefined' && global.DEBUG_FILTER;
  let debugCounters = {
    total: 0,
    noPrizePicks: 0,
    wrongOverUnder: 0,
    failedSafety: 0,
    passed: 0,
    goblinsFound: 0
  };

  // Minimal filter - only removes props with missing data or wrong book
  function filterProps(item, filterType) {
    if (DEBUG_MODE) {
      debugCounters.total++;
    }
    
    // Only filter by book availability
    const isPrizePicks = item.outcome.bookOdds.PRIZEPICKS !== undefined;
    const isSleeper    = item.outcome.bookOdds.SLEEPER   !== undefined;
    if (showPrizePicksOnly && !isPrizePicks) {
      if (DEBUG_MODE) {
        debugCounters.noPrizePicks++;
        if (debugCounters.noPrizePicks === 1) {
          console.log(`❌ Filter reason: No PrizePicks odds for ${item.outcome.marketLabel}`);
        }
      }
      return false;
    }

    // Only filter by Over/Under type if specifically requested
    const outcomeLabel = item.outcome.outcomeLabel;
    const isOver  = outcomeLabel === "Over";
    const isUnder = outcomeLabel === "Under";
  
    const overFilters  = new Set([FilterType.FILTER_HIGH_ODDS_HIGH_TREND_OVERS]);
    const underFilters = new Set([FilterType.FILTER_HIGH_ODDS_HIGH_TREND_UNDERS]);
    if (overFilters.has(filterType) && isUnder) {
      if (DEBUG_MODE) debugCounters.wrongOverUnder++;
      return false;
    }
    if (underFilters.has(filterType) && isOver) {
      if (DEBUG_MODE) debugCounters.wrongOverUnder++;
      return false;
    }
    
    // Must have basic stats to be useful
    if (!item.stats || !item.stats.h2h) {
      if (DEBUG_MODE) debugCounters.failedSafety++;
      return false;
    }
  
    if (DEBUG_MODE) {
      debugCounters.passed++;
      if (debugCounters.passed <= 3) {
        console.log(`✅ Passed basic filter: ${item.outcome.marketLabel}`);
      }
    }
    
    return true;
  }
  
  // Print debug summary at the end
  if (DEBUG_MODE && typeof global !== 'undefined') {
    global.printFilterDebug = () => {
      console.log('\n📊 Filter Debug Summary:');
      console.log(`   Total props processed: ${debugCounters.total}`);
      console.log(`   ❌ Filtered (no PrizePicks): ${debugCounters.noPrizePicks}`);
      console.log(`   ❌ Filtered (wrong Over/Under): ${debugCounters.wrongOverUnder}`);
      console.log(`   ❌ Filtered (failed safety checks): ${debugCounters.failedSafety}`);
      console.log(`   ✅ Passed all filters: ${debugCounters.passed}`);
    };
  }
  
  // ---------- Slip builders ----------
  function estPEstForRow(row) {
    const dummyOutcome = { outcomeLabel: row.type };
    const rawStats = { l5: row.l5, l10: row.l10, h2h: row.h2h, curSeason: row.curSeason, prevSeason: row.prevSeason };
    const pick = pickWindowAndPEst(dummyOutcome, rawStats);
    return pick ? pick.pEst : null;
  }
  function product(arr) { return arr.reduce((a,b)=>a*b,1); }
  function pct(x) { return Math.round(x*100); }
  function uniqueByPlayer(arr) {
    const seen = new Set();
    return arr.filter(r => {
      const key = r.player.replace(/\s+\(.+?\)$/,'');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  function combinations2(list) {
    const out = [];
    for (let i=0;i<list.length;i++) {
      for (let j=i+1;j<list.length;j++) {
        out.push([list[i], list[j]]);
      }
    }
    return out;
  }
  
  // Favorable mix scorer:
  // + weight for opposite Over/Under, + different teams, + different periods,
  // + sum of positive gaps, with small tie-busters on higher min-gap.
  function pairScore(a, b) {
    let score = 0;
    const gapA = Number(a.edgeGapPct ?? -999), gapB = Number(b.edgeGapPct ?? -999);
    if (gapA > 0) score += gapA;
    if (gapB > 0) score += gapB;
    // diversity bonuses
    if ((a._isOver ^ b._isOver) === 1) score += 5;             // Opposite sides
    if (a._teamId && b._teamId && a._teamId !== b._teamId) score += 2; // Different teams
    if (a.periodLabel !== b.periodLabel) score += 1;           // Different period
    // encourage not-too-unbalanced pairs
    score += Math.min(gapA, gapB) * 0.1;
    return score;
  }
  
  function topByGap(list, n) {
    return uniqueByPlayer(
      list.filter(r => typeof r.edgeGapPct === "number")
          .sort((a,b) => b.edgeGapPct - a.edgeGapPct)
    ).slice(0, n);
  }
  
  function buildAllRegularPairs(rows) {
    // Filter for regular props that meet safety criteria
    const regularsPos = rows.filter(r => {
        if (r._isGoblin) return false; // Skip goblins
        if (!r.edgeGapPct || r.edgeGapPct <= 0) return false; // Must have positive edge
        
        // Apply safety filter here instead of in filterProps
        const stats = getBlendedStats({ l20: r.l20, l10: r.l10, l5: r.l5, h2h: r.h2h, curSeason: r.curSeason, prevSeason: r.prevSeason });
        return isPlayoffs ? isSafeRegularPlayoffs(r) : isSafeRegular(stats);
    });
  
    // Unique by player first
    const uniq = uniqueByPlayer(regularsPos);
    const playerAppearances = new Map(); // Track how many times each player appears
    const usedPairs = new Set(); // Track unique pairs of players
    const maxPairs = MAX_REGULAR_PAIRS;
    const out = [];

    // Helper to get clean player name without suffix
    const getCleanPlayerName = (player) => player.replace(/\s+\(.+?\)$/,'');
    
    // Helper to create a unique key for a pair of players (order-independent)
    const getPairKey = (player1, player2) => {
      const name1 = getCleanPlayerName(player1.player);
      const name2 = getCleanPlayerName(player2.player);
      return [name1, name2].sort().join('|');
    };
    
    // Helper to check if player is under appearance limit
    const canUsePlayer = (player) => {
      const name = getCleanPlayerName(player.player);
      const count = playerAppearances.get(name) || 0;
      return count < 2;
    };

    // Helper to check if this pair has been used before
    const canUsePair = (player1, player2) => {
      const pairKey = getPairKey(player1, player2);
      return !usedPairs.has(pairKey);
    };

    // Helper to update appearance count for a player
    const incrementPlayerCount = (player) => {
      const name = getCleanPlayerName(player.player);
      playerAppearances.set(name, (playerAppearances.get(name) || 0) + 1);
    };

    // Helper to mark a pair as used
    const markPairAsUsed = (player1, player2) => {
      const pairKey = getPairKey(player1, player2);
      usedPairs.add(pairKey);
    };

    // For each player that still has room for more appearances
    for (let i = 0; i < uniq.length && out.length < maxPairs; i++) {
      const firstPlayer = uniq[i];
      if (!canUsePlayer(firstPlayer)) continue;

      // Find the best available partner for this player
      let bestPartner = null;
      let bestScore = -Infinity;

      // Look through all other players for the best available partner
      for (let j = 0; j < uniq.length; j++) {
        if (i === j) continue; // Skip same player
        const potentialPartner = uniq[j];
        
        // Skip if this partner is at their limit or we've used this pair before
        if (!canUsePlayer(potentialPartner) || !canUsePair(firstPlayer, potentialPartner)) continue;

        const score = pairScore(firstPlayer, potentialPartner);
        if (score > bestScore) {
          bestScore = score;
          bestPartner = potentialPartner;
        }
      }

      // If we found a valid partner, create the slip
      if (bestPartner) {
        const pEsts = [firstPlayer, bestPartner].map(estPEstForRow).filter(Number.isFinite);
        const pWin = pEsts.length === 2 ? product(pEsts) : null;

        // Update tracking
        incrementPlayerCount(firstPlayer);
        incrementPlayerCount(bestPartner);
        markPairAsUsed(firstPlayer, bestPartner);

        const pair = [firstPlayer, bestPartner];
        const totalGap = pair.reduce((sum, prop) => sum + (prop.edgeGapPct || 0), 0).toFixed(1);
        const { rating, ratingClass } = calculateSlipRating(pair);
        const { riskLevel, riskClass } = getRiskLevel(pair);
        
        out.push({
          title: `Regular Value (2-pick) #${out.length + 1}`,
          size: 2,
          bucket: "Regular",
          sortBasis: "Mix + Edge Gap",
          pctWin: pWin ? pct(pWin) : "—",
          legs: pair.map(leg => formatLegForDisplay(leg)),
          totalGap,
          rating,
          ratingClass,
          riskLevel,
          riskClass,
          why: "Both legs show positive Edge Gap; pairing mixes risk profile (sides/teams/periods) when available."
        });
      }
    }
    return out;
  }
  
  // Build one mega slip (prefer 6; fallback to 5→4→3) using weighted scoring system,
  function buildMegaSlip(rows) {
    // Calculate weighted score for each prop based on multiple factors
    function calculateScore(prop) {
      // Must have H2H data and positive edge gap
      if (!prop.h2h || !prop.edgeGapPct || prop.edgeGapPct <= 0) return -1;
      
      // Must pass safety check for mega slip
      const stats = getBlendedStats({ l20: prop.l20, l10: prop.l10, l5: prop.l5, h2h: prop.h2h, curSeason: prop.curSeason, prevSeason: prop.prevSeason });
      const passesRegularSafety = isPlayoffs ? isSafeRegularPlayoffs(prop) : isSafeRegular(stats);
      if (!passesRegularSafety) return -1;
      
      let score = 0;
      
      // Core stats weighted scoring (total 100%)
      score += (Number(prop.h2h) || 0) * 0.30;        // H2H: 30%
      score += (prop.edgeGapPct / 12) * 0.20;         // Edge gap: 20% (normalized to typical 12% max)
      score += (Number(prop.l5) || 0) * 0.20;         // L5: 20%
      score += (Number(prop.l10) || 0) * 0.15;        // L10: 15%
      score += (Number(prop.curSeason) || 0) * 0.10;  // Current season: 10%
      
      // Defense rank bonus (5%)
      const dRank = prop.defenseRank;
      if (dRank && dRank !== "N/A") {
        const normalizedDRank = (30 - parseInt(dRank)) / 30;  // Invert so higher is better
        score += normalizedDRank * 0.05;
      }
      
      // Bonus points for trends
      if ((Number(prop.l5) || 0) > (Number(prop.l10) || 0)) score += 0.05;  // Improving recent form
      if ((Number(prop.l10) || 0) > (Number(prop.curSeason) || 0)) score += 0.05;  // Overall improving trend
      if ((Number(prop.l5) || 0) >= 0.7) score += 0.1;  // Strong recent performance
      
      return score;
    }

    // Score and filter props
    const scoredProps = uniqueByPlayer(
      rows.filter(r => !r._isGoblin)  // No goblins in mega slip
          .map(r => ({ ...r, score: calculateScore(r) }))
          .filter(r => r.score > 0)  // Must have valid score (which includes safety check)
          .sort((a, b) => {
            // Primary sort by weighted score
            if (b.score !== a.score) return b.score - a.score;
            
            // Secondary sort by trend (L5 vs L10 change)
            const trendA = ((Number(a.l5) || 0) - (Number(a.l10) || 0));
            const trendB = ((Number(b.l5) || 0) - (Number(b.l10) || 0));
            return trendB - trendA;
          })
    );

    if (scoredProps.length === 0) return null;

    // Build slip prioritizing diversity
    let legs = [];
    
    // First pass: Build diverse set of high-scoring props
    for (const prop of scoredProps) {
      if (legs.length >= 6) break;
      // Avoid duplicate team + period + side combinations when possible
      if (!legs.find(x => 
          x._teamId === prop._teamId && 
          x.periodLabel === prop.periodLabel && 
          x._isOver === prop._isOver
      )) {
        legs.push(prop);
      }
    }

    // Second pass: Fill remaining slots with highest scoring props
    for (const prop of scoredProps) {
      if (legs.length >= 6) break;
      if (!legs.includes(prop)) {
        legs.push(prop);
      }
    }

    // Determine final slip size (6→5→4→3)
    const targetSizes = [6, 5, 4, 3];
    let chosenSize = targetSizes.find(sz => legs.length >= sz);
    legs = legs.slice(0, chosenSize);

    // Calculate slip metrics
    const pEsts = legs.map(estPEstForRow).filter(Number.isFinite);
    const pWin = pEsts.length === legs.length ? product(pEsts) : null;
    const totalGap = legs.reduce((sum, prop) => sum + (prop.edgeGapPct || 0), 0);
    const avgScore = legs.reduce((sum, prop) => sum + prop.score, 0) / legs.length;

    const { rating, ratingClass } = calculateSlipRating(legs);
    const { riskLevel, riskClass } = getRiskLevel(legs);

    return {
      title: `🎯 Mega ${legs.length}-Pick Slip`,
      size: legs.length,
      bucket: "Mega",
      sortBasis: "Weighted Score",
      legs: legs.map(leg => formatLegForDisplay(leg)),
      pctWin: pWin ? pct(pWin) : "—",
      totalGap: Math.round(totalGap),
      avgScore: (avgScore * 10).toFixed(1),
      rating,
      ratingClass,
      riskLevel,
      riskClass,
      why: "Props scored using weighted system: H2H (30%), Edge Gap (20%), L5 (20%), L10 (15%), Season (10%), Defense (5%). Bonus for improving trends."
    };
  }
  
  function calculateSlipRating(legs) {
    let totalScore = 0;
    
    for (const leg of legs) {
        // Get base stats (all on 0-1 scale)
        const h2h = Number(leg.h2h) || 0;
        const l5 = Number(leg.l5) || 0;
        const l10 = Number(leg.l10) || 0;
        const curSeason = Number(leg.curSeason) || 0;
        const prevSeason = Number(leg.prevSeason) || 0;
        
        // Normalize edge gap to 0-1 scale (assume max useful edge is 100%)
        const edgeGap = Math.min(100, Math.max(0, leg.edgeGapPct || 0)) / 100;
        
        // Normalize defense rank to 0-1 scale (1 = best, 30 = worst)
        const defRank = Number(leg.defenseRank);
        const defScore = (defRank && defRank > 0) ? Math.max(0, (30 - defRank) / 30) : 0;
        
        let legScore = 0;
        
        if (isEarlySeason) {
            // Early season weighting
            legScore += h2h * 0.30;           // H2H (30%) - most reliable early
            legScore += l5 * 0.25;            // L5 (25%) - recent form
            legScore += prevSeason * 0.20;    // Last season (20%) - historical baseline
            legScore += edgeGap * 0.20;       // Edge gap (20%)
            legScore += defScore * 0.05;      // Defense (5%)
        } else {
            // Regular season weighting
            legScore += h2h * 0.25;           // H2H (25%)
            legScore += l5 * 0.20;            // L5 (20%)
            legScore += l10 * 0.15;           // L10 (15%)
            legScore += curSeason * 0.10;     // Season (10%)
            legScore += edgeGap * 0.20;       // Edge gap (20%)
            legScore += defScore * 0.10;      // Defense (10%)
        }
        
        totalScore += legScore;
    }
    
    // Average per leg (0-1 scale) and convert to 0-10 scale
    const avgScore = totalScore / legs.length;
    const rating = Math.round(avgScore * 10 * 10) / 10; // Round to 1 decimal
    
    // Generate rating class
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

function getTrendIndicator(leg) {
    const l5 = Number(leg.l5) || 0;
    const l10 = Number(leg.l10) || 0;
    if (l5 > l10 * 1.1) return "↑";
    if (l5 < l10 * 0.9) return "↓";
    return "→";
}

function getRiskLevel(legs) {
    const avgStats = legs.reduce((acc, leg) => {
        acc.h2h += Number(leg.h2h) || 0;
        acc.prevSeason += Number(leg.prevSeason) || 0;
        acc.l5 += Number(leg.l5) || 0;
        acc.l10 += Number(leg.l10) || 0;
        acc.edgeGap += Number(leg.edgeGapPct) || 0;
        return acc;
    }, { h2h: 0, prevSeason: 0, l5: 0, l10: 0, edgeGap: 0 });
    
    // Convert to averages
    const len = legs.length;
    avgStats.h2h /= len;
    avgStats.prevSeason /= len;
    avgStats.l5 /= len;
    avgStats.l10 /= len;
    avgStats.edgeGap /= len;
    
    let riskLevel, riskClass;
    
    if (isEarlySeason) {
        // Early season risk criteria - more conservative
        if (avgStats.h2h > 0.85 && avgStats.prevSeason > 0.7 && avgStats.l5 >= avgStats.prevSeason) {
            // Low risk if: Strong H2H, good last season, maintaining or improving form
            riskLevel = "LOW";
            riskClass = "high";
        } else if (avgStats.h2h > 0.75 && avgStats.prevSeason > 0.6 && avgStats.l5 > 0.6) {
            // Medium risk if: Good H2H, decent last season, acceptable current form
            riskLevel = "MEDIUM";
            riskClass = "medium";
        } else {
            riskLevel = "HIGH";
            riskClass = "low";
        }
    } else {
        // Regular season risk criteria - more balanced
        if (avgStats.h2h > 0.75 && avgStats.l10 > 0.65 && avgStats.edgeGap > 12) {
            // Low risk if: Good H2H, consistent recent form, strong edge
            riskLevel = "LOW";
            riskClass = "high";
        } else if (avgStats.h2h > 0.65 && avgStats.l5 > 0.6 && avgStats.edgeGap > 8) {
            // Medium risk if: Decent H2H, good recent form, solid edge
            riskLevel = "MEDIUM";
            riskClass = "medium";
        } else {
            riskLevel = "HIGH";
            riskClass = "low";
        }
    }
    
    return { riskLevel, riskClass };
}

function buildRecommendedSlips(rows) {
    const slips = [];
  
    // Get all safe goblins with positive edge gaps, sorted by safety (H2H, L10, L5)
    const safeGoblins = rows.filter(r => {
        const isGoblin = r._isGoblin;
        if (!isGoblin) return false;
        if (!r.edgeGapPct || r.edgeGapPct <= 0) return false;
        const stats = getBlendedStats(r.stats || {});
        return isPlayoffs ? isSafeGoblinPlayoffs(r) : isSafeGoblin(stats);
    }).sort((a, b) => {
        // Sort by safety: prioritize H2H, then L10, then L5, then edge
        const safetyA = (a.h2h * 0.4) + (a.l10 * 0.3) + (a.l5 * 0.2) + (Math.min(100, a.edgeGapPct) / 100 * 0.1);
        const safetyB = (b.h2h * 0.4) + (b.l10 * 0.3) + (b.l5 * 0.2) + (Math.min(100, b.edgeGapPct) / 100 * 0.1);
        return safetyB - safetyA; // Highest safety first
    });
    
    // Get all safe regulars with positive edge gaps
    const safeRegulars = rows.filter(r => {
        if (r._isGoblin) return false;
        if (!r.edgeGapPct || r.edgeGapPct <= 0) return false;
        const stats = getBlendedStats({ l20: r.l20, l10: r.l10, l5: r.l5, h2h: r.h2h, curSeason: r.curSeason, prevSeason: r.prevSeason });
        return isPlayoffs ? isSafeRegularPlayoffs(r) : isSafeRegular(stats);
    }).sort((a, b) => b.edgeGapPct - a.edgeGapPct);
    
    if (DEBUG_MODE) {
        console.log(`\n🎰 Slip Building Debug:`);
        console.log(`   Total rows: ${rows.length}`);
        console.log(`   Safe goblins: ${safeGoblins.length}`);
        console.log(`   Safe regulars: ${safeRegulars.length}`);
    }

    // 1. GOBLIN SLIP: All safe goblins in one slip
    if (safeGoblins.length > 0) {
      const pEsts = safeGoblins.map(estPEstForRow).filter(Number.isFinite);
      const pWin = pEsts.length === safeGoblins.length ? product(pEsts) : null;
      const totalGap = safeGoblins.reduce((sum, prop) => sum + (prop.edgeGapPct || 0), 0).toFixed(1);
      const { rating, ratingClass } = calculateSlipRating(safeGoblins);
      const { riskLevel, riskClass } = getRiskLevel(safeGoblins);
      
      slips.push({
        title: `🎃 Safe Goblins (${safeGoblins.length}-pick)`,
        size: safeGoblins.length,
        bucket: "Goblin",
        sortBasis: "Edge Gap",
        pctWin: pWin ? pct(pWin) : "—",
        legs: safeGoblins.map(leg => formatLegForDisplay(leg)),
        totalGap,
        rating,
        ratingClass,
        riskLevel,
        riskClass,
        why: "All qualifying Goblins with positive Edge Gaps that pass strict hit-rate filters."
      });
    }
  
    // 2. ELITE TIER: Top 10% by edge (4-6 picks)
    const eliteCount = Math.min(6, Math.max(4, Math.floor(safeRegulars.length * 0.1)));
    if (safeRegulars.length >= 4) {
      const eliteSlip = buildTieredSlip(safeRegulars.slice(0, eliteCount), "Elite", "🏆");
      if (eliteSlip) slips.push(eliteSlip);
    }
  
    // 3. SAME GAME PARLAYS: Group by event/team for correlation
    const sameGameSlips = buildSameGameParlays(safeRegulars);
    slips.push(...sameGameSlips);
  
    // 4. BALANCED PORTFOLIOS: Mix edge tiers with risk management (3-5 picks each)
    const portfolioSlips = buildBalancedPortfolios(safeRegulars);
    slips.push(...portfolioSlips);
  
    // 5. MEGA SLIP: Best overall combination (6→5→4→3)
    const mega = buildMegaSlip(rows);
    if (mega) slips.push(mega);
  
    // 6. TRENDING UP: All props with improving form (L5 > L10)
    const trendingSlip = buildTrendingUpSlip(safeRegulars);
    if (trendingSlip) slips.push(trendingSlip);
  
    // 7. VALUE HUNTERS: High edge but slightly lower hit rates (3-4 picks)
    const valueSlips = buildValueHunterSlips(rows);
    slips.push(...valueSlips);
  
    return slips;
  }
  
  // Build a tiered slip from a sorted list
  function buildTieredSlip(props, tierName, emoji) {
    if (props.length < 3) return null;
    
    // Ensure diversity
    const diverse = [];
    const usedTeams = new Set();
    const usedPlayers = new Set();
    
    for (const prop of props) {
      const playerKey = prop.player.replace(/\s+\(.+?\)$/,'');
      if (usedPlayers.has(playerKey)) continue;
      
      // Prefer different teams when possible
      if (diverse.length < 3 || !usedTeams.has(prop._teamId)) {
        diverse.push(prop);
        usedTeams.add(prop._teamId);
        usedPlayers.add(playerKey);
      }
      
      if (diverse.length >= 6) break;
    }
    
    if (diverse.length < 3) return null;
    
    const pEsts = diverse.map(estPEstForRow).filter(Number.isFinite);
    const pWin = pEsts.length === diverse.length ? product(pEsts) : null;
    const totalGap = diverse.reduce((sum, prop) => sum + (prop.edgeGapPct || 0), 0).toFixed(1);
    const { rating, ratingClass } = calculateSlipRating(diverse);
    const { riskLevel, riskClass } = getRiskLevel(diverse);
    const avgEdge = (totalGap / diverse.length).toFixed(1);
    
    return {
      title: `${emoji} ${tierName} Tier (${diverse.length}-pick)`,
      size: diverse.length,
      bucket: tierName,
      sortBasis: "Edge Gap",
      pctWin: pWin ? pct(pWin) : "—",
      legs: diverse.map(leg => formatLegForDisplay(leg)),
      totalGap,
      rating,
      ratingClass,
      riskLevel,
      riskClass,
      why: `Top ${tierName.toLowerCase()} props averaging ${avgEdge}% edge with diverse team coverage.`
    };
  }
  
  // Build same-game parlays (SGPs) for correlation
  function buildSameGameParlays(safeRegulars) {
    const slips = [];
    const byEvent = new Map();
    
    // Group props by event (game)
    safeRegulars.forEach(prop => {
      const eventId = prop.outcome?.eventId;
      if (!eventId) return;
      if (!byEvent.has(eventId)) byEvent.set(eventId, []);
      byEvent.get(eventId).push(prop);
    });
    
    // Create SGPs for games with 3+ props
    let sgpCount = 0;
    for (const [eventId, props] of byEvent.entries()) {
      if (props.length < 3 || sgpCount >= 5) continue; // Max 5 SGPs
      
      // Sort by edge gap and take top 3-5
      const sorted = props.sort((a, b) => b.edgeGapPct - a.edgeGapPct);
      const sgpLegs = uniqueByPlayer(sorted).slice(0, Math.min(5, sorted.length));
      
      if (sgpLegs.length < 3) continue;
      
      const pEsts = sgpLegs.map(estPEstForRow).filter(Number.isFinite);
      const pWin = pEsts.length === sgpLegs.length ? product(pEsts) : null;
      const totalGap = sgpLegs.reduce((sum, prop) => sum + (prop.edgeGapPct || 0), 0).toFixed(1);
      const { rating, ratingClass } = calculateSlipRating(sgpLegs);
      const { riskLevel, riskClass } = getRiskLevel(sgpLegs);
      
      // Get game info from first prop
      const firstProp = sgpLegs[0];
      const teams = firstProp.player.split(" vs ");
      const gameLabel = teams.length > 1 ? teams[1] : "Same Game";
      
      slips.push({
        title: `🎯 SGP: ${gameLabel} (${sgpLegs.length}-pick)`,
        size: sgpLegs.length,
        bucket: "SGP",
        sortBasis: "Correlation",
        pctWin: pWin ? pct(pWin) : "—",
        legs: sgpLegs.map(leg => formatLegForDisplay(leg)),
        totalGap,
        rating,
        ratingClass,
        riskLevel,
        riskClass,
        why: `Same-game parlay with correlated props for increased likelihood.`
      });
      
      sgpCount++;
    }
    
    return slips;
  }
  
  // Build balanced portfolios mixing edge quality and risk
  function buildBalancedPortfolios(safeRegulars) {
    if (safeRegulars.length < 12) return []; // Need enough props for multiple portfolios
    
    const slips = [];
    const portfolioCount = Math.min(3, Math.floor(safeRegulars.length / 12)); // Max 3 portfolios
    
    for (let i = 0; i < portfolioCount; i++) {
      // Take alternating props from different parts of the sorted list
      // This mixes high-edge with medium-edge for balance
      const portfolio = [];
      const startIdx = i * 4; // Offset each portfolio
      
      // High edge (from top third)
      const topThird = Math.floor(safeRegulars.length / 3);
      portfolio.push(safeRegulars[startIdx % topThird]);
      portfolio.push(safeRegulars[(startIdx + 1) % topThird]);
      
      // Medium edge (from middle third)
      const midStart = topThird;
      portfolio.push(safeRegulars[midStart + (startIdx % topThird)]);
      
      // Add 1-2 more diverse picks
      for (let j = startIdx + 2; j < safeRegulars.length && portfolio.length < 5; j++) {
        const candidate = safeRegulars[j];
        // Avoid same player/team as existing picks
        const playerKey = candidate.player.replace(/\s+\(.+?\)$/,'');
        const hasSamePlayer = portfolio.some(p => 
          p.player.replace(/\s+\(.+?\)$/,'') === playerKey
        );
        const hasSameTeam = portfolio.some(p => p._teamId === candidate._teamId);
        
        if (!hasSamePlayer && !hasSameTeam) {
          portfolio.push(candidate);
        }
      }
      
      if (portfolio.length < 3) continue;
      
      const pEsts = portfolio.map(estPEstForRow).filter(Number.isFinite);
      const pWin = pEsts.length === portfolio.length ? product(pEsts) : null;
      const totalGap = portfolio.reduce((sum, prop) => sum + (prop.edgeGapPct || 0), 0).toFixed(1);
      const { rating, ratingClass } = calculateSlipRating(portfolio);
      const { riskLevel, riskClass } = getRiskLevel(portfolio);
      
      slips.push({
        title: `⚖️ Balanced Portfolio ${i + 1} (${portfolio.length}-pick)`,
        size: portfolio.length,
        bucket: "Balanced",
        sortBasis: "Risk-Adjusted",
        pctWin: pWin ? pct(pWin) : "—",
        legs: portfolio.map(leg => formatLegForDisplay(leg)),
        totalGap,
        rating,
        ratingClass,
        riskLevel,
        riskClass,
        why: `Balanced mix of high and medium edge props with diverse team exposure.`
      });
    }
    
    return slips;
  }
  
  // Build trending up slip (all props with improving form)
  function buildTrendingUpSlip(safeRegulars) {
    // Filter for props trending up (L5 > L10 * 1.1 = significant improvement)
    const trendingUp = safeRegulars.filter(r => {
      const l5 = Number(r.l5) || 0;
      const l10 = Number(r.l10) || 0;
      return l5 > l10 * 1.1; // At least 10% improvement
    }).sort((a, b) => {
      // Sort by improvement magnitude and edge
      const improvementA = (a.l5 - a.l10) + (a.edgeGapPct / 100);
      const improvementB = (b.l5 - b.l10) + (b.edgeGapPct / 100);
      return improvementB - improvementA;
    });
    
    if (trendingUp.length < 4) return null;
    
    // Take top 5-6 trending props with diversity
    const diverse = [];
    const usedPlayers = new Set();
    
    for (const prop of trendingUp) {
      const playerKey = prop.player.replace(/\s+\(.+?\)$/,'');
      if (usedPlayers.has(playerKey)) continue;
      
      diverse.push(prop);
      usedPlayers.add(playerKey);
      
      if (diverse.length >= 6) break;
    }
    
    if (diverse.length < 4) return null;
    
    const pEsts = diverse.map(estPEstForRow).filter(Number.isFinite);
    const pWin = pEsts.length === diverse.length ? product(pEsts) : null;
    const totalGap = diverse.reduce((sum, prop) => sum + (prop.edgeGapPct || 0), 0).toFixed(1);
    const { rating, ratingClass } = calculateSlipRating(diverse);
    const { riskLevel, riskClass } = getRiskLevel(diverse);
    const avgImprovement = (diverse.reduce((sum, p) => sum + (p.l5 - p.l10), 0) / diverse.length * 100).toFixed(0);
    
    return {
      title: `📈 Trending Up (${diverse.length}-pick)`,
      size: diverse.length,
      bucket: "Trending",
      sortBasis: "Improvement",
      pctWin: pWin ? pct(pWin) : "—",
      legs: diverse.map(leg => formatLegForDisplay(leg)),
      totalGap,
      rating,
      ratingClass,
      riskLevel,
      riskClass,
      why: `All props showing upward momentum (avg +${avgImprovement}% L5 vs L10 improvement).`
    };
  }
  
  // Build value hunter slips (high edge but slightly lower hit rates)
  function buildValueHunterSlips(rows) {
    // Props with good edge but don't quite pass strict safety filters
    const valueProps = rows.filter(r => {
      if (r._isGoblin) return false;
      if (!r.edgeGapPct || r.edgeGapPct < 10) return false; // Must have 10%+ edge
      
      // Check if it would fail strict safety but has good edge
      const stats = getBlendedStats({ l20: r.l20, l10: r.l10, l5: r.l5, h2h: r.h2h, curSeason: r.curSeason, prevSeason: r.prevSeason });
      const passesStrict = isPlayoffs ? isSafeRegularPlayoffs(r) : isSafeRegular(stats);
      
      if (passesStrict) return false; // Already in other slips
      
      // Relaxed criteria: good recent form OR good H2H
      const hasGoodRecent = (stats.l5 >= 0.6 && stats.l10 >= 0.5);
      const hasGoodH2H = (stats.h2h >= 0.7);
      const hasDecentSeason = (stats.curSeason >= 0.5);
      
      return (hasGoodRecent || hasGoodH2H) && hasDecentSeason;
    }).sort((a, b) => b.edgeGapPct - a.edgeGapPct);
    
    const slips = [];
    if (valueProps.length >= 3) {
      // Create 1-2 value hunter slips
      const slipCount = Math.min(2, Math.floor(valueProps.length / 3));
      
      for (let i = 0; i < slipCount; i++) {
        const start = i * 3;
        const hunters = uniqueByPlayer(valueProps.slice(start, start + 4));
        
        if (hunters.length < 3) continue;
        
        const pEsts = hunters.map(estPEstForRow).filter(Number.isFinite);
        const pWin = pEsts.length === hunters.length ? product(pEsts) : null;
        const totalGap = hunters.reduce((sum, prop) => sum + (prop.edgeGapPct || 0), 0).toFixed(1);
        const { rating, ratingClass } = calculateSlipRating(hunters);
        const { riskLevel, riskClass } = getRiskLevel(hunters);
        
        slips.push({
          title: `💎 Value Hunters ${i + 1} (${hunters.length}-pick)`,
          size: hunters.length,
          bucket: "Value",
          sortBasis: "High Edge",
          pctWin: pWin ? pct(pWin) : "—",
          legs: hunters.map(leg => formatLegForDisplay(leg)),
          totalGap,
          rating,
          ratingClass,
          riskLevel,
          riskClass,
          why: `High edge props (${(totalGap/hunters.length).toFixed(1)}% avg) with acceptable risk profiles.`
        });
      }
    }
    
    return slips;
  }
  
  // Format leg display consistently across all slip types
  function formatLegForDisplay(leg) {
    // Split the original player string to extract components
    const parts = leg.player.split(" vs ");
    const playerInfo = parts[0];
    const opponentName = parts[1];
    
    // Check if it's a goblin prop
    const isGoblin = leg.approvalTag === "✅ Goblin";
    
    // Get trend indicator
    const trendIndicator = getTrendIndicator(leg);
    
    // Strip any existing prefixes and get clean player name
    const cleanPlayerName = playerInfo.replace(/^(👿\s*)?(PP:|SL:|O:)?\s*(\[(?:Over|Under)\]\s*)?/, "");
    
    return {
      ...leg,
      isGoblin,
      playerName: cleanPlayerName,
      opponentName,
      trendIndicator,
      trendClass: trendIndicator === '↑' ? 'trend-up' : trendIndicator === '↓' ? 'trend-down' : 'trend-neutral'
    };
  }
  
  // ---------- Constants ----------
  const SortingType = {
    SORT_SEASON: "CurSeasonFirst",
    SORT_ODDS: "SORT_ODDS",
    SORT_DEFENSE_RANK: "SORT_DEFENSE_RANK",
    SORT_TREND: "SORT_TREND",
    SORT_FAVORABLE_TREND: "SORT_FAVORABLE_TREND",
    SORT_EDGE_GAP: "SORT_EDGE_GAP"
  };
  const FilterType = {
    FILTER_GOBLINS: "FILTER_GOBLINS",
    FILTER_HIGH_ODDS_HIGH_TREND: "FILTER_HIGH_ODDS_HIGH_TREND",
    FILTER_HIGH_ODDS_HIGH_TREND_OVERS: "FILTER_HIGH_ODDS_HIGH_TREND_OVERS",
    FILTER_HIGH_ODDS_HIGH_TREND_UNDERS: "FILTER_HIGH_ODDS_HIGH_TREND_UNDERS",
  };
  
  // ---------- Render ----------
  pm.visualizer.set(
    template,
    (function constructVisualizerPayload(filterType, sortingType) {
      var responseData = pm.response.json();
      var rows = responseData.props
        .filter(item => filterProps(item, filterType))
        .sort((a, b) => sortProps(a, b, sortingType))
        .map(item => mapProps(item, filterType))
        .filter(item => item !== null);
  
      const slips = buildRecommendedSlips(rows);
  
      return { filteredData: rows, isPlayoffs: isPlayoffs, slips };
    })(
      FilterType.FILTER_HIGH_ODDS_HIGH_TREND,
      SortingType.SORT_EDGE_GAP // default sort = highest positive Edge Gap first
    )
  );
  