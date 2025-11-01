# Elite Starters Configuration for Postman

## Overview
The Elite Stars slip automatically selects the safest non-goblin prop for each elite player. The player list can be stored in Postman as a global variable.

## Setup in Postman

### Step 1: Copy the Elite Starters JSON
Run this command to generate the Postman-ready JSON:
```bash
node convert_elite_starters_for_postman.js
```

This will display the JSON array and also save it to `eliteStarters_array.json`.

### Step 2: Add to Postman Globals
1. Open Postman
2. Click the **Environments** icon (gear icon) in the top right
3. Select **Globals** tab
4. Click **Add a new variable**
5. Set the following:
   - **Variable Name:** `EliteStarters`
   - **Type:** default
   - **Initial Value:** (paste the JSON array from step 1)
   - **Current Value:** (will auto-populate)
6. Click **Save**

### Step 3: Verify in Postman
The script will automatically detect and use the `EliteStarters` global variable when running in Postman.

## How It Works

### Load Priority
1. **First:** Tries to load from `pm.globals.get('EliteStarters')`
2. **Fallback:** Loads from `eliteStarters.json` file (for local Node.js)

### Code Logic
```javascript
function loadEliteStarters() {
  // First try Postman globals
  const pmGlobal = pm.globals.get('EliteStarters');
  if (pmGlobal) {
    return JSON.parse(pmGlobal);
  }
  
  // Fall back to file system for local Node.js
  if (typeof require !== 'undefined') {
    // Load from eliteStarters.json
  }
  
  return [];
}
```

## Elite Starters List

Currently includes **38 elite NBA players**:

### S-Tier (10 players)
- Nikola Jokic (Denver Nuggets)
- Giannis Antetokounmpo (Milwaukee Bucks)
- Luka Doncic (Dallas Mavericks)
- Joel Embiid (Philadelphia 76ers)
- Shai Gilgeous-Alexander (Oklahoma City Thunder)
- Jayson Tatum (Boston Celtics)
- Stephen Curry (Golden State Warriors)
- Kevin Durant (Phoenix Suns)
- Anthony Davis (Los Angeles Lakers)
- Kawhi Leonard (Los Angeles Clippers)

### A-Tier (26 players)
- Devin Booker, Anthony Edwards, LeBron James, Jaylen Brown, Jimmy Butler
- Tyrese Haliburton, Jalen Brunson, Donovan Mitchell, Damian Lillard, Kyrie Irving
- Paul George, Bam Adebayo, Victor Wembanyama, Domantas Sabonis, De'Aaron Fox
- Jamal Murray, Rudy Gobert, Jaren Jackson Jr., Zion Williamson, Trae Young
- Jrue Holiday, Lauri Markkanen, Pascal Siakam, Karl-Anthony Towns, Chet Holmgren
- Tyrese Maxey

### B-Tier (2 players)
- Khris Middleton, DeMar DeRozan

## Updating the List

### In Postman
1. Go to Globals
2. Find the `EliteStarters` variable
3. Edit the JSON array directly
4. Save

### Locally
1. Edit `eliteStarters.json` (JSONL format - one JSON object per line)
2. Run `node convert_elite_starters_for_postman.js` to regenerate
3. Copy the new JSON and update Postman globals

## Example Elite Stars Slip Output

```
⭐ Elite Stars (6-pick)
  Rating: 6.9/10 | Risk: LOW | Edge: 246.8%
  
  Players:
  1. Karl-Anthony Towns - Rebounds Over 7.5
  2. Giannis Antetokounmpo - Points + Rebounds Over 43.5
  3. Jaylen Brown - Personal Fouls Over 3.5
  4. Pascal Siakam - Three Pointers Over 1.5
  5. Kevin Durant - Points + Rebounds Over 30.5
  6. Domantas Sabonis - Points + Rebounds Under 29.5
```

## Benefits

✅ **Centralized Management** - Update once in Postman, applies everywhere
✅ **No File Dependencies** - Works in Postman without file system access
✅ **Easy Updates** - Edit JSON directly in Postman UI
✅ **Version Control** - File still exists for Git tracking
✅ **Dual Support** - Works both in Postman and local Node.js

## Troubleshooting

### Slip not generating?
- Check that `EliteStarters` global variable exists in Postman
- Verify the JSON is valid (use a JSON validator)
- Ensure at least 3 elite players have available props

### Want to add/remove players?
- Edit the JSON array in Postman globals
- Follow the same structure: `{"player":"Name","team":"Team","tier":"S|A|B",...}`

### Testing locally?
- File fallback will automatically use `eliteStarters.json`
- Run `node local_debug.js` to test
