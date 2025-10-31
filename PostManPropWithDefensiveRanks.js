// PostManPropWithDefensiveRanks + ALL Regular 2-pick slips + Mega slip (6→5→4→3)

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
    const chosen = isOver
      ? windows.reduce((a,b) => (+b[1] > +a[1] ? b : a))
      : windows.reduce((a,b) => (+b[1] < +a[1] ? b : a));
  
    const pOver = Math.max(0, Math.min(1, Number(chosen[1])));
    const pEst  = isOver ? pOver : (1 - pOver);
  
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
    if (stats.curSeason < .54 || stats.h2h == null || stats.h2h < 0.66 || (stats.l5 < stats.l10 || stats.l10 < (stats.l20 * .9))) return 0;
    let hits=0;
    if (stats.l20 >= 0.5) hits++;
    if (stats.l10 >= 0.6) hits++;
    if (stats.l5 >= 0.6) hits++;
    if (stats.h2h >= 0.80) hits++;
    if (stats.curSeason >= 0.55) hits++;
    if (stats.l5 >= stats.l10 && stats.l10 > stats.l20) hits++;
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
    const isGoblin = item.outcome.bookOdds.PRIZEPICKS?.identifier?.bookProps?.odds_type === "goblin" || 
                     item.outcome.bookOdds.PRIZEPICKS?.identifier?.bookProps?.odds_label === "👿";

    if (isGoblin && isSafeGoblin(blended)) return "✅ Goblin";
    if (!isGoblin && (isPlayoffs ? isSafeRegularPlayoffs(item) : isSafeRegular(blended))) return "✅ Regular";
    return "⚠ Trend mismatch";
  }
  
  // ---------- Map props ----------
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
    if (opponentDefenseRank == "N/A" && opponentTeamName === "Unknown Team") return null;
  
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
      AVG_ODDS:     avgOdds,
  
      // hidden helpers for mixing/diversity
      _teamId: outcome.teamId,
      _isOver: isOver ? 1 : 0
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
  
  // ---------- Filters ----------
  function filterProps(item, filterType) {
    const isPrizePicks = item.outcome.bookOdds.PRIZEPICKS !== undefined;
    const isSleeper    = item.outcome.bookOdds.SLEEPER   !== undefined;
    if (showPrizePicksOnly && !isPrizePicks) return false;

    const outcomeLabel = item.outcome.outcomeLabel;
    const periodLabel  = item.outcome.periodLabel;
    const isOver  = outcomeLabel === "Over";
    const isUnder = outcomeLabel === "Under";
  
    const overFilters  = new Set([FilterType.FILTER_HIGH_ODDS_HIGH_TREND_OVERS]);
    const underFilters = new Set([FilterType.FILTER_HIGH_ODDS_HIGH_TREND_UNDERS]);
    if (overFilters.has(filterType) && isUnder) return false;
    if (underFilters.has(filterType) && isOver)  return false;
  
    const blended = getBlendedStats(item.stats || {});
    const ppOdds        = parseFloat(item.outcome.bookOdds.PRIZEPICKS?.odds);
    const noGoblinProps = ppOdds !== -137;
    const avgOdds       = getAvgOdds(item);
    const isGoblin      = avgOdds <= -300;
  
    const safeRegular          = noGoblinProps && isSafeRegular(blended);
    const safeRegularPlayoffs  = noGoblinProps && isSafeRegularPlayoffs(item);
    const safeGoblin           = isGoblin && isSafeGoblin(blended, avgOdds);
    const safe2ndHalf          = noGoblinProps && isSafe2ndHalf(blended, periodLabel);
  
    if (showOnlyGoblins)      return safeGoblin;
    if (showOnly2ndHalf)      return (safeGoblin || safe2ndHalf);
    if (isPlayoffs)           return (isSafeGoblinPlayoffs && isGoblin) || safeRegularPlayoffs;
    return (safeGoblin || safeRegular);
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
    const regularsPos = rows
      .filter(r => r.approvalTag === "✅ Regular" && typeof r.edgeGapPct === "number" && r.edgeGapPct > 0);
  
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
  
  // Build one mega slip (prefer 6; fallback to 5→4→3) using strongest positive gaps,
  // mixing Goblins and Regulars and enforcing unique players.
  function buildMegaSlip(rows) {
    // Calculate a score for each regular prop that factors in both H2H and edge gap
    const scoreProp = (prop) => {
      const h2hValue = Number(prop.h2h) || 0;
      const edgeGap = Number(prop.edgeGapPct) || 0;
      // Weight H2H more heavily in the scoring
      return (h2hValue * 2) + edgeGap;
    };

    // Only get regular props with positive edge gaps, sorted by combined score
    const regulars = uniqueByPlayer(
      rows.filter(r => r.approvalTag === "✅ Regular" && 
                      typeof r.edgeGapPct === "number" && 
                      r.edgeGapPct > 0 &&
                      r.h2h !== null)  // Ensure H2H data exists
          .sort((a,b) => scoreProp(b) - scoreProp(a))
    );
  
    if (regulars.length === 0) return null;
  
    let legs = [];
    // Try to build diverse set of regular props
    for (const r of regulars) {
      if (legs.length >= 6) break;
      // avoid duplicate team + period + side if possible
      if (!legs.find(x => x._teamId===r._teamId && x.periodLabel===r.periodLabel && x._isOver===r._isOver)) {
        legs.push(r);
      }
    }
    // Add any remaining high-scoring regulars if needed
    for (const r of regulars) {
      if (legs.length >= 6) break;
      if (!legs.find(x => x.player.replace(/\s+\(.+?\)$/,'') === r.player.replace(/\s+\(.+?\)$/,''))) {
        legs.push(r);
      }
    }
  
    // Fallback sizes if we couldn't reach 6
    const targetSizes = [6,5,4,3];
    let chosenSize = targetSizes.find(sz => legs.length >= sz);
    legs = legs.slice(0, chosenSize);
    
    // Sort final legs by combined score (H2H weighted more heavily)
    legs.sort((a,b) => {
      const scoreA = (Number(a.h2h) || 0) * 2 + (Number(a.edgeGapPct) || 0);
      const scoreB = (Number(b.h2h) || 0) * 2 + (Number(b.edgeGapPct) || 0);
      return scoreB - scoreA;
    });
    
    const pEsts = legs.map(estPEstForRow).filter(Number.isFinite);
    const pWin = pEsts.length===legs.length ? product(pEsts) : null;
    const totalGap = legs.reduce((sum, prop) => sum + (prop.edgeGapPct || 0), 0).toFixed(1);
    const avgH2H = legs.reduce((sum, prop) => sum + (Number(prop.h2h) || 0), 0) / legs.length;
  
    return {
      title: `Mega Regular Slip (${legs.length}-pick) - Total Gap: ${totalGap}, Avg H2H: ${avgH2H.toFixed(2)}`,
      size: chosenSize,
      bucket: "Regular",
      sortBasis: "H2H + Edge Gaps",
      pctWin: pWin ? pct(pWin) : "—",
      legs,
      why: "Top regular props prioritizing high H2H values and positive Edge Gaps, with diversity across sides/teams/periods. Props sorted by combined H2H and gap score."
    };
  }
  
  function calculateSlipRating(legs) {
    let score = 0;
    for (const leg of legs) {
        // Get base stats
        const h2h = Number(leg.h2h) || 0;
        const l5 = Number(leg.l5) || 0;
        const l10 = Number(leg.l10) || 0;
        const prevSeason = Number(leg.prevSeason) || 0;
        const edgeGap = leg.edgeGapPct || 0;
        const defRank = Number(leg.defenseRank);
        
        if (isEarlySeason) {
            // Early season weighting
            score += h2h * 0.35;           // H2H (35%) - most reliable early
            score += l5 * 0.25;            // L5 (25%) - recent form
            score += prevSeason * 0.20;     // Last season (20%) - historical baseline
            score += edgeGap * 0.15;        // Edge gap (15%)
            if (defRank && defRank <= 10) score += 0.05;  // Defense (5%)
            
            // Early season bonus for improvement
            const improvement = l5 - prevSeason;
            if (improvement > 0.1) score += 0.1;
        } else {
            // Regular season weighting
            score += h2h * 0.25;           // H2H (25%)
            score += l5 * 0.20;            // L5 (20%)
            score += l10 * 0.15;           // L10 (15%)
            score += edgeGap * 0.25;       // Edge gap (25%)
            if (defRank && defRank <= 10) score += 0.15;  // Defense (15%)
        }
    }
    
    // Average per leg and convert to 0-10 scale
    const rating = Math.round((score / legs.length) * 10);
    
    // Generate rating class - stricter thresholds for early season
    let ratingClass = 'low';
    if (isEarlySeason) {
        if (rating >= 8) ratingClass = 'high';       // More demanding early season
        else if (rating >= 6) ratingClass = 'medium';
    } else {
        if (rating >= 7) ratingClass = 'high';       // Regular season thresholds
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
  
    // Get all safe goblins with positive edge gaps, sorted by gap value
    const goblins = rows.filter(r => r.approvalTag === "✅ Goblin" && typeof r.edgeGapPct === "number" && r.edgeGapPct > 0)
      .sort((a, b) => b.edgeGapPct - a.edgeGapPct);

    // If we have any goblins, create a single slip with all of them
    if (goblins.length > 0) {
      const pEsts = goblins.map(estPEstForRow).filter(Number.isFinite);
      const pWin = pEsts.length === goblins.length ? product(pEsts) : null;
      const totalGap = goblins.reduce((sum, prop) => sum + (prop.edgeGapPct || 0), 0).toFixed(1);
      const { rating, ratingClass } = calculateSlipRating(goblins);
      const { riskLevel, riskClass } = getRiskLevel(goblins);
      
      slips.push({
        title: `Goblin Core (${goblins.length}-pick)`,
        size: goblins.length,
        bucket: "Goblin",
        sortBasis: "Edge Gap",
        pctWin: pWin ? pct(pWin) : "—",
        legs: goblins.map(leg => {
          const trendIndicator = getTrendIndicator(leg);
          let trendClass = 'trend-neutral';
          if (trendIndicator === '↑') trendClass = 'trend-up';
          else if (trendIndicator === '↓') trendClass = 'trend-down';
          return {
            ...leg,
            trendIndicator,
            trendClass
          };
        }),
        totalGap,
        rating,
        ratingClass,
        riskLevel,
        riskClass,
        why: "All qualifying Goblins with positive Edge Gaps that pass strict hit-rate filters, sorted by gap value."
      });
    }
  
    // Mixed Trio (3-pick): top 2 Goblins + best Regular
    const top2Goblins = topByGap(rows.filter(r => r.approvalTag==="✅ Goblin"), 2);
    const reg1 = topByGap(rows.filter(r => r.approvalTag==="✅ Regular"), 1);
    if (top2Goblins.length === 2 && reg1.length === 1) {
      const trio = uniqueByPlayer([...top2Goblins, ...reg1]).slice(0,3);
      if (trio.length === 3) {
        const pEsts = trio.map(estPEstForRow).filter(Number.isFinite);
        const pWin = pEsts.length===3 ? product(pEsts) : null;
        const totalGap = trio.reduce((sum, prop) => sum + (prop.edgeGapPct || 0), 0).toFixed(1);
        const { rating, ratingClass } = calculateSlipRating(trio);
        const { riskLevel, riskClass } = getRiskLevel(trio);
        
        slips.push({
          title: "Mixed Trio (3-pick)",
          size: 3,
          bucket: "Mixed",
          sortBasis: "Edge Gap",
          pctWin: pWin ? pct(pWin) : "—",
          legs: trio.map(leg => formatLegForDisplay(leg)),
          totalGap,
          rating,
          ratingClass,
          riskLevel,
          riskClass,
          why: "Blend of two high-edge Goblins plus the top Regular to diversify risk across props."
        });
      }
    }
  
    // NEW: ALL Regular Value (2-pick) slips with favorable mix among positive gaps
    const allRegPairs = buildAllRegularPairs(rows);
    slips.push(...allRegPairs);
  
    // NEW: Mega Slip (6→5→4→3)
    const mega = buildMegaSlip(rows);
    if (mega) slips.push(mega);
  
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
  