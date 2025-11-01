# Setting Up Elite Starters in Postman

## Step-by-Step Guide

### Step 1: Generate the JSON Array
Run this command in your terminal:
```bash
node convert_elite_starters_for_postman.js
```

This will output the JSON array and save it to `eliteStarters_array.json`.

### Step 2: Copy the JSON
Open `eliteStarters_array.json` and copy the entire contents (it should be a JSON array starting with `[` and ending with `]`).

### Step 3: Add to Postman Globals

1. **Open Postman**
2. Click the **gear icon** ⚙️ in the top right (or go to **Environments**)
3. Click **Globals** tab
4. Click **+ Add a new variable** button
5. Fill in the variable:
   - **VARIABLE:** `EliteStarters` (exact name, case-sensitive)
   - **TYPE:** default
   - **INITIAL VALUE:** Paste the JSON array from Step 2
   - **CURRENT VALUE:** (will auto-populate from Initial Value)
6. Click **Save** (disk icon in top right)

### Step 4: Verify the Variable

#### Method 1: Check in Console
After running your request in Postman:
1. Open the **Console** (bottom panel)
2. Look for these messages:
   ```
   ✅ Loaded 38 elite starters from Postman globals
   🌟 Building Elite Stars slip with 38 elite players
   ```

#### Method 2: Test in Pre-request Script
Add this to your request's Pre-request Script tab:
```javascript
const eliteStarters = pm.globals.get('EliteStarters');
if (eliteStarters) {
    const parsed = JSON.parse(eliteStarters);
    console.log(`✅ EliteStarters global found: ${parsed.length} players`);
    console.log('First player:', parsed[0].player);
} else {
    console.log('❌ EliteStarters global NOT found');
}
```

### Step 5: Run Your Request
Execute your Postman request that uses the `PostManPropWithDefensiveRanks.js` visualizer.

## Troubleshooting

### ❌ "Elite Stars slip skipped: No elite starters loaded"
**Problem:** The global variable is not being found.

**Solutions:**
1. Verify the variable name is exactly `EliteStarters` (case-sensitive)
2. Make sure you clicked **Save** after adding the variable
3. Try refreshing Postman or restarting it
4. Check that the CURRENT VALUE is populated (not just INITIAL VALUE)

### ❌ "Elite Stars slip skipped: Not enough props (need 3+)"
**Problem:** No props match elite players.

**Solutions:**
1. Check that you have props data in your response
2. Verify elite player names match the format in your props
3. The script uses fuzzy matching, so partial names should work

### ❌ JSON Parse Error
**Problem:** Invalid JSON in the global variable.

**Solutions:**
1. Validate your JSON at https://jsonlint.com/
2. Make sure it's an array: starts with `[` and ends with `]`
3. Ensure proper escaping of quotes
4. Re-run `convert_elite_starters_for_postman.js` to regenerate

### ⚠️ "Elite Stars slip skipped: Not enough unique players (need 3+)"
**Problem:** Found props but less than 3 different elite players have valid props.

**Solutions:**
1. Check your data has multiple elite players
2. Verify props meet criteria: non-goblin, positive edge, approved
3. This is normal if you have limited prop data

## Expected Console Output (Success)

When working correctly, you should see in the Postman Console:
```
✅ Loaded 38 elite starters from Postman globals
🌟 Building Elite Stars slip with 38 elite players
   Found 19 props for elite players
   Selected safest prop for 7 elite players
   Built Elite Stars slip with 6 picks
```

## Elite Starters Format

Each player object should have this structure:
```json
{
  "player": "Giannis Antetokounmpo",
  "team": "Milwaukee Bucks",
  "positions": ["PF", "C"],
  "tier": "S",
  "archetypes": ["Slashing Big", "Transition Force"],
  "notes": "All NBA perennial"
}
```

Required fields:
- `player` (string) - Player's full name
- `team` (string) - Team name
- `tier` (string) - "S", "A", or "B"

Optional fields:
- `positions` (array)
- `archetypes` (array)
- `notes` (string)

## Updating Elite Starters

### To Add a Player:
1. Go to Postman → Globals
2. Find `EliteStarters` variable
3. Click to edit the CURRENT VALUE
4. Add a new object to the array following the format above
5. Save

### To Remove a Player:
1. Go to Postman → Globals
2. Find `EliteStarters` variable
3. Click to edit the CURRENT VALUE
4. Remove the player object from the array
5. Save

### To Update from File:
1. Edit `eliteStarters.json` locally
2. Run `node convert_elite_starters_for_postman.js`
3. Copy the new JSON from output or `eliteStarters_array.json`
4. Paste into Postman global variable
5. Save

## Quick Test

Run this in Postman Console to verify:
```javascript
// In Pre-request Script or Console
const elite = JSON.parse(pm.globals.get('EliteStarters') || '[]');
console.log('Elite Starters loaded:', elite.length);
console.log('S-Tier players:', elite.filter(p => p.tier === 'S').map(p => p.player));
```

## Need Help?

1. Check Postman Console for error messages
2. Verify JSON format at jsonlint.com
3. Make sure variable name is exact: `EliteStarters`
4. Try the test script above to verify the variable exists
